# GitHub Spec Kit Structure Fix

**Created:** 2025-11-19
**Issue:** StackShift was generating specs in incorrect locations, causing "three ways" inconsistency

## Problem Summary

StackShift has been generating specifications in **THREE different structures**:

### ❌ Wrong Structure 1: Root `specs/` folder
```
specs/
├── 001-feature-name/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
```

### ❌ Wrong Structure 2: `.specify/memory/specifications/`
```
.specify/
└── memory/
    ├── constitution.md
    └── specifications/
        ├── feature-1.md
        └── feature-2.md
```

### ✅ CORRECT Structure (GSK-Compliant):
```
.specify/
├── memory/
│   └── constitution.md
└── specs/
    ├── 001-feature-name/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    ├── 002-another-feature/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    └── ...
```

## GitHub Spec Kit Official Structure

According to https://github.com/github/spec-kit:

1. **Constitution:** `.specify/memory/constitution.md`
2. **Specifications:** `.specify/specs/NNN-feature-name/spec.md`
3. **Plans:** `.specify/specs/NNN-feature-name/plan.md`
4. **Tasks:** `.specify/specs/NNN-feature-name/tasks.md`

**Key Points:**
- Constitution goes in `.specify/memory/`
- Specs go in `.specify/specs/` (NOT `specs/` at root)
- Each feature is a numbered folder: `001-feature`, `002-feature`, etc.
- All three files (spec.md, plan.md, tasks.md) live in the same feature folder

## Files That Need Updating

### 1. Skills
- ✅ `skills/create-specs/SKILL.md` - Lines 64, 184, 196, 219-226
- ✅ `skills/gap-analysis/SKILL.md` - References to spec locations
- ✅ `skills/implement/SKILL.md` - References to spec locations
- ✅ `skills/implement/operations/handoff.md` - References to spec locations
- ✅ `skills/reverse-engineer/SKILL.md` - References to spec output
- ✅ `skills/spec-coverage-map/SKILL.md` - References to spec locations

### 2. Commands
- ✅ `commands/batch.md` - Spec output location references
- ✅ `commands/coverage.md` - Spec path references
- ✅ `commands/modernize.md` - Spec references
- ✅ `commands/speckit-implement.md` - Spec references

### 3. Scripts
- ✅ `scripts/prepare-web-batch.sh` - Creates wrong directories
- ✅ `scripts/BATCH_PROCESSING_GUIDE.md` - Documentation

### 4. Web Bootstrap
- ✅ `web/WEB_BOOTSTRAP.md` - Spec references
- ✅ `web/reconcile-specs.md` - Manual reconciliation

### 5. Documentation
- ✅ `docs/development/SPEC_KIT_INTEGRATION.md` - Integration docs
- ✅ `docs/guides/BROWNFIELD_UPGRADE_MODE.md` - References

### 6. Templates
- ✅ `plugin-templates/constitution-prescriptive-template.md` - References

### 7. Agents
- ✅ `agents/feature-brainstorm/AGENT.md` - Spec references

## Migration Strategy

### For Existing Projects
When StackShift encounters existing projects with wrong structure:

```bash
# Detect structure
if [ -d "specs" ] && [ ! -d ".specify/specs" ]; then
  echo "⚠️  Legacy structure detected: specs/"
  echo "Migrating to GSK-compliant structure..."
  mkdir -p .specify/specs
  mv specs/* .specify/specs/
  rmdir specs
fi

if [ -d ".specify/memory/specifications" ]; then
  echo "⚠️  Old StackShift structure detected: .specify/memory/specifications/"
  echo "Migrating to GSK-compliant structure..."
  mkdir -p .specify/specs
  mv .specify/memory/specifications/* .specify/specs/
  rmdir .specify/memory/specifications
fi
```

### For New Projects
Always create specs in `.specify/specs/NNN-feature-name/`

## Search & Replace Patterns

Replace these patterns across all files:

1. `specs/###-feature-name` → `.specify/specs/###-feature-name`
2. `specs/FEATURE-ID` → `.specify/specs/FEATURE-ID`
3. `specs/001-` → `.specify/specs/001-`
4. `.specify/memory/specifications` → `.specify/specs`
5. Documentation references to root `specs/` folder

## Implementation Checklist

- [ ] Update all SKILL.md files
- [ ] Update all command .md files
- [ ] Update scripts (bash)
- [ ] Update web bootstrap docs
- [ ] Update development docs
- [ ] Update templates
- [ ] Update agent descriptions
- [ ] Add migration logic to create-specs skill
- [ ] Test with new project
- [ ] Test with existing project (migration path)
- [ ] Update README.md with correct structure
- [ ] Update QUICKSTART.md

## Testing Plan

1. **Test New Project Creation:**
   ```bash
   cd /tmp/test-app
   # Run StackShift Gear 3
   # Verify specs created in .specify/specs/
   ```

2. **Test Migration Path:**
   ```bash
   cd /tmp/old-structure-app
   # Has specs/ at root
   # Run StackShift Gear 3
   # Verify migration to .specify/specs/
   ```

3. **Test Documentation Accuracy:**
   - Follow SKILL.md instructions
   - Verify all paths work correctly
   - Check slash commands reference correct paths

## Rollout Plan

1. ✅ Document the issue (this file)
2. ✅ Create fix plan
3. ⏳ Update all documentation files
4. ⏳ Update all skill files
5. ⏳ Update scripts
6. ⏳ Test with sample projects
7. ⏳ Commit changes with clear message
8. ⏳ Update CHANGELOG.md

## References

- GitHub Spec Kit: https://github.com/github/spec-kit
- GSK README: https://raw.githubusercontent.com/github/spec-kit/main/README.md
- StackShift Issue: Three different spec structures causing confusion

---

**Status:** IN PROGRESS
**Priority:** HIGH - Causes confusion and requires manual migration
**Impact:** All future StackShift runs will use correct GSK structure
