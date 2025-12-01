---
description: Gear 4 - Analyze gaps and create prioritized implementation roadmap
---

# Gear 4: Gap Analysis

**IMPORTANT**: This reads from cached AST analysis files (no re-analysis needed).

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
