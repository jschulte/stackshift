---
description: Gear 4 - Analyze gaps and create prioritized implementation roadmap
---

# Gear 4: Gap Analysis

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

**This reads from cached AST analysis files (no re-analysis needed).**

## Step 1: Read Cached AST Analysis (Deterministic - Reads Files)

Use the Bash tool to display the cached roadmap:

```bash
# Check if analysis exists and is fresh
~/stackshift/scripts/run-ast-analysis.mjs check .

# Display the roadmap (uses cache if < 1 hour old)
~/stackshift/scripts/run-ast-analysis.mjs roadmap .
```

**What this does**:
- Reads from `.stackshift-analysis/roadmap.md` (created in Gear 1)
- If cache is stale (> 1 hour), automatically re-runs analysis
- If cache missing, runs fresh analysis and saves it
- Displays comprehensive gap analysis with priorities

**No re-parsing**: Uses cached AST results from Gear 1 for speed.

## Step 2: Review Gap Analysis

The roadmap shows:
- All features with implementation status (✅/⚠️/❌)
- Confidence scores for each gap
- Prioritized implementation phases
- Effort estimates
- Missing functions, stubs, incomplete features

## Step 3: If Analysis Missing, Use Fallback

If `.stackshift-analysis/` doesn't exist:

Use the Skill tool with skill="gap-analysis" for manual analysis.

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
