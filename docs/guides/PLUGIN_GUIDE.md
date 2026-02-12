# StackShift - Claude Code Plugin

**Shift gears in your codebase with complete control.**

## Overview

StackShift transforms reverse engineering into an interactive, guided experience for Claude Code users. Like a manual transmission gives you control over your drive, StackShift gives you control over your codebase transformation - whether shifting to a new tech stack or taking the wheel on existing code.

---

## Installation

### For Users

```bash
# In Claude Code
> /plugin marketplace add jschulte/claude-plugins
> /plugin install stackshift
```

Restart Claude Code. Shift into gear!

### For Developers

```bash
# Clone the repository
git clone https://github.com/jschulte/stackshift.git
cd stackshift

# Link to local plugin directory for testing
ln -s $(pwd) ~/.claude/plugins/local/stackshift
```

---

## Skills

The plugin provides 6 interactive skills corresponding to the 6-step process:

### 1. analyze
**Initial Analysis** - Auto-detect tech stack, analyze directory structure, assess completeness.

**Trigger phrases:**
- "Analyze this codebase"
- "What tech stack is this using?"
- "Run initial analysis"

**Output:** `analysis-report.md`

### 2. reverse-engineer
**Reverse Engineer** - Deep codebase analysis to generate 8 comprehensive documentation files.

**Trigger phrases:**
- "Reverse engineer the codebase"
- "Generate comprehensive documentation"
- "Extract all API endpoints"

**Output:** `docs/reverse-engineering/` (8 files)

### 3. create-specs
**Create Specifications** - Transform documentation into formal GitHub Spec Kit specifications.

**Trigger phrases:**
- "Create specifications"
- "Transform docs into formal specs"
- "Generate feature specs"

**Output:** `specs/` directory with feature specs, OpenAPI, JSON Schemas

### 4. gap-analysis
**Gap Analysis** - Compare specs against implementation to identify what's missing.

**Trigger phrases:**
- "Analyze gaps"
- "What's missing from the application?"
- "Identify incomplete features"

**Output:** `specs/gap-analysis.md`

### 5. complete-spec
**Complete Specification** - Interactive Q&A to resolve ambiguities and finalize specs.

**Trigger phrases:**
- "Complete the specification"
- "Resolve clarifications"
- "Let's clarify the missing details"

**Output:** Updated specs with all `[NEEDS CLARIFICATION]` markers resolved

### 6. implement
**Implement from Spec** - Systematically build missing features from finalized specs.

**Trigger phrases:**
- "Implement missing features"
- "Build from specifications"
- "Complete the implementation"

**Output:** Fully implemented application with all specs marked ✅ COMPLETE

---

## Workflow State Management

The plugin automatically tracks your progress through the 6 steps.

### State File

Created in project root as `.stackshift-state.json`:

```json
{
  "version": "1.0.0",
  "created": "2024-01-15T10:00:00.000Z",
  "updated": "2024-01-15T11:30:00.000Z",
  "currentStep": "create-specs",
  "completedSteps": ["analyze", "reverse-engineer"],
  "metadata": {
    "projectName": "my-app",
    "projectPath": "/path/to/my-app"
  },
  "stepDetails": {
    "analyze": {
      "started": "2024-01-15T10:00:00.000Z",
      "completed": "2024-01-15T10:05:00.000Z",
      "status": "completed"
    }
  }
}
```

### Checking State

State is tracked automatically via `.stackshift-state.json` in your project root. Skills automatically update state as you progress through the gears.

```bash
# Check current state
cat .stackshift-state.json
```

---

## Plugin Architecture

### Directory Structure

```
stackshift/
├── .claude-plugin/              # Plugin metadata
├── .claude/
│   ├── commands/                # Slash commands
│   └── settings.json            # Plugin settings
├── agents/                      # Agent definitions
├── skills/
│   ├── analyze/
│   │   ├── SKILL.md            # Skill definition with frontmatter
│   │   └── operations/         # Sub-operations documentation
│   ├── reverse-engineer/
│   ├── create-specs/
│   ├── gap-analysis/
│   ├── complete-spec/
│   └── implement/
├── docs/                        # Documentation
├── scripts/                     # Utility scripts
└── web/                         # Web resources
```

### Skill Definition Format

Each skill has a `SKILL.md` with YAML frontmatter:

```markdown
---
name: analyze
description: Perform initial analysis of a codebase - detect tech stack, directory structure, and completeness. This is Step 1 of 6...
---

# Initial Analysis

[Skill documentation...]
```

**Frontmatter fields:**
- `name` - Skill identifier (must match directory name)
- `description` - Detailed description (used for auto-activation)

### Auto-Activation

Skills auto-activate based on:
1. **Trigger phrases** in description (e.g., "analyze codebase")
2. **Workflow context** (e.g., after completing step N, suggest step N+1)
3. **User intent** (natural language understanding)

### Operations Documentation

Each skill can have `operations/` directory with detailed guides for sub-tasks:
- `operations/detect-stack.md` - Tech stack detection commands
- `operations/directory-analysis.md` - Directory structure analysis
- etc.

These are referenced from the main `SKILL.md` and provide reusable documentation.

---

## Templates

Templates are included in `plugin/templates/` and accessible to all skills:

### feature-spec-template.md
Template for creating feature specifications (F001-F0XX format)

### constitution-template.md
Template for project constitution (principles, decisions, standards)

### implementation-status-template.md
Template for tracking implementation status across all features

---

## Development

### Testing Locally

```bash
# Link plugin to local Claude plugins directory
ln -s $(pwd) ~/.claude/plugins/local/reverse-engineering-toolkit

# Restart Claude Code

# Test skills
> "Analyze this codebase"  # Should activate analyze skill
```

### Skill Development

1. **Create skill directory**
   ```bash
   mkdir -p plugin/skills/my-skill/operations
   ```

2. **Create SKILL.md**
   ```markdown
   ---
   name: my-skill
   description: What this skill does and when to use it
   ---

   # My Skill

   [Documentation...]
   ```

3. **Add operations** (optional)
   ```bash
   touch plugin/skills/my-skill/operations/operation-1.md
   ```

4. **Test skill**
   - Restart Claude Code
   - Trigger skill via natural language

---

## Best Practices

### Skill Design

1. **Clear description** - Include trigger phrases and use cases
2. **Step-by-step process** - Break down complex tasks
3. **Success criteria** - Define what "complete" means
4. **Next steps** - Guide user to the next skill
5. **Error handling** - Handle missing prerequisites gracefully

### Workflow Management

1. **Check prerequisites** - Verify previous steps completed
2. **Update state** - Mark steps as started/completed
3. **Validate output** - Ensure expected files were created
4. **Guide next step** - Tell user what to do next

### Documentation

1. **Main SKILL.md** - High-level overview and process
2. **operations/** - Detailed sub-task guides
3. **Examples** - Show expected input/output
4. **Common issues** - Troubleshooting section

---

## Roadmap

### Planned Features

- [ ] **Hooks integration** - Auto-track file changes, update specs
- [ ] **Extended integrations** - Expose state and progress to external tools
- [ ] **Slash commands** - `/re-toolkit:status`, `/re-toolkit:next`
- [ ] **Progress visualization** - Visual workflow diagram in Claude Code
- [ ] **Multi-project support** - Track multiple projects simultaneously
- [ ] **Team collaboration** - Share state across team members
- [ ] **Templates customization** - Project-specific template variants

### Future Skills

- `migrate-framework` - Guide framework migration using specs
- `audit-specs` - Verify specs match implementation
- `generate-tests` - Auto-generate tests from specs
- `sync-docs` - Keep docs in sync with code changes

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add/improve skills or operations
4. Test thoroughly with local plugin
5. Submit a Pull Request

---

## License

MIT

---

## Support

- **Repository:** https://github.com/jschulte/stackshift
- **Issues:** https://github.com/jschulte/stackshift/issues
- **Documentation:** See README.md and individual SKILL.md files

---

**Built for Claude Code** | **Powered by Skills** | **Spec-Driven Development** | **🚗 Shift with Confidence**
