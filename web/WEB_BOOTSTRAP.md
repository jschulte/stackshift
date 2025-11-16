You are setting up StackShift - a reverse engineering toolkit that transforms applications into spec-driven projects.

## Bootstrap StackShift

First, download and set up StackShift in this repository:

```bash
# Download StackShift v1.0.0 from GitHub
curl -L https://github.com/jschulte/stackshift/archive/refs/tags/v1.0.0.tar.gz -o stackshift.tar.gz

# Extract to .stackshift directory
mkdir -p .stackshift
tar -xzf stackshift.tar.gz -C .stackshift --strip-components=1

# Cleanup
rm stackshift.tar.gz

# Verify installation
ls .stackshift/
```

You should now have:
- `.stackshift/plugin/skills/` - 7 skills
- `.stackshift/plugin/agents/` - 2 agents
- `.stackshift/plugin/templates/` - Constitution and spec templates
- `.stackshift/plugin/speckit-templates/` - Fallback Spec Kit templates
- `.stackshift/prompts/greenfield/` - Tech-agnostic prompts
- `.stackshift/prompts/brownfield/` - Tech-prescriptive prompts

## Configuration

Ask me these questions:

1. **Route:**
   - A) Greenfield: Extract business logic only (tech-agnostic) for rebuilding in new stack
   - B) Brownfield: Extract full implementation (tech-prescriptive) for managing with GitHub Spec Kit

2. **Mode:**
   - A) Manual: Stop at each gear for review
   - B) Cruise Control: Shift through all 6 gears automatically

3. **(If Cruise Control) Clarifications Strategy:**
   - A) Defer: Mark [NEEDS CLARIFICATION], continue anyway
   - B) Prompt: Stop and ask questions
   - C) Skip: Only implement clear features

4. **(If Cruise Control) Implementation Scope:**
   - A) None: Stop after specs ready
   - B) P0: Critical features only
   - C) P0+P1: Critical + high-value (recommended)
   - D) All: Everything (may take hours)

5. **(If Greenfield + implementing) Target Stack:**
   - What tech stack for the new implementation?
   - Examples: Next.js 15, Python/FastAPI, Go/Gin

6. **(If Greenfield + implementing) Build Location:**
   - Where to build new app? (default: greenfield/)

Save configuration to `.stackshift-state.json`

## Execute 6-Gear Process

Based on my answers, follow the appropriate guide from `.stackshift/prompts/`:

### For Brownfield Route

Read and execute: `.stackshift/prompts/brownfield/02-reverse-engineer-full-stack.md`

Use the Task tool with subagent_type=Explore to:
- Extract business logic + technical implementation
- Document exact frameworks, versions, file paths
- Generate 8 comprehensive docs in `docs/reverse-engineering/`

Then continue through remaining gears using Brownfield approach.

### For Greenfield Route

Read and execute: `.stackshift/prompts/greenfield/02-reverse-engineer-business-logic.md`

Use the Task tool with subagent_type=Explore to:
- Extract business logic ONLY (no tech details)
- Focus on WHAT, not HOW
- Generate 8 tech-agnostic docs in `docs/reverse-engineering/`

Then continue through remaining gears using Greenfield approach.

## The 6 Gears

### 🔍 Gear 1: Analyze
- Detect tech stack
- Assess completeness
- Generate `analysis-report.md`
- Save state to `.stackshift-state.json`

### 🔄 Gear 2: Reverse Engineer
- Use appropriate prompt from `.stackshift/prompts/`
- Generate 8 comprehensive documentation files
- Save to `docs/reverse-engineering/`

### 📋 Gear 3: Create Specifications
- Run: `specify init --here --ai claude --force`
- If fails: Create `.specify/memory/{specifications,plans}` manually
- Copy templates from `.stackshift/plugin/speckit-templates/*.md` to `.specify/templates/`
- Generate constitution using `.stackshift/plugin/templates/constitution-{agnostic|prescriptive}-template.md`
- Generate feature specifications in `.specify/memory/specifications/`
- Generate implementation plans in `.specify/memory/plans/`

### 🔍 Gear 4: Gap Analysis
- Compare specs vs implementation
- Identify COMPLETE/PARTIAL/MISSING features
- Mark [NEEDS CLARIFICATION] items
- Create prioritized roadmap
- Generate `docs/gap-analysis-report.md`

### ✨ Gear 5: Complete Specification
- Based on clarifications_strategy (defer/prompt/skip)
- Resolve [NEEDS CLARIFICATION] markers
- Finalize all specifications

### 🚀 Gear 6: Implement
- Based on implementation_scope (none/p0/p0_p1/all)
- Use /speckit.tasks and /speckit.implement
- For Greenfield: Build in greenfield/ (or custom location)
- For Brownfield: Build in current directory

## Progress Reporting

After each gear:
```
✅ Gear N: [Name] Complete (X minutes)
Progress: N/6 gears (X%)
```

Final report:
```
🏁 All gears complete!

Generated:
- analysis-report.md
- docs/reverse-engineering/ (8 files)
- .specify/memory/constitution.md
- .specify/memory/specifications/ (X specs)
- .specify/memory/plans/ (Y plans)
- docs/gap-analysis-report.md
- .stackshift-state.json

All committed to this branch.
```

## Handoff After Completion

If Gears 1-5 complete and gaps exist (PARTIAL/MISSING features):

Run the handoff procedure from `.stackshift/plugin/skills/implement/operations/handoff.md`:
1. Celebrate completion
2. Explain transition to standard Spec Kit workflow
3. List remaining features
4. Offer to set up first feature branch
5. Provide /speckit.* command guidance

## Important Notes

**For Brownfield:**
- Extract business logic + technical details
- Document exact versions, file paths, schemas
- Specs match current implementation
- Enables /speckit.analyze validation

**For Greenfield:**
- Extract business logic ONLY
- NO framework/library names (unless business requirement)
- Tech-agnostic specs
- Can implement in any stack

**For Both:**
- Use Task tool with Explore agent for deep analysis
- Generate files in parallel for efficiency
- Commit after each gear
- All files created in current working directory
- StackShift code in `.stackshift/` (available to reference)

## Ready?

Ask me the configuration questions (1-6 above), then shift through the gears! 🚗💨
