---
name: gap-analysis
description: Compare specifications against implementation to identify incomplete features, missing UI components, technical debt, and ambiguous requirements. Generates prioritized gap list with [NEEDS CLARIFICATION] markers. This is Step 4 of 6 in the reverse engineering process.
---

# Gap Analysis

**Step 4 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** 15 minutes
**Prerequisites:** Step 3 completed (`specs/` directory exists)
**Output:** `specs/gap-analysis.md`

---

## When to Use This Skill

Use this skill when:
- You've completed Step 3 (Create Specifications)
- Have formal specifications in `specs/`
- Ready to identify what's missing or incomplete
- Preparing to complete the specification

**Trigger Phrases:**
- "Analyze gaps in implementation"
- "What's missing from the application?"
- "Identify incomplete features"
- "Compare specs to code"

---

## What This Skill Does

Compares specifications against implementation to identify:

1. **Missing Features** - Not started (❌ MISSING status)
2. **Partial Features** - Backend done, UI missing or vice versa (⚠️ PARTIAL status)
3. **Technical Debt** - Code quality, tests, documentation needs
4. **Clarifications Needed** - Ambiguous requirements marked `[NEEDS CLARIFICATION]`
5. **Prioritized Implementation Plan** - P0/P1/P2/P3 priorities

---

## Process Overview

### Step 1: Review Feature Specs

For each feature spec in `specs/features/`:
- Identify status (✅ COMPLETE / ⚠️ PARTIAL / ❌ MISSING)
- List what's implemented vs what's missing
- Note any ambiguities or unclear requirements

### Step 2: Identify Missing Features

Features marked ❌ MISSING:
- Why weren't they implemented?
- Are they actually needed?
- What's the user impact?
- Implementation effort estimate

### Step 3: Analyze Partial Features

Features marked ⚠️ PARTIAL:
- What exists? (e.g., backend API done)
- What's missing? (e.g., UI components)
- Why was it left incomplete?
- Effort to complete

### Step 4: Technical Debt Assessment

From `docs/reverse-engineering/technical-debt-analysis.md`:
- Code quality issues
- Missing tests
- Documentation gaps
- Security concerns
- Performance issues

### Step 5: Mark Ambiguities

Add `[NEEDS CLARIFICATION]` markers for:
- Unclear requirements
- Missing UX/UI details
- Undefined behavior
- Unspecified constraints

Example:
```markdown
### Analytics Dashboard [NEEDS CLARIFICATION]
- What charts/metrics should be displayed?
- Real-time or daily aggregates?
- User filtering options?
```

### Step 6: Prioritize Implementation

Classify gaps by priority:
- **P0** - Critical, blocking major use cases
- **P1** - High value, important for core functionality
- **P2** - Medium value, nice to have
- **P3** - Low priority, future enhancement

---

## Output Format

Create `specs/gap-analysis.md`:

```markdown
# Gap Analysis

**Date:** [Current Date]
**Overall Completion:** ~66%

---

## Summary

- **Complete Features:** 3 (25%)
- **Partial Features:** 4 (33%)
- **Missing Features:** 5 (42%)
- **Clarifications Needed:** 12

---

## Missing Features (❌)

### F003: Analytics Dashboard [P1]
**Status:** Not started
**Impact:** Users cannot track metrics over time
**Effort:** ~8 hours
**Dependencies:** None
**Clarifications:**
- [NEEDS CLARIFICATION] What metrics to display?
- [NEEDS CLARIFICATION] Chart types (line, bar, pie)?

### F005: Social Features [P2]
...

---

## Partial Features (⚠️)

### F002: Fish Management [P0]
**Implemented:**
- ✅ Backend API (all CRUD endpoints)
- ✅ Fish list page
- ✅ Fish detail view

**Missing:**
- ❌ Fish profile edit page
- ❌ Photo upload UI
- ❌ Bulk import feature

**Effort to Complete:** ~4 hours
**Clarifications:**
- [NEEDS CLARIFICATION] Photo upload: drag-drop or click-browse?
- [NEEDS CLARIFICATION] Max photos per fish?

---

## Technical Debt

### High Priority
- Missing integration tests (0 tests)
- No error handling in 8 API endpoints
- Hardcoded AWS region (should be configurable)

### Medium Priority
- Frontend components lack TypeScript types
- No loading states in UI
- Missing rate limiting on API

### Low Priority
- Inconsistent code formatting
- No dark mode support
- Missing accessibility labels

---

## Clarifications Needed (12 total)

### Critical (P0)
1. **F002 - Photo Upload:** UI pattern preference?
2. **F004 - Offline Sync:** Full data or metadata only?

### Important (P1)
3. **F003 - Analytics:** Chart types and metrics?
4. **F006 - Notifications:** Email, push, or both?

### Nice-to-Have (P2)
5. **F007 - Dark Mode:** Full theme support or toggle only?
...

---

## Prioritized Implementation Plan

### Phase 1: Complete P0 Items (~12 hours)
1. F002: Complete fish management UI
2. F004: Implement offline sync
3. Add error handling to all APIs
4. Add integration tests

### Phase 2: Implement P1 Features (~20 hours)
1. F003: Analytics dashboard
2. F006: Notification system
3. Add rate limiting
4. Improve TypeScript coverage

### Phase 3: P2/P3 Enhancements (~TBD)
1. F005: Social features
2. F007: Dark mode
3. F008: Admin panel
...

---

## Recommendations

1. **Clarify ambiguities in Step 5** before implementing
2. **Focus on P0 items first** - highest user impact
3. **Address technical debt** alongside new features
4. **Add tests** before expanding features

---

## Notes

[Any additional context or observations]
```

---

## Success Criteria

After running this skill, you should have:

- ✅ `specs/gap-analysis.md` created
- ✅ All missing features identified
- ✅ Partial features analyzed (what exists vs missing)
- ✅ Technical debt cataloged
- ✅ Ambiguities marked with `[NEEDS CLARIFICATION]`
- ✅ Prioritized implementation plan
- ✅ Ready to proceed to Step 5 (Complete Specification)

---

## Next Step

Once gap analysis is complete, proceed to:

**Step 5: Complete Specification** - Use the `complete-spec` skill for interactive clarification session.

---

## Technical Notes

- Cross-reference specs with actual code to verify status
- Estimate effort based on similar completed features
- Be conservative with P0 classification (only truly critical items)
- Group related clarifications together

---

**Remember:** This is Step 4 of 6. After identifying gaps, you'll have an interactive session to resolve clarifications, then implement missing features.
