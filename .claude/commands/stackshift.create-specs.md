---
description: Gear 3 - Generate GitHub Spec Kit specifications for ALL features
---

# Gear 3: Create Specifications

**IMPORTANT**: This uses cached AST analysis to auto-detect implementation status.

## Step 1: Check AST Analysis Cache

Verify AST analysis from Gear 1 is available:

```bash
~/stackshift/scripts/run-ast-analysis.mjs check .
```

**If missing**: AST analysis should have been run in Gear 1. Run it now:
```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

## Step 2: Install GitHub Spec Kit Scripts (Deterministic)

```bash
~/stackshift/scripts/install-speckit-scripts.sh .
```

**Why**: Required for `/speckit.*` commands to work in Gear 4.

## Step 3: Generate Specifications

Use the Skill tool with skill="create-specs".

**The skill will**:
- Read `docs/reverse-engineering/functional-specification.md`
- Read `.stackshift-analysis/raw-analysis.json` for implementation status
- Generate constitution and ALL feature specs
- Auto-populate status (✅/⚠️/❌) from AST data
- Create implementation plans for incomplete features
- Save to `.specify/` directory

**Enhanced with AST**:
- Specs show actual function signatures from code
- Implementation status auto-detected (not guessed)
- Stub detection marks features as PARTIAL
- Missing functions marked as NOT IMPLEMENTED
