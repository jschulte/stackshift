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

StackShift has prepared your codebase with comprehensive reverse-engineering documentation.

**Generated files (same as Spec Kit path):**
```
docs/reverse-engineering/
├── functional-specification.md   # Business logic, requirements, user stories
├── integration-points.md         # External services, APIs, dependencies
├── configuration-reference.md    # All config options, env vars
├── data-architecture.md          # Data models, API contracts, schemas
├── operations-guide.md           # Deployment, infrastructure
├── technical-debt-analysis.md    # Issues, improvements
├── observability-requirements.md # Monitoring, logging
├── visual-design-system.md       # UI/UX patterns
└── test-documentation.md         # Testing requirements
```

### Next Steps for BMAD

1. **Install BMAD** (if not already):
   ```bash
   npx bmad-method@alpha install
   ```

2. **Load the Analyst agent** in your IDE (see BMAD docs for instructions)

3. **Run workflow-init**:
   ```
   *workflow-init
   ```

4. **Point BMAD to StackShift's documentation**:

   When BMAD asks about your project, tell it:
   ```
   This project has been analyzed by StackShift. Comprehensive reverse-engineering
   documentation is available in docs/reverse-engineering/. Please use these 9
   documents as context for creating the PRD and architecture.

   Key documents:
   - functional-specification.md - Business requirements and user stories
   - data-architecture.md - Data models and API contracts
   - integration-points.md - External dependencies and services
   ```

5. **BMAD takes over** - PM and Architect agents will:
   - Read StackShift's reverse-engineering docs
   - Collaboratively create PRD through conversation with you
   - Collaboratively create Architecture through conversation with you
   - Dev agent implements based on finalized docs

### Why This Works

**StackShift provides rich context, BMAD provides collaborative refinement:**

| StackShift Does | BMAD Does |
|-----------------|-----------|
| AST-powered code extraction | Collaborative PRD creation with PM agent |
| Semantic business logic analysis | Collaborative Architecture with Architect agent |
| Accurate API/data documentation | Agent-driven implementation workflow |
| Comprehensive 9-doc output | Scale-adaptive planning (Quick → Enterprise) |

**You get the best of both worlds:**
- StackShift's deep, accurate reverse engineering as input
- BMAD's interactive, collaborative artifact creation as output

---

## Path C: BOTH (implementation_framework: both) 🚀

### BE RAD: Best of All Worlds!

When you chose "BOTH", you get maximum flexibility.

### Step 1: Implement Features with Spec Kit

**First**, run Spec Kit implementation:

Use the Skill tool with skill="implement".

**The skill will**:
- Build features using `/speckit.tasks` and `/speckit.implement`
- Only implement PARTIAL and MISSING features
- Follow spec requirements exactly

### Step 2: Verify Implementation

```bash
~/stackshift/scripts/run-ast-analysis.mjs status .
```

### Step 3: BMAD Handoff (Optional)

**Then**, you have the option to hand off to BMAD for collaborative refinement.

**What you now have:**
```
.specify/                         # Spec Kit artifacts
├── memory/
│   ├── constitution.md
│   └── [feature-name]/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md

docs/reverse-engineering/         # BMAD context
├── functional-specification.md
├── data-architecture.md
├── integration-points.md
└── ... (9 files total)
```

**Your options going forward:**

1. **Use Spec Kit workflow** for task-driven development:
   - `/speckit.specify` for new features
   - `/speckit.plan` for implementation plans
   - `/speckit.tasks` for task lists
   - `/speckit.implement` for execution

2. **Use BMAD workflow** for collaborative refinement:
   - `npx bmad-method@alpha install`
   - Run `*workflow-init`
   - Point BMAD to `docs/reverse-engineering/`
   - Let PM/Architect agents create artifacts through conversation

3. **Mix and match** as needed:
   - Use Spec Kit for quick, focused tasks
   - Use BMAD when you need deeper architectural discussion
   - Both have access to the same rich context

### Why BOTH is Powerful

| Scenario | Use This |
|----------|----------|
| Quick bug fix | Spec Kit `/speckit.implement` |
| New feature with clear scope | Spec Kit workflow |
| Complex feature needing discussion | BMAD PM agent |
| Architecture decision | BMAD Architect agent |
| Day-to-day development | Spec Kit |
| Strategic planning | BMAD |

**The BE RAD philosophy:**
- **B**usiness logic extraction (StackShift)
- **E**verything documented (9 comprehensive files)
- **R**eady for any workflow (Spec Kit OR BMAD)
- **A**daptable to your needs (switch anytime)
- **D**ecision-free (no commitment upfront)
