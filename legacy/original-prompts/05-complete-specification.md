# Step 5: Complete Specification

**Estimated Time:** 30-60 minutes (INTERACTIVE)
**Output:** Complete, unambiguous specifications with all clarifications resolved

---

## ⚠️ Important: This Step is Interactive

Unlike previous steps, this is a **conversation** where Claude asks you questions and you provide answers. Set aside time for a focused session.

---

## 📋 Copy and Paste This Prompt

```
Now that we have identified all gaps in Step 4, let's have an interactive session to complete the specification.

I will ask you clarifying questions about missing features, ambiguous requirements, and implementation details. Your answers will help me create a complete, unambiguous specification that we can implement from.

---

## Process

### 1. Review Gap Analysis

First, let's review what we found in `specs/gap-analysis.md`:

**Summary:**
- Total gaps: [X]
- Missing features: [X]
- Partial features: [X]
- Clarifications needed: [X]

I'll now ask you questions to clarify each gap.

---

## 2. Clarification Questions

I'll ask about each item marked `[NEEDS CLARIFICATION]` across all specs.

For each question, please provide:
- **Decision:** Your choice or answer
- **Rationale:** Why this approach (optional but helpful)
- **Constraints:** Any limitations I should know
- **Priority:** Does this affect the priority level?

---

### Missing Features

For each missing feature (❌ NOT IMPLEMENTED), I'll ask:

#### F0XX: [Feature Name]

**Context:** [What this feature is supposed to do]

**Questions:**
1. **Should we implement this feature?**
   - Yes, it's critical (P0)
   - Yes, it's important (P1)
   - Yes, it's nice to have (P2)
   - No, deprioritize or skip (P3)
   - No, remove from spec entirely

2. **If yes, what does the user experience look like?**
   - How do users access this feature?
   - What's the main workflow?
   - What screens/pages are needed?

3. **What are the key business rules?**
   - Any validation rules?
   - Authorization requirements?
   - Edge cases to handle?

4. **Any dependencies or prerequisites?**
   - Must other features be done first?
   - External services required?

---

[I'll repeat this for each missing feature]

---

### Partial Features (Missing Frontend)

For features where backend exists but UI is missing:

#### F0XX: [Feature Name]

**Context:** [What exists: API endpoints, data models, etc.]

**Questions:**
1. **UI Components needed:**
   - What page should this live on?
   - What form fields/inputs are needed?
   - What actions can users take?

2. **User Experience:**
   - Is this a modal, a page, or embedded in another page?
   - What happens after user submits/saves?
   - Success message? Error handling?

3. **Design Preferences:**
   - Should photo upload be drag-drop or click-to-browse?
   - Should species be free-text or dropdown with autocomplete?
   - Should location be GPS auto-detect or manual entry?
   - Mobile-first or desktop-first?

4. **Validation & Feedback:**
   - Real-time validation or on-submit?
   - What error messages to show?
   - Loading states during async operations?

---

[I'll repeat this for each partial feature]

---

### Technical Decisions

**Questions about architecture and implementation:**

1. **State Management:**
   - Current approach: [e.g., React Query + Zustand]
   - Should new features follow same pattern?
   - Any new state management needs?

2. **Styling Approach:**
   - Current approach: [e.g., Tailwind CSS + Radix UI]
   - Should new components follow same pattern?
   - Any new design system components needed?

3. **Testing Requirements:**
   - Current coverage: [X]%
   - Target coverage: [Y]%
   - Required test types: Unit? Integration? E2E?

4. **Performance Requirements:**
   - Any specific performance targets?
   - Page load time expectations?
   - API response time requirements?

5. **Accessibility Requirements:**
   - Target WCAG level: AA or AAA?
   - Screen reader support required?
   - Keyboard navigation priority?

6. **Browser/Device Support:**
   - Modern browsers only?
   - Mobile devices (iOS/Android)?
   - Tablet support?
   - PWA features required?

---

## 3. Priority Refinement

Based on your answers, let's refine priorities:

**Current Priority Breakdown:**
- P0 (Critical): [X] features
- P1 (High): [X] features
- P2 (Medium): [X] features
- P3 (Low): [X] features

**Questions:**
1. Do these priorities still make sense?
2. Should any features be promoted/demoted?
3. What's the minimum viable product (MVP)?
4. What can wait for v2.0?

---

## 4. Implementation Sequence

**Questions:**
1. Should we implement in priority order (P0 → P1 → P2)?
2. Or should we complete one feature area at a time?
3. Any features that should be done together?
4. Any features that can be done in parallel?

---

## 5. Success Criteria

**Questions:**
1. How will we know when the application is "complete"?
2. What must be done before launch?
3. What's acceptable for post-launch?
4. Any specific user acceptance criteria?

---

## Interactive Session Begins

I'm ready to start asking questions. I'll go through:
1. All `[NEEDS CLARIFICATION]` items from feature specs
2. Missing features (should we build them?)
3. Partial features (how should UI work?)
4. Technical decisions
5. Priority refinement
6. Implementation sequence

**Please respond to each question** and I'll update the specifications accordingly.

Let's start with the first set of questions:

[I'll now ask the first batch of clarifying questions based on the gap analysis]
```

---

## What to Expect

During this interactive session:

1. **Claude will ask ~10-30 questions** depending on gaps
2. **Answer thoughtfully** - these answers become the spec
3. **Be specific** - vague answers = vague specs
4. **Ask for clarification** if a question is unclear
5. **Take breaks** if needed - save progress and continue later

---

## After the Session

Once all questions are answered, Claude will:

1. **Update all feature specs** with your answers
2. **Remove all `[NEEDS CLARIFICATION]` markers**
3. **Update priorities** based on your input
4. **Refine implementation plan** with correct sequencing
5. **Update effort estimates** with new information
6. **Create final implementation roadmap**
7. **Commit updated specifications**

---

## Success Criteria

After this session:
- [x] All `[NEEDS CLARIFICATION]` markers resolved
- [x] Complete UX/UI details for all features
- [x] Business rules clearly defined
- [x] Priorities finalized
- [x] Implementation sequence determined
- [x] Specifications updated and committed
- [x] Ready for Step 6 (implementation)

---

## Tips for a Successful Session

**Do:**
- ✅ Set aside focused time (30-60 minutes)
- ✅ Have design mockups/wireframes ready (if any)
- ✅ Think about user workflows beforehand
- ✅ Be specific in your answers
- ✅ Ask Claude to clarify questions if needed

**Don't:**
- ❌ Rush through questions
- ❌ Give vague answers like "whatever works"
- ❌ Skip questions (mark as "decide later" if unsure)
- ❌ Change answers later without updating spec

---

## Example Question/Answer

**Claude's Question:**
> For the photo upload feature, should users be able to:
> A) Drag and drop photos
> B) Click to browse and select
> C) Both drag-drop and click
> D) Mobile: Camera + gallery, Desktop: Drag-drop + browse

**Good Answer:**
> D - Mobile: Camera + gallery, Desktop: Drag-drop + browse
>
> Rationale: On mobile, quick camera access is critical for field use. On desktop, drag-drop is most convenient. Both should support gallery/browse as fallback.
>
> Additional details:
> - Max 10 photos per catch
> - Show upload progress
> - Allow removing photos before save
> - Compress images before upload

**Poor Answer:**
> Drag and drop I guess

---

## 🔄 Next Step

Once all clarifications are resolved and specifications are complete, proceed to:

**Step 6: Implement from Spec** (`06-implement-from-spec.md`)
