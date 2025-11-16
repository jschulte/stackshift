# GitHub Spec Kit in Claude Code Web - Fallback Guide

## The Issue

Claude Code Web may not have the `specify` CLI installed, so `specify init` might fail.

**However:** The `/speckit.*` slash commands are just **file-based prompts**! We can create the structure manually.

---

## Solution: Manual .specify/ Creation

If `specify init` fails in Claude Code Web, create the structure manually:

### Step 1: Create Directory Structure

```bash
mkdir -p .specify/memory/specifications
mkdir -p .specify/memory/plans
mkdir -p .specify/templates
mkdir -p .specify/scripts
```

### Step 2: Create constitution.md

```bash
# StackShift will generate this based on route
# - Greenfield: Use constitution-agnostic-template.md
# - Brownfield: Use constitution-prescriptive-template.md
```

### Step 3: Create Slash Command Templates

These enable the `/speckit.*` commands:

**.specify/templates/speckit-analyze.md:**
```markdown
---
name: speckit.analyze
description: Validate specifications against implementation
---

Analyze the codebase and compare against specifications in specs/:

1. For each specification:
   - Check if marked COMPLETE but implementation missing
   - Check if implementation exists but not in spec
   - Verify consistency with related specs

2. Report:
   - Inconsistencies found
   - Implementation drift
   - Outdated status markers
   - Recommendations

3. Output summary with issues and recommendations
```

**.specify/templates/speckit-tasks.md:**
```markdown
---
name: speckit.tasks
description: Generate actionable tasks from implementation plan
---

Read the implementation plan: specs/{{PLAN_NAME}}.md

Generate actionable task list:
1. Break down plan into atomic tasks
2. Each task should be:
   - Specific (exact file/function)
   - Testable (has acceptance criteria)
   - Atomic (can be done in one step)
3. List dependencies between tasks
4. Provide task checklist

Output in markdown checklist format.
```

**.specify/templates/speckit-implement.md:**
```markdown
---
name: speckit.implement
description: Implement feature from specification and plan
---

Implement feature: {{FEATURE_NAME}}

1. Read specification: specs/{{FEATURE_NAME}}.md
2. Read implementation plan: specs/{{FEATURE_NAME}}.md
3. Execute each task from the plan
4. Test against acceptance criteria
5. Update specification status markers
6. Commit changes with reference to spec

Proceed systematically through all tasks.
```

**.specify/templates/speckit-clarify.md:**
```markdown
---
name: speckit.clarify
description: Resolve [NEEDS CLARIFICATION] markers
---

Find all [NEEDS CLARIFICATION] markers in specs/

For each clarification:
1. Ask user the question
2. Wait for answer
3. Update specification with the answer
4. Remove the [NEEDS CLARIFICATION] marker
5. Update related specs if needed

Continue until all markers resolved.
```

### Step 4: StackShift Creates These Automatically

When StackShift detects that `specify init` failed:

```javascript
// Fallback workflow
console.log('⚠️  specify CLI not available, creating .specify/ structure manually...');

// Create directories
await createDirectories();

// Copy slash command templates
await createSlashCommands();

// Generate constitution
await generateConstitution(route);

console.log('✅ .specify/ structure created manually');
console.log('📝 Slash commands available: /speckit.analyze, /speckit.tasks, /speckit.implement, /speckit.clarify');
```

---

## How Slash Commands Work

**Slash commands are NOT magic** - they're just:

1. **Prompt templates** in `.specify/templates/`
2. **Variable substitution** ({{FEATURE_NAME}} etc.)
3. **File-based context** (read specs, write results)

**When you type:**
```
> /speckit.analyze
```

**Claude Code expands it to:**
```
[Contents of .specify/templates/speckit-analyze.md]

[Claude reads specs from .specify/memory/ and analyzes]
```

---

## Fallback: Direct Prompts

If slash commands don't work at all, use direct prompts:

**Instead of `/speckit.analyze`:**
```
Analyze specifications in specs/ against the codebase.
For each spec, check if implementation matches status markers.
Report inconsistencies.
```

**Instead of `/speckit.tasks feature-name`:**
```
Read specs/feature-name.md and generate
actionable task checklist with specific file changes needed.
```

**Instead of `/speckit.implement feature-name`:**
```
Read specification and implementation plan for feature-name,
then implement each task systematically. Test against
acceptance criteria and update spec status when complete.
```

---

## StackShift Web Orchestrator Approach

The web orchestrator will:

1. **Try `specify init --here --ai claude --force`**
   - If succeeds: ✅ Use normal slash commands
   - If fails: Go to step 2

2. **Create .specify/ structure manually**
   - Create directories
   - Generate constitution from StackShift template
   - Create slash command templates
   - Create specifications
   - ✅ Slash commands now work!

3. **If slash commands still don't work**
   - Use direct prompts (same logic)
   - Still follows Spec Kit workflow
   - Just without the `/speckit.*` syntax

---

## What StackShift Will Include

To make this seamless, StackShift will include:

**New directory:** `plugin/speckit-templates/`
```
plugin/speckit-templates/
├── speckit-analyze.md
├── speckit-tasks.md
├── speckit-implement.md
├── speckit-clarify.md
├── speckit-specify.md
└── speckit-plan.md
```

When `specify init` fails, StackShift copies these to `.specify/templates/`

---

## Updated Web Orchestrator Logic

```markdown
## Gear 3: Create Specifications

Step 1: Try official Spec Kit
```bash
specify init --here --ai claude --force
```

Step 2: If that fails, create manually
```bash
# StackShift has templates built-in
mkdir -p .specify/memory/{specifications,plans}
mkdir -p .specify/templates

# Copy templates from StackShift
cp plugin/speckit-templates/*.md .specify/templates/

# Generate constitution
[Use StackShift template based on route]

✅ Slash commands now available!
```

Step 3: Generate specifications
[Normal workflow continues]
```

---

## Action Items

Want me to:

1. **Create `plugin/speckit-templates/`** with all slash command definitions
2. **Update web orchestrator** to handle `specify init` failures gracefully
3. **Update create-specs skill** with fallback logic
4. **Test the fallback** to ensure it works

This would make StackShift work reliably in Claude Code Web even without the specify CLI!

Should I implement this? 🚀