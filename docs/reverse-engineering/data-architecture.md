# Data Architecture: StackShift

**Date:** 2025-11-16  
**Version:** 1.0.0  
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

StackShift uses file-based state management with JSON persistence. No database required. Primary data structure is the workflow state file.

---

## State File Schema

### File Location
**Path:** `.stackshift-state.json` (project root)
**Format:** JSON
**Encoding:** UTF-8
**Max Size:** 10MB

### TypeScript Type Definition

```typescript
type StepId = 'analyze' | 'reverse-engineer' | 'create-specs' |  
              'gap-analysis' | 'complete-spec' | 'implement'

type Route = 'greenfield' | 'brownfield' | null

interface State {
  version: string;              // "1.0.0"
  created: string;              // ISO timestamp
  updated: string;              // ISO timestamp
  path: Route;
  currentStep: StepId | null;
  completedSteps: StepId[];
  metadata: {
    projectName: string;
    projectPath: string;
    pathDescription?: string;
  };
  stepDetails: Record<string, any>;
  auto_mode?: boolean;
  config?: {
    route?: 'greenfield' | 'brownfield';
    mode?: 'manual' | 'cruise';
    clarifications_strategy?: 'defer' | 'prompt' | 'skip';
    implementation_scope?: 'none' | 'p0' | 'p0_p1' | 'all';
    target_stack?: string;
    greenfield_location?: string;
    pause_between_gears?: boolean;
  };
}
```

### State Lifecycle

**Creation:**
```json
{
  "version": "1.0.0",
  "created": "2025-11-16T09:23:00.000Z",
  "updated": "2025-11-16T09:23:00.000Z",
  "path": null,
  "currentStep": null,
  "completedSteps": [],
  "metadata": {
    "projectName": "my-app",
    "projectPath": "/path/to/project"
  },
  "stepDetails": {}
}
```

**After Gear 1 (Analyze):**
```json
{
  "path": "brownfield",
  "currentStep": "reverse-engineer",
  "completedSteps": ["analyze"],
  "stepDetails": {
    "analyze": {
      "started": "2025-11-16T09:23:00.000Z",
      "completed": "2025-11-16T09:45:00.000Z",
      "status": "completed",
      "output": "analysis-report.md"
    }
  }
}
```

**Complete Workflow:**
```json
{
  "currentStep": null,  // null = all complete
  "completedSteps": [
    "analyze",
    "reverse-engineer",
    "create-specs",
    "gap-analysis",
    "complete-spec",
    "implement"
  ]
}
```

---

## File System Data Structures

### Generated Documentation
**Location:** `docs/reverse-engineering/`
**Files:** 8 markdown files
**Format:** GitHub Flavored Markdown

1. `functional-specification.md`
2. `configuration-reference.md`
3. `data-architecture.md`
4. `operations-guide.md`
5. `technical-debt-analysis.md`
6. `observability-requirements.md`
7. `visual-design-system.md`
8. `test-documentation.md`

### GitHub Spec Kit Structure
**Location:** `.specify/` + `specs/`

```
.specify/
├── memory/
│   └── constitution.md       # Project principles (agnostic or prescriptive)
├── templates/                # AI agent templates
└── scripts/                  # Automation utilities

specs/
└── FEATURE-ID/
    ├── spec.md               # Feature specification
    ├── plan.md               # Implementation plan
    └── tasks.md              # Generated task list
```

---

## MCP Resources

### stackshift://state
**Type:** application/json
**Content:** Raw state from `.stackshift-state.json`

### stackshift://progress
**Type:** text/plain
**Content:** Human-readable progress summary
```
# StackShift Progress
**Route:** ⚙️ Brownfield (Manage Existing)
**Progress:** 2/6 gears (33%)
...
```

### stackshift://route
**Type:** text/plain
**Content:** Selected route with description

---

## Data Validation

### Prototype Pollution Protection
**Dangerous Properties Removed:**
- `__proto__`
- `constructor`
- `prototype`

**Validation:** `state-manager.ts` removes these on JSON parse

### Structure Validation
**Required Fields:**
- version (string)
- created (ISO timestamp string)
- updated (ISO timestamp string)
- path (null or 'greenfield'/'brownfield')
- currentStep (null or valid StepId)
- completedSteps (array of StepIds)
- metadata (object with projectName, projectPath)

**Validation Function:** `validateState()` in StateManager

---

## Data Persistence

### Atomic Write Operation
**Implementation:**
```typescript
// Temp file with random suffix
const tempFile = `${stateFile}.${randomBytes(8).toString('hex')}.tmp`;

// Write to temp, then atomic rename
await fs.writeFile(tempFile, JSON.stringify(state, null, 2));
await fs.rename(tempFile, stateFile);  // Atomic on POSIX
```

**Benefits:**
- Prevents corruption from interrupted writes
- POSIX atomic rename (no partial writes visible)
- Cleanup on error
- Random suffix prevents collisions

### Concurrency Control
**Pattern:** Read-modify-write with validation
**Testing:** 10 parallel updates tested (all succeed)
**File:** `state-manager.ts`

---

## Data Access Patterns

### Read State
```typescript
const stateManager = new StateManager(directory);
const state = await stateManager.load();
```

### Update State
```typescript
await stateManager.update(state => ({
  ...state,
  completedSteps: [...state.completedSteps, 'analyze'],
  currentStep: 'reverse-engineer'
}));
```

### Complete Step
```typescript
await stateManager.completeStep('analyze', {
  output: 'analysis-report.md'
});
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-16
