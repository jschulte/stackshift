# Deterministic AST Execution

## Problem Statement

AST analysis must be **deterministic and guaranteed to run** when the environment allows. We cannot rely on Claude "deciding" to follow skill instructions.

## Solution: Direct Command Execution in Slash Commands

### Pattern: Make Commands Execute, Not Suggest

**Bad** (Relies on Claude's interpretation):
```markdown
# .claude/commands/stackshift.gap-analysis.md
Use the Skill tool with skill="gap-analysis".

# skills/gap-analysis/SKILL.md
You can optionally run AST analysis...
```
❌ Not deterministic - Claude might skip AST

**Good** (Deterministic execution):
```markdown
# .claude/commands/stackshift.gap-analysis.md
## Step 1: Run AST Analysis (Deterministic - Always Executes)

First, use the Bash tool to execute the AST analysis script:

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

## Step 2: If AST Fails, Use Fallback
...
```
✅ Deterministic - Claude sees explicit Bash tool instruction in Step 1

---

## Current State

### ✅ Gear 4: Gap Analysis (DETERMINISTIC)

**File**: `.claude/commands/stackshift.gap-analysis.md`

**Execution Flow**:
1. User runs: `/stackshift.gap-analysis`
2. Command expands with: "use the Bash tool to execute..."
3. Claude executes: `~/stackshift/scripts/run-ast-analysis.mjs roadmap`
4. AST analysis runs deterministically
5. If fails: Fallback to skill-based manual analysis

**Guarantee**: AST will run unless script/Node.js unavailable

---

### ❌ Other Gears (NOT YET DETERMINISTIC)

These still use the pattern:
```markdown
Use the Skill tool with skill="xxx".
```

Which means:
- Claude loads skill file
- Skill provides instructions
- Claude decides what to do
- Not deterministic

**Needs updating**:
- Gear 1: Analysis
- Gear 2: Reverse Engineering
- Gear 3: Create Specs
- Gear 5: Complete Specs
- Gear 6: Implementation

---

## Implementation Pattern

### Step 1: Create AST Command (if needed)

```javascript
// scripts/run-ast-analysis.mjs
case 'detect-status': {
  const result = await detectStatusHandler({ directory });
  console.log(JSON.stringify(result, null, 2));
  break;
}
```

### Step 2: Update Slash Command for Deterministic Execution

```markdown
---
description: Gear X - [Description]
---

# Gear X: [Name]

**IMPORTANT**: This command runs AST-powered [task] automatically.

## Step 1: Run AST Analysis (Deterministic - Always Executes)

First, use the Bash tool to execute the AST analysis script:

```bash
~/stackshift/scripts/run-ast-analysis.mjs [command] . [options]
```

**This will**:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Step 2: [Process Results]

[What to do with AST output]

## Step 3: If AST Fails, Use Fallback

If the AST command fails:

Use the Skill tool with skill="[gear-name]" for manual analysis.
```

### Step 3: Keep Skill as Fallback

The skill file remains unchanged and serves as:
- Fallback if AST fails
- Documentation of manual process
- Alternative approach

---

## Guarantees

### What We Guarantee

✅ **Gear 4**: AST analysis will execute when `/stackshift.gap-analysis` is run
- Unless script doesn't exist
- Unless Node.js unavailable
- Unless permissions issue

### What We Don't Guarantee (Yet)

❌ **Other Gears**: Still rely on skill interpretation
- Claude might skip AST
- Claude might forget to run command
- Not deterministic

---

## Rollout Plan

### Phase 1: ✅ Make Gear 4 Deterministic (DONE)
- Updated `.claude/commands/stackshift.gap-analysis.md`
- Explicit "use the Bash tool" instruction
- AST runs as Step 1

### Phase 2: Add New AST Commands

Create these commands in `scripts/run-ast-analysis.mjs`:

1. **detect-status** (for Gear 3)
   ```bash
   ~/stackshift/scripts/run-ast-analysis.mjs detect-status . --output=json
   ```
   Returns: Implementation status (✅/⚠️/❌) for each feature

2. **verify** (for Gear 6)
   ```bash
   ~/stackshift/scripts/run-ast-analysis.mjs verify . --spec=path/to/spec.md
   ```
   Returns: Verification report (signature, tests, stubs)

3. **extract** (for Gear 2)
   ```bash
   ~/stackshift/scripts/run-ast-analysis.mjs extract . --type=apis
   ```
   Returns: Extracted APIs, business logic, etc.

### Phase 3: Update Slash Commands for Deterministic Execution

Update each command file to follow the pattern:
```markdown
## Step 1: Run AST Analysis (Deterministic)
Use the Bash tool to execute...
```

Files to update:
- [ ] `.claude/commands/stackshift.create-specs.md`
- [ ] `.claude/commands/stackshift.implement.md`
- [ ] `.claude/commands/stackshift.reverse-engineer.md`
- [ ] `.claude/commands/stackshift.complete-spec.md`
- [ ] `.claude/commands/stackshift.analyze.md`

---

## Testing Determinism

### How to Verify

1. Run slash command: `/stackshift.gap-analysis`
2. Check that Claude immediately executes Bash tool (no interpretation delay)
3. Verify AST script runs
4. Confirm output is used

### Expected Behavior

**Deterministic**:
```
User: /stackshift.gap-analysis
Claude: [immediately runs Bash tool]
        ~/stackshift/scripts/run-ast-analysis.mjs roadmap
Output: [AST analysis results]
Claude: [uses results to generate report]
```

**Not Deterministic** (old way):
```
User: /stackshift.gap-analysis
Claude: [reads skill file]
        [interprets instructions]
        [decides to run command... or maybe not]
        [might skip if unclear]
```

---

## Key Principles

### 1. Commands Execute, Skills Instruct

**Commands** (`.claude/commands/*.md`):
- Contain explicit execution steps
- "Use the Bash tool to execute..."
- Deterministic

**Skills** (`skills/*/SKILL.md`):
- Contain detailed instructions
- Explain the "why"
- Fallback/manual process

### 2. Always Provide Fallback

```markdown
## Step 1: Run AST (Deterministic)
[AST command]

## Step 2: If Fails, Use Manual
If AST unavailable, use skill="xxx" for manual process
```

Never make AST a hard requirement - always have fallback.

### 3. Make Failures Obvious

```bash
# In script
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found. AST analysis requires Node.js 18+"
  exit 1
fi
```

Claude sees failure immediately and can use fallback.

---

## Metrics

Track determinism:
- **Gear 4**: 100% AST execution rate (when Node.js available)
- **Other Gears**: TBD (need to update first)

Goal: 100% AST execution for all gears when environment permits.

---

## Summary

**Question**: "Will AST be used automatically?"

**Answer**:
- ✅ **Gear 4**: Yes - deterministically executes AST via Bash tool
- ❌ **Other Gears**: Not yet - still rely on skill interpretation
- 🔄 **Next**: Update other gears to use same deterministic pattern

**Bottom Line**: AST should never be forgotten or skipped. The slash command must explicitly invoke the Bash tool to execute the AST script, not just suggest it in a skill file.
