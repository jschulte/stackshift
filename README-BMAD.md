# BMAD Integration Implementation Guide

> **For Enterprise StackShift Forks**
>
> This document provides complete implementation instructions for integrating BMAD Method support into StackShift. Follow these steps exactly to add dual-framework support (GitHub Spec Kit + BMAD Method).

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
   - [Phase 1: Gear 1 - Framework Choice](#phase-1-gear-1---framework-choice)
   - [Phase 2: Gear 2 - Framework-Aware Output](#phase-2-gear-2---framework-aware-output)
   - [Phase 3: Gears 3-5 - Skip/Simplify for BMAD](#phase-3-gears-3-5---skipsimplify-for-bmad)
   - [Phase 4: Gear 6 - BMAD Handoff](#phase-4-gear-6---bmad-handoff)
   - [Phase 5: Cruise Control Updates](#phase-5-cruise-control-updates)
   - [Phase 6: Documentation Updates](#phase-6-documentation-updates)
4. [File Reference](#file-reference)
5. [BMAD Templates](#bmad-templates)
6. [Testing & Verification](#testing--verification)

---

## Overview

### What is BMAD?

BMAD (Breakthrough Method for Agile AI-Driven Development) is an AI-driven agile framework with:
- 21 specialized agents (PM, Architect, Dev, QA, etc.)
- 4 phases: Analysis → Planning → Solutioning → Implementation
- Scale-adaptive workflows (Quick Flow for small, full BMad Method for large)
- `devLoadAlwaysFiles` config that loads lean docs every dev session

### Why Integrate BMAD?

StackShift and BMAD are **complementary**:
- **StackShift**: Code → Specs (reverse engineering with AST analysis)
- **BMAD**: Specs → Code (forward development with agent workflows)

Integration allows users to:
1. Choose their implementation framework upfront (Gear 1)
2. Generate output in the chosen format (Gear 2)
3. Hand off seamlessly to their preferred workflow (Gear 6)

### Key Insight

StackShift's Gear 2 (Reverse Engineering) replaces BMAD's Phase 0 (`document-project` task) with **deeper AST-powered analysis**. BMAD uses a simple file flattener; StackShift uses semantic AST parsing.

---

## Architecture

### Dual-Path Flow

```
Gear 1: Analyze
├── Detect tech stack
├── Choose route (Greenfield/Brownfield)
└── Choose framework (Spec Kit/BMAD) ← NEW
        │
        ├─────────────────┬────────────────────┐
        │                 │                    │
   Spec Kit Path      BMAD Path               │
        │                 │                    │
        ▼                 ▼                    │
Gear 2: Reverse Engineer                      │
├── Spec Kit: docs/reverse-engineering/       │
└── BMAD: docs/ (PRD, Architecture)           │
        │                 │                    │
        │                 │                    │
        ▼                 ▼                    │
Gears 3-5            SKIPPED                  │
(Spec Kit only)      (BMAD agents handle)     │
        │                 │                    │
        ▼                 ▼                    │
Gear 6: Implement / Handoff                   │
├── Spec Kit: /speckit.tasks, /speckit.implement
└── BMAD: *workflow-init handoff              │
```

### State File Structure

The `.stackshift-state.json` file stores framework choice:

```json
{
  "current_gear": 2,
  "route": "brownfield",
  "implementation_framework": "bmad",  // NEW FIELD
  "completed_gears": [1],
  "tech_stack": { ... }
}
```

### Framework Detection Command

All gears use this bash snippet to check framework:

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Implementation Steps

### Phase 1: Gear 1 - Framework Choice

#### File: `skills/analyze/SKILL.md`

**Location**: After Route Selection question, before Brownfield Mode question

**Add Question 2: Implementation Framework**

```markdown
**Question 2: Implementation Framework**

```
Which implementation framework do you want to use?

A) GitHub Spec Kit (Recommended for most projects)
   → Feature-level specifications in .specify/
   → Task-driven implementation with /speckit.* commands

B) BMAD Method (For larger/enterprise projects)
   → PRD + Architecture docs in docs/
   → Agent-driven workflow (PM, Architect, Dev agents)
```

**Default**: GitHub Spec Kit (most users, simpler workflow)

**When to recommend BMAD**:
- Large enterprise projects
- Teams already using BMAD
- Projects needing full agent orchestration
```

**Update AskUserQuestion call** to include framework choice:

```markdown
Use the AskUserQuestion tool with the following questions:

**Question 1: Route**
- header: "Route"
- question: "Which development path do you want to take?"
- options:
  - label: "Greenfield (Recommended for migrations)"
    description: "Extract business logic only, rebuild in new stack"
  - label: "Brownfield"
    description: "Document existing code, manage with specs going forward"

**Question 2: Implementation Framework**
- header: "Framework"
- question: "Which implementation framework do you want to use?"
- options:
  - label: "GitHub Spec Kit (Recommended)"
    description: "Feature specs in .specify/, /speckit.* commands"
  - label: "BMAD Method"
    description: "PRD + Architecture in docs/, agent-driven workflow"
```

**Update state file example** in the skill:

```json
{
  "current_gear": 1,
  "route": "brownfield",
  "implementation_framework": "speckit",
  "transmission": "manual",
  ...
}
```

#### File: `.claude/commands/stackshift.analyze.md`

**Update Step 2 description**:

```markdown
## Step 2: Detect Tech Stack, Route, and Framework

...

**Framework choice determines output format**:
- **GitHub Spec Kit**: Creates `.specify/` structure, uses `/speckit.*` commands
- **BMAD Method**: Creates `docs/` structure, hands off to `*workflow-init`
```

#### File: `skills/analyze/operations/generate-report.md`

**Add StackShift Configuration section** to the report template:

```markdown
## StackShift Configuration

- **Route:** [Greenfield / Brownfield]
- **Implementation Framework:** [GitHub Spec Kit / BMAD Method]
- **Transmission:** [Manual / Cruise Control]
```

---

### Phase 2: Gear 2 - Framework-Aware Output

#### File: `skills/reverse-engineer/SKILL.md`

**Add framework check** at the beginning:

```markdown
## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Implementation Framework: ${IMPL_FRAMEWORK:-speckit}"
```

**If BMAD**: Output goes to `docs/` structure (see BMAD Output below)
**If Spec Kit**: Output goes to `docs/reverse-engineering/` (existing behavior)
```

**Add BMAD output structure documentation**:

```markdown
## BMAD Output Structure (implementation_framework: bmad)

When BMAD is selected, generate documentation in BMAD's expected format:

```
docs/
├── index.md                      # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md            # Lean - loaded every dev session (<100 lines)
│   ├── coding-standards.md      # Lean - loaded every dev session (<150 lines)
│   └── project-structure.md     # Lean - loaded every dev session (<100 lines)
├── architecture.md              # Full architecture documentation
└── prd.md                       # Product requirements document
```

**CRITICAL**: Files in `docs/architecture/` are loaded on EVERY dev agent session via BMAD's `devLoadAlwaysFiles` config. Keep them LEAN:
- `tech-stack.md`: < 100 lines
- `coding-standards.md`: < 150 lines
- `project-structure.md`: < 100 lines

Full details go in `docs/architecture.md` (loaded on demand).
```

**Update success criteria**:

```markdown
## Success Criteria

### GitHub Spec Kit Path
- [ ] All 9 documentation files generated in `docs/reverse-engineering/`
- [ ] Business logic extracted (route-appropriate)
- [ ] AST analysis integrated where applicable

### BMAD Method Path
- [ ] `docs/index.md` created with navigation
- [ ] `docs/architecture/*.md` files created (LEAN, < 100-150 lines each)
- [ ] `docs/architecture.md` created with full details
- [ ] `docs/prd.md` created with requirements and epics
- [ ] Ready for BMAD `*workflow-init` handoff
```

#### File: `.claude/commands/stackshift.reverse-engineer.md`

**Add framework check and BMAD output structure**:

```markdown
## Step 2: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Implementation Framework: ${IMPL_FRAMEWORK:-speckit}"
```

**BMAD Output Structure:**
```
docs/
├── index.md                      # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md            # Lean - loaded every dev session
│   ├── coding-standards.md      # Lean - loaded every dev session
│   └── project-structure.md     # Lean - loaded every dev session
├── architecture.md              # Full architecture documentation
└── prd.md                       # Product requirements document
```

**IMPORTANT for BMAD**: Keep `docs/architecture/*.md` files LEAN (< 100-150 lines). These are loaded on EVERY dev agent session. Put full details in `docs/architecture.md`.
```

#### Create BMAD Templates

Create directory: `skills/reverse-engineer/templates/bmad/`

Create these 6 template files (see [BMAD Templates](#bmad-templates) section below for full content):

1. `index.md` - Navigation index
2. `tech-stack.md` - Lean tech stack reference
3. `coding-standards.md` - Lean coding standards
4. `project-structure.md` - Lean project structure
5. `architecture.md` - Full architecture documentation
6. `prd.md` - Product requirements document

---

### Phase 3: Gears 3-5 - Skip/Simplify for BMAD

Each of these gears needs a framework check and BMAD path that skips/simplifies.

#### File: `.claude/commands/stackshift.create-specs.md`

**Add at the beginning**:

```markdown
**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

[... existing content ...]
```

**Add at the end**:

```markdown
---

## Path B: BMAD Method (implementation_framework: bmad)

### Skip This Gear

For BMAD projects, documentation was already created in BMAD format during Gear 2.

**What was generated in Gear 2:**
```
docs/
├── index.md                    # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md          # Lean - loaded every dev session
│   ├── coding-standards.md    # Lean - loaded every dev session
│   └── project-structure.md   # Lean - loaded every dev session
├── architecture.md            # Full architecture documentation
└── prd.md                     # Product requirements document
```

**Why skip**: BMAD doesn't use `.specify/` format. The `docs/` structure from Gear 2 is what BMAD agents expect.

**Proceed to**: Gear 4 (Gap Analysis) or Gear 6 (Implementation) for BMAD handoff.
```

#### File: `.claude/commands/stackshift.gap-analysis.md`

**Add framework check and BMAD path**:

```markdown
**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

[... existing content ...]

---

## Path B: BMAD Method (implementation_framework: bmad)

### Optional: Review AST Gap Analysis

For BMAD projects, you can optionally review the AST-generated gap analysis:

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap .
```

This shows:
- Implementation completeness from AST analysis
- Missing/partial features detected
- Prioritized implementation phases

### BMAD Handles Gap Analysis Differently

BMAD's workflow (`*workflow-init`) handles gap analysis through its agents:
- **Analyst agent** reviews the `docs/` structure
- **PM agent** identifies gaps from `docs/prd.md`
- **Architect agent** analyzes technical gaps from `docs/architecture.md`

**Recommended**: Proceed to Gear 6 for BMAD handoff. Let BMAD agents handle their own gap analysis with the comprehensive docs StackShift generated.
```

#### File: `.claude/commands/stackshift.complete-spec.md`

**Add framework check and BMAD path**:

```markdown
**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

[... existing content ...]

---

## Path B: BMAD Method (implementation_framework: bmad)

### Skip This Gear

For BMAD projects, specification clarification happens through BMAD's interactive workflow.

**How BMAD handles clarifications:**
1. `*workflow-init` detects brownfield project with existing `docs/`
2. Analyst agent reviews docs and asks clarifying questions
3. PM agent refines requirements interactively
4. Architect agent resolves technical ambiguities

**Why skip**: StackShift generated comprehensive documentation in Gear 2. BMAD agents handle clarifications through their conversational workflow, which is better suited to real-time refinement.

**Proceed to**: Gear 6 for BMAD handoff.
```

---

### Phase 4: Gear 6 - BMAD Handoff

#### File: `.claude/commands/stackshift.implement.md`

**Add framework check and dual paths**:

```markdown
**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

[... existing implementation content ...]

---

## Path B: BMAD Method (implementation_framework: bmad)

### StackShift Complete - Handoff to BMAD

StackShift has prepared your codebase with comprehensive documentation in BMAD's format.

**Generated files:**
```
docs/
├── index.md                    # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md          # Loaded every dev session
│   ├── coding-standards.md    # Loaded every dev session
│   └── project-structure.md   # Loaded every dev session
├── architecture.md            # Full technical details
└── prd.md                     # Product requirements
```

### Next Steps for BMAD

1. **Install BMAD** (if not already):
   ```bash
   npx bmad-method@alpha install
   ```

2. **Load the Analyst agent** in your IDE (see `docs/ide-info/` for instructions)

3. **Run workflow-init**:
   ```
   *workflow-init
   ```

   BMAD will:
   - Detect existing `docs/` documentation
   - Recognize this as a brownfield project
   - Route to appropriate workflow (Quick Flow or BMad Method)
   - Use your StackShift-generated docs as context

4. **BMAD takes over** - PM, Architect, and Dev agents proceed with full context

### Why This Works

StackShift performed BMAD's "Phase 0: Documentation" with deeper analysis:
- AST-powered extraction (vs BMAD's file flattener)
- Semantic understanding of business logic
- Accurate API and data model documentation
- Lean `docs/architecture/*.md` files ready for dev agent context

**You get the best of both worlds:**
- StackShift's deep reverse engineering
- BMAD's agent-driven implementation workflow
```

---

### Phase 5: Cruise Control Updates

#### File: `.claude/commands/stackshift.cruise-control.md`

**Update to show both paths**:

```markdown
**The skill will run** (varies by framework choice):

### GitHub Spec Kit Path
1. **Gear 1**: Detect tech stack + route + framework (uses AST cache)
2. **Gear 2**: Extract documentation (enhanced with AST)
3. **Gear 3**: Create specs (auto-detects status from AST)
4. **Gear 4**: Gap analysis (reads cached roadmap)
5. **Gear 5**: Complete specs (evidence-based from AST)
6. **Gear 6**: Implement + verify (checks with AST)

### BMAD Method Path
1. **Gear 1**: Detect tech stack + route + framework (uses AST cache)
2. **Gear 2**: Extract documentation in BMAD `docs/` format
3-5. **Skipped**: BMAD agents handle specs/gaps/clarifications
6. **Gear 6**: Handoff to BMAD `*workflow-init`
```

#### File: `skills/cruise-control/SKILL.md`

**Add framework choice to setup questions**:

```markdown
2. **Implementation Framework:**
   ```
   Choose implementation framework:
   A) GitHub Spec Kit - Feature specs in .specify/, /speckit.* commands
   B) BMAD Method - PRD + Architecture in docs/, agent-driven workflow
   ```

3. **Clarifications Handling:** (Spec Kit only)
   ...

4. **Implementation Scope:** (Spec Kit only)
   ...

**Note**: For BMAD Method, questions 3-4 are skipped. BMAD agents handle clarifications and implementation through their interactive workflow.
```

**Add BMAD execution flow**:

```markdown
### BMAD Method Path

#### Gear 1: Analyze (Auto)
- Detects tech stack
- Assesses completeness
- Sets route and framework (from your selections)
- Saves state with `auto_mode: true`
- **Auto-shifts to Gear 2** ✅

#### Gear 2: Reverse Engineer (Auto)
- Launches `stackshift:code-analyzer` agent
- Extracts documentation in BMAD `docs/` format
- Generates: `docs/index.md`, `docs/architecture/`, `docs/architecture.md`, `docs/prd.md`
- **Skips to Gear 6** ✅

#### Gears 3-5: Skipped
- BMAD agents handle specs, gap analysis, and clarifications
- Documentation is already in BMAD format from Gear 2

#### Gear 6: BMAD Handoff
- Displays instructions for BMAD installation and setup
- Provides `*workflow-init` command to start BMAD workflow
- **StackShift completes - BMAD takes over!** 🏁
```

**Add BMAD success criteria**:

```markdown
### BMAD Method Path

After cruise control completes:

- ✅ Gears 1, 2, 6 complete (3-5 skipped)
- ✅ `.stackshift-state.json` shows framework: "bmad"
- ✅ `docs/` structure generated with all required files
- ✅ BMAD handoff instructions displayed
- ✅ Ready for `*workflow-init` to take over
```

---

### Phase 6: Documentation Updates

#### File: `README.md`

**Update intro** to mention framework choice:

```markdown
> **Two paths, two frameworks, complete control:**
>
> **🔀 Greenfield:** Extract business logic from your legacy app, then rebuild in a modern stack using tech-agnostic specs.
>
> **⚙️ Brownfield:** Transform your existing codebase into a spec-driven project for ongoing management.
>
> **🛠️ Choose Your Implementation Framework:**
> - **GitHub Spec Kit** - Feature specs in `.specify/`, task-driven workflow
> - **BMAD Method** - PRD + Architecture in `docs/`, agent-driven workflow
```

**Add new section "Implementation Framework Choice"**:

```markdown
## 🛠️ Implementation Framework Choice

After choosing your route (Greenfield/Brownfield), StackShift asks which implementation framework to use:

### GitHub Spec Kit (Recommended for most projects)

**Output structure:**
```
.specify/
├── memory/
│   ├── constitution.md      # Project principles
│   └── [feature-name]/      # Per-feature specs
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
└── templates/               # Spec templates
```

**Workflow:**
- `/speckit.specify` - Create feature specs
- `/speckit.plan` - Create implementation plans
- `/speckit.tasks` - Generate task lists
- `/speckit.implement` - Execute implementation

**Best for:** Most projects, task-driven development, smaller teams

### BMAD Method (For larger/enterprise projects)

**Output structure:**
```
docs/
├── index.md                    # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md          # Lean - loaded every dev session
│   ├── coding-standards.md    # Lean - loaded every dev session
│   └── project-structure.md   # Lean - loaded every dev session
├── architecture.md            # Full architecture documentation
└── prd.md                     # Product requirements document
```

**Workflow:**
1. StackShift generates `docs/` structure (Gears 1-2)
2. Gears 3-5 skipped (BMAD handles specs/gaps/clarifications)
3. Gear 6 hands off to BMAD's `*workflow-init`
4. BMAD's 21 agents (PM, Architect, Dev, etc.) take over

**Best for:** Large projects, enterprise teams, agent-driven workflows

### Framework Comparison

| Aspect | GitHub Spec Kit | BMAD Method |
|--------|-----------------|-------------|
| **Output** | `.specify/` directory | `docs/` directory |
| **Specs** | Feature-level specs | PRD + Architecture |
| **Workflow** | `/speckit.*` commands | Agent-driven (`*workflow-init`) |
| **Gears Used** | All 6 gears | Gears 1-2, then handoff |
| **Team Size** | Any | Larger teams |
| **Automation** | Task-driven | Agent-driven |

**Note:** StackShift's reverse engineering (Gear 2) replaces BMAD's Phase 0 (`document-project`) with deeper AST-powered analysis.
```

**Update 6-gear process diagram** to show dual paths:

```
┌─────────────────────────────────────────────────────────────┐
│                  Shift Through 6 Gears                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Gear 1: Initial Analysis + Route + Framework Selection     │
│  ├─ Run AST analysis (parse codebase, save to cache)        │
│  ├─ Detect technology stack                                 │
│  ├─ Choose route: Greenfield or Brownfield?                 │
│  └─ Choose framework: GitHub Spec Kit or BMAD Method?       │
│         │                                                    │
│         ├─────────────────┬────────────────────┐            │
│         │                 │                    │            │
│    Spec Kit           BMAD Method              │            │
│   (All 6 gears)     (Gears 1-2, handoff)      │            │
│         │                 │                    │            │
│         ▼                 ▼                    │            │
│  Gear 2: Reverse Engineer (Reverse Gear! 🔄)                │
│  ├─ Extract business logic + tech details                   │
│  ├─ Enhanced with AST: auto-extract APIs & logic            │
│  ├─ Spec Kit: Generate 9 docs to docs/reverse-engineering/  │
│  └─ BMAD: Generate docs/ structure (PRD, Architecture)      │
│         │                                                    │
│         ├─────────────────┬────────────────────┐            │
│         │                 │                    │            │
│    Spec Kit           BMAD Method              │            │
│         │          (Skip to Gear 6)            │            │
│         ▼                 │                    │            │
│  Gears 3-5: Spec Kit Path                     │            │
│  ├─ Gear 3: Create .specify/ specs            │            │
│  ├─ Gear 4: Gap analysis                      │            │
│  └─ Gear 5: Complete specification            │            │
│         │                 │                    │            │
│         ▼                 ▼                    │            │
│  Gear 6: Implement / Handoff                                │
│  ├─ Spec Kit: /speckit.tasks & /speckit.implement           │
│  └─ BMAD: Handoff to *workflow-init (agents take over)      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Update initial configuration list**:

```markdown
StackShift will ask a few questions upfront:
1. Route: Greenfield or Brownfield?
2. Implementation Framework: GitHub Spec Kit or BMAD Method?
3. Transmission: Manual or Cruise Control?
4. (If Cruise Control + Spec Kit) Clarifications strategy & implementation scope
5. (If Greenfield) Target tech stack
```

---

## File Reference

### Files Modified

| File | Changes |
|------|---------|
| `skills/analyze/SKILL.md` | Add Question 2 (Framework), update state file example |
| `skills/analyze/operations/generate-report.md` | Add StackShift Configuration section |
| `.claude/commands/stackshift.analyze.md` | Update Step 2 description |
| `skills/reverse-engineer/SKILL.md` | Add framework check, BMAD output structure, success criteria |
| `.claude/commands/stackshift.reverse-engineer.md` | Add framework check and BMAD output |
| `.claude/commands/stackshift.create-specs.md` | Add framework check, BMAD skip path |
| `.claude/commands/stackshift.gap-analysis.md` | Add framework check, BMAD skip path |
| `.claude/commands/stackshift.complete-spec.md` | Add framework check, BMAD skip path |
| `.claude/commands/stackshift.implement.md` | Add framework check, BMAD handoff path |
| `.claude/commands/stackshift.cruise-control.md` | Add dual-path descriptions |
| `skills/cruise-control/SKILL.md` | Add framework choice, BMAD flow, success criteria |
| `README.md` | Add framework choice, new section, update diagram |

### Files Created

| File | Purpose |
|------|---------|
| `skills/reverse-engineer/templates/bmad/index.md` | Navigation template |
| `skills/reverse-engineer/templates/bmad/tech-stack.md` | Lean tech stack template |
| `skills/reverse-engineer/templates/bmad/coding-standards.md` | Lean coding standards template |
| `skills/reverse-engineer/templates/bmad/project-structure.md` | Lean project structure template |
| `skills/reverse-engineer/templates/bmad/architecture.md` | Full architecture template |
| `skills/reverse-engineer/templates/bmad/prd.md` | PRD template |

---

## BMAD Templates

### Template: `skills/reverse-engineer/templates/bmad/index.md`

```markdown
# Documentation Index

> Generated by StackShift reverse engineering process
> Ready for BMAD workflow

## Quick Access (Loaded Every Session)

These files are loaded on every dev agent session. Keep them lean!

- [Tech Stack](architecture/tech-stack.md) - Languages, frameworks, key dependencies
- [Coding Standards](architecture/coding-standards.md) - Code style and patterns
- [Project Structure](architecture/project-structure.md) - Directory layout and key files

## Full Documentation

- [Architecture](architecture.md) - Complete technical architecture
- [PRD](prd.md) - Product requirements and user stories

## For BMAD Agents

This documentation was generated by StackShift's AST-powered reverse engineering.
Run `*workflow-init` to start the BMAD workflow with this context.
```

### Template: `skills/reverse-engineer/templates/bmad/tech-stack.md`

```markdown
# Tech Stack

> **IMPORTANT**: This file is loaded on EVERY dev agent session. Keep it under 100 lines.
> This is a quick reference. Full details in architecture.md.

## Core Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | [language] | [version] |
| Framework | [framework] | [version] |
| Database | [database] | [version] |
| Runtime | [runtime] | [version] |

## Key Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| [package] | [purpose] | [version] |

## Development Tools

- **Package Manager**: [npm/yarn/pnpm]
- **Build Tool**: [tool]
- **Test Framework**: [framework]
- **Linter**: [linter]

## Environment

- **Node Version**: [version]
- **Required ENV vars**: See `.env.example`

---

*Keep this file lean. Full dependency list in package.json, full architecture in architecture.md*
```

### Template: `skills/reverse-engineer/templates/bmad/coding-standards.md`

```markdown
# Coding Standards

> **IMPORTANT**: This file is loaded on EVERY dev agent session. Keep it under 150 lines.
> These are the rules the dev agent MUST follow.

## Code Style

- **Indentation**: [2 spaces / 4 spaces / tabs]
- **Quotes**: [single / double]
- **Semicolons**: [yes / no]
- **Line length**: [max chars]

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | [kebab-case] | `user-profile.ts` |
| Components | [PascalCase] | `UserProfile` |
| Functions | [camelCase] | `getUserProfile` |
| Constants | [SCREAMING_SNAKE] | `MAX_RETRIES` |
| Types/Interfaces | [PascalCase] | `UserProfile` |

## Patterns

### Error Handling
```
[Describe the error handling pattern used]
```

### Validation
```
[Describe validation approach]
```

### Logging
```
[Describe logging approach]
```

### Authentication
```
[Describe auth pattern]
```

## Testing Requirements

- **Unit tests**: [framework] - Required for [what]
- **Integration tests**: [framework] - Required for [what]
- **E2E tests**: [framework] - Required for [what]
- **Coverage target**: [percentage]

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] Has appropriate error handling
- [ ] Includes tests for new code
- [ ] No console.log statements
- [ ] TypeScript strict mode passes

---

*Keep this file focused on rules. Full patterns in architecture.md*
```

### Template: `skills/reverse-engineer/templates/bmad/project-structure.md`

```markdown
# Project Structure

> **IMPORTANT**: This file is loaded on EVERY dev agent session. Keep it under 100 lines.

## Directory Layout

```
[project-root]/
├── src/                    # Source code
│   ├── [dir]/             # [Purpose]
│   ├── [dir]/             # [Purpose]
│   └── [dir]/             # [Purpose]
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   └── e2e/               # End-to-end tests
├── docs/                   # Documentation (you are here)
├── [config-dir]/          # Configuration
└── [other-dirs]/          # [Purpose]
```

## Key Files

| File | Purpose |
|------|---------|
| `[path]` | [Main entry point] |
| `[path]` | [Database schema] |
| `[path]` | [API routes] |
| `[path]` | [Environment config] |
| `[path]` | [Type definitions] |

## Where to Put Things

| Type of Code | Location |
|--------------|----------|
| React components | `src/components/` |
| API routes | `src/api/` or `src/server/` |
| Database models | `src/models/` or `prisma/` |
| Utility functions | `src/lib/` or `src/utils/` |
| Type definitions | `src/types/` |
| Tests | `tests/` or `__tests__/` |

## Important Paths

- **Entry point**: `[path]`
- **Database schema**: `[path]`
- **Environment variables**: `[path]`
- **Build output**: `[path]`

---

*Keep this file as a quick reference. Full architecture in architecture.md*
```

### Template: `skills/reverse-engineer/templates/bmad/architecture.md`

```markdown
# Architecture

> Full technical architecture documentation. Loaded on demand, not every session.

## Overview

[2-3 paragraph summary of the system architecture, key decisions, and design philosophy]

---

## System Architecture

### High-Level Diagram

```
[ASCII diagram showing main components and data flow]

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    API      │────▶│  Database   │
│  (React)    │◀────│  (Express)  │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  External   │
                    │  Services   │
                    └─────────────┘
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| [Component] | [What it does] | [Tech used] |

---

## Database Architecture

### Schema Overview

```
[ERD or table relationships in text format]
```

### Tables/Collections

#### [Table Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| [col] | [type] | [constraints] | [description] |

### Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| [table] | [name] | [cols] | [why] |

---

## API Architecture

### Endpoints Overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/[resource] | [yes/no] | [description] |
| POST | /api/[resource] | [yes/no] | [description] |

### Authentication

- **Method**: [JWT / Session / OAuth]
- **Token location**: [Header / Cookie]
- **Expiration**: [duration]
- **Refresh strategy**: [description]

---

## Security Architecture

### Authentication Flow

```
[Describe auth flow step by step]
```

### Authorization

- **Model**: [RBAC / ABAC / Custom]
- **Roles**: [list roles]
- **Permissions**: [how managed]

---

## Infrastructure

### Deployment Architecture

```
[Describe deployment setup]
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | DB connection | postgres://... |
| JWT_SECRET | Token signing | [secret] |

---

## Development Workflow

### Local Setup

```bash
# Steps to run locally
[commands]
```

### Testing

```bash
# Run tests
[commands]
```

### Deployment

```bash
# Deploy steps
[commands]
```

---

*Generated by StackShift reverse engineering process*
```

### Template: `skills/reverse-engineer/templates/bmad/prd.md`

```markdown
# Product Requirements Document

> Extracted by StackShift reverse engineering process
> Date: [DATE]
> Route: [ROUTE]

---

## Executive Summary

[2-3 paragraph summary of:
- What this product does
- Who it's for
- Key value proposition]

---

## Goals & Success Metrics

### Primary Goals

1. **[Goal 1]**: [Description]
2. **[Goal 2]**: [Description]
3. **[Goal 3]**: [Description]

### Success Metrics

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| [metric] | [target] | [current] | [how measured] |

---

## Functional Requirements

### FR-001: [Requirement Name]

- **Priority**: P0 / P1 / P2 / P3
- **Status**: Complete / Partial / Not Started
- **Description**: [What it does]
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

[Continue for all functional requirements...]

---

## Non-Functional Requirements

### NFR-001: Performance

- **Response time**: [target]
- **Throughput**: [target]
- **Concurrent users**: [target]

### NFR-002: Security

- **Authentication**: [requirements]
- **Authorization**: [requirements]
- **Data protection**: [requirements]

---

## Epic Definitions

### Epic 1: [Epic Name]

**Description**: [What this epic delivers]

**Features included**:
- FR-001: [name]
- FR-002: [name]

**Dependencies**: [Other epics or external]

**Estimated scope**: [S/M/L/XL]

---

## User Stories

### [Epic 1] Stories

#### US-001: [Story Title]

**As a** [user type]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria**:
- [ ] Given [context], when [action], then [result]

**Priority**: P0 / P1 / P2 / P3

---

## Out of Scope

The following are explicitly NOT included in this product:

1. **[Item]**: [Why excluded]

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [risk] | High/Med/Low | High/Med/Low | [approach] |

---

## Dependencies

### External Dependencies

| Dependency | Type | Status | Owner |
|------------|------|--------|-------|
| [dep] | API / Service / Team | [status] | [who] |

---

*Generated by StackShift reverse engineering process*
*Ready for BMAD PM agent to process*
```

---

## Testing & Verification

### Manual Testing Checklist

1. **Gear 1 - Framework Choice**
   - [ ] Run `/stackshift.analyze` or `analyze` skill
   - [ ] Verify Question 2 (Implementation Framework) appears
   - [ ] Select "BMAD Method"
   - [ ] Verify `.stackshift-state.json` contains `"implementation_framework": "bmad"`

2. **Gear 2 - BMAD Output**
   - [ ] Run `/stackshift.reverse-engineer`
   - [ ] Verify `docs/` directory created (not `docs/reverse-engineering/`)
   - [ ] Verify `docs/index.md` exists
   - [ ] Verify `docs/architecture/` directory with 3 lean files
   - [ ] Verify `docs/architecture.md` (full) exists
   - [ ] Verify `docs/prd.md` exists
   - [ ] Check lean files are under line limits

3. **Gears 3-5 - Skip Behavior**
   - [ ] Run `/stackshift.create-specs` with BMAD framework
   - [ ] Verify it shows "Skip This Gear" message
   - [ ] Same for `/stackshift.gap-analysis`
   - [ ] Same for `/stackshift.complete-spec`

4. **Gear 6 - BMAD Handoff**
   - [ ] Run `/stackshift.implement` with BMAD framework
   - [ ] Verify it shows BMAD handoff instructions
   - [ ] Verify `*workflow-init` command is mentioned
   - [ ] Verify installation instructions are shown

5. **Cruise Control - BMAD Path**
   - [ ] Run cruise control with BMAD framework
   - [ ] Verify Gears 1-2 execute
   - [ ] Verify Gears 3-5 are skipped
   - [ ] Verify Gear 6 shows handoff

### Integration Test with BMAD

1. Run StackShift on a test codebase with BMAD selected
2. Verify `docs/` structure matches BMAD's expectations
3. Install BMAD: `npx bmad-method@alpha install`
4. Run `*workflow-init`
5. Verify BMAD recognizes the `docs/` as existing documentation
6. Verify BMAD agents can process the generated docs

---

## Troubleshooting

### Framework not detected

**Symptom**: Gear 2+ defaults to Spec Kit even though BMAD was selected

**Fix**: Check `.stackshift-state.json` has `"implementation_framework": "bmad"`. If missing, re-run Gear 1.

### Lean files too long

**Symptom**: BMAD dev agent context overflows

**Fix**: Edit `docs/architecture/*.md` files to be under limits:
- `tech-stack.md`: < 100 lines
- `coding-standards.md`: < 150 lines
- `project-structure.md`: < 100 lines

Move details to `docs/architecture.md`.

### BMAD doesn't recognize docs

**Symptom**: `*workflow-init` doesn't detect existing documentation

**Fix**: Ensure `docs/index.md` exists and has proper structure. BMAD looks for this file to detect existing docs.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial BMAD integration |

---

*This guide enables any Claude instance to implement BMAD integration in an enterprise StackShift fork.*
