# Step 6: Implement from Spec

**Estimated Time:** Hours to days (depends on gaps)
**Output:** Fully implemented application matching complete specification

---

## 📋 Copy and Paste This Prompt

```
Now that we have complete, unambiguous specifications from Steps 1-5, let's systematically implement all missing features.

We'll work through the prioritized implementation plan from `specs/gap-analysis.md`, implementing features one by one and checking them off as complete.

---

## Phase 1: Review Implementation Plan

Let's review the plan from `specs/gap-analysis.md`:

**Prioritized Implementation Plan:**

### Phase 1: Critical (P0) - [X] person-weeks
1. F0XX - [Feature Name] ([Effort])
2. F0XX - [Feature Name] ([Effort])

### Phase 2: High Priority (P1) - [X] person-weeks
1. F0XX - [Feature Name] ([Effort])
2. F0XX - [Feature Name] ([Effort])

### Phase 3: Medium Priority (P2) - [X] person-weeks
[...]

### Phase 4: Low Priority (P3) - [X] person-weeks
[...]

---

## Phase 2: Implementation Approach

We'll use this systematic approach for each feature:

### For Each Feature:

1. **Review Specification**
   - Read feature spec in `specs/features/F0XX-[name].md`
   - Understand acceptance criteria
   - Note dependencies
   - Check technical details

2. **Plan Implementation**
   - Break feature into tasks
   - Identify which files to create/modify
   - Determine order of implementation
   - Consider edge cases

3. **Implement**
   - Backend first (if needed)
   - Frontend second (if needed)
   - Follow specification exactly
   - Match existing code style
   - Add comments for complex logic

4. **Test**
   - Write unit tests
   - Write integration tests (if needed)
   - Manual testing of user workflows
   - Verify acceptance criteria

5. **Update Specification**
   - Mark items as ✅ completed in feature spec
   - Update `specs/implementation-status.md`
   - Remove `[ ]` unchecked items as they're done

6. **Commit**
   - Commit with clear message referencing feature ID
   - Push to feature branch or main (your preference)

---

## Phase 3: Implementation Workflow

Let's start with the first P0 feature.

### Current Feature: F0XX - [Feature Name]

**Specification:** `specs/features/F0XX-[name].md`

**Status:**
- Backend: [✅ Complete | ⚠️ Partial | ❌ Missing]
- Frontend: [✅ Complete | ⚠️ Partial | ❌ Missing]

**What Needs to Be Done:**
[List from specification]

**Let me implement this feature step by step:**

1. [First task]
2. [Second task]
3. [Third task]

[I'll now implement the feature following the specification]

---

## Phase 4: Progress Tracking

After each feature implementation, I'll update:

### Implementation Checklist

**Phase 1: Critical (P0)**
- [ ] F001 - [Feature Name]
- [ ] F002 - [Feature Name]

**Phase 2: High Priority (P1)**
- [ ] F00X - [Feature Name]
- [ ] F00X - [Feature Name]

**Phase 3: Medium Priority (P2)**
- [ ] F0XX - [Feature Name]

**Phase 4: Low Priority (P3)**
- [ ] F0XX - [Feature Name]

---

## Phase 5: Validation

After implementing each feature:

### Validation Checklist

- [ ] **Acceptance Criteria Met**
  - All criteria from spec verified
  - User workflow tested manually
  - Edge cases handled

- [ ] **Tests Written**
  - Unit tests for new functions/components
  - Integration tests for new API endpoints
  - E2E tests for critical workflows

- [ ] **Code Quality**
  - Follows existing code style
  - No linting errors
  - TypeScript types correct
  - Comments for complex logic

- [ ] **Documentation Updated**
  - Feature spec marked complete
  - Implementation status updated
  - README updated if needed

- [ ] **Specification Match**
  - Implementation exactly matches spec
  - No deviations or shortcuts
  - All business rules implemented

---

## Phase 6: Completion Criteria

The application is complete when:

1. **All P0 Features**: ✅ Implemented and tested
2. **All P1 Features**: ✅ Implemented and tested
3. **Test Coverage**: Meets target (e.g., >70%)
4. **Documentation**: All specs marked ✅ COMPLETE
5. **Quality Gates**: All tests passing, no critical issues
6. **User Acceptance**: Key user workflows work end-to-end

---

## Interactive Implementation

As we implement, I'll:

1. **Show you what I'm building** before implementing
2. **Ask for confirmation** on design decisions not in spec
3. **Request feedback** on implementations
4. **Highlight trade-offs** when they arise
5. **Keep you updated** on progress

---

## Let's Begin Implementation

I'm ready to start implementing features from the specification.

**First Feature to Implement:**
F0XX - [Feature Name from Gap Analysis]

**Shall I proceed with implementing this feature?**

Or would you prefer to:
- [ ] Start with a different feature
- [ ] Review the spec once more
- [ ] Make changes to the spec first
- [ ] Proceed with this feature

Let me know and I'll start building!

---

## After Each Feature

After completing each feature, I'll:

1. ✅ Mark feature as complete in spec
2. 📝 Commit with clear message
3. 📊 Update implementation status
4. ➡️ Move to next feature

And we'll continue until all features are ✅ complete.

---

## Tips for Smooth Implementation

**Do:**
- ✅ Review each feature spec before I implement
- ✅ Test features as they're completed
- ✅ Provide feedback if something doesn't look right
- ✅ Take breaks between phases
- ✅ Celebrate completed milestones!

**Don't:**
- ❌ Rush through testing
- ❌ Skip spec updates
- ❌ Change spec mid-implementation (finish feature first)
- ❌ Accumulate tech debt (do it right the first time)

---

## Progress Reporting

After each session, I'll provide a progress report:

```markdown
## Implementation Progress Report

**Date:** [Current Date]
**Session Duration:** [X hours]

### Completed This Session
- ✅ F0XX - [Feature Name] (Backend + Frontend + Tests)
- ✅ F0XX - [Feature Name] (Frontend Only)

### In Progress
- ⚙️ F0XX - [Feature Name] (Backend done, Frontend 50%)

### Next Up
- 📋 F0XX - [Feature Name]
- 📋 F0XX - [Feature Name]

### Overall Progress
- Features: [X]/[Total] complete ([X]%)
- Backend: [X]% complete
- Frontend: [X]% complete
- Tests: [X]% coverage

### Estimated Remaining
- [X] person-days to complete all P0/P1
- [X] person-weeks to 100% completion
```

---

## Final Deliverables

When implementation is complete:

1. **Fully Functional Application**
   - All features working as specified
   - No placeholder pages
   - Complete user workflows

2. **Complete Test Coverage**
   - Unit tests for all business logic
   - Integration tests for APIs
   - E2E tests for critical workflows
   - Coverage target met

3. **Updated Documentation**
   - All feature specs marked ✅ COMPLETE
   - Implementation status: 100%
   - README reflects current state
   - API docs generated from OpenAPI spec

4. **Production Ready**
   - All quality gates passing
   - No critical technical debt
   - Deployment documentation updated
   - Ready to launch

---

## Success Criteria

Implementation phase is complete when:
- [x] All P0 features ✅ implemented
- [x] All P1 features ✅ implemented
- [x] Test coverage at target %
- [x] All specs updated
- [x] No placeholder code
- [x] Quality gates passing
- [x] User workflows validated
- [x] Ready for production

---

## Let's Ship This! 🚀

Ready to build from the complete specification?

**Reply with:** "Start implementation" and I'll begin with the first feature!
```

---

## What Happens During Implementation

1. **Feature-by-feature approach**: One complete feature at a time
2. **Incremental commits**: Each feature gets committed when done
3. **Continuous validation**: Tests run, specs updated as we go
4. **Progress visibility**: You see exactly what's done and what's left
5. **Quality focus**: No shortcuts, do it right the first time

---

## Timeline Expectations

Depending on gaps identified:

- **Small gaps** (few partial features): 1-3 days
- **Medium gaps** (missing UI for backend): 1-2 weeks
- **Large gaps** (many missing features): 2-6 weeks

The systematic approach ensures steady progress and high quality.

---

## 🎉 Completion

When all features are implemented:

**You'll have:**
- ✅ 100% complete application
- ✅ Full specification documentation
- ✅ Test coverage at target
- ✅ Production-ready codebase
- ✅ Specification-driven development established

**Going forward:**
- All new features start with specs
- No more ad-hoc development
- Clear roadmap for future enhancements
- Maintainable, documented codebase

---

**Ready to transform your partial application into a complete, spec-driven system? Let's build! 🚀**
