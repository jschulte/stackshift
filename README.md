<div align="center">

<img src="public/stackshift-logo.png" alt="StackShift" width="400">

**A reverse engineering toolkit that lets you shift gears in your codebase.**

Transform any application into a fully-specified, spec-driven project with complete control - whether you're shifting to a new tech stack or taking the wheel on existing code.

<p>
  <a href="https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/actions/workflows/ci.yml"><img src="https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.3.0-blue" alt="TypeScript">
</p>

</div>

> **Six routes with auto-detection:**
>
> **🔀 Greenfield:** Extract business logic from your legacy app, then rebuild in a modern stack using tech-agnostic specs.
>
> **⚙️ Brownfield:** Transform your existing codebase into a spec-driven project and manage it with GitHub Spec Kit going forward.
>
> **🎯 Osiris Widget:** Auto-detects ws-* repos. Extracts widget + ws-scripts + all wsm-*/ddc-* modules.
>
> **📦 Osiris Module:** Auto-detects wsm-*/ddc-* repos. Extracts shared module business logic and API contracts.
>
> **🏛️ CMS V9 Widget:** Auto-detects Velocity widgets in cms-web/htdocs/v9/widgets/. Extracts widget + components + Java backend.
>
> **🎨 CMS Viewmodel:** Auto-detects Groovy viewmodel widgets in cms-web/htdocs/v9/viewmodel/. Simpler than Velocity.
>
> **⬆️ Upgrade Mode:** Brownfield route with automatic dependency upgrades to latest versions (modernize while spec'ing).
>
> Start in reverse (engineering), shift through 6 gears, and cruise into spec-driven development!
>
> **Built for Cox Automotive** - Accelerating our journey to world-class software engineering through systematic transformation of our entire application portfolio.

---

## 📚 Documentation

- **[Quick Start](QUICKSTART.md)** - Get started in 5 minutes!
- **[Installation Guide](docs/guides/INSTALLATION.md)** - Detailed installation for all platforms
- **[Plugin Guide](docs/guides/PLUGIN_GUIDE.md)** - Claude Code plugin usage
- **[Brownfield Upgrade Mode](docs/guides/BROWNFIELD_UPGRADE_MODE.md)** - Spec-driven dependency modernization
- **[Web Guide](web/README.md)** - Using in Claude Code Web (browser)
- **[Batch Processing](scripts/BATCH_PROCESSING_GUIDE.md)** - Process multiple projects efficiently
- **[ws-scripts Reference](docs/osiris/ws-scripts-capabilities.md)** - Osiris widget infrastructure (Cox Automotive)

---

## 🎯 What StackShift Does

**Reverse Engineering Meets Manual Control** - StackShift provides a **systematic, 6-gear process** to:

1. **🔍 First Gear:** Analyze - Detect tech stack and assess completeness
2. **🔄 Second Gear (Reverse!):** Reverse Engineer - Extract comprehensive documentation
3. **📋 Third Gear:** Create Specifications - Transform into GitHub Spec Kit format
4. **🔎 Fourth Gear:** Gap Analysis - Identify what's missing or incomplete
5. **✨ Fifth Gear:** Complete Specification - Resolve ambiguities and clarifications
6. **🚀 Sixth Gear:** Implement - Build features from specs!

**Six Routes - Auto-Detection + Manual Choice:**

<!-- DIAGRAM: workflow-start -->
### Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> analyze
    analyze --> reverse-engineer
    reverse-engineer --> create-specs
    create-specs --> gap-analysis
    gap-analysis --> complete-spec
    complete-spec --> implement
    analyze --> cruise-control: auto
    implement --> [*]
    cruise-control --> [*]
```

*Last generated: 2025-11-18T13:30:45.122Z*
<!-- DIAGRAM: workflow-end -->


### 🔀 Route A: Greenfield (Shift to New Stack)
**Use when:** Rebuilding in a different tech stack or platform

**Approach:** Extract business logic ONLY (tech-agnostic)
- Focus on WHAT the system does, not HOW
- Framework-agnostic specifications
- Can implement in any technology
- Perfect for platform migrations

**Example:** "Extract business logic from Rails app to rebuild in Next.js"

### ⚙️ Route B: Brownfield (Take the Wheel on Existing Code)
**Use when:** Managing existing codebase with GitHub Spec Kit

**Approach:** Extract business logic + technical implementation (tech-prescriptive)
- Document both WHAT and HOW
- Capture exact tech stack, versions, file paths
- Enables `/speckit.analyze` validation
- Perfect for ongoing spec-driven development

**Two Modes:**
- **Standard:** Create specs for current state (as-is)
- **Upgrade:** 🆕 Create specs + upgrade all dependencies to latest versions

**Example:** "Add GitHub Spec Kit to existing Next.js app for spec-driven management"

**Example (Upgrade):** "Spec this legacy app AND upgrade everything to modern versions"

### 🎯 Route C: Osiris (Cox Automotive Widget Services)
**Use when:** Analyzing Cox Automotive Osiris Widget Services (ws-* repos)

**Auto-detected when:** Repository name starts with `ws-`

**Approach:** Comprehensive widget + module extraction (tech-agnostic)
- Extract widget business logic
- Extract ws-scripts infrastructure (SSR, Common data, preferences, feature flags)
- Deep-dive all wsm-* module dependencies
- Analyze ddc-* library integrations
- Document complete business logic for migration

**What Gets Analyzed:**
1. **Widget Code** - React components, state management, user interactions
2. **ws-scripts Infrastructure** - Server-side rendering, build tooling, common data
3. **Configuration Files** - config/prefs.json, feature-flags.json, labels.json
4. **Server-Side Logic** - src/server/store.js, endpoints.js, middleware
5. **WSM Modules** - All wsm-* dependencies (often 60-80% of business logic)
6. **DDC Libraries** - ddc-* utility integrations

**Example:** "Extract ws-vehicle-details widget and all module dependencies for migration to Next.js"

**Result:** Complete business logic captured from widget AND all shared modules, ready for migration.

### 📦 Route D: Osiris Module (Cox Automotive Shared Modules)
**Use when:** Analyzing Cox Automotive shared modules (wsm-*, ddc-*)

**Auto-detected when:** Repository name starts with `wsm-` or `ddc-`

**Approach:** Module business logic extraction (tech-agnostic)
- Extract module functionality and purpose
- Document configuration options (PropTypes/interfaces)
- Extract business rules and calculations
- Document data contracts (inputs/outputs)
- Analyze edge case handling
- Document integration patterns

**What Gets Analyzed:**
1. **Module Code** - React components, hooks, utilities
2. **Configuration** - PropTypes or TypeScript interfaces
3. **Business Logic** - Calculations, validations, transformations
4. **Data Contracts** - Input/output schemas
5. **Integration Patterns** - How widgets consume the module

**Example:** "Extract wsm-pricing-display module - pricing calculations, formatting, configuration options"

**Result:** Complete module business logic, ready for standalone extraction or widget migration.

### 🏛️ Route E: CMS V9 Widget (Legacy Velocity Widgets)
**Use when:** Analyzing legacy Velocity-based widgets from cms-web

**Auto-detected when:** Directory contains `widget.vm` in `cms-web/htdocs/v9/widgets/` path

**Approach:** Comprehensive legacy widget extraction (tech-agnostic)
- Extract Velocity template logic
- Trace component dependency tree (5-7 levels deep)
- Analyze helper object usage ($helper, $npvresourcetool, etc.)
- Extract portlet configuration (preferences)
- Analyze Java backend business logic
- Document conditional branches and business rules

**What Gets Analyzed:**
1. **Widget Entry** - widget.vm setup and context
2. **Component Nesting** - Complete #parse chain (5-7 levels)
3. **Helper Objects** - $helper, $npvresourcetool, $format, $link, $i18n, $phone, $v, $ff, $paths
4. **Portlet XML** - All widget preferences and defaults
5. **Java Backend** - Portlet class business logic and DVS integration
6. **Conditional Logic** - All #if branches, feature flags, account type checks

**Complexity:** Very High (1,000-2,000 LOC, 40-100 conditionals, 20-50 helper calls)

**Example:** "Extract contact info widget - account selection, ZIP proximity, department phones, vCard rendering"

**Delegates to:** `cms-web-widget-analyzer` agent (specialized in Velocity patterns)

**Result:** Complete extraction of business logic from complex legacy widget architecture.

### 🎨 Route F: CMS Viewmodel (Groovy Viewmodel Widgets)
**Use when:** Analyzing Groovy-based viewmodel widgets from cms-web

**Auto-detected when:** Directory path matches `cms-web/htdocs/v9/viewmodel/widgets/`

**Approach:** Groovy viewmodel extraction (tech-agnostic)
- Extract Groovy viewmodel classes
- Analyze component usage
- Document Java backend integration
- Extract business rules

**Complexity:** Generally lower than V9 Velocity widgets

**Example:** "Extract viewmodel widget - Groovy business logic, component patterns"

**Delegates to:** `cms-web-widget-analyzer` agent (Groovy mode)

**Result:** Complete viewmodel business logic extraction.

**Result**: A fully-documented, specification-driven application ready for enterprise development.

---

## 🎯 Why This Matters at Cox Automotive

**The Challenge:** Cox Automotive operates hundreds of applications across our brands - Manheim, Kelley Blue Book, Autotrader, vAuto, and more. Many of these applications:
- Lack comprehensive documentation
- Have accumulated technical debt over years
- Need modernization but risk is high due to tribal knowledge
- Require significant onboarding time for new engineers

**The Solution:** StackShift provides a systematic approach to:
- **Reduce Risk** - Understand exactly what exists before making changes
- **Accelerate Onboarding** - New team members get complete specs, not tribal knowledge
- **Enable Modernization** - Safely migrate to modern tech stacks with confidence
- **Scale Best Practices** - Establish spec-driven development across all teams
- **Improve Velocity** - AI coding assistants work better with clear specifications

**The Impact:** By transforming our application portfolio with StackShift, we're building the foundation for Cox Automotive to become a leader in automotive technology - with software engineering practices that match our industry ambitions.

---

## 🚗 6-Gear Process

```
┌─────────────────────────────────────────────────────────────┐
│                  Shift Through 6 Gears                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Gear 1: Initial Analysis + Route Selection                 │
│  ├─ Detect technology stack                                 │
│  ├─ Identify application type                               │
│  ├─ Map directory structure                                 │
│  └─ Choose your route: Greenfield or Brownfield?            │
│         │                                                    │
│         ├─────────────────┬────────────────────┐            │
│         │                 │                    │            │
│    Greenfield         Brownfield               │            │
│  (Tech-Agnostic)   (Tech-Prescriptive)         │            │
│         │                 │                    │            │
│         ▼                 ▼                    │            │
│  Gear 2: Reverse Engineer (Reverse Gear! 🔄)                │
│  ├─ Extract business logic ONLY ◄── Greenfield              │
│  ├─ OR business logic + tech details ◄── Brownfield         │
│  └─ Generate 9 comprehensive docs                           │
│         │                                                    │
│         ▼                                                    │
│  Gear 3: Create Specifications                              │
│  ├─ Initialize .specify/ (GitHub Spec Kit)                  │
│  ├─ Agnostic constitution ◄── Greenfield                    │
│  ├─ OR prescriptive constitution ◄── Brownfield             │
│  └─ Generate feature specs, plans                           │
│         │                                                    │
│         ▼                                                    │
│  Gear 4: Gap Analysis                                       │
│  ├─ Run /speckit.analyze                                    │
│  ├─ Identify missing features                               │
│  ├─ Brownfield: ~100% match initially                       │
│  └─ Greenfield: All features marked MISSING                 │
│         │                                                    │
│         ▼                                                    │
│  Gear 5: Complete Specification                             │
│  ├─ Use /speckit.clarify                                    │
│  ├─ Answer clarifications                                   │
│  ├─ Define missing details                                  │
│  └─ Prioritize implementation                               │
│         │                                                    │
│         ▼                                                    │
│  Gear 6: Implement from Spec (Kick it into 6th! 🚀)         │
│  ├─ Use /speckit.tasks & /speckit.implement                 │
│  ├─ Greenfield: Build in new stack                          │
│  ├─ Brownfield: Fill gaps in existing                       │
│  ├─ Validate with /speckit.analyze                          │
│  └─ Achieve 100% completion - cruise into production!       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Two Ways to Use StackShift

#### Option 1: Claude Code Plugin (Local - Best Experience)

**Recommended for:** Regular use, local development

Install as a Claude Code plugin for interactive skills and workflow tracking:

```bash
# In Claude Code
> /plugin marketplace add jschulte/claude-plugins
> /plugin install stackshift
```

Restart Claude Code. Skills will now be available:
- `analyze` - Initial Analysis (Gear 1)
- `reverse-engineer` - Reverse Engineer (Gear 2)
- `create-specs` - Create Specifications (Gear 3)
- `gap-analysis` - Gap Analysis (Gear 4)
- `complete-spec` - Complete Specification (Gear 5)
- `implement` - Implement from Spec (Gear 6)
- `cruise-control` - Automatic mode (all gears)
- `modernize` - Upgrade dependencies (Brownfield only)

**Usage:**

Use slash commands to invoke StackShift:

```bash
# Start the analysis process
/stackshift.start

# Batch process multiple repos
/stackshift.batch

# Check installed version
/stackshift.version
```

**⚠️ Important:** Always use slash commands (not natural language prompts) to ensure StackShift activates correctly.

### Prerequisites

- Claude Code with plugin support
- Git repository with existing codebase
- Node.js 18+ (for state management scripts)
- ~2-4 hours total time for complete process

### Run the Process

**With Plugin (Recommended):**

```bash
# Navigate to your project
cd /path/to/your/project

# Start StackShift using the slash command
/stackshift.start
```

This will guide you through all 6 gears automatically.

**Initial Configuration:**

StackShift will ask a few questions upfront:
1. Route: Greenfield or Brownfield?
2. Transmission: Manual or Cruise Control?
3. (If Cruise Control) Clarifications strategy & implementation scope
4. (If Greenfield) Target tech stack

All answers saved to `.stackshift-state.json` - configure once, use throughout!

**Progress Tracking:**

```bash
# Check which gear you're in
node ~/.claude/plugins/stackshift/plugin/scripts/state-manager.js progress
```

**Without Plugin (Manual):**

If not using the plugin, use the web bootstrap for manual execution:

```bash
# 1. Clone StackShift
git clone https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git

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

> Which route best aligns with your goals?
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
>
> **C) Osiris:** Extract Cox Automotive Widget Service
>    - Auto-detected for ws-* repository names
>    - Extract widget + all wsm-*/ddc-* modules + ws-scripts
>    - Tech-agnostic for migration to modern stacks
>    - Focus: Complete widget ecosystem

### When to Choose Greenfield (Route A)

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

### When to Choose Brownfield (Route B)

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

#### Brownfield Upgrade Mode 🆕

**What it does:**
After completing all 6 gears and establishing full spec coverage, optionally modernize ALL dependencies to latest versions.

**The Process:**
1. Complete Gears 1-6 (establish specs for current state)
2. Capture dependency baseline (document all current versions)
3. Run tests to establish behavioral baseline
4. Upgrade ALL dependencies to latest (npm upgrade, etc.)
5. Run tests to detect breaking changes
6. Use specs to guide breaking change fixes
7. Improve test coverage to 85%+ using spec acceptance criteria
8. Validate with `/speckit.analyze` that behavior preserved
9. Generate upgrade report documenting changes

**Benefits:**
- ✅ Specs act as safety net during upgrade
- ✅ Breaking changes guided by intended behavior (from specs)
- ✅ Systematic approach reduces upgrade risk
- ✅ Test coverage improved alongside upgrade
- ✅ Security vulnerabilities eliminated
- ✅ No full rewrite needed

**Example:** "Spec this Next.js 12 app, then upgrade to Next.js 15 with spec-guided migration"

**Slash command:** After Gear 6, run `/stackshift.modernize` to start the upgrade process

### When to Choose Osiris (Route C)

**Perfect for:**
- 🎯 **Osiris widget migrations** - Move ws-* widgets to modern stacks (Next.js, React, etc.)
- 📦 **Module consolidation** - Understand all wsm-* dependencies before migration
- 🔄 **Widget modernization** - Extract complete business logic for rebuild
- 📚 **Widget documentation** - Capture years of customer-driven features
- 👥 **Widget team transitions** - Preserve knowledge when teams change

**Results in:**
- Complete business logic from widget AND all shared modules
- ws-scripts infrastructure documented (preferences, feature flags, labels)
- Tech-agnostic specifications ready for modern stack implementation
- Example: "Vehicle details widget with pricing display (wsm-pricing-display), incentive calculations (wsm-incentive-display), media gallery (wsm-vehicle-media-gallery)"

### Route Comparison

| Aspect | Greenfield (A) | Brownfield (B) | Brownfield Upgrade | Osiris (C) |
|--------|----------------|----------------|-------------------|------------|
| **Focus** | WHAT only | WHAT + HOW | WHAT + HOW + Modernize | WHAT (widget + modules) |
| **Tech Stack** | Any (your choice) | Current (documented) | Latest versions | Any (your choice) |
| **Specifications** | Agnostic | Prescriptive | Prescriptive | Agnostic |
| **Implementation** | Build new | Manage existing | Modernize existing | Build new |
| **Scope** | Single app | Single app | Single app | Widget + all modules |
| **Dependencies** | Your choice | As-is | Upgrade to latest | Your choice |
| **Test Coverage** | Your target | As-is | Improve to 85%+ | Your target |
| **Flexibility** | High | Constrained | Medium | High |
| **Validation** | Manual | `/speckit.analyze` | `/speckit.analyze` | Manual |
| **Cox Specific** | No | No | No | Yes (Osiris) |
| **Use Case** | Platform migration | Ongoing development | Modernization | Widget migration |
| **Auto-Detect** | No | No | No | Yes (ws-* repos) |

---

## 📁 StackShift Structure

### Plugin Structure (Recommended)

```
stackshift/
├── README.md                           ← You are here
├── .claude-plugin/
│   └── marketplace.json               ← Plugin marketplace config
├── plugin/
│   ├── .claude-plugin/
│   │   └── plugin.json                ← Plugin metadata
│   ├── skills/
│   │   ├── analyze/                   ← Step 1: Initial Analysis
│   │   │   ├── SKILL.md               ← Skill definition
│   │   │   └── operations/            ← Sub-operations
│   │   ├── reverse-engineer/          ← Step 2: Reverse Engineer
│   │   ├── create-specs/              ← Step 3: Create Specifications
│   │   ├── gap-analysis/              ← Step 4: Gap Analysis
│   │   ├── complete-spec/             ← Step 5: Complete Specification
│   │   └── implement/                 ← Step 6: Implement from Spec
│   ├── templates/                     ← Spec templates
│   │   ├── feature-spec-template.md
│   │   ├── constitution-agnostic-template.md
│   │   ├── constitution-prescriptive-template.md
│   │   └── implementation-status-template.md
│   └── scripts/
│       └── state-manager.js           ← Progress tracking
├── web/                               ← Web prompts (for manual use)
│   ├── WEB_BOOTSTRAP.md               ← Bootstrap for claude.ai
│   └── convert-reverse-engineering-to-speckit.md
└── legacy/
    └── original-prompts/              ← Legacy manual prompts (archived)
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

### Osiris Widget Services (Cox Automotive)
- Auto-detects ws-* repository names
- Extracts widget + wsm-*/ddc-* modules + ws-scripts
- Analyzes server-side rendering and configuration
- Documents preferences, feature flags, labels
- Captures complete business logic for migration
- Ready for Next.js/React modernization

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

**For Cox Automotive teams:**
1. Create a branch for your improvements
2. Add or enhance prompts and templates
3. Submit a pull request for review
4. Help scale spec-driven development across Cox

---

## 📚 Additional Resources

- [GitHub Spec Kit](https://github.com/github/spec-kit) - Official spec-driven development toolkit
- [OpenAPI Specification](https://swagger.io/specification/) - API specification standard
- [JSON Schema](https://json-schema.org/) - Data validation standard
- [Architecture Decision Records](https://adr.github.io/) - Document key decisions

---

## 🔄 Upstream Sync Automation (Cox Version)

The Cox version automatically syncs with upstream StackShift to get latest features:

**Automated (Recommended):**
- GitHub Action runs weekly on Mondays at 9 AM UTC
- Auto-merges changes and creates PRs for review
- Handles Cox-specific patterns (removes mcp-server)
- See: `.github/workflows/sync-upstream.yml`

**Manual:**
```bash
./scripts/cox-automation/sync-upstream.sh
```

For full documentation, see [`scripts/cox-automation/README.md`](scripts/cox-automation/README.md)

---

## 📝 License

This toolkit is provided as-is for use across Cox Automotive. Adapt and modify as needed for your team's specific needs. Originally developed as an open-source project, now maintained and enhanced for Cox's software engineering transformation.

---

## ❓ Questions & Feedback

This toolkit was created to solve a critical enterprise challenge: **transforming Cox Automotive's application portfolio into fully-specified, enterprise-grade codebases** that enable rapid, reliable development at scale.

**Encountered an issue or have a suggestion?**

- 🐛 **Found a bug?** [Open an issue](https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/issues/new)
- 💡 **Have an idea?** [Start a discussion](https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/discussions)
- 🔧 **Want to contribute?** [Submit a pull request](https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/pulls)
- 💬 **Need help?** Reach out to your engineering leadership or the platform team

The toolkit improves with real-world usage across our teams!

---

**Happy Shifting! 🚗💨**

*Start in reverse (engineering), shift through 6 gears, cruise into spec-driven development.*
