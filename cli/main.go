package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const (
	SelectMode = iota
	SettingsMode
	ConfirmMode
	ExecutingMode
	ResultsMode
)

type model struct {
	// State
	mode         int
	cursor       int
	scrollOffset int
	width        int
	height       int
	spinnerFrame int

	// Data
	repos         []Repository
	selectedRepos map[string]bool

	// Settings
	route            string // "greenfield" or "brownfield"
	transmission     string // "manual" or "cruise-control"
	clarification    string // "prompt", "defer", "skip"
	implementation   string // "none", "p0", "p0_p1", "all"
	targetStack      string // For greenfield
	parallelLimit    int
	useClaudeCode    bool   // true = claude code, false = opencode
	settingsCursor   int

	// Execution
	orchestrator     *Orchestrator
	runningTasks     []Task
	logs             []string
	executionDone    bool

	// Results
	results []GearResult
}

type Repository struct {
	Name         string
	Path         string
	Language     string
	Framework    string
	CurrentGear  int    // 0-6
	Status       string // "not_started", "in_progress", "complete", "failed"
}

type Task struct {
	Repo     string
	Gear     int
	Status   string
	Progress int
	Message  string
}

type GearResult struct {
	Repo    string
	Gear    int
	Success bool
	Message string
	Files   []string
}

// Message types for execution updates
type executionStartedMsg struct{}

type taskUpdateMsg struct {
	repo   string
	gear   int
	status string
}

type executionCompleteMsg struct {
	results []GearResult
}

type logMsg struct {
	message string
}

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("205")).
			MarginBottom(1)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("42"))

	cursorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("205")).
			Bold(true)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("241")).
			MarginTop(1)
)

func initialModel() model {
	// Auto-discover repositories
	repos := discoverRepositories()

	return model{
		mode:           SelectMode,
		repos:          repos,
		selectedRepos:  make(map[string]bool),
		route:          "brownfield",
		transmission:   "cruise-control",
		clarification:  "defer",
		implementation: "p0",
		parallelLimit:  3,
		useClaudeCode:  true,
		logs:           []string{},
	}
}

func discoverRepositories() []Repository {
	var repos []Repository

	// Default search path
	homeDir, _ := os.UserHomeDir()
	searchPath := filepath.Join(homeDir, "git")

	// Check if user provided custom path
	if len(os.Args) > 1 && os.Args[1] != "" {
		searchPath = os.Args[1]
	}

	// Recursively find all .git directories
	filepath.Walk(searchPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}

		if info.IsDir() && info.Name() == ".git" {
			repoPath := filepath.Dir(path)
			repoName := filepath.Base(repoPath)

			// Detect language/framework
			lang, framework := detectTechStack(repoPath)

			// Check current progress
			currentGear, status := checkProgress(repoPath)

			repos = append(repos, Repository{
				Name:        repoName,
				Path:        repoPath,
				Language:    lang,
				Framework:   framework,
				CurrentGear: currentGear,
				Status:      status,
			})
		}

		return nil
	})

	return repos
}

func detectTechStack(repoPath string) (string, string) {
	// Check for package.json (Node.js)
	if _, err := os.Stat(filepath.Join(repoPath, "package.json")); err == nil {
		// Read package.json to detect framework
		// Simplified for now
		return "JavaScript/TypeScript", "Unknown"
	}

	// Check for requirements.txt (Python)
	if _, err := os.Stat(filepath.Join(repoPath, "requirements.txt")); err == nil {
		return "Python", "Unknown"
	}

	// Check for go.mod (Go)
	if _, err := os.Stat(filepath.Join(repoPath, "go.mod")); err == nil {
		return "Go", "Unknown"
	}

	// Check for Cargo.toml (Rust)
	if _, err := os.Stat(filepath.Join(repoPath, "Cargo.toml")); err == nil {
		return "Rust", "Unknown"
	}

	return "Unknown", "Unknown"
}

func checkProgress(repoPath string) (int, string) {
	// Check for .stackshift-state.json
	stateFile := filepath.Join(repoPath, ".stackshift-state.json")
	if _, err := os.Stat(stateFile); err == nil {
		// Parse state file (simplified)
		// Would actually parse JSON and check completedSteps
		return 0, "not_started"
	}

	return 0, "not_started"
}

func (m model) Init() tea.Cmd {
	return tickCmd()
}

// Ticker for spinner animation
func tickCmd() tea.Cmd {
	return tea.Tick(time.Millisecond*100, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

type tickMsg time.Time

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		return m.handleKeyPress(msg.String())

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case tickMsg:
		// Update spinner frame
		m.spinnerFrame++
		if m.mode == ExecutingMode && !m.executionDone {
			return m, tickCmd()
		}
		return m, nil

	case executionStartedMsg:
		// Clear previous results
		m.runningTasks = []Task{}
		m.logs = []string{}
		m.results = []GearResult{}
		m.executionDone = false

	case taskUpdateMsg:
		// Update task status
		found := false
		for i, task := range m.runningTasks {
			if task.Repo == msg.repo && task.Gear == msg.gear {
				m.runningTasks[i].Status = msg.status
				found = true
				break
			}
		}
		if !found {
			m.runningTasks = append(m.runningTasks, Task{
				Repo:   msg.repo,
				Gear:   msg.gear,
				Status: msg.status,
			})
		}

	case executionCompleteMsg:
		m.results = msg.results
		m.executionDone = true
		m.mode = ResultsMode

	case logMsg:
		m.logs = append(m.logs, msg.message)
		// Keep only last 50 logs
		if len(m.logs) > 50 {
			m.logs = m.logs[len(m.logs)-50:]
		}
	}

	return m, nil
}

func (m model) handleKeyPress(key string) (tea.Model, tea.Cmd) {
	switch m.mode {
	case SelectMode:
		return m.handleSelectMode(key)
	case SettingsMode:
		return m.handleSettingsMode(key)
	case ConfirmMode:
		return m.handleConfirmMode(key)
	case ExecutingMode:
		return m.handleExecutingMode(key)
	case ResultsMode:
		return m.handleResultsMode(key)
	}

	return m, nil
}

func (m model) handleSelectMode(key string) (tea.Model, tea.Cmd) {
	switch key {
	case "q", "ctrl+c":
		return m, tea.Quit

	case "up", "k":
		if m.cursor > 0 {
			m.cursor--
		}

	case "down", "j":
		if m.cursor < len(m.repos)-1 {
			m.cursor++
		}

	case " ": // Space to toggle selection
		repo := m.repos[m.cursor]
		m.selectedRepos[repo.Name] = !m.selectedRepos[repo.Name]

	case "a": // Select all
		for _, repo := range m.repos {
			m.selectedRepos[repo.Name] = true
		}

	case "n": // Select none
		m.selectedRepos = make(map[string]bool)

	case "s": // Settings
		m.mode = SettingsMode
		m.settingsCursor = 0

	case "enter":
		// Check if any repos selected
		selectedCount := 0
		for _, selected := range m.selectedRepos {
			if selected {
				selectedCount++
			}
		}

		if selectedCount > 0 {
			m.mode = ConfirmMode
		}
	}

	return m, nil
}

func (m model) handleSettingsMode(key string) (tea.Model, tea.Cmd) {
	switch key {
	case "q", "esc":
		m.mode = SelectMode

	case "up", "k":
		if m.settingsCursor > 0 {
			m.settingsCursor--
		}

	case "down", "j":
		if m.settingsCursor < 5 { // 6 settings total
			m.settingsCursor++
		}

	case "enter", " ":
		// Toggle or change setting
		switch m.settingsCursor {
		case 0: // Route
			if m.route == "greenfield" {
				m.route = "brownfield"
			} else {
				m.route = "greenfield"
			}
		case 1: // Transmission
			if m.transmission == "manual" {
				m.transmission = "cruise-control"
			} else {
				m.transmission = "manual"
			}
		case 2: // Clarification
			opts := []string{"prompt", "defer", "skip"}
			for i, opt := range opts {
				if m.clarification == opt {
					m.clarification = opts[(i+1)%len(opts)]
					break
				}
			}
		case 3: // Implementation
			opts := []string{"none", "p0", "p0_p1", "all"}
			for i, opt := range opts {
				if m.implementation == opt {
					m.implementation = opts[(i+1)%len(opts)]
					break
				}
			}
		case 4: // AI Backend
			m.useClaudeCode = !m.useClaudeCode
		case 5: // Parallel limit
			// Could add +/- controls here
		}
	}

	return m, nil
}

func (m model) handleConfirmMode(key string) (tea.Model, tea.Cmd) {
	switch key {
	case "y", "enter":
		m.mode = ExecutingMode
		// Start execution
		return m, m.startExecution()

	case "n", "q", "esc":
		m.mode = SelectMode
	}

	return m, nil
}

func (m model) handleExecutingMode(key string) (tea.Model, tea.Cmd) {
	// Only allow quit during execution
	if key == "ctrl+c" {
		return m, tea.Quit
	}

	return m, nil
}

func (m model) handleResultsMode(key string) (tea.Model, tea.Cmd) {
	switch key {
	case "q", "enter", "esc":
		m.mode = SelectMode
		m.selectedRepos = make(map[string]bool)
	}

	return m, nil
}

func (m model) startExecution() tea.Cmd {
	return func() tea.Msg {
		// Collect selected repositories
		selectedRepos := []Repository{}
		for _, repo := range m.repos {
			if m.selectedRepos[repo.Name] {
				selectedRepos = append(selectedRepos, repo)
			}
		}

		// Create orchestrator
		settings := Settings{
			Route:          m.route,
			Transmission:   m.transmission,
			Clarification:  m.clarification,
			Implementation: m.implementation,
			TargetStack:    m.targetStack,
		}

		orchestrator := NewOrchestrator(selectedRepos, settings, m.parallelLimit, m.useClaudeCode)

		// Run in background and collect results
		results, err := orchestrator.Run()
		if err != nil {
			return logMsg{message: fmt.Sprintf("Execution error: %v", err)}
		}

		return executionCompleteMsg{results: results}
	}
}

func (m model) View() string {
	switch m.mode {
	case SelectMode:
		return m.viewSelectMode()
	case SettingsMode:
		return m.viewSettingsMode()
	case ConfirmMode:
		return m.viewConfirmMode()
	case ExecutingMode:
		return m.viewExecutingMode()
	case ResultsMode:
		return m.viewResultsMode()
	}

	return ""
}

func (m model) viewSelectMode() string {
	s := titleStyle.Render("🚗 STACKSHIFT") + "\n\n"
	s += fmt.Sprintf("Discovered %d repositories\n\n", len(m.repos))

	// Show repos
	start := m.scrollOffset
	end := start + (m.height - 10)
	if end > len(m.repos) {
		end = len(m.repos)
	}

	for i := start; i < end; i++ {
		repo := m.repos[i]

		cursor := "  "
		if i == m.cursor {
			cursor = cursorStyle.Render("→ ")
		}

		checkbox := "☐"
		if m.selectedRepos[repo.Name] {
			checkbox = selectedStyle.Render("☑")
		}

		status := ""
		switch repo.Status {
		case "complete":
			status = "✅"
		case "in_progress":
			status = fmt.Sprintf("🚗 Gear %d", repo.CurrentGear)
		case "failed":
			status = "❌"
		default:
			status = "⏸️"
		}

		line := fmt.Sprintf("%s%s %s | %s | %s",
			cursor,
			checkbox,
			repo.Name,
			repo.Language,
			status,
		)

		s += line + "\n"
	}

	// Show selection count
	selectedCount := 0
	for _, selected := range m.selectedRepos {
		if selected {
			selectedCount++
		}
	}

	s += "\n"
	s += helpStyle.Render(fmt.Sprintf("Selected: %d | Settings: %s → %s",
		selectedCount,
		m.route,
		m.transmission,
	))
	s += "\n"
	s += helpStyle.Render("↑/↓: Navigate | Space: Toggle | a: All | n: None | s: Settings | Enter: Start | q: Quit")

	return s
}

func (m model) viewSettingsMode() string {
	s := titleStyle.Render("⚙️  SETTINGS") + "\n\n"

	settings := []struct {
		name    string
		value   string
		options string
	}{
		{"Route", m.route, "greenfield | brownfield"},
		{"Transmission", m.transmission, "manual | cruise-control"},
		{"Clarification Strategy", m.clarification, "prompt | defer | skip"},
		{"Implementation Scope", m.implementation, "none | p0 | p0_p1 | all"},
		{"AI Backend", func() string {
			if m.useClaudeCode {
				return "Claude Code"
			}
			return "OpenCode (CoPilot)"
		}(), ""},
		{"Parallel Limit", fmt.Sprintf("%d repos", m.parallelLimit), "+/- to adjust"},
	}

	for i, setting := range settings {
		cursor := "  "
		if i == m.settingsCursor {
			cursor = cursorStyle.Render("→ ")
		}

		s += fmt.Sprintf("%s%s: %s\n", cursor, setting.name, selectedStyle.Render(setting.value))
		if setting.options != "" {
			s += fmt.Sprintf("   (%s)\n", helpStyle.Render(setting.options))
		}
	}

	s += "\n"
	s += helpStyle.Render("↑/↓: Navigate | Enter/Space: Toggle | Esc: Back")

	return s
}

func (m model) viewConfirmMode() string {
	s := titleStyle.Render("🚀 READY TO SHIFT") + "\n\n"

	selectedRepos := []string{}
	for name, selected := range m.selectedRepos {
		if selected {
			selectedRepos = append(selectedRepos, name)
		}
	}

	s += fmt.Sprintf("Repositories: %d\n", len(selectedRepos))
	s += fmt.Sprintf("Route: %s\n", m.route)
	s += fmt.Sprintf("Mode: %s\n", m.transmission)
	s += fmt.Sprintf("Parallel: %d at a time\n\n", m.parallelLimit)

	if len(selectedRepos) <= 10 {
		s += "Selected repositories:\n"
		for _, repo := range selectedRepos {
			s += fmt.Sprintf("  • %s\n", repo)
		}
	}

	s += "\n"
	s += helpStyle.Render("Y/Enter: Start | N/Esc: Cancel")

	return s
}

func (m model) viewExecutingMode() string {
	s := titleStyle.Render("🚗 SHIFTING GEARS...") + "\n\n"

	// Add a simple spinner animation
	spinners := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
	spinner := spinners[m.spinnerFrame%len(spinners)]

	if len(m.runningTasks) == 0 {
		s += fmt.Sprintf("%s Starting execution...\n", spinner)
	} else {
		// Show progress for each running task
		gearIcons := map[int]string{
			1: "🔍", // Analyze
			2: "📐", // Reverse Engineer
			3: "📝", // Create Specs
			4: "🔎", // Gap Analysis
			5: "✍️", // Complete Spec
			6: "🔨", // Implement
		}

		for _, task := range m.runningTasks {
			icon := gearIcons[task.Gear]
			if icon == "" {
				icon = "⚙️"
			}

			statusIcon := spinner
			if task.Status == "complete" {
				statusIcon = "✅"
			} else if task.Status == "failed" {
				statusIcon = "❌"
			}

			s += fmt.Sprintf("%s %s Gear %d: %s - %s\n",
				statusIcon,
				icon,
				task.Gear,
				task.Repo,
				task.Status,
			)
		}
	}

	// Show recent logs
	if len(m.logs) > 0 {
		s += "\nRecent activity:\n"
		start := 0
		if len(m.logs) > 5 {
			start = len(m.logs) - 5
		}
		for _, log := range m.logs[start:] {
			s += fmt.Sprintf("  %s\n", log)
		}
	}

	s += "\n"
	if m.executionDone {
		s += helpStyle.Render("Execution complete! Press Enter to view results")
	} else {
		s += helpStyle.Render("Ctrl+C: Abort")
	}

	return s
}

func (m model) viewResultsMode() string {
	s := titleStyle.Render("✅ RESULTS") + "\n\n"

	successCount := 0
	for _, result := range m.results {
		if result.Success {
			successCount++
		}
	}

	s += fmt.Sprintf("Completed: %d/%d\n\n", successCount, len(m.results))

	for _, result := range m.results {
		icon := "✅"
		if !result.Success {
			icon = "❌"
		}

		s += fmt.Sprintf("%s Gear %d: %s\n", icon, result.Gear, result.Repo)
		if !result.Success {
			s += fmt.Sprintf("   Error: %s\n", result.Message)
		}
	}

	s += "\n"
	s += helpStyle.Render("Enter/q: Return to main menu")

	return s
}

func main() {
	// ASCII art splash
	fmt.Println(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗████████╗ █████╗  ██████╗██╗  ██╗              ║
║   ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝              ║
║   ███████╗   ██║   ███████║██║     █████╔╝               ║
║   ╚════██║   ██║   ██╔══██║██║     ██╔═██╗               ║
║   ███████║   ██║   ██║  ██║╚██████╗██║  ██╗              ║
║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝              ║
║                                                           ║
║   ███████╗██╗  ██╗██╗███████╗████████╗                   ║
║   ██╔════╝██║  ██║██║██╔════╝╚══██╔══╝                   ║
║   ███████╗███████║██║█████╗     ██║                      ║
║   ╚════██║██╔══██║██║██╔══╝     ██║                      ║
║   ███████║██║  ██║██║██║        ██║                      ║
║   ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝                      ║
║                                                           ║
║   Reverse Engineering → Specification-Driven Development ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)

	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
