# Step 4: Gap Analysis

**Estimated Time:** 15 minutes
**Output:** `specs/gap-analysis.md` with prioritized list of missing functionality

---

## 📋 Copy and Paste This Prompt

```
Analyze the specifications created in Step 3 and identify all gaps between the specification and the current implementation.

Use the feature specs in `specs/features/` and `specs/implementation-status.md` as your source.

---

## Phase 1: Identify Missing Features

Review all feature specs and categorize by status:

### ✅ Complete Features
- List features marked as ✅ COMPLETE (100% backend + 100% frontend)
- These are done and working

### ⚠️ Partial Features
- List features marked as ⚠️ PARTIAL
- For each, identify what's missing:
  - Backend complete but frontend missing? → List missing UI components
  - Frontend complete but backend missing? → List missing API endpoints
  - Both partial? → List what's missing from each

### ❌ Not Implemented
- List features marked as ❌ NOT IMPLEMENTED
- These haven't been started at all

---

## Phase 2: Categorize Gaps

Create `specs/gap-analysis.md` with this structure:

```markdown
# Gap Analysis

**Date:** [Current Date]
**Overall Completion:** [X]%
**Gaps Identified:** [Count]

---

## Executive Summary

This application is [X]% complete with [X] features fully implemented, [X] features partially complete, and [X] features not started.

**Primary Gaps:**
1. [Most significant gap]
2. [Second most significant gap]
3. [Third most significant gap]

**Estimated Effort to 100%:** [X] person-weeks

---

## 1. Missing Features (Not Started)

Features that have not been implemented at all:

### F0XX: [Feature Name]
**Priority:** [P0/P1/P2/P3]
**Estimated Effort:** [Low/Medium/High]

**What's Missing:**
- Backend: [List missing API endpoints, services]
- Frontend: [List missing pages, components]
- Tests: [List missing test coverage]

**Why It Matters:**
[Business value or user impact]

**Blockers:**
- [Any dependencies or prerequisites]

**[NEEDS CLARIFICATION]:**
- [?] [Question about how this should work]
- [?] [Another ambiguity]

---

[Repeat for each missing feature]

---

## 2. Partial Features (Backend Done, UI Missing)

Features where backend is complete but frontend is placeholder:

### F0XX: [Feature Name]
**Priority:** [P0/P1/P2/P3]
**Backend:** ✅ 100% Complete
**Frontend:** ❌ [X]% Complete
**Estimated Effort:** [Low/Medium/High]

**What Exists (Backend):**
- [x] API endpoint: `POST /path`
- [x] Data model: [Model name]
- [x] Business logic: [Service name]
- [x] Tests: [X]% coverage

**What's Missing (Frontend):**
- [ ] Page: `[/route]` - [Purpose]
- [ ] Component: `[ComponentName]` - [Purpose]
- [ ] Component: `[AnotherComponent]` - [Purpose]
- [ ] Form validation and error handling
- [ ] Loading states
- [ ] Success/error notifications

**UX/UI Decisions Needed:**
**[NEEDS CLARIFICATION]:**
- [?] [Question about UI behavior]
- [?] [Question about UX flow]
- [?] [Question about design]

**Estimated Frontend Work:**
- [X] hours/days to complete

---

[Repeat for each partial feature]

---

## 3. Partial Features (UI Done, Backend Missing)

Features where frontend exists but backend is incomplete:

### F0XX: [Feature Name]
[Same format as above, but flipped]

---

## 4. Partial Features (Both Incomplete)

Features where both backend and frontend are partially done:

### F0XX: [Feature Name]
[List what exists and what's missing for both]

---

## 5. Technical Debt Gaps

Issues from `docs/reverse-engineering/technical-debt-analysis.md` that impact functionality:

### TD-001: [Technical Debt Item]
**Type:** [Performance/Security/Code Quality/Testing]
**Priority:** [P0/P1/P2/P3]
**Impact:** [Description]

**What Needs to Be Done:**
- [ ] [Specific task]
- [ ] [Another task]

**Effort:** [Low/Medium/High]

---

## 6. Testing Gaps

Missing test coverage from `docs/reverse-engineering/test-documentation.md`:

### Missing Test Coverage

- [ ] **Backend Unit Tests:**
  - [ ] [Module/Service without tests]
  - [ ] [Another module without tests]

- [ ] **Backend Integration Tests:**
  - [ ] [Missing integration test]

- [ ] **Frontend Component Tests:**
  - [ ] [Component without tests]

- [ ] **E2E Tests:**
  - [ ] [User flow not tested]

**Current Coverage:**
- Backend: [X]%
- Frontend: [X]%

**Target Coverage:**
- Backend: [Y]%
- Frontend: [Y]%

**Effort to Reach Target:** [X] person-days

---

## 7. Documentation Gaps

Missing or incomplete documentation:

- [ ] API documentation (OpenAPI/Swagger UI)
- [ ] Component documentation (Storybook?)
- [ ] Architecture diagrams
- [ ] Deployment runbook
- [ ] User guides/help docs

---

## 8. Clarifications Needed

All items marked `[NEEDS CLARIFICATION]` across all feature specs:

### Feature: [Feature Name]
- [?] [Question 1]
- [?] [Question 2]

### Feature: [Another Feature]
- [?] [Question 3]

**Total Clarifications Needed:** [Count]

---

## 9. Prioritized Implementation Plan

### Phase 1: Critical (P0) - [X] person-weeks
Must have for MVP or production:

1. **F0XX - [Feature Name]** ([Effort])
   - [Key deliverables]

2. **F0XX - [Feature Name]** ([Effort])
   - [Key deliverables]

### Phase 2: High Priority (P1) - [X] person-weeks
Important for full functionality:

1. **F0XX - [Feature Name]** ([Effort])
2. **F0XX - [Feature Name]** ([Effort])

### Phase 3: Medium Priority (P2) - [X] person-weeks
Nice to have:

1. **F0XX - [Feature Name]** ([Effort])
2. **F0XX - [Feature Name]** ([Effort])

### Phase 4: Low Priority (P3) - [X] person-weeks
Future enhancements:

1. **F0XX - [Feature Name]** ([Effort])

---

## 10. Dependencies & Sequencing

Features that must be completed before others:

```
F001 (Auth) → F002 (User Profile) → F003 (Settings)
                ↓
              F004 (Data Management)
                ↓
              F005 (Analytics)
```

---

## 11. Effort Estimates

### By Category
- Missing Features: [X] person-weeks
- Partial Features (UI): [X] person-weeks
- Partial Features (Backend): [X] person-weeks
- Technical Debt: [X] person-weeks
- Testing: [X] person-weeks
- Documentation: [X] person-weeks

**Total Effort:** [X] person-weeks ([X] person-months)

### By Priority
- P0 (Critical): [X] person-weeks
- P1 (High): [X] person-weeks
- P2 (Medium): [X] person-weeks
- P3 (Low): [X] person-weeks

---

## 12. Recommended Next Steps

1. **Step 5: Complete Specification** (Interactive Session)
   - Answer all `[NEEDS CLARIFICATION]` questions
   - Define missing UX/UI details
   - Prioritize implementation order
   - Refine effort estimates

2. **Step 6: Implementation**
   - Start with P0 features
   - Work through prioritized list
   - Check off completed items
   - Validate against specifications

---

## Notes

[Any additional context or observations from the gap analysis]
```

---

## Phase 3: Generate Summary Metrics

Calculate and include:

**Completion Metrics:**
- Features: [X] complete, [X] partial, [X] missing
- Backend: [X]% complete
- Frontend: [X]% complete
- Tests: [X]% coverage
- Docs: [X]% coverage

**Effort Metrics:**
- Total gaps: [Count]
- Estimated person-weeks to 100%
- Breakdown by priority

**Priority Breakdown:**
- P0: [Count] items, [X] person-weeks
- P1: [Count] items, [X] person-weeks
- P2: [Count] items, [X] person-weeks
- P3: [Count] items, [X] person-weeks

---

## Commit Gap Analysis

```bash
git add specs/gap-analysis.md
git commit -m "docs: add comprehensive gap analysis

Identified [X] gaps across [Y] features:
- [X] features not started (P0: [X], P1: [X], P2: [X])
- [X] features with missing frontend UI
- [X] features with missing backend
- [X] technical debt items
- [X] clarifications needed

Total estimated effort: [X] person-weeks
Next: Interactive clarification session (Step 5)"
git push
```

---

## Success Criteria

After running this prompt:
- [x] `specs/gap-analysis.md` created
- [x] All missing features identified
- [x] All partial features analyzed
- [x] Technical debt catalogued
- [x] Testing gaps listed
- [x] Clarifications marked with [NEEDS CLARIFICATION]
- [x] Prioritized implementation plan created
- [x] Effort estimates provided
- [x] Committed to git
- [x] Ready for Step 5 (interactive session)
```

---

## 🔄 Next Step

Once gap analysis is complete and committed, proceed to:

**Step 5: Complete Specification** (`05-complete-specification.md`)

**Note:** Step 5 is **interactive** - you'll have a conversation to answer clarifications and refine the spec.
