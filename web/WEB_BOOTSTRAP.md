# StackShift Web Bootstrap

**Copy and paste this ENTIRE prompt into Claude Code Web**

---

You are setting up StackShift - a reverse engineering toolkit that transforms applications into spec-driven projects.

## Bootstrap StackShift

First, download and set up StackShift in this repository:

```bash
# Download StackShift from GitHub
curl -L https://github.com/jschulte/stackshift/archive/refs/tags/v1.0.0.tar.gz -o stackshift.tar.gz

# Extract to .stackshift directory
mkdir -p .stackshift
tar -xzf stackshift.tar.gz -C .stackshift --strip-components=1

# Cleanup
rm stackshift.tar.gz

# Verify
ls .stackshift/
# Should show: plugin/, mcp-server/, prompts/, docs/, etc.
```

## Now You Have Access To

✅ **All skills** - `.stackshift/plugin/skills/*/SKILL.md`
✅ **All agents** - `.stackshift/plugin/agents/*/AGENT.md`
✅ **All templates** - `.stackshift/plugin/templates/*.md`
✅ **All prompts** - `.stackshift/prompts/greenfield/` and `.stackshift/prompts/brownfield/`
✅ **Spec Kit templates** - `.stackshift/plugin/speckit-templates/*.md`

## Configuration

Ask me these questions:

1. **Route:**
   - Greenfield: Extract business logic only (tech-agnostic)
   - Brownfield: Extract full implementation (tech-prescriptive)

2. **Mode:**
   - Manual: Stop at each gear
   - Cruise Control: Automatic through all 6 gears

3. **If Cruise Control - Clarifications:**
   - Defer, Prompt, or Skip

4. **If Cruise Control - Scope:**
   - None, P0, P0+P1, or All

5. **If Greenfield + implementing - Target Stack:**
   - What tech stack?

6. **If Greenfield + implementing - Build Location:**
   - greenfield/ or custom folder

Save configuration to `.stackshift-state.json`

## Execute StackShift

Now execute the 6-gear process:

### Gear 1: Analyze

Read and follow: `.stackshift/plugin/skills/analyze/SKILL.md`

This file contains complete instructions for:
- Tech stack detection (use operations/detect-stack.md)
- Directory analysis (use operations/directory-analysis.md)
- Documentation scan (use operations/documentation-scan.md)
- Completeness assessment (use operations/completeness-assessment.md)
- Report generation (use operations/generate-report.md)

Generate `analysis-report.md` following the template.

### Gear 2: Reverse Engineer

Read and follow: `.stackshift/plugin/skills/reverse-engineer/SKILL.md`

**Route-specific instructions:**
- Greenfield: Read `.stackshift/prompts/greenfield/02-reverse-engineer-business-logic.md`
- Brownfield: Read `.stackshift/prompts/brownfield/02-reverse-engineer-full-stack.md`

Use the stackshift:code-analyzer agent instructions from:
`.stackshift/plugin/agents/stackshift-code-analyzer/AGENT.md`

Generate 8 comprehensive docs in `docs/reverse-engineering/`

### Gear 3: Create Specifications

Read and follow: `.stackshift/plugin/skills/create-specs/SKILL.md`

**Constitution template:**
- Greenfield: Use `.stackshift/plugin/templates/constitution-agnostic-template.md`
- Brownfield: Use `.stackshift/plugin/templates/constitution-prescriptive-template.md`

**Feature spec template:**
Use `.stackshift/plugin/templates/feature-spec-template.md`

**Spec Kit setup:**
1. Try: `specify init --here --ai claude --force`
2. If fails: Copy templates from `.stackshift/plugin/speckit-templates/*.md` to `.specify/templates/`

Use the stackshift:technical-writer agent instructions from:
`.stackshift/plugin/agents/stackshift-technical-writer/AGENT.md`

Generate specifications in `.specify/memory/specifications/`

### Gear 4: Gap Analysis

Read and follow: `.stackshift/plugin/skills/gap-analysis/SKILL.md`

Run /speckit.analyze if available, or manually compare specs vs code.

Generate `docs/gap-analysis-report.md`

### Gear 5: Complete Specification

Read and follow: `.stackshift/plugin/skills/complete-spec/SKILL.md`

Handle clarifications based on strategy from configuration.

Use `/speckit.clarify` if available, or manually resolve.

### Gear 6: Implement

Read and follow: `.stackshift/plugin/skills/implement/SKILL.md`

Implement features based on scope from configuration.

Use `/speckit.tasks` and `/speckit.implement` if available.

For greenfield: Build in greenfield_location using target_stack.

## Progress Tracking

After each gear:
- Update `.stackshift-state.json` with progress
- Commit changes with clear message
- Report progress to user

## Completion

Show summary:
- What was generated
- Current state
- Next steps for ongoing spec-driven development

All changes automatically committed to the branch.

---

**Ready to bootstrap StackShift and shift through the gears!** 🚗💨
