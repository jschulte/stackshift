---
description: Gear 2 - Extract comprehensive documentation from codebase
---

# Gear 2: Reverse Engineering

**IMPORTANT**: This uses cached AST analysis to enhance documentation extraction.

## Step 1: Verify AST Analysis Cache Exists

Check if AST analysis from Gear 1 is available:

```bash
~/stackshift/scripts/run-ast-analysis.mjs check .
```

If missing, run:
```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**Why**: AST analysis helps auto-extract API endpoints, business logic, and function signatures for more accurate documentation.

## Step 2: Extract Documentation

Use the Skill tool with skill="reverse-engineer".

**The skill will**:
- Create 8 comprehensive documentation files
- Read `.stackshift-analysis/raw-analysis.json` for AST insights (if available)
- Extract functional requirements, API endpoints, business logic
- Save to `docs/reverse-engineering/`

**Enhanced with AST** (if cache available):
- API endpoints auto-extracted from routing code
- Function signatures documented accurately
- Business logic patterns identified automatically
