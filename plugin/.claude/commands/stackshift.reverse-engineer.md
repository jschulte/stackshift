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

## Step 2: Check Implementation Framework

Read the framework choice from Gear 1:

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Implementation Framework: ${IMPL_FRAMEWORK:-speckit}"
```

**Output format depends on framework:**
- **speckit** (default): `docs/reverse-engineering/` (8 files)
- **bmad**: `docs/` in BMAD structure (6 files)

## Step 3: Extract Documentation

Use the Skill tool with skill="reverse-engineer".

**For GitHub Spec Kit** (`implementation_framework: speckit`):
- Creates 8 comprehensive documentation files
- Saves to `docs/reverse-engineering/`
- Ready for `/speckit.specify` in Gear 3

**For BMAD Method** (`implementation_framework: bmad`):
- Creates BMAD-compatible documentation structure
- Saves lean files to `docs/architecture/` (always-loaded by dev agent)
- Saves full docs to `docs/`
- Ready for `*workflow-init` handoff in Gear 6

**BMAD Output Structure:**
```
docs/
├── index.md                      # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md            # Lean - loaded every dev session
│   ├── coding-standards.md      # Lean - loaded every dev session
│   └── project-structure.md     # Lean - loaded every dev session
├── architecture.md              # Full architecture documentation
└── prd.md                       # Product requirements document
```

**Enhanced with AST** (if cache available):
- API endpoints auto-extracted from routing code
- Function signatures documented accurately
- Business logic patterns identified automatically
