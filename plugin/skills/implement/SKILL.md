---
name: implement
description: Systematically implement missing features from completed specifications. Works through prioritized list (P0 → P1 → P2), checks off items as completed, validates against acceptance criteria, and achieves 100% spec completion. This is Step 6 of 6 in the reverse engineering process.
---

# Implement from Spec

**Step 6 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** Hours to days (depends on gaps)
**Prerequisites:** Step 5 completed (all specs finalized, no `[NEEDS CLARIFICATION]` markers)
**Output:** Fully implemented application with all specs marked ✅ COMPLETE

---

## When to Use This Skill

Use this skill when:
- You've completed Step 5 (Complete Specification)
- All specifications are finalized and unambiguous
- Ready to implement missing and partial features
- Want to achieve 100% spec completion

**Trigger Phrases:**
- "Implement missing features"
- "Build from specifications"
- "Complete the partial features"
- "Implement the roadmap"

---

## What This Skill Does

Systematically implements features from specifications:

1. **Review Implementation Plan** - Confirm priority order
2. **Implement P0 Features** - Critical items first
3. **Implement P1 Features** - High-value items
4. **Complete Partial Features** - Finish incomplete work
5. **Validate Against Specs** - Test acceptance criteria
6. **Update Status Markers** - Mark features as ✅ COMPLETE
7. **Achieve 100% Completion** - All specs implemented

---

## Process Overview

### Step 1: Review Implementation Plan

From `specs/gap-analysis.md`:
- Prioritized list of features to implement
- Estimated effort for each
- Dependencies between features

**Confirm with user:**
- Start with P0 items?
- Any priority changes?
- Time constraints or deadlines?

### Step 2: Implement Each Feature

**For each feature in priority order:**

1. **Read Feature Spec**
   - Review overview and purpose
   - Read acceptance criteria
   - Note API endpoints, data models, UI requirements

2. **Plan Implementation**
   - What files need to be created/modified?
   - What dependencies are needed?
   - What order to implement (backend first, then frontend)?

3. **Implement Backend (if needed)**
   - API endpoints
   - Business logic
   - Database changes
   - Validation rules

4. **Implement Frontend (if needed)**
   - Pages/routes
   - Components
   - State management
   - API integration
   - Styling

5. **Add Tests**
   - Unit tests
   - Integration tests
   - E2E tests (for critical flows)

6. **Validate Against Acceptance Criteria**
   - Check off each criterion
   - Test manually
   - Verify edge cases

7. **Update Feature Spec**
   - Change status to ✅ COMPLETE
   - Note implementation details
   - Link to relevant code files

8. **Commit Changes**
   - Clear commit message
   - Reference feature spec (e.g., "feat: implement F003 analytics dashboard")

### Step 3: Handle Partial Features

For features marked ⚠️ PARTIAL:
- Identify what's implemented
- Implement missing pieces
- Ensure consistency between new and existing code
- Update to ✅ COMPLETE

### Step 4: Track Progress

Keep running checklist:
```markdown
## Implementation Progress

### P0 Items (4 total)
- [x] F002: Complete fish management UI
- [x] F004: Implement offline sync
- [ ] Add error handling to APIs
- [ ] Add integration tests

### P1 Items (3 total)
- [ ] F003: Analytics dashboard
- [ ] F006: Notification system
- [ ] Add rate limiting
```

Update `specs/implementation-status.md` after each feature.

---

## Implementation Guidelines

### Backend Development

**API Endpoints:**
- Follow existing patterns
- Use consistent error handling
- Add input validation
- Include proper authentication/authorization
- Add logging for debugging

**Database Changes:**
- Create migrations (don't modify existing)
- Add indexes for performance
- Include seed data if needed
- Test rollback procedures

**Business Logic:**
- Keep in service layer (not in routes)
- Write testable functions
- Handle edge cases
- Add appropriate comments

### Frontend Development

**Pages/Routes:**
- Follow existing navigation structure
- Add loading states
- Handle error states
- Responsive design

**Components:**
- Reuse existing components when possible
- Follow design system
- Add TypeScript types
- Include accessibility attributes

**State Management:**
- Use established patterns (Context/Redux/etc.)
- Keep state minimal
- Optimize re-renders

**API Integration:**
- Use existing API client
- Add loading and error handling
- Implement optimistic updates where appropriate

### Testing

**Required Tests:**
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI
- E2E tests for critical user flows

**Test Coverage Targets:**
- Backend: 80%+
- Frontend: 70%+
- Critical paths: 100%

### Documentation

As you implement:
- Update inline code comments
- Add JSDoc/TSDoc for functions
- Update README if setup changes
- Add to troubleshooting guide if complex

---

## Validation Process

For each feature, verify:

### Against Acceptance Criteria

Go through each criterion in the spec:
- [ ] Manual testing confirms it works
- [ ] Edge cases handled
- [ ] Error states work correctly
- [ ] Matches UX/UI requirements

### Code Quality

- [ ] Follows project conventions
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] TypeScript types (if applicable)
- [ ] No console.logs left in code

### Performance

- [ ] No unnecessary re-renders (frontend)
- [ ] Efficient database queries (backend)
- [ ] Lazy loading where appropriate
- [ ] Assets optimized

### Security

- [ ] Input sanitization
- [ ] Authentication checks
- [ ] Authorization rules
- [ ] No sensitive data exposed

---

## Example Implementation Flow

**Feature: F003 - Analytics Dashboard**

1. **Backend:**
   ```bash
   # Create API endpoints
   - Create src/api/analytics/fish-count.ts
   - Create src/api/analytics/water-params.ts
   - Create src/api/analytics/health-score.ts
   - Add WebSocket handler for alerts
   - Add tests
   ```

2. **Frontend:**
   ```bash
   # Create dashboard page
   - Create app/analytics/page.tsx
   - Create components/charts/FishCountChart.tsx
   - Create components/charts/WaterParamsChart.tsx
   - Create components/HealthScoreGauge.tsx
   - Create components/AlertsList.tsx
   - Add API integration
   - Style components
   - Add tests
   ```

3. **Validate:**
   - Test all charts render correctly
   - Verify date range selector works
   - Confirm real-time alerts update
   - Check mobile responsive design

4. **Update Spec:**
   - Change status: ❌ MISSING → ✅ COMPLETE
   - Add implementation notes
   - Link to code files

5. **Commit:**
   ```bash
   git add .
   git commit -m "feat: implement F003 analytics dashboard with charts and real-time alerts"
   ```

---

## Progress Tracking

### Update implementation-status.md

After each feature:
```markdown
## Overall: ~85% Complete (was 66%)

### ✅ Complete Features (6) ← was 3
- F001: User Authentication
- F002: Fish Management ← newly completed
- F003: Analytics Dashboard ← newly completed
- F004: Offline Sync ← newly completed
- ...

### ⚠️ Partial Features (1) ← was 4
- F006: Notification System (email done, push pending)

### ❌ Missing Features (3) ← was 5
- F005: Social Features
- F007: Dark Mode
- F008: Admin Panel
```

---

## Success Criteria

After running this skill, you should have:

- ✅ All P0 features implemented
- ✅ All P1 features implemented (or deferred with reason)
- ✅ All partial features completed
- ✅ Tests added for new features
- ✅ All feature specs marked ✅ COMPLETE
- ✅ Documentation updated
- ✅ Application at 100% completion (or defined scope)
- ✅ Ready for production deployment

---

## Final Steps

Once implementation is complete:

1. **Run full test suite** - Ensure nothing broke
2. **Update README** - Reflect new features
3. **Generate final documentation** - API docs, user guide
4. **Deploy to staging** - Test in production-like environment
5. **User acceptance testing** - Verify against original requirements
6. **Deploy to production** - Ship it!

---

## Continuous Spec-Driven Development

Going forward:

1. **New features start with specs** - Write spec first, then implement
2. **Update specs when requirements change** - Keep specs in sync
3. **Use specs for onboarding** - New developers read specs first
4. **Periodic re-evaluation** - Run toolkit again after major changes

---

## Technical Notes

- Implement in small, testable increments
- Commit frequently with clear messages
- Reference feature specs in commits (F001, F002, etc.)
- Update specs immediately after implementation
- Use TodoWrite tool to track implementation tasks

---

**Congratulations!** After completing this step, you'll have transformed a partially-complete application into a fully-specified, enterprise-grade, spec-driven codebase. 🎉

---

**Remember:** This is Step 6 of 6, the final step. After this, you'll have a complete application with comprehensive specifications that can guide future development.
