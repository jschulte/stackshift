---
name: stackshift.batch
description: Batch process multiple widgets/repos with StackShift analysis running in parallel. Analyzes 5 repos at a time, tracks progress, and aggregates results. Perfect for analyzing entire ~/git/osiris/ directory.
---

# StackShift Batch Processing

**Analyze multiple repositories in parallel**

Run StackShift on 10, 50, or 100+ repos simultaneously with progress tracking and result aggregation.

---

## Quick Start

**Analyze all Osiris widgets:**

```bash
# From ~/git/osiris directory
cd ~/git/osiris

# Let me analyze all ws-* widgets in batches of 5
```

I'll:
1. ✅ Find all ws-* directories
2. ✅ Filter to valid repos (has package.json)
3. ✅ Process in batches of 5 (configurable)
4. ✅ Track progress in `batch-results/`
5. ✅ Aggregate results when complete

---

## What I'll Do

### Step 1: Discovery

```bash
echo "=== Discovering repositories in ~/git/osiris ==="

# Find all widget directories
find ~/git/osiris -maxdepth 1 -type d -name "ws-*" | sort > /tmp/widgets-to-analyze.txt

# Count
WIDGET_COUNT=$(wc -l < /tmp/widgets-to-analyze.txt)
echo "Found $WIDGET_COUNT widgets"

# Show first 10
head -10 /tmp/widgets-to-analyze.txt
```

### Step 2: Batch Configuration

**IMPORTANT:** I'll ask ALL configuration questions upfront, ONCE. Your answers will be saved to a batch session file and automatically applied to ALL repos in all batches. You won't need to answer these questions again during this batch run!

I'll ask you:

**Question 1: How many to process?**
- A) All widgets ($WIDGET_COUNT total)
- B) First 10 (test run)
- C) First 25 (small batch)
- D) Custom number

**Question 2: Parallel batch size?**
- A) 3 at a time (conservative)
- B) 5 at a time (recommended)
- C) 10 at a time (aggressive, may slow down)
- D) Sequential (1 at a time, safest)

**Question 3: What route?**
- A) Auto-detect (osiris for ws-*, ask for others)
- B) Force osiris for all
- C) Force greenfield for all
- D) Force brownfield for all

**Question 4: Brownfield mode?** _(If route = brownfield)_
- A) Standard - Just create specs for current state
- B) Upgrade - Create specs + upgrade all dependencies

**Question 5: Transmission?**
- A) Manual - Review each gear before proceeding
- B) Cruise Control - Shift through all gears automatically

**Question 6: Clarifications strategy?** _(If transmission = cruise control)_
- A) Defer - Mark them, continue around them
- B) Prompt - Stop and ask questions
- C) Skip - Only implement fully-specified features

**Question 7: Implementation scope?** _(If transmission = cruise control)_
- A) None - Stop after specs are ready
- B) P0 only - Critical features only
- C) P0 + P1 - Critical + high-value features
- D) All - Every feature

**Question 8: Spec output location?** _(If route = greenfield or osiris)_
- A) Current repository (default)
- B) New application repository
- C) Separate documentation repository
- D) Custom location

**Question 9: Target stack?** _(If greenfield/osiris + implementation scope != none)_
- Examples:
  - Next.js 15 + TypeScript + Prisma + PostgreSQL
  - Python/FastAPI + SQLAlchemy + PostgreSQL
  - Your choice: [specify]

**Question 10: Build location?** _(If greenfield/osiris + implementation scope != none)_
- A) Subfolder (recommended) - e.g., greenfield/, v2/
- B) Separate directory - e.g., ~/git/my-new-app
- C) Replace in place (destructive)

**Then I'll:**
1. ✅ Save all answers to `~/.claude/stackshift-batch-session.json`
2. ✅ Show batch session summary
3. ✅ Start processing batches with auto-applied configuration
4. ✅ Clear batch session when complete (or keep if you want)

### Step 3: Create Batch Session & Spawn Agents

**First: Create batch session with all answers**

```bash
# After collecting all configuration answers, create batch session
cat > ~/.claude/stackshift-batch-session.json <<EOF
{
  "sessionId": "batch-$(date +%s)",
  "startedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "totalRepos": ${TOTAL_REPOS},
  "batchSize": ${BATCH_SIZE},
  "answers": {
    "route": "${ROUTE}",
    "transmission": "${TRANSMISSION}",
    "spec_output_location": "${SPEC_OUTPUT}",
    "target_stack": "${TARGET_STACK}",
    "build_location": "${BUILD_LOCATION}",
    "clarifications_strategy": "${CLARIFICATIONS}",
    "implementation_scope": "${SCOPE}"
  },
  "processedRepos": []
}
EOF

echo "✅ Batch session created"
echo "📦 Configuration will be auto-applied to all ${TOTAL_REPOS} repos"
```

**Then: Spawn parallel agents (they'll auto-use batch session)**

```typescript
// Use Task tool to spawn parallel agents
const batch1 = [
  'ws-vehicle-details',
  'ws-hours',
  'ws-contact',
  'ws-inventory-search',
  'ws-specials'
];

// Spawn 5 agents in parallel
const agents = batch1.map(widget => ({
  task: `Analyze ${widget} widget with StackShift`,
  description: `StackShift analysis: ${widget}`,
  subagent_type: 'general-purpose',
  prompt: `
    cd ~/git/osiris/${widget}

    IMPORTANT: Batch session is active at ~/.claude/stackshift-batch-session.json
    All configuration will be auto-applied. DO NOT ask configuration questions.

    Run StackShift Gear 1: Analyze
    - Will auto-detect route (batch session: ${ROUTE})
    - Will use spec output location: ${SPEC_OUTPUT}
    - Analyze widget + ws-scripts + wsm-* modules
    - Generate analysis-report.md

    Then run Gear 2: Reverse Engineer
    - Extract business logic
    - Document all wsm-* module dependencies
    - Create comprehensive documentation

    Then run Gear 3: Create Specifications
    - Generate .specify/ structure
    - Create constitution
    - Generate feature specs

    Save all results to:
    ${SPEC_OUTPUT}/${widget}/

    When complete, create completion marker:
    ${SPEC_OUTPUT}/${widget}/.complete
  `
}));

// Launch all 5 in parallel
agents.forEach(agent => spawnAgent(agent));
```

### Step 4: Progress Tracking

```bash
# Create tracking directory
mkdir -p ~/git/stackshift-batch-results

# Monitor progress
while true; do
  COMPLETE=$(find ~/git/stackshift-batch-results -name ".complete" | wc -l)
  echo "Completed: $COMPLETE / $WIDGET_COUNT"

  # Check if batch done
  if [ $COMPLETE -ge 5 ]; then
    echo "✅ Batch 1 complete"
    break
  fi

  sleep 30
done

# Start next batch...
```

### Step 5: Result Aggregation

```bash
# After all batches complete
echo "=== Aggregating Results ==="

# Create master report
cat > ~/git/stackshift-batch-results/BATCH_SUMMARY.md <<EOF
# StackShift Batch Analysis Results

**Date:** $(date)
**Widgets Analyzed:** $WIDGET_COUNT
**Batches:** $(($WIDGET_COUNT / 5))
**Total Time:** [calculated]

## Completion Status

$(for widget in $(cat /tmp/widgets-to-analyze.txt); do
  widget_name=$(basename $widget)
  if [ -f ~/git/stackshift-batch-results/$widget_name/.complete ]; then
    echo "- ✅ $widget_name - Complete"
  else
    echo "- ❌ $widget_name - Failed or incomplete"
  fi
done)

## Results by Widget

$(for widget in $(cat /tmp/widgets-to-analyze.txt); do
  widget_name=$(basename $widget)
  if [ -f ~/git/stackshift-batch-results/$widget_name/.complete ]; then
    echo "### $widget_name"
    echo ""
    echo "**Specs created:** $(find ~/git/stackshift-batch-results/$widget_name/.specify/memory/specifications -name "*.md" 2>/dev/null | wc -l)"
    echo "**Modules analyzed:** $(cat ~/git/stackshift-batch-results/$widget_name/.stackshift-state.json 2>/dev/null | jq -r '.metadata.modulesAnalyzed // 0')"
    echo ""
  fi
done)

## Next Steps

All specifications are ready for review:
- Review specs in each widget's batch-results directory
- Merge specs to actual repos if satisfied
- Run Gears 4-6 as needed
EOF

cat ~/git/stackshift-batch-results/BATCH_SUMMARY.md
```

---

## Result Structure

```
~/git/stackshift-batch-results/
├── BATCH_SUMMARY.md                    # Master summary
├── batch-progress.json                 # Real-time tracking
│
├── ws-vehicle-details/
│   ├── .complete                       # Marker file
│   ├── .stackshift-state.json         # State
│   ├── analysis-report.md              # Gear 1 output
│   ├── docs/reverse-engineering/       # Gear 2 output
│   │   ├── functional-specification.md
│   │   ├── widget-logic.md
│   │   ├── modules/
│   │   │   ├── wsm-pricing-display.md
│   │   │   └── wsm-incentive-display.md
│   │   └── [7 more docs]
│   └── .specify/                       # Gear 3 output
│       └── memory/
│           ├── constitution.md
│           └── specifications/
│               ├── pricing-display.md
│               ├── incentive-logic.md
│               └── [more specs]
│
├── ws-hours/
│   └── [same structure]
│
└── [88 more widgets...]
```

---

## Monitoring Progress

**Real-time status:**

```bash
# I'll show you periodic updates
echo "=== Batch Progress ==="
echo "Batch 1 (5 widgets): 3/5 complete"
echo "  ✅ ws-vehicle-details - Complete (12 min)"
echo "  ✅ ws-hours - Complete (8 min)"
echo "  ✅ ws-contact - Complete (15 min)"
echo "  🔄 ws-inventory-search - Running (7 min elapsed)"
echo "  ⏳ ws-specials - Queued"
echo ""
echo "Estimated time remaining: 25 minutes"
```

---

## Error Handling

**If a widget fails:**
```bash
# Retry failed widgets
failed_widgets=(ws-inventory-search ws-specials)

for widget in "${failed_widgets[@]}"; do
  echo "Retrying: $widget"
  # Spawn new agent for retry
done
```

**Common failures:**
- Missing package.json
- Tests failing (can continue anyway)
- Module source not found (prompt for location)

---

## Use Cases

**1. Entire Osiris migration:**
```
Analyze all 90+ ws-* widgets for migration planning
↓
Result: Complete business logic extracted from entire platform
↓
Use specs to plan Next.js migration strategy
```

**2. Selective analysis:**
```
Analyze just the 10 high-priority widgets first
↓
Review results
↓
Then batch process remaining 80
```

**3. Module analysis:**
```
cd ~/git/osiris
Analyze all wsm-* modules (not widgets)
↓
Result: Shared module documentation
↓
Understand dependencies before widget migration
```

---

## Configuration Options

I'll ask you to configure:

- **Repository list:** All in folder, or custom list?
- **Batch size:** How many parallel (3/5/10)?
- **Gears to run:** 1-3 only or full 1-6?
- **Route:** Auto-detect or force specific route?
- **Output location:** Central results dir or per-repo?
- **Error handling:** Stop on failure or continue?

---

## Comparison with thoth-cli

**thoth-cli (Upgrades):**
- Orchestrates 90+ widget upgrades
- 3 phases: coverage → discovery → implementation
- Tracks in .osiris-upgrade.yml
- Parallel processing (2-5 at a time)

**StackShift Batch (Analysis):**
- Orchestrates 90+ widget analyses
- 6 gears: analyze → reverse-engineer → create-specs → gap → clarify → implement
- Tracks in .stackshift-state.json
- Parallel processing (3-10 at a time)
- Can output to central location

---

## Example Session

```
You: "I want to analyze all Osiris widgets in ~/git/osiris"

Me: "Found 92 widgets! Let me configure batch processing..."

[Asks questions via AskUserQuestion]
- Process all 92? ✅
- Batch size: 5
- Gears: 1-3 (just analyze and spec, no implementation)
- Output: Central results directory

Me: "Starting batch analysis..."

Batch 1 (5 widgets): ws-vehicle-details, ws-hours, ws-contact, ws-inventory, ws-specials
[Spawns 5 parallel agents using Task tool]

[15 minutes later]
"Batch 1 complete! Starting batch 2..."

[3 hours later]
"✅ All 92 widgets analyzed!

Results: ~/git/stackshift-batch-results/
- 92 analysis reports
- 92 sets of specifications
- 890 total specs extracted
- 347 wsm-* modules documented

Next: Review specs and begin migration planning"
```

---

## Managing Batch Sessions

### View Current Batch Session

```bash
# Check if batch session exists and view configuration
if [ -f ~/.claude/stackshift-batch-session.json ]; then
  echo "📦 Active Batch Session"
  cat ~/.claude/stackshift-batch-session.json | jq '.'
else
  echo "No active batch session"
fi
```

### Clear Batch Session

**After batch completes:**
```bash
# I'll ask you:
# "Batch processing complete! Clear batch session? (Y/n)"

# If yes:
rm ~/.claude/stackshift-batch-session.json
echo "✅ Batch session cleared"

# If no:
echo "✅ Batch session kept (will be used for next batch)"
```

**Manual clear:**
```bash
# Clear batch session anytime
rm ~/.claude/stackshift-batch-session.json
```

**Why keep batch session?**
- Run another batch with same configuration
- Process more repos later
- Continue interrupted batch

**Why clear batch session?**
- Done with current migration
- Want different configuration for next batch
- Starting fresh analysis

---

## Batch Session Benefits

**Without batch session (old way):**
```
Batch 1: Answer 10 questions ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Batch 2: Answer 10 questions AGAIN ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Batch 3: Answer 10 questions AGAIN ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Total: 30 questions answered, 6 min wasted
```

**With batch session (new way):**
```
Setup: Answer 10 questions ONCE ⏱️ 2 min
  ↓ Batch 1: Process 3 repos (15 min)
  ↓ Batch 2: Process 3 repos (15 min)
  ↓ Batch 3: Process 3 repos (15 min)

Total: 10 questions answered, 0 min wasted
Saved: 4 minutes per 9 repos processed
```

**For 90 repos in batches of 3:**
- Old way: 300 questions answered (60 min of clicking)
- New way: 10 questions answered (2 min of clicking)
- **Time saved: 58 minutes!** ⚡

---

**This batch processing system is perfect for:**
- Osiris migration (90+ widgets)
- Multi-repo monorepo analysis
- Department-wide code audits
- Portfolio modernization projects