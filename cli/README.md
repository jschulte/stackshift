# 🚗 STACKSHIFT CLI

**Bulk Reverse Engineering & Migration Orchestrator**

Transform 100+ legacy codebases into specification-driven, modern applications at scale.

## 🎯 The Mission

You've got 100 repos to migrate. They need:
- Fresh tech stack (Node 22, React 19, NextJS)
- Full documentation
- GitHub Spec Kit integration
- Test coverage
- Production-ready quality

**Doing this manually?** 6 months, minimum.
**With StackShift CLI?** 2-4 weeks for the whole fleet.

## 🚀 Quick Start

```bash
# Build
cd cli/stackshift-cli
go build -o stackshift

# Run
./stackshift

# Or specify custom directory
./stackshift ~/git/my-projects
```

## ✨ Features

### 🔍 Auto-Discovery
- Recursively scans `~/git/` (or custom path)
- Finds all repos with `.git` folders
- Detects tech stack automatically
- Shows current progress for each repo

### 🎨 Beautiful TUI
```
╔═══════════════════════════════════════════════╗
║   🚗 STACKSHIFT                                ║
║   Discovered 134 repositories                 ║
║                                               ║
║   → ☑ wsm-pricing-display | TypeScript | ✅   ║
║     ☑ wsm-date-picker | TypeScript | 🚗 Gear 3║
║     ☐ legacy-api-gateway | Go | ⏸️            ║
║     ☐ auth-service | Python | ⏸️              ║
║                                               ║
║   Selected: 2 | brownfield → cruise-control  ║
║   ↑/↓: Nav | Space: Toggle | s: Settings     ║
╚═══════════════════════════════════════════════╝
```

### ⚙️ Configurable Settings
- **Route:** greenfield (new stack) | brownfield (existing)
- **Transmission:** manual (step-by-step) | cruise-control (automated)
- **Clarification:** prompt | defer | skip
- **Implementation:** none | p0 | p0_p1 | all
- **AI Backend:** Claude Code | OpenCode (CoPilot)
- **Parallel Limit:** 1-10 repos at once

### 🔄 Multi-AI Support

**Claude Code** (Recommended)
- Larger context window
- Better analysis quality
- Reads SKILL.md files from plugin

**OpenCode + CoPilot**
- For teams with CoPilot licenses
- 1000+ users at your company
- Uses manual prompts from `/prompts`

### 🎮 Controls

#### Repo Selection
- `↑/↓` or `j/k` - Navigate
- `Space` - Toggle selection
- `a` - Select all
- `n` - Select none
- `s` - Settings
- `Enter` - Start
- `q` - Quit

#### Settings
- `↑/↓` - Navigate
- `Enter/Space` - Change setting
- `Esc` - Back to main

## 🏃 The 6-Gear Process

### Gear 1: Analyze (5 min)
- Detect tech stack
- Assess completeness
- Choose route (greenfield/brownfield)
- **Output:** `analysis-report.md`, `.stackshift-state.json`

### Gear 2: Reverse Engineer (30-45 min)
- Extract 8 comprehensive docs
- Business logic, data architecture, config
- **Output:** `docs/reverse-engineering/*.md`

### Gear 3: Create Specifications (30 min)
- Generate GitHub Spec Kit structure
- Create feature specs
- **Output:** `.specify/`, `specs/F*/spec.md`

### Gear 4: Gap Analysis (15 min)
- Identify missing features
- Prioritize P0/P1/P2/P3
- **Output:** `docs/gap-analysis-report.md`

### Gear 5: Complete Specification (30-60 min)
- Resolve [NEEDS CLARIFICATION] markers
- Final validation
- **Output:** Updated specs

### Gear 6: Implement (hours-days)
- Generate missing code
- Create PRs
- CI/CD integration
- **Output:** Working code!

## 🎛️ Transmission Modes

### Manual (Step-by-Step)
```bash
# Run just Gear 1 on selected repos
→ Analyze (Gear 1)
  Review results
→ Reverse Engineer (Gear 2)
  Review docs
→ Continue...
```

### Cruise Control (Automated)
```bash
# Run ALL gears sequentially
→ Analyzing 10 repos...
  ✅ 8 complete, ❌ 2 failed
→ Reverse engineering...
  🚗 In progress (Gear 2)
→ Continue through all 6 gears
```

## 📊 Orchestration

### Parallel Processing
```
Parallel Limit: 3

┌─────────────┬─────────────┬─────────────┐
│ Repo 1      │ Repo 2      │ Repo 3      │
│ Gear 2      │ Gear 1      │ Gear 3      │
│ 45%         │ 100%        │ 12%         │
└─────────────┴─────────────┴─────────────┘

Queue: Repo 4, Repo 5, Repo 6... (7 waiting)
```

### Progress Tracking
- Real-time status updates
- Per-repo gear tracking
- Success/failure counts
- Automatic retry on failure
- Resume from interruption

### Results
```
✅ RESULTS

Completed: 95/100

✅ Gear 1: wsm-pricing-display
✅ Gear 2: wsm-pricing-display
✅ Gear 3: wsm-pricing-display
❌ Gear 4: wsm-pricing-display
   Error: Clarification needed - manual review required

Logs saved to: ~/.stackshift-results/2024-11-17_14-30-00/
```

## 📁 Output Structure

```
~/.stackshift-results/
└── 2024-11-17_14-30-00/
    ├── wsm-pricing-display_gear1.log
    ├── wsm-pricing-display_gear2.log
    ├── wsm-date-picker_gear1.log
    └── summary.md
```

## 🛠️ Configuration

### Environment Variables

```bash
# Custom git directory
export STACKSHIFT_GIT_DIR=~/git/my-company

# Custom prompts location
export STACKSHIFT_PROMPTS_DIR=~/git/stackshift/prompts

# Default settings
export STACKSHIFT_ROUTE=brownfield
export STACKSHIFT_TRANSMISSION=cruise-control
export STACKSHIFT_PARALLEL=3
```

### Config File (~/.stackshift-cli.json)

```json
{
  "defaultRoute": "brownfield",
  "defaultTransmission": "cruise-control",
  "parallelLimit": 3,
  "useClaudeCode": true,
  "clarificationStrategy": "defer",
  "implementationScope": "p0"
}
```

## 🔧 Advanced Usage

### Filter by Status
```bash
# Only show incomplete repos
./stackshift --filter incomplete

# Only show failed repos
./stackshift --filter failed
```

### Resume from Failure
```bash
# Automatically resumes from last successful gear
./stackshift --resume
```

### Dry Run
```bash
# Preview what would be executed
./stackshift --dry-run
```

### Specific Gear Only
```bash
# Run just Gear 3 on selected repos
./stackshift --gear 3
```

## 📦 Integration

### Corporate MCP Server
```bash
# Add to company MCP server
cp stackshift /usr/local/bin/
ln -s /usr/local/bin/stackshift /company/mcp-server/tools/
```

### CI/CD Pipeline
```yaml
# .github/workflows/stackshift.yml
name: StackShift Analysis
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          stackshift --gear 1 --non-interactive
          git add analysis-report.md .stackshift-state.json
          git commit -m "chore: StackShift analysis"
```

## 🎓 Comparison to Thoth

| Feature | Thoth (Osiris Upgrade) | StackShift CLI |
|---------|------------------------|----------------|
| **Purpose** | Upgrade widgets to Node 22 | Reverse engineer + migrate |
| **Scope** | 134 Osiris repos | Any codebase |
| **Phases** | 3 (Part 0, 1, 2) | 6 (Gears 1-6) |
| **Output** | Tests + PRs | Full specs + docs + code |
| **AI Backend** | OpenCode | Claude Code OR OpenCode |
| **TUI** | ✅ Beautiful Go/Charm | ✅ Beautiful Go/Charm |
| **Orchestration** | ✅ Parallel batches | ✅ Parallel batches |
| **Progress** | ✅ PR cache + validation | ✅ State file + validation |
| **Resume** | ✅ From any phase | ✅ From any gear |

## 🚀 Roadmap

- [x] Core TUI with repo selection
- [x] Multi-AI backend support
- [x] Orchestration engine
- [ ] Real-time progress parsing
- [ ] Slack/Teams notifications
- [ ] Web dashboard
- [ ] Plugin system for custom gears
- [ ] Analytics and reporting

## 🤝 Contributing

This is enterprise tooling built for scale. Pull requests welcome!

## 📄 License

MIT

---

**Built with 🚗 by engineers who don't fuck around**

*Inspired by Thoth (record keeper of the gods) and StackShift (gear shifter of repos)*
