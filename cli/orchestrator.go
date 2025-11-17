package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"
)

type Orchestrator struct {
	repos          []Repository
	settings       Settings
	parallelLimit  int
	useClaudeCode  bool
	resultsDir     string
	runningMutex   sync.Mutex
	runningTasks   map[string]*exec.Cmd
}

type Settings struct {
	Route          string
	Transmission   string
	Clarification  string
	Implementation string
	TargetStack    string
}

type StateFile struct {
	Version        string   `json:"version"`
	Created        string   `json:"created"`
	Updated        string   `json:"updated"`
	Path           string   `json:"path"`
	CurrentStep    string   `json:"currentStep"`
	CompletedSteps []string `json:"completedSteps"`
	CruiseControl  struct {
		Enabled              bool   `json:"enabled"`
		ClarificationStrategy string `json:"clarificationStrategy"`
		ImplementationScope  string `json:"implementationScope"`
		AutoMode             bool   `json:"autoMode"`
	} `json:"cruiseControl"`
}

func NewOrchestrator(repos []Repository, settings Settings, parallelLimit int, useClaudeCode bool) *Orchestrator {
	homeDir, _ := os.UserHomeDir()
	resultsDir := filepath.Join(homeDir, ".stackshift-results", time.Now().Format("2006-01-02_15-04-05"))
	os.MkdirAll(resultsDir, 0755)

	return &Orchestrator{
		repos:         repos,
		settings:      settings,
		parallelLimit: parallelLimit,
		useClaudeCode: useClaudeCode,
		resultsDir:    resultsDir,
		runningTasks:  make(map[string]*exec.Cmd),
	}
}

func (o *Orchestrator) Run() ([]GearResult, error) {
	results := []GearResult{}

	// Determine which gears to run based on transmission mode
	gears := []int{}
	if o.settings.Transmission == "cruise-control" {
		gears = []int{1, 2, 3, 4, 5, 6} // All gears
	} else {
		// Manual mode - run just the next incomplete gear for each repo
		gears = []int{1} // Start with Gear 1
	}

	// Process repos in batches based on parallel limit
	for i := 0; i < len(o.repos); i += o.parallelLimit {
		end := i + o.parallelLimit
		if end > len(o.repos) {
			end = len(o.repos)
		}

		batch := o.repos[i:end]

		// Run this batch
		batchResults := o.runBatch(batch, gears)
		results = append(results, batchResults...)
	}

	return results, nil
}

func (o *Orchestrator) runBatch(batch []Repository, gears []int) []GearResult {
	var wg sync.WaitGroup
	resultsChan := make(chan GearResult, len(batch)*len(gears))

	for _, repo := range batch {
		wg.Add(1)
		go func(r Repository) {
			defer wg.Done()

			for _, gear := range gears {
				result := o.runGear(r, gear)
				resultsChan <- result

				// If gear failed and we're in cruise control, stop this repo
				if !result.Success && o.settings.Transmission == "cruise-control" {
					break
				}
			}
		}(repo)
	}

	wg.Wait()
	close(resultsChan)

	results := []GearResult{}
	for result := range resultsChan {
		results = append(results, result)
	}

	return results
}

func (o *Orchestrator) runGear(repo Repository, gear int) GearResult {
	gearNames := map[int]string{
		1: "analyze",
		2: "reverse-engineer",
		3: "create-specs",
		4: "gap-analysis",
		5: "complete-spec",
		6: "implement",
	}

	gearName := gearNames[gear]

	// Create log file
	logFile := filepath.Join(o.resultsDir, fmt.Sprintf("%s_gear%d.log", repo.Name, gear))
	logF, err := os.Create(logFile)
	if err != nil {
		return GearResult{
			Repo:    repo.Name,
			Gear:    gear,
			Success: false,
			Message: fmt.Sprintf("Failed to create log file: %v", err),
		}
	}
	defer logF.Close()

	// Build command based on AI backend
	var cmd *exec.Cmd

	if o.useClaudeCode {
		// Use Claude Code
		cmd = o.buildClaudeCodeCommand(repo, gearName)
	} else {
		// Use OpenCode (GitHub CoPilot)
		cmd = o.buildOpenCodeCommand(repo, gearName)
	}

	cmd.Dir = repo.Path
	cmd.Stdout = logF
	cmd.Stderr = logF

	// Track running task
	o.runningMutex.Lock()
	o.runningTasks[repo.Name] = cmd
	o.runningMutex.Unlock()

	// Run command
	startTime := time.Now()
	err = cmd.Run()
	duration := time.Since(startTime)

	// Remove from running tasks
	o.runningMutex.Lock()
	delete(o.runningTasks, repo.Name)
	o.runningMutex.Unlock()

	if err != nil {
		return GearResult{
			Repo:    repo.Name,
			Gear:    gear,
			Success: false,
			Message: fmt.Sprintf("Command failed after %s: %v", duration, err),
		}
	}

	// Validate completion
	success, message := o.validateGear(repo, gear)

	return GearResult{
		Repo:    repo.Name,
		Gear:    gear,
		Success: success,
		Message: message,
	}
}

func (o *Orchestrator) buildClaudeCodeCommand(repo Repository, gearName string) *exec.Cmd {
	// Build command to execute StackShift skill using Claude Code
	// The skills are accessed via the slash commands in the plugin

	// Map gear names to skill commands
	skillCommands := map[string]string{
		"analyze":          "/stackshift:analyze",
		"reverse-engineer": "/stackshift:reverse-engineer",
		"create-specs":     "/stackshift:create-specs",
		"gap-analysis":     "/stackshift:gap-analysis",
		"complete-spec":    "/stackshift:complete-specs",
		"implement":        "/stackshift:implement",
	}

	skillCommand, exists := skillCommands[gearName]
	if !exists {
		// Fallback to basic prompt
		prompt := fmt.Sprintf("Execute StackShift %s gear for this repository", gearName)
		return exec.Command("claude", prompt)
	}

	// Build the command with the skill invocation
	prompt := fmt.Sprintf("Execute the StackShift skill: %s\n\nRepository: %s\nPath: %s\nLanguage: %s\nFramework: %s\n\nSettings:\n- Route: %s\n- Clarification: %s\n- Implementation: %s",
		skillCommand,
		repo.Name,
		repo.Path,
		repo.Language,
		repo.Framework,
		o.settings.Route,
		o.settings.Clarification,
		o.settings.Implementation,
	)

	// Use claude CLI with the prompt
	return exec.Command("claude", prompt)
}

func (o *Orchestrator) buildOpenCodeCommand(repo Repository, gearName string) *exec.Cmd {
	// For OpenCode/VSCode with CoPilot, we'll create a prompt file
	// that can be executed via code CLI or similar tool

	// Generate gear-specific prompt content
	promptContent := o.generateGearPrompt(gearName, repo)

	// Create temp file with the prompt
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("stackshift_%s_%s.md", repo.Name, gearName))
	os.WriteFile(tmpFile, []byte(promptContent), 0644)

	// Check if 'code' CLI is available (VSCode)
	if _, err := exec.LookPath("code"); err == nil {
		// Use VSCode CLI to open the prompt file and repository
		return exec.Command("code", repo.Path, tmpFile)
	}

	// Fallback to generic command - user may need to configure
	return exec.Command("echo", fmt.Sprintf("Please run StackShift %s gear for %s manually", gearName, repo.Name))
}

func (o *Orchestrator) generateGearPrompt(gearName string, repo Repository) string {
	// Generate gear-specific prompts for manual execution
	prompts := map[string]string{
		"analyze": `# StackShift Gear 1: Analyze

Please analyze this repository and create an analysis-report.md file containing:
1. Technology stack analysis
2. Architecture overview
3. Dependencies and integrations
4. Key business logic components
5. Database schema and data flow`,

		"reverse-engineer": `# StackShift Gear 2: Reverse Engineer

Create comprehensive documentation in docs/reverse-engineering/ including:
- functional-specification.md
- data-architecture.md
- configuration-reference.md
- api-documentation.md`,

		"create-specs": `# StackShift Gear 3: Create Specs

Based on the analysis, create specifications in docs/specs/ for:
- Technical requirements
- API contracts
- Data models
- Business rules`,

		"gap-analysis": `# StackShift Gear 4: Gap Analysis

Analyze gaps between current implementation and target stack.
Create gap-analysis.md documenting:
- Missing features
- Architecture differences
- Migration challenges`,

		"complete-spec": `# StackShift Gear 5: Complete Specifications

Finalize all specifications with:
- Implementation details
- Migration strategy
- Testing requirements
- Deployment plan`,

		"implement": `# StackShift Gear 6: Implement

Begin implementation based on specifications:
- Create new components
- Migrate existing functionality
- Update tests
- Document changes`,
	}

	basePrompt := prompts[gearName]
	if basePrompt == "" {
		basePrompt = fmt.Sprintf("# StackShift Gear: %s\n\nExecute the %s gear for this repository.", gearName, gearName)
	}

	// Add context
	return fmt.Sprintf(`%s

Repository: %s
Path: %s
Language: %s
Framework: %s

Settings:
- Route: %s
- Clarification Strategy: %s
- Implementation Scope: %s

Please execute this gear and update .stackshift-state.json when complete.`,
		basePrompt,
		repo.Name,
		repo.Path,
		repo.Language,
		repo.Framework,
		o.settings.Route,
		o.settings.Clarification,
		o.settings.Implementation,
	)
}

func getGearNumber(gearName string) int {
	gears := map[string]int{
		"analyze":           1,
		"reverse-engineer":  2,
		"create-specs":      3,
		"gap-analysis":      4,
		"complete-spec":     5,
		"implement":         6,
	}
	return gears[gearName]
}

func (o *Orchestrator) validateGear(repo Repository, gear int) (bool, string) {
	stateFile := filepath.Join(repo.Path, ".stackshift-state.json")

	// Check if state file exists
	data, err := os.ReadFile(stateFile)
	if err != nil {
		return false, "State file not found"
	}

	var state StateFile
	if err := json.Unmarshal(data, &state); err != nil {
		return false, "Invalid state file"
	}

	// Check if gear is in completed steps
	gearNames := map[int]string{
		1: "analyze",
		2: "reverse-engineer",
		3: "create-specs",
		4: "gap-analysis",
		5: "complete-spec",
		6: "implement",
	}

	expectedStep := gearNames[gear]
	for _, step := range state.CompletedSteps {
		if step == expectedStep {
			return true, "Gear completed successfully"
		}
	}

	return false, fmt.Sprintf("Gear %s not found in completed steps", expectedStep)
}

func (o *Orchestrator) validateGear1(repo Repository) (bool, string) {
	// Check for analysis-report.md
	reportPath := filepath.Join(repo.Path, "analysis-report.md")
	if _, err := os.Stat(reportPath); os.IsNotExist(err) {
		return false, "analysis-report.md not found"
	}

	return true, "Analysis complete"
}

func (o *Orchestrator) validateGear2(repo Repository) (bool, string) {
	// Check for docs/reverse-engineering/ directory
	docsPath := filepath.Join(repo.Path, "docs", "reverse-engineering")
	if _, err := os.Stat(docsPath); os.IsNotExist(err) {
		return false, "docs/reverse-engineering/ not found"
	}

	// Check for at least some documentation files
	expectedFiles := []string{
		"functional-specification.md",
		"data-architecture.md",
		"configuration-reference.md",
	}

	foundCount := 0
	for _, file := range expectedFiles {
		if _, err := os.Stat(filepath.Join(docsPath, file)); err == nil {
			foundCount++
		}
	}

	if foundCount < 2 {
		return false, fmt.Sprintf("Only %d/3 documentation files found", foundCount)
	}

	return true, fmt.Sprintf("Reverse engineering complete (%d/3 docs)", foundCount)
}

func (o *Orchestrator) Kill(repoName string) error {
	o.runningMutex.Lock()
	defer o.runningMutex.Unlock()

	if cmd, exists := o.runningTasks[repoName]; exists {
		if cmd.Process != nil {
			return cmd.Process.Kill()
		}
	}

	return nil
}

func (o *Orchestrator) KillAll() {
	o.runningMutex.Lock()
	defer o.runningMutex.Unlock()

	for _, cmd := range o.runningTasks {
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
	}
}

func (o *Orchestrator) GetProgress(repoName string) (int, string) {
	// Read state file from repo
	// Return current gear and status
	// This would parse .stackshift-state.json
	return 0, "in_progress"
}
