---
description: Gear 6 - Implement features from specifications
---

# Gear 6: Implementation

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

### Step 1: Implement Features

Use the Skill tool with skill="implement".

**The skill will**:
- Build features using `/speckit.tasks` and `/speckit.implement`
- Only implement PARTIAL and MISSING features
- Follow spec requirements exactly

### Step 2: Verify Implementation

After implementing each feature, verify with AST:

```bash
~/stackshift/scripts/run-ast-analysis.mjs status .
```

**What this checks**:
- ✅ Functions exist with correct signatures
- ✅ No stubs remaining
- ✅ Test files created

---

## Path B: BMAD Method (implementation_framework: bmad)

### StackShift Complete - Handoff to BMAD

StackShift has prepared your codebase with comprehensive documentation in BMAD's format.

**Generated files:**
```
docs/
├── index.md                    # Navigation for BMAD agents
├── architecture/
│   ├── tech-stack.md          # Loaded every dev session
│   ├── coding-standards.md    # Loaded every dev session
│   └── project-structure.md   # Loaded every dev session
├── architecture.md            # Full technical details
└── prd.md                     # Product requirements
```

### Next Steps for BMAD

1. **Install BMAD** (if not already):
   ```bash
   npx bmad-method@alpha install
   ```

2. **Load the Analyst agent** in your IDE (see `docs/ide-info/` for instructions)

3. **Run workflow-init**:
   ```
   *workflow-init
   ```

   BMAD will:
   - Detect existing `docs/` documentation
   - Recognize this as a brownfield project
   - Route to appropriate workflow (Quick Flow or BMad Method)
   - Use your StackShift-generated docs as context

4. **BMAD takes over** - PM, Architect, and Dev agents proceed with full context

### Why This Works

StackShift performed BMAD's "Phase 0: Documentation" with deeper analysis:
- AST-powered extraction (vs BMAD's file flattener)
- Semantic understanding of business logic
- Accurate API and data model documentation
- Lean `docs/architecture/*.md` files ready for dev agent context

**You get the best of both worlds:**
- StackShift's deep reverse engineering
- BMAD's agent-driven implementation workflow
