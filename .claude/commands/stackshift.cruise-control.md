---
description: Cruise Control - Automatically run all 6 gears in sequence
---

# Cruise Control: Automatic Mode

**IMPORTANT**: This runs all 6 gears with AST analysis integrated throughout.

## Step 1: Run Full AST Analysis Upfront (Deterministic)

Before starting the 6-gear workflow, use the Bash tool to run comprehensive AST analysis:

```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**This creates** `.stackshift-analysis/` cache used by all gears.

## Step 2: Run All 6 Gears Sequentially

Use the Skill tool with skill="cruise-control".

**The skill will run**:
1. **Gear 1**: Detect tech stack (uses AST cache)
2. **Gear 2**: Extract documentation (enhanced with AST)
3. **Gear 3**: Create specs (auto-detects status from AST)
4. **Gear 4**: Gap analysis (reads cached roadmap)
5. **Gear 5**: Complete specs (evidence-based from AST)
6. **Gear 6**: Implement + verify (checks with AST)

**AST Integration**:
- All gears read from `.stackshift-analysis/` cache
- No re-parsing (efficient)
- Deterministic (files exist or error)

**Like automatic transmission**: Set route, run AST once, StackShift handles everything.
