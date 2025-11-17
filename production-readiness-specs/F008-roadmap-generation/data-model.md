# Data Model: F008 Roadmap Generation

**Feature:** F008-roadmap-generation
**Date:** 2025-11-17
**Status:** ✅ Complete

---

## Overview

This document defines all TypeScript interfaces, types, and data structures for the automated roadmap generation system. These types form the core data model for gap analysis, feature brainstorming, and roadmap generation.

---

## Core Domain Models

### 1. Gap Analysis Types

#### SpecGap

Represents a gap between what a specification promises and what is actually implemented.

```typescript
/**
 * A gap between specification requirements and actual implementation
 */
interface SpecGap {
  /** Unique identifier (e.g., "F002-FR1") */
  id: string;

  /** Specification this gap belongs to (e.g., "F002-error-handling") */
  spec: string;

  /** Requirement identifier (e.g., "FR1: StackShiftError class") */
  requirement: string;

  /** Brief description of the gap */
  description: string;

  /** Current implementation status */
  status: GapStatus;

  /** How confident we are about this gap (0-100) */
  confidence: number;

  /** Evidence supporting this gap classification */
  evidence: Evidence[];

  /** File paths that should contain the implementation */
  expectedLocations: string[];

  /** File paths where partial implementation was found (if any) */
  actualLocations: string[];

  /** Estimated effort to close this gap */
  effort: EffortEstimate;

  /** Priority level */
  priority: Priority;

  /** Business impact of not fixing this gap */
  impact: string;

  /** Recommended action to close the gap */
  recommendation: string;

  /** Related gaps or dependencies */
  dependencies: string[];
}

type GapStatus =
  | 'complete'    // Fully implemented with tests
  | 'partial'     // Basic implementation exists but incomplete
  | 'stub'        // Function exists but only returns placeholder/guidance
  | 'missing';    // No implementation found

/**
 * Evidence that supports a gap classification
 */
interface Evidence {
  /** Type of evidence */
  type: EvidenceType;

  /** Description of what was found (or not found) */
  description: string;

  /** File path where evidence was found */
  location?: string;

  /** Line number in file */
  line?: number;

  /** Code snippet */
  snippet?: string;

  /** Confidence boost/penalty this evidence provides (-50 to +50) */
  confidenceImpact: number;
}

type EvidenceType =
  | 'file-not-found'
  | 'function-not-found'
  | 'exact-function-match'
  | 'ast-signature-verified'
  | 'test-file-exists'
  | 'test-file-missing'
  | 'returns-todo-comment'
  | 'returns-guidance-text'
  | 'name-similarity-only'
  | 'comments-suggest-incomplete';
```

#### FeatureGap

Represents a discrepancy between advertised features (README, marketing) and actual capabilities.

```typescript
/**
 * Gap between advertised features and actual implementation
 */
interface FeatureGap {
  /** Unique identifier */
  id: string;

  /** Feature as advertised in documentation */
  advertisedFeature: string;

  /** What was claimed about this feature */
  claim: string;

  /** Source of the claim (e.g., "README.md:45") */
  source: string;

  /** Actual implementation reality */
  reality: string;

  /** Accuracy score (0-100) */
  accuracyScore: number;

  /** Classification of the gap */
  status: FeatureGapStatus;

  /** Recommended action */
  recommendation: FeatureGapRecommendation;

  /** Evidence */
  evidence: Evidence[];
}

type FeatureGapStatus =
  | 'accurate'     // Claim matches reality (90-100% accurate)
  | 'misleading'   // Partially true but overstated (40-89%)
  | 'false';       // Claim is incorrect (0-39%)

type FeatureGapRecommendation =
  | 'implement-feature'    // Build the feature to match claim
  | 'update-documentation' // Fix the claim to match reality
  | 'add-disclaimer'       // Add "planned" or "partial" note
  | 'remove-claim';        // Remove misleading claim entirely
```

#### CompletenessAssessment

Overall assessment of how complete an application is relative to its specifications.

```typescript
/**
 * Overall completeness assessment
 */
interface CompletenessAssessment {
  /** Overall completion percentage (0-100) */
  overall: number;

  /** Breakdown by category */
  categories: {
    coreFeatures: number;        // 0-100%
    documentation: number;        // 0-100%
    testing: number;              // 0-100%
    security: number;             // 0-100%
    deployment: number;           // 0-100%
    errorHandling: number;        // 0-100%
    performance: number;          // 0-100%
  };

  /** Breakdown by priority */
  priorities: {
    p0: { total: number; complete: number; percentage: number };
    p1: { total: number; complete: number; percentage: number };
    p2: { total: number; complete: number; percentage: number };
    p3: { total: number; complete: number; percentage: number };
  };

  /** Production readiness score (0-100) */
  productionReadiness: number;

  /** Critical gaps that block production */
  criticalGaps: SpecGap[];

  /** Recommended next steps */
  recommendations: string[];
}
```

---

### 2. Feature Brainstorming Types

#### DesirableFeature

A strategically valuable feature that doesn't currently exist but would improve the application.

```typescript
/**
 * A brainstormed feature that would add value to the application
 */
interface DesirableFeature {
  /** Unique identifier */
  id: string;

  /** Category this feature belongs to */
  category: FeatureCategory;

  /** Feature name (concise) */
  name: string;

  /** Detailed description */
  description: string;

  /** Why this feature is valuable */
  rationale: string;

  /** Business/user value */
  value: string;

  /** Estimated effort to implement */
  effort: EffortEstimate;

  /** Priority level */
  priority: Priority;

  /** Prerequisites/dependencies */
  dependencies: string[];

  /** Alternative approaches considered */
  alternatives: string[];

  /** Technical risks */
  risks: Risk[];

  /** How this was brainstormed */
  source: BrainstormSource;
}

type FeatureCategory =
  | 'core-functionality'    // Missing essential features
  | 'user-experience'       // UX improvements, polish
  | 'integration'           // Ecosystem connections
  | 'performance'           // Speed, scalability
  | 'security'              // Security enhancements
  | 'developer-experience'  // Tooling, debugging
  | 'documentation'         // Guides, examples
  | 'testing';              // Test infrastructure

type BrainstormSource =
  | 'ai-generated'          // Claude suggested
  | 'gap-analysis'          // Derived from spec gaps
  | 'competitive-analysis'  // From competitor research
  | 'best-practices'        // Industry standards
  | 'user-request'          // From user feedback
  | 'manual';               // Manually added
```

#### ScoredFeature

A desirable feature with quantitative scoring for prioritization.

```typescript
/**
 * A desirable feature with scoring for prioritization
 */
interface ScoredFeature extends DesirableFeature {
  /** Impact score (1-10) */
  impactScore: number;

  /** Effort score (1-10, higher = more effort) */
  effortScore: number;

  /** ROI (impact / effort) */
  roi: number;

  /** Strategic value score (0-10) */
  strategicValue: number;

  /** Risk score (0-10, higher = more risky) */
  riskScore: number;

  /** Overall priority score (weighted combination) */
  priorityScore: number;

  /** Scoring breakdown */
  scoringDetails: {
    impactFactors: string[];
    effortFactors: string[];
    strategicFactors: string[];
    riskFactors: string[];
  };
}
```

---

### 3. Roadmap Types

#### RoadmapItem

A single actionable item in the roadmap (could be a gap or a feature).

```typescript
/**
 * A single actionable item in the roadmap
 */
interface RoadmapItem {
  /** Unique identifier */
  id: string;

  /** Type of item */
  type: RoadmapItemType;

  /** Title/name */
  title: string;

  /** Detailed description */
  description: string;

  /** Priority level */
  priority: Priority;

  /** Estimated effort */
  effort: EffortEstimate;

  /** Which phase this belongs to */
  phase: number;

  /** Status */
  status: ItemStatus;

  /** Owner/assignee */
  owner?: string;

  /** Dependencies (IDs of other items) */
  dependencies: string[];

  /** Blocks these items */
  blocks: string[];

  /** Success criteria */
  successCriteria: string[];

  /** Acceptance criteria */
  acceptanceCriteria: string[];

  /** Related spec or feature */
  relatedTo?: string;

  /** Tags for filtering/grouping */
  tags: string[];
}

type RoadmapItemType =
  | 'spec-gap'       // From spec vs implementation gap
  | 'feature-gap'    // From advertised vs actual gap
  | 'enhancement'    // Brainstormed improvement
  | 'technical-debt' // Refactoring, cleanup
  | 'documentation'  // Doc improvements
  | 'testing';       // Test additions

type ItemStatus =
  | 'not-started'
  | 'in-progress'
  | 'blocked'
  | 'completed'
  | 'wont-do';
```

#### Phase

A group of related roadmap items with a common goal and timeline.

```typescript
/**
 * A phase/milestone in the roadmap
 */
interface Phase {
  /** Phase number (1, 2, 3, etc.) */
  number: number;

  /** Phase name */
  name: string;

  /** Primary goal of this phase */
  goal: string;

  /** Timeline (e.g., "Weeks 1-4") */
  duration: string;

  /** Start week */
  startWeek: number;

  /** End week */
  endWeek: number;

  /** Items in this phase */
  items: RoadmapItem[];

  /** Total effort for this phase */
  totalEffort: EffortEstimate;

  /** Expected outcome */
  outcome: string;

  /** Success criteria for the phase */
  successCriteria: string[];

  /** Deliverables */
  deliverables: string[];

  /** Dependencies on other phases */
  dependencies: number[];
}
```

#### Roadmap

The complete roadmap with all phases, items, and metadata.

```typescript
/**
 * The complete strategic roadmap
 */
interface Roadmap {
  /** Roadmap metadata */
  metadata: RoadmapMetadata;

  /** Executive summary */
  summary: RoadmapSummary;

  /** All phases */
  phases: Phase[];

  /** All items (flattened across phases) */
  allItems: RoadmapItem[];

  /** Priority distribution */
  priorities: {
    p0: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p1: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p2: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p3: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
  };

  /** Timeline estimates */
  timeline: Timeline;

  /** Risks and mitigations */
  risks: Risk[];

  /** Dependencies */
  dependencies: Dependency[];

  /** Success criteria */
  successCriteria: string[];

  /** Recommendations */
  recommendations: string[];
}

/**
 * Roadmap metadata
 */
interface RoadmapMetadata {
  /** When this roadmap was generated */
  generated: Date;

  /** Project name */
  projectName: string;

  /** Project path */
  projectPath: string;

  /** StackShift version used */
  toolVersion: string;

  /** Analysis basis */
  analysisBasis: {
    specsAnalyzed: number;
    gapsFound: number;
    featuresIdentified: number;
    totalItems: number;
  };
}

/**
 * Executive summary
 */
interface RoadmapSummary {
  /** High-level overview */
  overview: string;

  /** Current state */
  currentState: string;

  /** Target state */
  targetState: string;

  /** Completion status */
  completion: CompletenessAssessment;

  /** Key highlights */
  highlights: string[];

  /** Critical next steps */
  nextSteps: string[];
}
```

---

### 4. Supporting Types

#### EffortEstimate

Represents estimated effort to complete a task.

```typescript
/**
 * Effort estimate with ranges
 */
interface EffortEstimate {
  /** Realistic estimate (most likely) */
  hours: number;

  /** Confidence in this estimate */
  confidence: 'low' | 'medium' | 'high';

  /** Estimation method used */
  method: EstimationMethod;

  /** Range of estimates */
  range: {
    optimistic: number;  // Best case
    realistic: number;   // Most likely
    pessimistic: number; // Worst case
  };

  /** Display format (e.g., "4-6 hours", "2-3 weeks") */
  display: string;
}

type EstimationMethod =
  | 'historical'   // Based on similar completed tasks
  | 'ai'           // AI-generated estimate
  | 'complexity'   // Based on complexity scoring
  | 'analogy'      // Similar to another task
  | 'expert'       // Manual expert estimate
  | 'placeholder'; // Rough guess
```

#### Priority

Priority level for roadmap items.

```typescript
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

interface PriorityDefinition {
  level: Priority;
  label: string;
  description: string;
  criteria: string[];
}

const PRIORITY_DEFINITIONS: Record<Priority, PriorityDefinition> = {
  P0: {
    level: 'P0',
    label: 'Critical',
    description: 'Blockers, security issues, misleading docs',
    criteria: [
      'Blocks production deployment',
      'Security vulnerability',
      'Data loss risk',
      'Misleading documentation',
    ],
  },
  P1: {
    level: 'P1',
    label: 'High',
    description: 'Core value proposition, major gaps',
    criteria: [
      'Core feature incomplete',
      'Major advertised feature missing',
      'Poor user experience',
    ],
  },
  P2: {
    level: 'P2',
    label: 'Medium',
    description: 'Enhancements, additional languages',
    criteria: [
      'Nice-to-have feature',
      'Additional language support',
      'Performance improvement',
    ],
  },
  P3: {
    level: 'P3',
    label: 'Nice to Have',
    description: 'Polish, integrations, advanced features',
    criteria: [
      'Optional integration',
      'UI polish',
      'Advanced feature',
    ],
  },
};
```

#### Timeline

Timeline estimates for completing the roadmap.

```typescript
/**
 * Timeline estimates with different team sizes
 */
interface Timeline {
  /** Total effort in hours */
  totalHours: number;

  /** Total effort in weeks */
  totalWeeks: number;

  /** Estimates by team size */
  byTeamSize: {
    oneDev: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
    twoDevs: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
    threeDevs: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
  };

  /** Critical path (longest dependency chain) */
  criticalPath: {
    items: RoadmapItem[];
    durationWeeks: number;
  };

  /** Parallelizable work */
  parallelizableWork: {
    items: RoadmapItem[];
    durationWeeks: number;
  };
}
```

#### Risk

A risk associated with roadmap execution.

```typescript
/**
 * A risk in the roadmap
 */
interface Risk {
  /** Unique identifier */
  id: string;

  /** Risk title */
  title: string;

  /** Detailed description */
  description: string;

  /** Likelihood (low, medium, high) */
  likelihood: RiskLevel;

  /** Impact if it occurs (low, medium, high) */
  impact: RiskLevel;

  /** Overall severity (likelihood × impact) */
  severity: RiskLevel;

  /** Mitigation strategies */
  mitigations: string[];

  /** Contingency plan */
  contingency?: string;

  /** Related roadmap items */
  affectedItems: string[];
}

type RiskLevel = 'low' | 'medium' | 'high';
```

#### Dependency

A dependency between roadmap items or external dependencies.

```typescript
/**
 * A dependency relationship
 */
interface Dependency {
  /** Item that depends */
  dependent: string; // RoadmapItem ID

  /** Item depended upon */
  dependsOn: string; // RoadmapItem ID or external dependency

  /** Type of dependency */
  type: DependencyType;

  /** Why this dependency exists */
  reason: string;

  /** Is this a hard dependency (blocker) or soft (nice-to-have)? */
  isHard: boolean;
}

type DependencyType =
  | 'sequential'    // Must be done after
  | 'prerequisite'  // Must be done before
  | 'related'       // Should be done together
  | 'optional';     // Nice if done before
```

---

## 5. Analysis Types

### ProjectContext

Information about the project being analyzed.

```typescript
/**
 * Context about the project being analyzed
 */
interface ProjectContext {
  /** Project root directory */
  path: string;

  /** Project name */
  name: string;

  /** Primary programming language */
  language: string;

  /** Technology stack */
  techStack: string[];

  /** Frameworks detected */
  frameworks: string[];

  /** Current features (from docs/specs) */
  currentFeatures: string[];

  /** StackShift route (greenfield vs brownfield) */
  route: 'greenfield' | 'brownfield';

  /** Lines of code */
  linesOfCode: number;

  /** Number of files */
  fileCount: number;

  /** Existing specifications */
  specs: ParsedSpec[];

  /** Documentation files */
  docs: DocumentationFile[];
}
```

### ParsedSpec

A parsed specification file.

```typescript
/**
 * A parsed specification file
 */
interface ParsedSpec {
  /** Spec identifier (e.g., "F002") */
  id: string;

  /** Full title */
  title: string;

  /** File path */
  path: string;

  /** Status markers found */
  status: string; // "COMPLETE", "PARTIAL", "MISSING"

  /** Priority */
  priority: Priority;

  /** Effort estimate */
  effort: string;

  /** Functional requirements */
  functionalRequirements: Requirement[];

  /** Non-functional requirements */
  nonFunctionalRequirements: Requirement[];

  /** Acceptance criteria */
  acceptanceCriteria: AcceptanceCriterion[];

  /** Success criteria */
  successCriteria: string[];

  /** Implementation phases */
  phases: SpecPhase[];
}

interface Requirement {
  id: string;
  title: string;
  priority: Priority;
  description: string;
  acceptanceCriteria: string[];
  implementation?: ImplementationDetails;
}

interface AcceptanceCriterion {
  criterion: string;
  status: '✅' | '⚠️' | '❌' | '';
  implementedIn?: string; // File path
}

interface ImplementationDetails {
  files: string[];
  functions: string[];
  status: GapStatus;
}

interface SpecPhase {
  number: number;
  name: string;
  effort: string;
  status: string;
  tasks: SpecTask[];
}

interface SpecTask {
  description: string;
  completed: boolean;
}
```

### DocumentationFile

A documentation file (README, ROADMAP, etc.).

```typescript
/**
 * A documentation file
 */
interface DocumentationFile {
  /** File path */
  path: string;

  /** File type */
  type: 'readme' | 'roadmap' | 'guide' | 'spec' | 'changelog' | 'other';

  /** Parsed content */
  content: string;

  /** Extracted claims/features */
  claims: DocumentationClaim[];
}

interface DocumentationClaim {
  /** What is claimed */
  claim: string;

  /** Where in the document */
  location: { line: number; section: string };

  /** Related features/functionality */
  relatedFeatures: string[];
}
```

---

## 6. Export Types

### ExportFormat

Supported export formats.

```typescript
type ExportFormat =
  | 'markdown'
  | 'json'
  | 'csv'
  | 'github-issues'
  | 'html';

interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  includeConfidenceScores?: boolean;
  includeEvidence?: boolean;
  groupBy?: 'priority' | 'phase' | 'type';
  filterPriority?: Priority[];
}

interface ExportResult {
  format: ExportFormat;
  content: string;
  metadata: {
    generatedAt: Date;
    itemCount: number;
    byteSize: number;
  };
}
```

### GitHubIssue

Roadmap item as a GitHub issue.

```typescript
/**
 * Roadmap item formatted as GitHub issue
 */
interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  assignees: string[];
  priority: Priority;
  relatedItems: string[];
}
```

---

## 7. Progress Tracking Types

### RoadmapProgress

Tracks progress on roadmap completion over time.

```typescript
/**
 * Roadmap progress tracking
 */
interface RoadmapProgress {
  /** When roadmap was generated */
  generatedAt: Date;

  /** When progress was last updated */
  lastUpdated: Date;

  /** Total items */
  totalItems: number;

  /** Completed items */
  completed: number;

  /** In progress items */
  inProgress: number;

  /** Not started items */
  notStarted: number;

  /** Blocked items */
  blocked: number;

  /** Won't do items */
  wontDo: number;

  /** Completion percentage */
  percentComplete: number;

  /** Velocity (items completed per week) */
  velocity: number;

  /** Estimated completion date (based on velocity) */
  estimatedCompletion: Date;

  /** Individual item statuses */
  itemStatus: Map<string, ItemStatus>;

  /** Progress by priority */
  byPriority: {
    p0: ProgressBreakdown;
    p1: ProgressBreakdown;
    p2: ProgressBreakdown;
    p3: ProgressBreakdown;
  };

  /** Progress by phase */
  byPhase: Map<number, ProgressBreakdown>;

  /** Burndown chart data (for visualization) */
  burndown: BurndownPoint[];
}

interface ProgressBreakdown {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
}

interface BurndownPoint {
  date: Date;
  itemsRemaining: number;
  idealRemaining: number;
}
```

### RoadmapDelta

Changes between roadmap versions.

```typescript
/**
 * Changes between two roadmap versions
 */
interface RoadmapDelta {
  /** Previous roadmap generation date */
  previousDate: Date;

  /** Current roadmap generation date */
  currentDate: Date;

  /** Newly added items */
  added: RoadmapItem[];

  /** Removed items (completed or obsolete) */
  removed: RoadmapItem[];

  /** Changed items (priority, effort, etc.) */
  changed: {
    item: RoadmapItem;
    changes: ItemChange[];
  }[];

  /** Newly completed items */
  completed: RoadmapItem[];

  /** New gaps introduced (regressions) */
  regressions: SpecGap[];

  /** Summary of changes */
  summary: {
    addedCount: number;
    removedCount: number;
    changedCount: number;
    completedCount: number;
    regressionCount: number;
  };
}

interface ItemChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}
```

---

## 8. Configuration Types

### RoadmapConfig

Configuration for roadmap generation.

```typescript
/**
 * Configuration for roadmap generation
 */
interface RoadmapConfig {
  /** Features to enable/disable */
  features: {
    astParsing: boolean;
    aiBrainstorming: boolean;
    multiLanguageSupport: boolean;
    githubIntegration: boolean;
  };

  /** Gap detection settings */
  gapDetection: {
    confidenceThreshold: number; // Minimum confidence to include (0-100)
    includeStubs: boolean;
    includePartial: boolean;
    languageSupport: string[]; // ['javascript', 'typescript', 'python', etc.]
  };

  /** Brainstorming settings */
  brainstorming: {
    enabled: boolean;
    categories: FeatureCategory[];
    maxFeaturesPerCategory: number;
    aiModel?: string;
  };

  /** Roadmap settings */
  roadmap: {
    maxPhases: number;
    phaseStrategy: 'priority' | 'timeline' | 'dependency';
    includeRisks: boolean;
    includeDependencies: boolean;
  };

  /** Export settings */
  export: {
    defaultFormat: ExportFormat;
    outputDirectory: string;
    createGitHubIssues: boolean;
    templatePath?: string;
  };

  /** Performance settings */
  performance: {
    maxAnalysisTime: number; // milliseconds
    parallelism: number;
    cacheEnabled: boolean;
  };
}
```

---

## Type Guards and Utilities

### Type Guards

```typescript
/**
 * Type guard for checking if an item is a SpecGap
 */
function isSpecGap(item: RoadmapItem | SpecGap): item is SpecGap {
  return 'spec' in item && 'requirement' in item;
}

/**
 * Type guard for checking if a feature is scored
 */
function isScoredFeature(
  feature: DesirableFeature | ScoredFeature
): feature is ScoredFeature {
  return 'impactScore' in feature && 'roi' in feature;
}
```

### Utility Types

```typescript
/**
 * Partial roadmap item (for updates)
 */
type PartialRoadmapItem = Partial<RoadmapItem> & { id: string };

/**
 * Read-only roadmap (for display)
 */
type ReadonlyRoadmap = Readonly<Roadmap> & {
  readonly phases: ReadonlyArray<Readonly<Phase>>;
  readonly allItems: ReadonlyArray<Readonly<RoadmapItem>>;
};

/**
 * Mutable roadmap (for generation)
 */
type MutableRoadmap = Roadmap;
```

---

## Validation Schemas

### Zod Schemas (for runtime validation)

```typescript
import { z } from 'zod';

/**
 * Zod schema for EffortEstimate
 */
const EffortEstimateSchema = z.object({
  hours: z.number().positive(),
  confidence: z.enum(['low', 'medium', 'high']),
  method: z.enum(['historical', 'ai', 'complexity', 'analogy', 'expert', 'placeholder']),
  range: z.object({
    optimistic: z.number().positive(),
    realistic: z.number().positive(),
    pessimistic: z.number().positive(),
  }),
  display: z.string(),
});

/**
 * Zod schema for RoadmapItem
 */
const RoadmapItemSchema = z.object({
  id: z.string(),
  type: z.enum(['spec-gap', 'feature-gap', 'enhancement', 'technical-debt', 'documentation', 'testing']),
  title: z.string().min(1),
  description: z.string(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  effort: EffortEstimateSchema,
  phase: z.number().int().positive(),
  status: z.enum(['not-started', 'in-progress', 'blocked', 'completed', 'wont-do']),
  owner: z.string().optional(),
  dependencies: z.array(z.string()),
  blocks: z.array(z.string()),
  successCriteria: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  relatedTo: z.string().optional(),
  tags: z.array(z.string()),
});

/**
 * Validation function
 */
function validateRoadmapItem(item: unknown): item is RoadmapItem {
  try {
    RoadmapItemSchema.parse(item);
    return true;
  } catch {
    return false;
  }
}
```

---

## Constants

```typescript
/**
 * Default confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 90,
  HIGH: 70,
  MEDIUM: 50,
  LOW: 30,
  VERY_LOW: 0,
} as const;

/**
 * Default effort multipliers (for team size calculations)
 */
export const EFFORT_MULTIPLIERS = {
  ONE_DEV: 1.0,
  TWO_DEVS: 0.55, // Not exactly 0.5 due to coordination overhead
  THREE_DEVS: 0.4,
} as const;

/**
 * Default hours per week per developer
 */
export const HOURS_PER_WEEK = 35; // Conservative (accounting for meetings, etc.)

/**
 * Default gap status priority (for sorting)
 */
export const GAP_STATUS_PRIORITY: Record<GapStatus, number> = {
  missing: 1,    // Highest priority
  stub: 2,
  partial: 3,
  complete: 4,   // Lowest priority
} as const;
```

---

## Summary

This data model provides:

1. **Gap Analysis:** SpecGap, FeatureGap, CompletenessAssessment
2. **Feature Brainstorming:** DesirableFeature, ScoredFeature
3. **Roadmap:** RoadmapItem, Phase, Roadmap
4. **Supporting Types:** EffortEstimate, Priority, Timeline, Risk, Dependency
5. **Progress Tracking:** RoadmapProgress, RoadmapDelta
6. **Configuration:** RoadmapConfig, ExportOptions
7. **Validation:** Type guards, Zod schemas
8. **Constants:** Thresholds, multipliers

All types are designed to be:
- **Type-safe:** Strict TypeScript with no `any`
- **Composable:** Types build on each other
- **Validated:** Zod schemas for runtime safety
- **Documented:** JSDoc comments for IDE support

**Status:** ✅ Complete - Ready for implementation
