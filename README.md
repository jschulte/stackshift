# Reverse Engineering to Spec-Driven Development Toolkit

**Transform any partially-complete application into a fully-specified, enterprise-grade, spec-driven codebase.**

---

## 🎯 What This Toolkit Does

This toolkit provides a **systematic, repeatable process** to:

1. **Reverse-engineer** existing codebases (even incomplete ones)
2. **Generate comprehensive documentation** automatically
3. **Transform into formal specifications** (GitHub Spec Kit format)
4. **Identify feature gaps** clearly
5. **Complete missing implementations** systematically
6. **Establish spec-driven development** going forward

**Result**: A fully-documented, specification-driven application ready for enterprise development.

---

## 📊 Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    6-Step Process                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Initial Analysis                                   │
│  ├─ Detect technology stack                                 │
│  ├─ Identify application type                               │
│  └─ Map directory structure                                 │
│         │                                                    │
│         ▼                                                    │
│  Step 2: Reverse Engineer                                   │
│  ├─ Extract data models                                     │
│  ├─ Document API endpoints                                  │
│  ├─ Analyze configuration                                   │
│  └─ Generate 8 comprehensive docs                           │
│         │                                                    │
│         ▼                                                    │
│  Step 3: Create Specifications                              │
│  ├─ Transform docs → formal specs                           │
│  ├─ Mark implementation status                              │
│  ├─ Create feature specs (F001-F0XX)                        │
│  └─ Generate OpenAPI/JSON Schema                            │
│         │                                                    │
│         ▼                                                    │
│  Step 4: Gap Analysis                                       │
│  ├─ Identify missing features                               │
│  ├─ Find incomplete implementations                         │
│  ├─ List technical debt                                     │
│  └─ Create [NEEDS CLARIFICATION] markers                    │
│         │                                                    │
│         ▼                                                    │
│  Step 5: Complete Specification                             │
│  ├─ Collaborative refinement session                        │
│  ├─ Answer clarifications                                   │
│  ├─ Define missing UX/UI details                            │
│  └─ Prioritize implementation order                         │
│         │                                                    │
│         ▼                                                    │
│  Step 6: Implement from Spec                                │
│  ├─ Systematically build missing pieces                     │
│  ├─ Check off completed items                               │
│  ├─ Validate against specification                          │
│  └─ Achieve 100% completion                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation (Claude Code Plugin)

**Recommended Method:**

Install as a Claude Code plugin for the best experience with interactive skills and workflow tracking:

```bash
# In Claude Code
> /plugin marketplace add jonahschulte/reverse-engineering-toolkit
> /plugin install reverse-engineering-toolkit
```

Restart Claude Code. Skills will now be available:
- `analyze` - Initial Analysis
- `reverse-engineer` - Reverse Engineer
- `create-specs` - Create Specifications
- `gap-analysis` - Gap Analysis
- `complete-spec` - Complete Specification
- `implement` - Implement from Spec

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
- Node.js 18+ (for state management scripts)
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

**Workflow Progress Tracking:**

The plugin automatically tracks your progress:
```bash
# Check progress anytime
node ~/.claude/plugins/reverse-engineering-toolkit/plugin/scripts/state-manager.js progress
```

**Without Plugin (Manual):**

If not using the plugin, you can still use the prompts directly:

```bash
# 1. Clone this toolkit
git clone https://github.com/jonahschulte/reverse-engineering-toolkit.git

# 2. Copy prompts to your project
cp -r reverse-engineering-toolkit/prompts /path/to/your/project/

# 3. Run each prompt in order (copy-paste into Claude Code)
cat prompts/01-initial-analysis.md  # Step 1
cat prompts/02-reverse-engineer.md  # Step 2
# ... etc
```

---

## 📁 Toolkit Structure

### Plugin Structure (Recommended)

```
reverse-engineering-toolkit/
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
│   │   ├── constitution-template.md
│   │   └── implementation-status-template.md
│   └── scripts/
│       └── state-manager.js           ← Progress tracking
└── prompts/                           ← Original prompts (for manual use)
    ├── 01-initial-analysis.md
    ├── 02-reverse-engineer.md
    └── ...
```

### Plugin Benefits

**Why use the plugin over manual prompts?**

✅ **Auto-activation** - Skills activate based on context, no copy-paste needed
✅ **Progress tracking** - State management tracks where you are in the workflow
✅ **Resume capability** - Pick up where you left off if interrupted
✅ **Guided experience** - Claude knows the full context and next steps
✅ **Templates included** - Access all templates without file operations
✅ **Updates** - Get improvements via plugin updates

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

**Prompt:** `prompts/01-initial-analysis.md`

---

### Step 2: Reverse Engineer (30 minutes)

**What it does:**
- Deep codebase analysis using specialized agents
- Extracts all data models, API endpoints, components
- Documents configuration, infrastructure, operations
- Analyzes technical debt and test coverage
- Generates 8 comprehensive documents

**Output:**
```
docs/reverse-engineering/
├── functional-specification.md     (Business logic, requirements)
├── configuration-reference.md      (All config options)
├── data-architecture.md            (Data models, API contracts)
├── operations-guide.md             (Deployment, infrastructure)
├── technical-debt-analysis.md      (Issues, improvements)
├── observability-requirements.md   (Monitoring, logging)
├── visual-design-system.md         (UI/UX patterns)
└── test-documentation.md           (Testing requirements)
```

**Prompt:** `prompts/02-reverse-engineer.md`

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

**Prompt:** `prompts/03-create-specifications.md`

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

**Prompt:** `prompts/04-gap-analysis.md`

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

**Prompt:** `prompts/05-complete-specification.md`

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

**Prompt:** `prompts/06-implement-from-spec.md`

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

## ❓ Questions?

This toolkit was created to solve a real problem: **transforming 50+ partially-complete applications into fully-specified, enterprise-grade codebases**.

If you encounter issues or have suggestions, document them as you go. The toolkit improves with real-world usage.

---

**Happy Reverse Engineering! 🚀**

*Transform chaos into clarity, one specification at a time.*
# reverse-engineering-toolkit
