---
description: Gear 3 - Generate GitHub Spec Kit specifications for ALL features
---

# Gear 3: Create Specifications

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

**This uses cached AST analysis to auto-detect implementation status.**

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

---

## Path B: BMAD Method (implementation_framework: bmad)

### Skip This Gear

For BMAD projects, documentation was already created in BMAD format during Gear 2.

**What was generated in Gear 2:**
```
docs/
├── index.md                    # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md          # Lean - loaded every dev session
│   ├── coding-standards.md    # Lean - loaded every dev session
│   └── project-structure.md   # Lean - loaded every dev session
├── architecture.md            # Full architecture documentation
└── prd.md                     # Product requirements document
```

**Why skip**: BMAD doesn't use `.specify/` format. The `docs/` structure from Gear 2 is what BMAD agents expect.

**Proceed to**: Gear 4 (Gap Analysis) or Gear 6 (Implementation) for BMAD handoff.
