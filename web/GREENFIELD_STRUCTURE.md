# Greenfield Project Structure for Claude Code Web

## The Challenge

When building a new app from extracted business logic:
- **Original app:** Rails, PHP, old stack (being analyzed)
- **New app:** Next.js, Python, new stack (being built)
- **Claude Code Web:** Works on one repo/branch at a time

**Where does the new app go?**

---

## Recommended: Subfolder Approach

**Structure:**

```
my-project/                       # GitHub repo
├── legacy/                       # Original app (optional: move here)
│   ├── app/                     # Old code
│   ├── config/
│   └── ...
├── docs/                         # StackShift documentation
│   └── reverse-engineering/
│       ├── functional-specification.md   # Business logic extracted
│       ├── data-architecture.md
│       └── ... (8 files)
├── .specify/                     # Tech-agnostic specifications
│   └── memory/
│       ├── constitution.md      # NO framework mentions
│       ├── specifications/      # Business requirements only
│       └── plans/              # Implementation plans for new stack
├── greenfield/                   # NEW app built here! ✨
│   ├── package.json             # New stack (Next.js, etc.)
│   ├── README.md                # New app docs
│   ├── app/                     # New implementation
│   ├── components/
│   ├── lib/
│   └── ... (complete new application)
└── .stackshift-state.json
```

---

## Why This Works

✅ **Single repo** - Claude Code Web can access everything
✅ **Clear separation** - Old vs new clearly distinct
✅ **Easy reference** - New implementation can reference specs
✅ **Side-by-side comparison** - See old vs new
✅ **Gradual migration** - Can keep both running during transition
✅ **Eventually delete legacy** - When migration complete

---

## Implementation Flow

### Gear 1-4: Analysis and Specs

StackShift works with the **original app**:
- Analyzes legacy code
- Extracts business logic
- Creates tech-agnostic specs
- **Output location:** `.specify/`, `docs/`

**No new code yet** - just documentation and specifications.

### Gear 5: Complete Specification

Resolve clarifications:
- What features to build in new app?
- Any features to skip?
- Priority order?

Update specs with answers.

### Gear 6: Implementation

StackShift builds NEW app in `greenfield/`:

```bash
# StackShift creates:
mkdir -p greenfield

# Initialize new stack
cd greenfield
npm create next-app@latest . --typescript --tailwind --app

# Then implements features from specs
# Each feature from .specify/memory/specifications/
# Built in new stack (Next.js, Python, whatever)
```

**Result:** Brand new application in `greenfield/` directory!

---

## Gear 6: Greenfield Implementation Details

When implementing in greenfield location:

### Step 1: Initialize New Stack

```bash
cd greenfield/

# For Next.js
npm create next-app@latest . --typescript

# For Python/FastAPI
python -m venv venv
pip install fastapi uvicorn sqlalchemy

# For Go
go mod init my-app

# etc.
```

### Step 2: Copy Design Patterns

Reference old app for patterns:
- Look at `legacy/` to understand existing patterns
- Don't copy code, but understand UX flow
- Replicate user experience, not implementation

### Step 3: Implement from Specs

For each spec in `.specify/memory/specifications/`:
```bash
# Read spec (tech-agnostic)
cat .specify/memory/specifications/user-authentication.md

# Implement in new stack
# - Use /speckit.tasks to generate task list
# - Use /speckit.implement to build
# - Build in greenfield/ directory
# - Use target_stack from configuration
```

### Step 4: Update Specs

Mark implementation status:
```markdown
## Status
✅ COMPLETE - Implemented in greenfield/

## Implementation Location
**Directory:** greenfield/
**Stack:** Next.js 15 + TypeScript + Prisma
**Files:**
- greenfield/app/auth/login/page.tsx
- greenfield/lib/auth/jwt.ts
...
```

---

## Alternative Structures

### Option B: Branch-Based

```bash
# Old app
git checkout main
[legacy code here]

# New app
git checkout greenfield-rebuild
[new code here]
```

**Pros:** Complete separation
**Cons:** Can't reference both in same Web session

### Option C: Separate Repos

```bash
# Legacy repo
github.com/user/legacy-app
[old code, specs extracted]

# New repo
github.com/user/new-app
[built from specs]
```

**Pros:** Complete independence
**Cons:** Claude Code Web can only work on one at a time

**Recommended:** Stick with subfolder approach for Web!

---

## Example: Rails → Next.js Migration

### Before StackShift

```
my-rails-app/
├── app/
│   ├── models/
│   ├── controllers/
│   └── views/
├── config/
└── Gemfile
```

### After StackShift (Greenfield)

```
my-rails-app/
├── legacy/                       # Moved old code here
│   ├── app/
│   ├── config/
│   └── Gemfile
├── docs/                         # Extracted documentation
│   └── reverse-engineering/
├── .specify/                     # Tech-agnostic specs
│   └── memory/
│       ├── constitution.md      # Business requirements only!
│       └── specifications/      # No Rails mentions
├── greenfield/                   # NEW Next.js app!
│   ├── package.json
│   ├── app/
│   │   ├── auth/               # Rebuilt from spec
│   │   ├── dashboard/          # Rebuilt from spec
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── README.md
└── .stackshift-state.json
```

### Migration Complete

When ready to switch:
```bash
# Old app still running: my-rails-app.com (from legacy/)
# New app deployed: new-app.vercel.app (from greenfield/)

# After validation:
# - Delete legacy/ folder
# - Move greenfield/* to root
# - Or keep greenfield/ as the new project structure
```

---

## For Your $700 Token Burn

**Greenfield projects:**

If scope includes implementation (all, p0_p1, p0):
- **Tokens:** ~200k-500k (building full new app!)
- **Time:** 3-6 hours per project
- **Projects possible:** 1-3 with full implementation

**Recommendation for token maximization:**

```bash
# Specs only (fastest)
./prepare-web-batch.sh legacy-app greenfield cruise none

# Generates specs, no implementation
# Tokens: ~50k
# Then implement locally later (free!)
# Can do 10-15 greenfield specs extractions!
```

---

Want me to update the prepare-web-batch.sh script to automatically:
1. Create `greenfield/` directory for greenfield projects
2. Add instructions about greenfield structure
3. Update implementation logic to target the right location

?