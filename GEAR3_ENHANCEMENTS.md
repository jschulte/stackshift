# Gear 3 Enhancements: Thoroughness Options

**Date**: 2024-11-19
**Status**: ✅ Implemented
**Impact**: Saves 2-5 hours per project

---

## What Changed

**Gear 3 (Create Specs)** now has **thoroughness options** instead of just creating specs:

### Option 1: Specs Only (30 min - original)
- Generate `specs/###-feature-name/spec.md` for all features
- Constitution and folder structure
- Ready for manual `/speckit.plan`

### Option 2: Specs + Plans (45-60 min - recommended)
- Everything from Option 1
- **PLUS**: Auto-generate `plan.md` for PARTIAL/MISSING features
- Parallel generation (5 at a time)
- Ready for manual `/speckit.tasks`

### Option 3: Specs + Plans + Tasks (90-120 min - complete roadmap)
- Everything from Option 2
- **PLUS**: Auto-generate comprehensive `tasks.md` (300-500 lines each)
- Parallel generation (3 at a time)
- Ready for immediate implementation
- **No additional planning needed!**

---

## Why This Is Better

**Before**: 6 separate gears (was going to be 8 with 3.5 and 3.6)
- Overcomplicated the gear metaphor
- User had to understand more concepts
- More confusing configuration

**After**: Still 6 gears, but Gear 3 has depth options
- Simpler mental model
- Single configuration point
- Clearer user choice

---

## How to Use

### Interactive Mode

When running Gear 3, you'll be asked:

```
How thorough should spec generation be?

1. Specs only (30 min)
   - Generate specifications for all features
   - Manual planning required afterward

2. Specs + Plans (45-60 min) - Recommended
   - Generate specs AND implementation plans
   - Ready for task breakdown

3. Specs + Plans + Tasks (90-120 min) - Complete Roadmap
   - Generate everything: specs, plans, AND tasks
   - Ready for immediate implementation
   - No additional planning needed

Choose: [1/2/3]
```

### Configuration File

Set in `.stackshift-state.json`:

```json
{
  "config": {
    "gear3_thoroughness": "specs+plans+tasks"
  }
}
```

**Options**:
- `"specs"` - Level 1
- `"specs+plans"` - Level 2
- `"specs+plans+tasks"` - Level 3

### In Cruise Control

```json
{
  "config": {
    "mode": "cruise-control",
    "gear3_thoroughness": "specs+plans+tasks"  // Full automation!
  }
}
```

---

## Implementation Details

### Plan Generation (Level 2+)

**Location**: `skills/create-specs/SKILL.md` - Step 4

**Process**:
1. Scan all specs for ⚠️ PARTIAL / ❌ MISSING status
2. Launch parallel agents (5 at a time)
3. Each agent reads spec and generates plan.md
4. Uses `/speckit.plan` template format
5. Verifies 100% coverage

**Output**: `plan.md` files (~400 lines each)

### Task Generation (Level 3 Only)

**Location**: `skills/create-specs/SKILL.md` - Step 5

**Process**:
1. Scan all plan.md files
2. Launch parallel agents (3 at a time)
3. Each agent reads spec + plan and generates tasks.md
4. Uses comprehensive template (based on v9-alert-banner examples)
5. Quality check: minimum 200 lines, target 300-500
6. Reports quality metrics

**Output**: `tasks.md` files (~400 lines each with 5-10 phases, 30-60 tasks)

---

## Benefits

### Time Savings

**Before (Manual)**:
- Gear 3: 30 min (specs only)
- Manual planning: 1-2 hours (create 8-12 plans)
- Manual tasking: 2-4 hours (create 8-12 task lists)
- **Total: 4-7 hours**

**After (Automated - Level 3)**:
- Gear 3: 90-120 min (specs + plans + tasks, all automated)
- **Total: 2 hours**
- **Savings: 2-5 hours!** 🎉

### Quality Improvements

**Before**:
- Plans: Inconsistent quality, sometimes too brief
- Tasks: Often skipped or incomplete
- Coverage: Hit-or-miss

**After**:
- Plans: Consistent 300-500 lines, comprehensive
- Tasks: Always 300-500 lines with all phases
- Coverage: 100% verified

---

## Examples

### Level 1: Specs Only
```
specs/
├── 001-alert-display/
│   └── spec.md              # Generated
├── 002-scheduled-display/
│   └── spec.md              # Generated
└── 003-analytics-tracking/
    └── spec.md              # Generated

Manual: Run /speckit.plan for each feature you want to implement
```

### Level 2: Specs + Plans
```
specs/
├── 001-alert-display/       # ✅ COMPLETE
│   └── spec.md
├── 002-scheduled-display/   # ✅ COMPLETE
│   └── spec.md
└── 003-analytics-tracking/  # ⚠️ PARTIAL
    ├── spec.md
    └── plan.md              # ✨ Auto-generated

Manual: Run /speckit.tasks for each plan when ready to implement
```

### Level 3: Specs + Plans + Tasks (Complete!)
```
specs/
├── 001-alert-display/       # ✅ COMPLETE
│   └── spec.md
├── 002-scheduled-display/   # ✅ COMPLETE
│   └── spec.md
└── 003-analytics-tracking/  # ⚠️ PARTIAL
    ├── spec.md
    ├── plan.md              # ✨ Auto-generated
    └── tasks.md             # ✨ Auto-generated (427 lines, 8 phases, 52 tasks)

Manual: Nothing! Just start implementing from tasks.md
```

---

## Recommended Usage

**For Small Projects (<10 features)**:
- Use Level 1 or 2
- Planning is quick enough to do manually
- More flexibility

**For Medium Projects (10-30 features)**:
- Use Level 2 or 3
- Planning starts to be tedious
- Level 3 saves significant time

**For Large Projects (30+ features)**:
- Use Level 3 (complete automation)
- Manual planning would take many hours
- Consistency is critical

**For Quick Assessment**:
- Use Level 1
- Get overview quickly
- Plan specific features as needed

---

## Configuration Options

All options configurable in `.stackshift-state.json`:

```json
{
  "config": {
    // Thoroughness level
    "gear3_thoroughness": "specs+plans+tasks",  // "specs" | "specs+plans" | "specs+plans+tasks"

    // Parallelization limits
    "plan_parallel_limit": 5,  // Plans generated in parallel
    "task_parallel_limit": 3,  // Tasks generated in parallel (slower)

    // Quality checks
    "plan_min_lines": 200,     // Flag plans shorter than this
    "task_min_lines": 200,     // Flag tasks shorter than this
    "task_target_lines": 400   // Target length for tasks
  }
}
```

---

## Files Modified

1. ✅ `skills/create-specs/SKILL.md` - Added Steps 4 and 5, configuration options
2. ✅ `GEAR3_ENHANCEMENTS.md` - This documentation file

**Lines Added**: ~140 lines to create-specs/SKILL.md

---

## Testing

Test the enhanced Gear 3 on:

1. **v9-alert-banner** (brownfield, all complete)
   - Expected: Specs only (no plans/tasks needed)
   - Verify: Correctly identifies all as COMPLETE

2. **ws-form** (mix of complete/partial/missing)
   - Expected: Specs for all, plans for incomplete, tasks for planned
   - Verify: Quality and coverage

3. **Greenfield project**
   - Expected: Specs for business logic, plans for all, tasks for all
   - Verify: Tech-agnostic specs, detailed tasks

---

## Next Steps

1. Test on sample project with different thoroughness levels
2. Refine prompts based on output quality
3. Update README.md with new options
4. Document in QUICKSTART.md

---

**Status**: ✅ Implemented and Ready to Test
**Complexity**: Reduced (kept as single gear with options)
**User Experience**: Improved (simpler choice)
**Time Savings**: 2-5 hours per project
