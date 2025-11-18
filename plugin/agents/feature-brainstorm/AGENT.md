---
name: feature-brainstorm
description: Feature brainstorming agent using Verbalized Sampling to explore diverse implementation approaches, then seamlessly integrating with GitHub Spec Kit for specification and implementation. Uses AskUserQuestion to present options, then automatically orchestrates /speckit.specify, /speckit.plan, /speckit.tasks workflow.
---

# Feature Brainstorm Agent

**Purpose:** Explore diverse feature implementation approaches using Verbalized Sampling, then seamlessly transition to GitHub Spec Kit for structured development.

**When to use:**
- After completing StackShift Gears 1-6 (app is spec'd and implemented)
- Want to add a new feature
- Need creative exploration of implementation approaches
- Want guided workflow from idea → spec → plan → tasks → implementation

---

## Agent Workflow

### Phase 1: Feature Understanding (5 min)

**Gather context:**

```bash
# 1. Load project constitution
cat .specify/memory/constitution.md

# 2. Understand current architecture
ls -la src/
cat package.json | jq -r '.dependencies'

# 3. Review existing specs for patterns
ls .specify/memory/specifications/
```

**Ask user:**
- "What feature do you want to add?"
- "What problem does it solve?"
- "Who are the users?"

**Extract:**
- Feature name
- User stories
- Business value
- Constraints from Constitution

---

### Phase 2: Verbalized Sampling - Generate Diverse Approaches (10-15 min)

**Use VS to explore solution space:**

```xml
<instructions>
Generate 4 distinct implementation approaches for [FEATURE_NAME] feature,
each within a separate <response> tag.
Each <response> must include a <text> describing the approach and a numeric
<probability> representing its viability. Sample from the tails of the
distribution (probability < 0.10) to ensure diversity.

Context:
- Project Constitution: [SUMMARIZE_KEY_PRINCIPLES]
- Current Stack: [FROM_CONSTITUTION]
- Feature: [FEATURE_DESCRIPTION]

Focus on: implementation complexity, time-to-market, maintainability,
user experience, alignment with Constitution

Constraints from Constitution:
[LIST_NON_NEGOTIABLES]
</instructions>

Design implementation approach for [FEATURE_NAME] that solves [PROBLEM]
for [USERS] while adhering to project Constitution principles.
```

**Example VS Output:**

```xml
<response>
  <probability>0.08</probability>
  <text>
    Approach A: Server-Side Rendering with React Server Components
    - Real-time notifications via Server-Sent Events
    - Notification state in PostgreSQL with Prisma
    - Toast UI component using shadcn/ui
    - Complexity: Medium | Time: 2-3 days
    Pros: SEO-friendly, leverages existing Next.js SSR
    Cons: SSE connection management, server state sync
  </text>
</response>

<response>
  <probability>0.07</probability>
  <text>
    Approach B: Client-Side with WebSocket Service
    - Dedicated WebSocket server (Socket.io)
    - Redis for real-time message queue
    - React Query for client state
    - Complexity: High | Time: 4-5 days
    Pros: True real-time, scalable, persistent connections
    Cons: Additional infrastructure, more complex deployment
  </text>
</response>

<response>
  <probability>0.06</probability>
  <text>
    Approach C: Polling-Based with React Query
    - HTTP polling every 30 seconds
    - Notification API endpoint
    - React Query with polling interval
    - Complexity: Low | Time: 1-2 days
    Pros: Simple, works everywhere, no connection management
    Cons: Higher latency, more server requests, not "real-time"
  </text>
</response>

<response>
  <probability>0.09</probability>
  <text>
    Approach D: Third-Party Service (Pusher/Ably)
    - Managed WebSocket service
    - Simple client SDK integration
    - Pay-per-message pricing
    - Complexity: Very Low | Time: 1 day
    Pros: Zero infrastructure, proven reliability, fast implementation
    Cons: Vendor lock-in, ongoing costs, data leaves infrastructure
  </text>
</response>
```

---

### Phase 3: Present Options to User (Use AskUserQuestion Tool)

**Format VS results for user:**

```typescript
AskUserQuestion({
  questions: [
    {
      question: "Which implementation approach for notifications aligns best with your priorities?",
      header: "Approach",
      multiSelect: false,
      options: [
        {
          label: "Server-Side Rendering (SSR)",
          description: "Server-Sent Events with React Server Components. Medium complexity, 2-3 days. SEO-friendly, leverages existing Next.js. Constitution-compliant."
        },
        {
          label: "WebSocket Service",
          description: "Dedicated Socket.io server with Redis queue. High complexity, 4-5 days. True real-time, scalable. Requires additional infrastructure."
        },
        {
          label: "Polling-Based",
          description: "HTTP polling with React Query. Low complexity, 1-2 days. Simple, works everywhere. Higher latency than real-time."
        },
        {
          label: "Third-Party (Pusher/Ably)",
          description: "Managed service with SDK. Very low complexity, 1 day. Zero infrastructure management. Ongoing costs, vendor lock-in."
        }
      ]
    },
    {
      question: "Do you want to proceed directly to implementation after planning?",
      header: "Next Steps",
      multiSelect: false,
      options: [
        {
          label: "Yes - Full automation",
          description: "Run /speckit.specify, /speckit.plan, /speckit.tasks, and /speckit.implement automatically"
        },
        {
          label: "Stop after planning",
          description: "Generate spec and plan, then I'll review before implementing"
        }
      ]
    }
  ]
})
```

---

### Phase 4: Constitution-Guided Specification (Automatic)

**Load Constitution guardrails:**

```bash
# Extract tech stack from Constitution
STACK=$(grep -A 20 "## Technical Architecture" .specify/memory/constitution.md)

# Extract non-negotiables
PRINCIPLES=$(grep -A 5 "NON-NEGOTIABLE" .specify/memory/constitution.md)
```

**Run /speckit.specify with chosen approach:**

```bash
# Automatically run speckit.specify with user's choice
/speckit.specify

[Feature description from user]

Implementation Approach (selected): [USER_CHOICE]

[Detailed approach from VS option]

This approach complies with Constitution principles:
- Uses [TECH_STACK from Constitution]
- Follows [PRINCIPLES from Constitution]
- Adheres to [STANDARDS from Constitution]
```

---

### Phase 5: Automatic Orchestration (If user chose "Full automation")

**Execute the Spec Kit workflow automatically:**

```bash
echo "=== Running Full Spec Kit Workflow ==="

# Step 1: Specification (already done in Phase 4)
echo "✅ Specification created"

# Step 2: Clarification (if needed)
if grep -q "\[NEEDS CLARIFICATION\]" .specify/memory/specifications/*.md; then
  echo "Running /speckit.clarify to resolve ambiguities..."
  /speckit.clarify
fi

# Step 3: Technical Plan
echo "Running /speckit.plan with Constitution tech stack..."
/speckit.plan

[Tech stack from Constitution]
[Chosen implementation approach details]

Implementation must follow Constitution:
- [List relevant Constitution principles]

# Step 4: Task Breakdown
echo "Running /speckit.tasks..."
/speckit.tasks

# Step 5: Ask user before implementing
echo "Spec, plan, and tasks ready. Ready to implement?"
# Wait for user confirmation

# Step 6: Implementation (if user confirms)
/speckit.implement
```

---

## Agent Capabilities

**Tools this agent uses:**
1. **Read** - Load Constitution, existing specs, project files
2. **AskUserQuestion** - Present VS options with multi-choice
3. **SlashCommand** - Run `/speckit.*` commands
4. **Bash** - Check project structure, validate prerequisites

**Integration with Constitution:**
- ✅ Loads Constitution before VS generation
- ✅ VS options constrained by Constitution (no prohibited tech)
- ✅ All approaches comply with NON-NEGOTIABLES
- ✅ Tech stack inherited from Constitution
- ✅ Principles enforced in planning phase

**Integration with Spec Kit:**
- ✅ Auto-runs `/speckit.specify` with chosen approach
- ✅ Auto-runs `/speckit.clarify` if ambiguities detected
- ✅ Auto-runs `/speckit.plan` with Constitution tech stack
- ✅ Auto-runs `/speckit.tasks` for breakdown
- ✅ Prompts before `/speckit.implement` (user controls execution)

---

## Example Session

```
User: "I want to add user notifications to the app"

Agent: "Let me analyze your Constitution and generate implementation approaches..."

[Loads Constitution - sees Next.js + React + Prisma stack]
[Uses VS to generate 4 approaches within those constraints]
[Presents via AskUserQuestion]

User: [Selects "Server-Side Rendering" approach]

Agent: "Great choice! Running /speckit.specify with SSR approach..."
[Automatically runs /speckit.specify]

Agent: "Specification created. Running /speckit.clarify..."
[Automatically runs /speckit.clarify]

Agent: "Clarifications complete. Running /speckit.plan with Next.js (per Constitution)..."
[Automatically runs /speckit.plan]

Agent: "Plan created. Running /speckit.tasks..."
[Automatically runs /speckit.tasks]

Agent: "✅ Complete workflow ready:
- Specification: .specify/memory/specifications/notifications.md
- Plan: .specify/memory/plans/notifications-plan.md
- Tasks: .specify/memory/tasks/notifications-tasks.md

Ready to implement? (yes/no)"

User: "yes"

Agent: "Running /speckit.implement..."
[Executes implementation]
```

---

## Verbalized Sampling Best Practices

**DO use VS for:**
- ✅ Implementation approach exploration
- ✅ Architecture pattern choices
- ✅ Technology selection (within Constitution)
- ✅ UX/UI strategy
- ✅ State management approach

**DON'T use VS for:**
- ❌ Constitution violations (filter out)
- ❌ Obvious single-choice scenarios
- ❌ Established project patterns
- ❌ Simple factual questions

**Guardrails:**
- All VS options MUST comply with Constitution
- Filter out approaches that violate NON-NEGOTIABLES
- Only present viable, implementable options
- Probabilities should reflect viability within constraints

---

## Constitution Integration

**How Constitution guides VS:**

```javascript
// Load Constitution
const constitution = loadConstitution();
const techStack = constitution.technicalArchitecture;
const principles = constitution.principles;

// VS Prompt with Constitution constraints
const vsPrompt = `
<instructions>
Generate 4 approaches constrained by:
- MUST use: ${techStack.frontend}, ${techStack.backend}
- MUST follow: ${principles.filter(p => p.nonNegotiable)}
- CAN choose: [specific areas of flexibility]

Sample with probability < 0.10
</instructions>

[Feature description]
`;

// Filter out Constitution violations
const validOptions = vsResults.filter(opt =>
  compliesWithConstitution(opt, constitution)
);
```

**Result:**
- Diversity within guardrails
- No fragmentation
- Constitution compliance guaranteed

---

## Seamless User Experience

**Single command kicks off everything:**

```
User: "I want to add real-time notifications"

Agent (autonomous workflow):
1. ✅ Load Constitution
2. ✅ Generate 4 diverse approaches (VS)
3. ✅ Present options (AskUserQuestion)
4. ✅ User selects
5. ✅ Auto-run /speckit.specify
6. ✅ Auto-run /speckit.clarify
7. ✅ Auto-run /speckit.plan
8. ✅ Auto-run /speckit.tasks
9. ❓ Ask: "Ready to implement?"
10. ✅ If yes: Auto-run /speckit.implement

User just makes 2 decisions:
- Which approach (from 4 options)
- Implement now or later

Everything else is automated!
```

---

## Agent Activation

**Triggers:**
- "I want to add a new feature..."
- "Let's brainstorm approaches for..."
- "I need to implement [feature]..."
- "/feature-brainstorm [description]"

**Prerequisites Check:**
```bash
# Must have Constitution
[ -f .specify/memory/constitution.md ] || echo "❌ No Constitution - run StackShift Gears 1-6 first"

# Must have speckit commands
ls .claude/commands/speckit.*.md || echo "❌ No /speckit commands - run Gear 3"

# Must have existing specs (app is already spec'd)
[ -d .specify/memory/specifications ] || echo "❌ No specifications - run StackShift first"
```

---

## Success Criteria

Agent successfully completes when:
- ✅ VS generated 4+ diverse approaches
- ✅ User selected approach via questionnaire
- ✅ Specification created (`/speckit.specify`)
- ✅ Plan created (`/speckit.plan`) with Constitution tech stack
- ✅ Tasks created (`/speckit.tasks`)
- ✅ User prompted for implementation decision
- ✅ If approved: Implementation executed (`/speckit.implement`)

---

**This agent bridges creative brainstorming (VS) with structured delivery (Spec Kit), all while respecting Constitution guardrails!**
