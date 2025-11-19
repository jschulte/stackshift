---
name: implement
description: Use GitHub Spec Kit's /speckit.implement and /speckit.tasks to systematically build missing features from specifications. Leverages implementation plans in specs/, validates against acceptance criteria, and achieves 100% spec completion. This is Step 6 of 6 in the reverse engineering process.
---

# Implement from Spec (with GitHub Spec Kit)

**Step 6 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** Hours to days (depends on gaps)
**Prerequisites:** Step 5 completed (all specs finalized, no `[NEEDS CLARIFICATION]` markers)
**Output:** Fully implemented application with all specs marked ✅ COMPLETE

---

## When to Use This Skill

Use this skill when:
- You've completed Step 5 (Complete Specification)
- All specifications in `specs/` are finalized
- Implementation plans exist in `specs/`
- Ready to use `/speckit.implement` to build features

**Trigger Phrases:**
- "Implement missing features"
- "Use speckit to implement"
- "Build from specifications"
- "Run speckit implement"

---

## What This Skill Does

Uses **GitHub Spec Kit's implementation workflow** to systematically build features:

1. **Use /speckit.tasks** - Generate actionable task lists from implementation plans
2. **Use /speckit.implement** - Execute tasks step-by-step for each feature
3. **Validate with /speckit.analyze** - Verify implementation matches specs
4. **Update Specs Automatically** - Spec Kit marks features ✅ COMPLETE as you implement
5. **Track Progress** - Monitor completion via `.specify/memory/` status markers
6. **Achieve 100% Completion** - All specs implemented and validated

**Key Benefit:** Spec Kit's `/speckit.implement` command guides you through implementation plans, updates specs automatically, and validates work against acceptance criteria.

---

## ⚠️ Two Contexts: Handoff vs Standard Implementation

**This skill works differently based on context:**

### Context A: Handoff (After Reverse Engineering)
**When:** Just completed Gears 1-5, on main branch, gaps identified
**What happens:** Handoff procedure (celebrate, explain transition, offer feature branch setup)
**See:** [operations/handoff.md](operations/handoff.md)

### Context B: Standard Implementation (Ongoing)
**When:** On feature branch (002-*, 003-*), working on specific feature
**What happens:** Standard GitHub Spec Kit implementation workflow
**See:** Process Overview below

**The handoff only happens ONCE** (after initial reverse engineering). After that, you always use standard /speckit.* workflow on feature branches.

---

## GitHub Spec Kit Implementation Workflow

The standard Spec Kit workflow is:

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement → /speckit.analyze
```

**For reverse engineering, we've already done the first two steps:**
- ✅ `/speckit.specify` - Done in Step 3 (created specifications)
- ✅ `/speckit.plan` - Done in Step 3 (created implementation plans)

**Now we use the remaining commands:**
- `/speckit.tasks` - Generate task lists
- `/speckit.implement` - Build features
- `/speckit.analyze` - Validate

---

## Process Overview

### Step 1: Review Implementation Roadmap

From `docs/gap-analysis-report.md`, review the phased plan:

**Phase 1: P0 Critical** (~12 hours)
- Essential features
- Security fixes
- Blocking issues

**Phase 2: P1 High Value** (~20 hours)
- Important features
- High user impact
- Key improvements

**Phase 3: P2/P3** (~TBD)
- Nice-to-have
- Future enhancements

**Confirm with user:**
- Start with Phase 1 (P0 items)?
- Any blockers to address first?
- Time constraints?

### Step 2: For Each Feature - Generate Tasks

Use `/speckit.tasks` to generate actionable tasks from implementation plan:

```bash
# Example: Implement user authentication frontend
> /speckit.tasks user-authentication-frontend
```

**What this does:**
- Reads `specs/user-authentication-frontend.md`
- Breaks down plan into specific, actionable tasks
- Creates task checklist

**Output example:**
```markdown
# Tasks: User Authentication Frontend

Based on implementation plan in `specs/user-authentication-frontend.md`

## Tasks
- [ ] Create LoginPage component (app/login/page.tsx)
- [ ] Create RegistrationPage component (app/register/page.tsx)
- [ ] Create PasswordResetPage component (app/reset-password/page.tsx)
- [ ] Add Zod validation schemas (lib/validation/auth.ts)
- [ ] Create useAuth hook (hooks/useAuth.ts)
- [ ] Implement API integration (lib/api/auth.ts)
- [ ] Add loading states to all forms
- [ ] Add error handling and display
- [ ] Write component tests (LoginPage.test.tsx, etc.)
- [ ] Update routing configuration (app/layout.tsx)

## Dependencies
- Backend API endpoints must be functional
- UI component library installed

## Acceptance Criteria (from specification)
- [ ] User can register with email and password
- [ ] User can log in with credentials
- [ ] User can reset forgotten password
- [ ] JWT tokens stored securely
- [ ] Forms validate input before submission
- [ ] Loading states shown during API calls
- [ ] Error messages displayed clearly
```

See [operations/generate-tasks.md](operations/generate-tasks.md)

### Step 3: Implement Feature with /speckit.implement

Use `/speckit.implement` to execute the implementation plan:

```bash
# Implement the feature step-by-step
> /speckit.implement user-authentication-frontend
```

**What this does:**
1. Loads tasks from `/speckit.tasks` output
2. Walks through each task systematically
3. Generates code for each task
4. Tests implementation against acceptance criteria
5. Updates specification status markers
6. Commits changes with descriptive messages

**Interactive flow:**
```
> /speckit.implement user-authentication-frontend

Starting implementation of: User Authentication Frontend
Plan: specs/user-authentication-frontend.md

Task 1/10: Create LoginPage component

I'll create app/login/page.tsx with:
- Email/password form
- Form validation
- Submit handler
- Link to registration and password reset

[Code generated]

✅ Task 1 complete

Task 2/10: Create RegistrationPage component
[...]

All tasks complete! Running validation...

✅ All acceptance criteria met
✅ Tests passing (8/8)
✅ No TypeScript errors

Updating specification status...
user-authentication.md: ⚠️ PARTIAL → ✅ COMPLETE

Implementation complete!
```

See [operations/use-speckit-implement.md](operations/use-speckit-implement.md)

### Step 4: Validate Implementation

After implementing, use `/speckit.analyze` to verify:

```bash
> /speckit.analyze
```

**What it checks:**
- Implementation matches specification
- All acceptance criteria met
- No inconsistencies with related specs
- Status markers accurate

**If issues found:**
```
⚠️ Issues detected:

1. user-authentication.md marked COMPLETE
   - Missing: Token refresh mechanism
   - Action: Add token refresh or update spec

2. Inconsistency with user-profile.md
   - user-profile depends on authentication
   - user-profile marked PARTIAL
   - Recommendation: Complete user-profile next
```

Fix any issues and re-run `/speckit.analyze` until clean.

### Step 5: Update Progress and Continue

After each feature:

1. **Check progress:**
   ```bash
   > /speckit.analyze
   # Shows: X/Y features complete
   ```

2. **Update gap report:**
   - Mark feature as ✅ COMPLETE
   - Update overall completion percentage
   - Move to next priority feature

3. **Commit changes:**
   ```bash
   git commit -m "feat: implement user authentication frontend (user-authentication.md)"
   ```

4. **Select next feature:**
   - Follow prioritized roadmap
   - Choose next P0 item, or move to P1 if P0 complete

### Step 6: Iterate Until 100% Complete

Repeat Steps 2-5 for each feature in the roadmap:

```bash
# Phase 1: P0 Critical
> /speckit.tasks fish-management-ui
> /speckit.implement fish-management-ui
> /speckit.analyze

> /speckit.tasks photo-upload-api
> /speckit.implement photo-upload-api
> /speckit.analyze

# Phase 2: P1 High Value
> /speckit.tasks analytics-dashboard
> /speckit.implement analytics-dashboard
> /speckit.analyze

# Continue until all features complete...
```

**Track progress:**
- Phase 1: 3/3 complete (100%) ✅
- Phase 2: 2/4 complete (50%) 🔄
- Phase 3: 0/5 complete (0%) ⏳

---

## Example: Complete Implementation Flow

```bash
# 1. Review roadmap
User: "Let's implement the missing features"
Claude: Reviews docs/gap-analysis-report.md
Claude: "I see 3 P0 items. Let's start with fish-management-ui?"
User: "Yes, let's do it"

# 2. Generate tasks
> /speckit.tasks fish-management-ui
Output: 12 tasks identified

# 3. Implement
> /speckit.implement fish-management-ui

Starting implementation...

Task 1/12: Create FishEditPage component
[Code generated for app/fish/[id]/edit/page.tsx]
✅ Task 1 complete

Task 2/12: Add photo upload UI
[Code generated for components/PhotoUpload.tsx]
✅ Task 2 complete

[... continues through all 12 tasks ...]

Implementation complete!
✅ All acceptance criteria met
✅ Tests passing (15/15)

# 4. Validate
> /speckit.analyze
✅ No issues found
fish-management.md: ⚠️ PARTIAL → ✅ COMPLETE

# 5. Commit
git commit -m "feat: complete fish management UI (fish-management.md)"

# 6. Next feature
Claude: "Phase 1 progress: 1/3 complete. Next: photo-upload-api?"
User: "Yes"

# Repeat...
```

---

## Integration with Reverse Engineering Process

**Your reverse-engineered codebase is now:**
1. ✅ Fully documented (Step 2)
2. ✅ Formal specs created (Step 3)
3. ✅ Gaps identified (Step 4)
4. ✅ Clarifications resolved (Step 5)
5. 🔄 **Being implemented systematically (Step 6)**

**Spec Kit ensures:**
- Implementation matches specs exactly
- Specs stay up-to-date with code
- No drift between docs and reality
- Continuous validation

**After completion:**
- Use `/speckit.specify` for new features
- Use `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` for development
- Use `/speckit.analyze` to maintain consistency
- Your codebase is now fully spec-driven!

---

## Success Criteria

After running this skill (implementing all features), you should have:

- ✅ All P0 features implemented (Phase 1 complete)
- ✅ All P1 features implemented (Phase 2 complete)
- ✅ P2/P3 features implemented or intentionally deferred
- ✅ All specifications marked ✅ COMPLETE
- ✅ `/speckit.analyze` shows no issues
- ✅ All tests passing
- ✅ Application at 100% completion
- ✅ Ready for production deployment

**Ongoing spec-driven development established:**
- New features start with `/speckit.specify`
- Implementation uses `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
- Continuous validation with `/speckit.analyze`

---

## Best Practices

### During Implementation

1. **One feature at a time** - Don't start multiple features in parallel
2. **Follow the roadmap** - Respect P0 → P1 → P2 priority order
3. **Use `/speckit.implement`** - Don't implement manually, let Spec Kit guide you
4. **Validate frequently** - Run `/speckit.analyze` after each feature
5. **Commit often** - Commit after each feature completion
6. **Update specs** - If you discover new requirements, update specs first

### Quality Standards

For each implementation:
- ✅ Meets all acceptance criteria
- ✅ Tests added and passing
- ✅ TypeScript types correct (if applicable)
- ✅ Error handling implemented
- ✅ Loading states for async operations
- ✅ Responsive design (if UI)
- ✅ Accessibility standards met

### When Issues Arise

If `/speckit.analyze` finds problems:
1. Fix the implementation to match spec, OR
2. Update the spec if requirements changed
3. Never leave specs and code out of sync

---

## Continuous Spec-Driven Development

After completing the reverse engineering process:

### For New Features
```bash
# 1. Create specification
> /speckit.specify

# 2. Create implementation plan
> /speckit.plan

# 3. Generate tasks
> /speckit.tasks

# 4. Implement
> /speckit.implement

# 5. Validate
> /speckit.analyze
```

### For Refactoring
```bash
# 1. Update affected specifications
> /speckit.specify

# 2. Update implementation plan
> /speckit.plan

# 3. Implement changes
> /speckit.implement

# 4. Validate no regression
> /speckit.analyze
```

### For Bug Fixes
```bash
# 1. Update spec if bug reveals requirement gap
> /speckit.specify

# 2. Fix implementation
[manual fix or /speckit.implement]

# 3. Validate
> /speckit.analyze
```

---

## Technical Notes

- Spec Kit's `/speckit.implement` generates code - review before committing
- Implementation plans should be detailed for best results
- `/speckit.tasks` output can be refined if tasks are too broad
- Use `/speckit.clarify` if you discover ambiguities during implementation
- Keep `.specify/memory/` in version control
- `specs/` is the source of truth

---

## Final Outcome

**You've transformed:**
- Partially-complete codebase with no specs
- → Fully spec-driven development workflow
- → 100% implementation aligned with specifications
- → Continuous validation with `/speckit.analyze`
- → Sustainable spec-first development process

**Your application is now:**
- ✅ Fully documented
- ✅ Completely specified
- ✅ 100% implemented
- ✅ Continuously validated
- ✅ Ready for ongoing spec-driven development

---

## Final Step: Generate Spec Coverage Map

Now let's create a visual coverage map showing the relationship between your specifications and code:

```bash
# Generate coverage map
```

I'll analyze all specs in `.specify/memory/specifications/` or `specs/` and create:

1. **ASCII box diagrams** - Visual map of each spec's files
2. **Reverse index** - Which spec(s) cover each file
3. **Coverage statistics** - Percentages by category
4. **Heat map** - Visual coverage representation
5. **Gap analysis** - Files not covered by specs
6. **Shared files** - High-risk files used by multiple specs

**Output:** `docs/spec-coverage-map.md`

This provides crucial visibility into spec-code alignment and helps identify any gaps!

---

## Spec Coverage Health Report

After generating the coverage map, I'll show you a summary:

```
📊 Spec Coverage Health Report

Overall Coverage: 91% (99/109 files)

By Category:
  Backend:       93% [████████████████░░]
  Frontend:      92% [████████████████░░]
  Infrastructure: 83% [███████████████░░░]
  Database:      100% [████████████████████]
  Scripts:       67% [█████████░░░░░░░░░]

Status:
  ✅ 12 specs covering 99 files
  ⚠️  10 gap files identified (need review)
  🔴 2 high-risk shared files (used by 4+ specs)

Full report: docs/spec-coverage-map.md
```

---

**Congratulations!** You've completed the 6-step Reverse Engineering to Spec-Driven Development process. Your codebase is now enterprise-grade, fully specified, and ready for sustainable development using GitHub Spec Kit or continue using StackShift to help develop new functionality. 🎉

---

**Remember:** Maintain the spec-driven workflow going forward:
1. Requirements change → Update specs first (`/speckit.specify`)
2. Plan implementation (`/speckit.plan`)
3. Generate tasks (`/speckit.tasks`)
4. Implement (`/speckit.implement`)
5. Validate (`/speckit.analyze`)

This ensures specs and code never drift apart.
