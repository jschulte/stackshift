# GitHub Spec Kit Compliance Guide

**Purpose:** Ensure all StackShift-generated specs follow the official GitHub Spec Kit structure

## Correct Structure (GSK-Compliant)

```
project-root/
├── .specify/
│   ├── memory/
│   │   └── constitution.md         # Project governance and principles
│   ├── specs/                      # All feature specifications
│   │   ├── 001-feature-name/
│   │   │   ├── spec.md            # Feature requirements
│   │   │   ├── plan.md            # Implementation plan
│   │   │   └── tasks.md           # Actionable tasks
│   │   ├── 002-another-feature/
│   │   │   ├── spec.md
│   │   │   ├── plan.md
│   │   │   └── tasks.md
│   │   └── ...
│   ├── templates/                  # AI agent templates
│   └── scripts/                    # Automation scripts
├── src/                            # Source code
└── docs/                           # Other documentation
```

## Key Rules

1. **Constitution Location:** `.specify/memory/constitution.md`
   - ✅ Single file containing project principles
   - ✅ Lives in `memory/` subdirectory

2. **Specifications Location:** `.specify/specs/NNN-feature-name/`
   - ✅ All specs in `.specify/specs/` directory
   - ❌ NOT in root `specs/` folder
   - ❌ NOT in `.specify/memory/specifications/`

3. **Feature Folder Naming:** `NNN-feature-name`
   - ✅ Three-digit zero-padded number (001, 002, 025, etc.)
   - ✅ Hyphen separator
   - ✅ Descriptive kebab-case name

4. **Feature Files:** Three files per feature
   - `spec.md` - Requirements, user stories, acceptance criteria
   - `plan.md` - Implementation approach, architecture decisions
   - `tasks.md` - Actionable checklist for implementation

## StackShift Gear 3 Behavior

When running Gear 3 (Create Specifications), StackShift will:

1. **Create `.specify/specs/` directory** (not `.specify/memory/specifications/`)
2. **Generate numbered feature folders** (001-feature, 002-feature, etc.)
3. **Create spec.md for ALL features** (complete, partial, missing)
4. **Create plan.md for incomplete features** (if thoroughness enabled)
5. **Create tasks.md** (if tasks generation enabled)

## Migration from Old Structures

If you have an old structure, StackShift will automatically migrate:

### From Root `specs/` Folder

```bash
# Before
specs/
├── 001-feature/
│   └── spec.md

# After (automatic migration)
.specify/
└── specs/
    ├── 001-feature/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
```

### From `.specify/memory/specifications/`

```bash
# Before
.specify/
└── memory/
    ├── constitution.md
    └── specifications/
        ├── feature-1.md
        └── feature-2.md

# After (automatic migration)
.specify/
├── memory/
│   └── constitution.md
└── specs/
    ├── 001-feature-1/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    └── 002-feature-2/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## Validation Checklist

Use this to verify GSK compliance:

- [ ] `.specify/memory/constitution.md` exists
- [ ] `.specify/specs/` directory exists
- [ ] NO root `specs/` folder exists
- [ ] NO `.specify/memory/specifications/` folder exists
- [ ] NO `.specify/memory/plans/` folder exists
- [ ] Each feature in `.specify/specs/NNN-feature-name/` format
- [ ] Each feature has `spec.md`
- [ ] Each incomplete feature has `plan.md`
- [ ] Each feature has `tasks.md` (if tasks enabled)

## Slash Commands

GitHub Spec Kit provides these commands (work with correct structure):

- `/speckit.specify` - Create new feature specification
- `/speckit.plan` - Generate implementation plan
- `/speckit.tasks` - Generate task breakdown
- `/speckit.implement` - Implement feature from spec
- `/speckit.analyze` - Validate implementation against spec

## Common Mistakes to Avoid

### ❌ Wrong: Root specs/ folder
```
specs/
└── 001-feature/
    └── spec.md
```

### ❌ Wrong: Specs in memory/
```
.specify/
└── memory/
    ├── constitution.md
    └── specifications/
        └── feature.md
```

### ❌ Wrong: Plans in separate directory
```
.specify/
├── memory/
│   └── plans/
│       └── 001-plan.md
└── specs/
    └── 001-feature/
        └── spec.md
```

### ✅ Correct: All-in-one feature folders
```
.specify/
├── memory/
│   └── constitution.md
└── specs/
    └── 001-feature/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## References

- Official GitHub Spec Kit: https://github.com/github/spec-kit
- StackShift Documentation: `/docs/development/SPEC_KIT_INTEGRATION.md`
- Migration Guide: `/docs/GSK_STRUCTURE_FIX.md`

---

**Last Updated:** 2025-11-19
**StackShift Version:** 2.0.0+
