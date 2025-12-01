---
description: Gear 1 - Analyze codebase and detect tech stack
---

# Gear 1: Analysis

**IMPORTANT**: This command runs AST analysis ONCE and saves results for all gears.

## Step 1: Run Full AST Analysis (Deterministic - Saves to Files)

First, use the Bash tool to execute comprehensive AST analysis:

```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**This will**:
- Parse entire codebase with Babel AST
- Analyze APIs, functions, classes, imports
- Detect stubs, business logic, patterns
- Save results to `.stackshift-analysis/` directory
- Generate roadmap.md, raw-analysis.json, summary.json

**Files created** (used by all other gears):
- `.stackshift-analysis/roadmap.md` - Human-readable gap analysis
- `.stackshift-analysis/raw-analysis.json` - Full AST data
- `.stackshift-analysis/summary.json` - Metadata & timestamps

**Cache duration**: 1 hour (auto-refreshes if stale)

## Step 2: Detect Tech Stack and Route

After AST analysis completes, use the Skill tool to detect tech stack:

Use the Skill tool with skill="analyze".

**The skill will**:
- Read file structure
- Detect frameworks from package.json
- Choose route (Greenfield/Brownfield)
- Auto-detect app type (monorepo, Nx, etc.)
- Create analysis-report.md
- Save to .stackshift-state.json
