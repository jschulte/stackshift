<div align="center">

<img src="public/stackshift-logo.png" alt="StackShift" width="400">

**A reverse engineering toolkit that lets you shift gears in your codebase.**

Transform any application into a fully-specified, spec-driven project with complete control - whether you're shifting to a new tech stack or taking the wheel on existing code.

<p>
  <a href="https://github.com/sponsors/jschulte"><img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="GitHub Sponsors"></a>
  <a href="https://ko-fi.com/jschulte"><img src="https://img.shields.io/badge/Support-Ko--fi-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi"></a>
</p>

<p>
  <a href="https://github.com/jschulte/stackshift/actions/workflows/ci.yml"><img src="https://github.com/jschulte/stackshift/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/jschulte/stackshift/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.3.0-blue" alt="TypeScript">
</p>

</div>

> **Two paths, two frameworks, complete control:**
>
> **🔀 Greenfield:** Extract business logic from your legacy app, then rebuild in a modern stack using tech-agnostic specs.
>
> **⚙️ Brownfield:** Transform your existing codebase into a spec-driven project for ongoing management.
>
> **🛠️ Choose Your Implementation Framework:**
> - **GitHub Spec Kit** - Feature specs in `.specify/`, task-driven workflow
> - **BMAD Method** - Handoff to BMAD agents for collaborative artifact creation
>
> Start in reverse (engineering), shift through 6 gears, and cruise into spec-driven development!
>
> *Free and open source. [Support development](https://github.com/sponsors/jschulte) to keep the gears turning!* ☕🚗

---

## 📚 Documentation

- **[Quick Start](QUICKSTART.md)** - Get started in 5 minutes!
- **[Installation Guide](docs/guides/INSTALLATION.md)** - Detailed installation for all platforms
- **[Plugin Guide](docs/guides/PLUGIN_GUIDE.md)** - Claude Code plugin usage
- **[Web Guide](web/README.md)** - Using in Claude Code Web (browser)
- **[Batch Processing](scripts/BATCH_PROCESSING_GUIDE.md)** - Process multiple projects efficiently
- **[Ecosystem Discovery](#-ecosystem-discovery)** - Auto-discover all related repos from a single starting point

---

## 🎯 What StackShift Does

**Reverse Engineering Meets Manual Control** - StackShift provides a **systematic, 6-gear process** to:

0. **🗺️ Pre-Gear:** Discover - Auto-discover the entire ecosystem from one repo *(optional)*
1. **🔍 First Gear:** Analyze - Detect tech stack and assess completeness
2. **🔄 Second Gear (Reverse!):** Reverse Engineer - Extract comprehensive documentation
3. **📋 Third Gear:** Create Specifications - Transform into GitHub Spec Kit format
4. **🔎 Fourth Gear:** Gap Analysis - Identify what's missing or incomplete
5. **✨ Fifth Gear:** Complete Specification - Resolve ambiguities and clarifications
6. **🚀 Sixth Gear:** Implement - Build features from specs!

**Two Paths - Choose Your Route:**

<!-- DIAGRAM: workflow-start -->
### Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> Discover: optional pre-step
    [*] --> Analyze
    Discover --> Batch: ecosystem map
    Discover --> Reimagine: capability synthesis
    Batch --> Analyze: per-repo
    Analyze --> ReverseEngineer: Gear 2
    ReverseEngineer --> CreateSpecs: Gear 3
    CreateSpecs --> GapAnalysis: Gear 4
    GapAnalysis --> CompleteSpec: Gear 5
    CompleteSpec --> Implement: Gear 6
    Analyze --> CruiseControl: auto mode
    Implement --> [*]
    CruiseControl --> [*]
    Reimagine --> [*]
```

*Last generated: 2026-02-12*
<!-- DIAGRAM: workflow-end -->


### 🔀 Path A: Greenfield (Shift to New Stack)
**Use when:** Rebuilding in a different tech stack or platform

**Approach:** Extract business logic ONLY (tech-agnostic)
- Focus on WHAT the system does, not HOW
- Framework-agnostic specifications
- Can implement in any technology
- Perfect for platform migrations

**Example:** "Extract business logic from Rails app to rebuild in Next.js"

### ⚙️ Path B: Brownfield (Take the Wheel on Existing Code)
**Use when:** Managing existing codebase with GitHub Spec Kit

**Approach:** Extract business logic + technical implementation (tech-prescriptive)
- Document both WHAT and HOW
- Capture exact tech stack, versions, file paths
- Enables `/speckit.analyze` validation
- Perfect for ongoing spec-driven development

**Two Modes:**
- **Standard**: Create specs for current state (as-is)
- **Upgrade** 🆕: Create specs + upgrade all dependencies to latest versions

**Example:** "Add GitHub Spec Kit to existing Next.js app for spec-driven management"
**Example (Upgrade):** "Spec this legacy app AND upgrade everything to modern versions"

**Result**: A fully-documented, specification-driven application ready for enterprise development.

---

## 🚗 6-Gear Process

```
┌─────────────────────────────────────────────────────────────┐
│                  Shift Through 6 Gears                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Gear 1: Initial Analysis + Route + Framework Selection     │
│  ├─ Detect technology stack                                 │
│  ├─ Choose route: Greenfield or Brownfield?                 │
│  └─ Choose framework: GitHub Spec Kit or BMAD Method?       │
│         │                                                    │
│         ▼                                                    │
│  Gear 2: Reverse Engineer (Reverse Gear!)                   │
│  ├─ Extract business logic + tech details                   │
│  └─ Generate 9 docs to docs/reverse-engineering/ (BOTH)     │
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
│  └─ BMAD: Handoff to *workflow-init (collaborative PRD)     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Three Ways to Use StackShift

#### Option 1: Claude Code Plugin (Local - Best Experience)

**Recommended for:** Regular use, local development

Install as a Claude Code plugin for interactive skills and workflow tracking:

```bash
# In Claude Code
> /plugin marketplace add jschulte/claude-plugins
> /plugin install stackshift
```

Restart Claude Code. Skills will now be available:
- `analyze` - Initial Analysis
- `reverse-engineer` - Reverse Engineer
- `create-specs` - Create Specifications
- `gap-analysis` - Gap Analysis
- `complete-spec` - Complete Specification
- `implement` - Implement from Spec
- `discover` - Ecosystem Discovery (find all related repos from one starting point)

**Usage:**

Skills auto-activate based on context, or invoke explicitly:

```
# Auto-activation
User: "I need to reverse engineer this codebase"
Claude: [analyze skill activates automatically]

# Explicit invocation
Just ask naturally: "Run initial analysis" or "Analyze this codebase"
```

### Prerequisites

- Claude Code with plugin support
- Git repository with existing codebase
- ~2-4 hours total time for complete process

### Run the Process

**With Plugin (Recommended):**

```bash
# Navigate to your project
cd /path/to/your/project

# Start Claude Code
# Skills will guide you through the process automatically
```

Simply say: "I want to reverse engineer this application" and Claude will guide you through all 6 steps.

**Initial Configuration:**

StackShift will ask a few questions upfront:
1. Route: Greenfield or Brownfield?
2. Implementation Framework: GitHub Spec Kit or BMAD Method?
3. Transmission: Manual or Cruise Control?
4. (If Cruise Control + Spec Kit) Clarifications strategy & implementation scope
5. (If Greenfield) Target tech stack

All answers saved to `.stackshift-state.json` - configure once, use throughout!

**Without Plugin (Manual):**

If not using the plugin, use the web bootstrap for manual execution:

```bash
# 1. Clone StackShift
git clone https://github.com/jschulte/stackshift.git

# 2. Use web bootstrap prompt
cat web/WEB_BOOTSTRAP.md
# Copy and paste into Claude.ai or Claude Code Web

# Or use the legacy prompts (for reference):
cat legacy/original-prompts/01-initial-analysis.md
```

**Recommended**: Use the web bootstrap or plugin for the best experience.

#### Option 2: Claude Code Web (Browser - No Install!)

**Recommended for:** Quick analysis, trying before installing, working on any device

```bash
# In Claude Code Web (https://claude.ai/code)
1. Connect to your GitHub account
2. Select your repo from the dropdown
3. Copy-paste web/WEB_BOOTSTRAP.md
4. Hit enter and shift through the gears! 🚗
```

See [`web/README.md`](web/README.md) for complete instructions.

**Benefits:**
- ☁️ Works in browser (any device)
- 🚀 No installation required
- 🔄 Full cruise control support
- 💾 Download specs when complete

---

## 🔀 Choose Your Route

**StackShift asks this question in Gear 1 (Initial Analysis):**

> Which path best aligns with your goals?
>
> **A) Greenfield:** Build new app based on business logic
>    - Extract business requirements only (tech-agnostic)
>    - Can implement in any stack
>    - Focus: WHAT the system does
>
> **B) Brownfield:** Manage this app with Spec Kit
>    - Extract business logic + technical details (prescriptive)
>    - Manage existing codebase with specs
>    - Focus: WHAT it does + HOW it's implemented

### When to Choose Greenfield (Path A)

**Perfect for:**
- 🔄 **Platform migrations** - Rails → Next.js, PHP → Python, Monolith → Microservices
- 🏗️ **Technology modernization** - Rebuild with modern stack
- 📱 **Cross-platform** - Web app → Mobile app using same business logic
- ♻️ **Clean slate** - Start fresh with better architecture
- 🎯 **Team flexibility** - Let new team choose their preferred stack

**Results in:**
- Specifications that describe business requirements only
- No framework or library mentions
- Can be implemented in ANY technology
- Example: "User authentication with email/password" (not "JWT via passport.js")

### When to Choose Brownfield (Path B)

**Perfect for:**
- 📋 **Spec-driven management** - Add GitHub Spec Kit to existing codebase
- 🔍 **Validation** - Use `/speckit.analyze` to ensure specs match code
- ⬆️ **Planned upgrades** - Manage framework/dependency upgrades via specs
- 🔧 **Gradual refactoring** - Spec-driven modernization of existing app
- 👥 **Team onboarding** - Use prescriptive specs as documentation

**Results in:**
- Specifications that describe business requirements + exact implementation
- Framework, library, version details included
- `/speckit.analyze` validates code matches specs
- Example: "User authentication using JWT via jose 5.1.0, bcrypt 5.1.1, stored in httpOnly cookies"

### Path Comparison

| Aspect | Greenfield (A) | Brownfield (B) |
|--------|----------------|----------------|
| **Focus** | WHAT only | WHAT + HOW |
| **Tech Stack** | Any (your choice) | Current (documented) |
| **Specifications** | Agnostic | Prescriptive |
| **Implementation** | Build new | Manage existing |
| **Flexibility** | High | Constrained to current stack |
| **Validation** | Manual | Automated |
| **Use Case** | Platform migration | Ongoing development |

---

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

**Output structure (same as Spec Kit):**
```
docs/reverse-engineering/
├── functional-specification.md   # Business logic, requirements
├── integration-points.md         # External services, APIs
├── configuration-reference.md    # All config options
├── data-architecture.md          # Data models, API contracts
├── operations-guide.md           # Deployment, infrastructure
├── technical-debt-analysis.md    # Issues, improvements
├── observability-requirements.md # Monitoring, logging
├── visual-design-system.md       # UI/UX patterns
└── test-documentation.md         # Testing requirements
```

**Workflow:**
1. StackShift generates `docs/reverse-engineering/` (Gears 1-2) - same output as Spec Kit
2. Gears 3-5 skipped (BMAD's agents handle PRD/Architecture collaboratively)
3. Gear 6 hands off to BMAD's `*workflow-init` with rich context
4. BMAD's PM and Architect agents create artifacts through conversation

**Key difference:** StackShift provides the same reverse-engineering docs as input. BMAD's value is the **collaborative artifact creation** - PM agent discusses requirements with you, Architect agent discusses technical decisions with you. The PRD and Architecture emerge from conversation, not auto-generation.

**Best for:** Large projects, enterprise teams, agent-driven workflows

### Framework Comparison

| Aspect | GitHub Spec Kit | BMAD Method |
|--------|-----------------|-------------|
| **Gear 2 Output** | Same 9 docs | Same 9 docs |
| **Gears 3-5** | Create `.specify/` specs | Skipped (BMAD handles) |
| **Gear 6** | `/speckit.implement` | Handoff to `*workflow-init` |
| **Artifact Creation** | Automated from docs | Collaborative with BMAD agents |
| **Best For** | Task-driven teams | Agent-driven enterprise teams |

**Note:** StackShift's reverse engineering (Gear 2) replaces BMAD's Phase 0 (`document-project`) with deeper analysis. Both frameworks get the same rich context.

---

## 📁 StackShift Structure

### Plugin Structure

```
stackshift/
├── .claude-plugin/       # Plugin metadata
├── .claude/              # Settings and commands
│   ├── commands/         # Slash commands
│   └── settings.json     # Plugin settings
├── agents/               # Agent definitions
├── docs/                 # Documentation
├── public/               # Public assets
├── scripts/              # Utility scripts
├── skills/               # Skill definitions (6 gears + extras)
├── web/                  # Web resources
├── package.json          # Plugin metadata
└── README.md
```

### Plugin Benefits

**Why use the plugin over manual prompts?**

✅ **Auto-activation** - Skills activate based on context, no copy-paste needed
✅ **Progress tracking** - State management tracks where you are (which gear)
✅ **Resume capability** - Pick up where you left off if interrupted
✅ **Guided experience** - StackShift knows the full context and next steps
✅ **Templates included** - Access all templates without file operations
✅ **Updates** - Get improvements via plugin updates
✅ **Smooth shifting** - Seamless transitions between steps

---

## 📖 Detailed Process Guide

### Step 1: Initial Analysis (5 minutes)

**What it does:**
- Detects programming language and framework
- Identifies application type (web, mobile, API, etc.)
- Maps directory structure
- Finds configuration files
- Estimates codebase size and completeness

**Output:**
- `analysis-report.md` with tech stack summary
- Quick assessment of what exists

**Plugin Skill:** `/stackshift:analyze`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 1)

---

### Step 2: Reverse Engineer (30 minutes)

**What it does:**
- Deep codebase analysis using specialized agents
- Extracts all data models, API endpoints, components
- Documents configuration, infrastructure, operations
- Analyzes technical debt and test coverage
- Generates 9 comprehensive documents

**Output:**
```
docs/reverse-engineering/
├── functional-specification.md     (Business logic, requirements)
├── integration-points.md           (External services, APIs, dependencies)
├── configuration-reference.md      (All config options)
├── data-architecture.md            (Data models, API contracts)
├── operations-guide.md             (Deployment, infrastructure)
├── technical-debt-analysis.md      (Issues, improvements)
├── observability-requirements.md   (Monitoring, logging)
├── visual-design-system.md         (UI/UX patterns)
└── test-documentation.md           (Testing requirements)
```

**Plugin Skill:** `/stackshift:reverse-engineer`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 2)

---

### Step 3: Create Specifications (30 minutes)

**What it does:**
- Transforms reverse-eng docs into formal specifications
- Creates feature specs (F001-F0XX format)
- Marks implementation status (✅ COMPLETE, ⚠️ PARTIAL, ❌ MISSING)
- Generates OpenAPI specification for APIs
- Creates JSON Schemas for data models
- Sets up GitHub Spec Kit structure

**Output:**
```
specs/
├── features/
│   ├── F001-user-authentication.md     (✅ COMPLETE)
│   ├── F002-data-management.md         (⚠️ PARTIAL)
│   ├── F003-advanced-features.md       (❌ MISSING)
│   └── ...
├── api/
│   └── openapi.yaml                    (Complete API spec)
├── data/
│   └── schemas/                        (JSON Schemas)
├── implementation-status.md            (Gap summary)
└── constitution.md                     (Project principles)
```

**Plugin Skill:** `/stackshift:create-specs`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 3)

---

### Step 4: Gap Analysis (15 minutes)

**What it does:**
- Compares specifications against implementation
- Identifies incomplete features
- Lists missing UI components
- Highlights technical debt
- Creates `[NEEDS CLARIFICATION]` markers for ambiguities
- Generates prioritized gap list

**Output:**
```
specs/gap-analysis.md
├── Missing Features (not started)
├── Partial Features (backend done, UI missing)
├── Technical Debt (needs improvement)
├── Clarifications Needed (ambiguous requirements)
└── Prioritized Implementation Plan
```

**Plugin Skill:** `/stackshift:gap-analysis`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 4)

---

### Step 5: Complete Specification (30-60 minutes, INTERACTIVE)

**What it does:**
- **Interactive conversation** to fill specification gaps
- Claude asks clarifying questions about missing features
- You provide details on UX, UI, behavior, priorities
- Specifications updated with your answers
- `[NEEDS CLARIFICATION]` markers resolved
- Final, complete specification created

**Example Questions:**
- "Analytics dashboard is missing - what charts do you want?"
- "Should offline sync be priority P0 or P2?"
- "For photo upload, drag-drop or click to browse?"
- "Species input: free-text or autocomplete dropdown?"

**Output:**
- Complete, unambiguous specifications
- No `[NEEDS CLARIFICATION]` markers remaining
- Clear implementation roadmap
- Prioritized feature list

**Plugin Skill:** `/stackshift:complete-spec`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 5)

---

### Step 6: Implement from Spec (Hours to Days)

**What it does:**
- Systematically implements missing features from specs
- Works through prioritized list (P0 → P1 → P2)
- Checks off items as completed
- Validates implementation against specification
- Achieves 100% completion

**Approach:**
```bash
# For each missing feature:
1. Review specification
2. Implement according to spec
3. Test against acceptance criteria
4. Mark as complete
5. Move to next feature
```

**Output:**
- Fully implemented application
- All specs marked ✅ COMPLETE
- Test coverage at target levels
- Production-ready codebase

**Plugin Skill:** `/stackshift:implement`
**Manual:** Use `web/WEB_BOOTSTRAP.md` (Gear 6)

---

## 🔄 Adapting for Different Application Types

This toolkit works for:

### Web Applications
- Frontend frameworks: React, Vue, Angular, Svelte
- Backend: Node.js, Python, Ruby, Go, Java
- Databases: SQL, NoSQL, any data store

### Mobile Applications
- React Native, Flutter, Swift, Kotlin
- Adapts documentation to mobile-specific patterns

### APIs / Microservices
- REST, GraphQL, gRPC
- Generates OpenAPI/AsyncAPI specs
- Documents service contracts

### Monoliths
- Breaks into logical modules
- Creates specifications per domain
- Identifies bounded contexts

### Legacy Systems
- Works even with minimal documentation
- Infers behavior from code
- Creates modernization roadmap

---

## Ecosystem Discovery

**Start with one repo. Discover the entire platform.**

When reverse-engineering a large system, the hardest part is figuring out *which repos matter*. The `discover` skill solves this:

```
/stackshift.discover
```

### How It Works

```mermaid
flowchart LR
    A[Starting Repo] --> B[Scan 10 Signal Types]
    B --> C{GitHub org detected?}
    C -->|Yes| D[Search GitHub Org]
    C -->|No| E[Skip]
    D --> F[Scan Local Filesystem]
    E --> F
    F --> G[Merge & Score Confidence]
    G --> H[Present Ecosystem Map]
    H --> I{User confirms}
    I -->|Add/Remove| H
    I -->|Looks good| J{Next step?}
    J --> K["/stackshift.batch"]
    J --> L["/stackshift.reimagine"]
    J --> M[Export map only]
```

### The Full Pipeline

```mermaid
flowchart TD
    D["/stackshift.discover"] -->|ecosystem map| B["/stackshift.batch"]
    D -->|ecosystem map| R["/stackshift.reimagine"]
    B -->|per repo| G1["Gear 1: Analyze"]
    G1 --> G2["Gear 2: Reverse Engineer"]
    G2 --> G3["Gear 3: Create Specs"]
    G3 --> G4["Gear 4: Gap Analysis"]
    G4 --> G5["Gear 5: Complete Spec"]
    G5 --> G6["Gear 6: Implement"]
    B -->|all docs| R
    R --> V["Reimagined Vision + New Specs"]
```

### 10 Signal Categories

| # | Signal | Where It Looks | Example |
|---|--------|---------------|---------|
| 1 | Scoped npm packages | `package.json` | `@myorg/shared-utils` |
| 2 | Docker Compose services | `docker-compose*.yml` | `depends_on: [auth-api]` |
| 3 | Environment variables | `.env*`, config files | `USER_SERVICE_URL` |
| 4 | API client calls | Source code | `fetch('http://auth-service')` |
| 5 | Shared databases | Connection strings | Same DB in multiple configs |
| 6 | CI/CD triggers | `.github/workflows/` | `repository_dispatch` |
| 7 | Workspace configs | `pnpm-workspace.yaml`, `turbo.json`, `nx.json` | Monorepo packages |
| 8 | Message queues | Source code, config | SQS queues, Kafka topics |
| 9 | Infrastructure refs | `terraform/`, `k8s/` | Shared VPCs, ALBs |
| 10 | Language-specific deps | `go.mod`, `requirements.txt` | `replace ../shared` |

### Confidence Scoring

Each discovered repo gets a confidence level:

| Level | Meaning | Example |
|-------|---------|---------|
| **CONFIRMED** | User-listed or workspace config | Found in `pnpm-workspace.yaml` |
| **HIGH** | 2+ independent signals | Docker Compose + env var + API call |
| **MEDIUM** | 1 strong signal | Scoped npm package dep |
| **LOW** | Naming pattern or GitHub search only | Repo name matches org convention |

### Key Features

- **Auto-detects GitHub org** from `git remote` (SSH and HTTPS, GitHub and GitLab)
- **Monorepo-aware** — workspace packages are auto-CONFIRMED, intra-monorepo deps mapped
- **Seamless batch handoff** — `/stackshift.batch` reads the discovered repo list automatically
- **Graceful degradation** — works without GitHub access (local scan only), handles rate limits
- **Large ecosystem support** — Mermaid diagrams auto-simplify for 20+ repos

### Example Session

```
You: /stackshift.discover
StackShift: "Auto-detected GitHub org: myorg (from git remote)"
StackShift: "Scanning user-service for integration signals..."
StackShift: "Found 12 related repos!"

  CONFIRMED: user-service, shared-utils, auth-service
  HIGH:      inventory-api, notification-hub, billing-api, order-service
  MEDIUM:    admin-dashboard, reporting-service, config-repo
  LOW:       legacy-gateway, monitoring-stack

StackShift: "Does this look right? (add/remove/proceed)"
You: "Looks good, run batch"
→ /stackshift.batch picks up the discovered repo list automatically
→ All 12 repos analyzed in parallel batches of 5
```

---

## 📋 Checklist: Is This Toolkit Right for You?

Use this toolkit if:

- ✅ You have an existing codebase (partial or complete)
- ✅ Documentation is lacking or outdated
- ✅ You want to establish spec-driven development
- ✅ You need to understand what's implemented vs. missing
- ✅ You want a systematic approach to completion
- ✅ You're using AI coding agents (Claude Code, Copilot, etc.)

**This toolkit is NOT for:**

- ❌ Brand new projects (use GitHub Spec Kit from the start)
- ❌ Throwaway prototypes
- ❌ Applications you plan to completely rewrite

---

## 💡 Best Practices

### Before Starting

1. **Commit current state** - Create a clean git state
2. **Create a branch** - Don't work on main
3. **Set aside time** - Steps 1-5 take ~2-4 hours
4. **Have context ready** - Know your app's purpose and users

### During Process

1. **Follow prompts in order** - Each step builds on previous
2. **Don't skip Step 5** - The interactive refinement is crucial
3. **Be thorough with clarifications** - Vague specs = buggy implementations
4. **Review generated specs** - Validate accuracy before implementing

### After Completion

1. **Keep specs updated** - Update specs when adding features
2. **Use spec-driven workflow** - New features start with specs
3. **Run periodically** - Re-run on major refactors or after acquisitions

---

## 🛠️ Troubleshooting

### "Claude can't find my configuration files"
- Make sure you're in the project root directory
- Check that config files aren't gitignored
- Explicitly mention unusual config locations

### "Generated specs are inaccurate"
- Step 5 is where you correct inaccuracies
- Use `[NEEDS CLARIFICATION]` to mark uncertain areas
- Review and refine before implementing

### "Too much output, can't process"
- Break large monoliths into modules
- Run toolkit per module/microservice
- Increase context window (use Claude Sonnet 4.5)

### "Missing important features in gap analysis"
- Manually add to `specs/features/`
- Use templates in `templates/` folder
- Re-run Step 4 with hints about what's missing

---

## 📈 Success Metrics

After running this toolkit, you should have:

- ✅ **100% documentation coverage** - Every feature documented
- ✅ **Clear implementation status** - Know exactly what exists
- ✅ **Formal specifications** - Unambiguous feature definitions
- ✅ **Identified gaps** - Complete list of missing pieces
- ✅ **Implementation roadmap** - Prioritized plan to completion
- ✅ **Spec-driven workflow** - Established for future development

---

## 🤝 Contributing

This toolkit is designed to be:
- **Generic** - Works for any application
- **Extensible** - Add your own prompts/templates
- **Shareable** - Use across teams and organizations

Improvements welcome:
1. Fork this toolkit
2. Add/improve prompts or templates
3. Share back with community
4. Help others achieve spec-driven development

---

## 📚 Additional Resources

- [GitHub Spec Kit](https://github.com/github/spec-kit) - Official spec-driven development toolkit
- [OpenAPI Specification](https://swagger.io/specification/) - API specification standard
- [JSON Schema](https://json-schema.org/) - Data validation standard
- [Architecture Decision Records](https://adr.github.io/) - Document key decisions

---

## 📝 License

This toolkit is provided as-is for use in any project. Adapt and modify as needed for your organization.

---

## ❓ Questions & Feedback

This toolkit was created to solve a real problem: **transforming partially-complete applications into fully-specified, enterprise-grade codebases**.

**Encountered an issue or have a suggestion?**

- 🐛 **Found a bug?** [Open an issue](https://github.com/jschulte/stackshift/issues/new)
- 💡 **Have an idea?** [Start a discussion](https://github.com/jschulte/stackshift/discussions)
- 🔧 **Want to contribute?** [Submit a pull request](https://github.com/jschulte/stackshift/pulls)

The toolkit improves with real-world usage and community feedback!

---

**Happy Shifting! 🚗💨**

*Start in reverse (engineering), shift through 6 gears, cruise into spec-driven development.*
