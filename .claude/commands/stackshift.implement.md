---
description: Gear 6 - Implement features from specifications
---

# Gear 6: Implementation

**IMPORTANT**: This uses cached AST analysis to verify implementations match specs.

## Step 1: Implement Features

Use the Skill tool with skill="implement".

**The skill will**:
- Build features using `/speckit.tasks` and `/speckit.implement`
- Only implement PARTIAL and MISSING features
- Follow spec requirements exactly

## Step 2: Verify Implementation (Deterministic - Post-Implementation)

After implementing each feature, verify with AST:

```bash
# Read cached analysis to verify implementation
~/stackshift/scripts/run-ast-analysis.mjs status .
```

**What this checks**:
- ✅ Functions exist with correct signatures
- ✅ No stubs remaining (all TODOs resolved)
- ✅ Error handling implemented
- ✅ Test files created

**If verification fails**: Fix issues before marking feature complete

**Enhanced with AST**:
- Automated verification (not manual review)
- Catches signature mismatches
- Detects remaining stubs
- Ensures quality before completion
