# Data Model: Automated Spec Generation

**Feature:** F002-automated-spec-generation
**Created:** 2025-11-17
**Purpose:** Define entities, relationships, and validation rules for automated spec generation

---

## Overview

This document defines the data structures used throughout the automated spec generation process, from parsing markdown documents to generating Spec Kit artifacts.

---

## Core Entities

### 1. MarkdownDocument

Represents a parsed markdown file from `docs/reverse-engineering/`.

**Properties:**
```typescript
interface MarkdownDocument {
  filePath: string;           // Absolute path to source file
  content: string;            // Raw markdown content
  nodes: MarkdownNode[];      // Parsed AST
  metadata: DocumentMetadata; // File info
}

interface DocumentMetadata {
  fileName: string;
  fileSize: number;           // In bytes
  lastModified: Date;
  checksum: string;           // SHA-256 for cache validation
}
```

**Validation Rules:**
- `filePath` must be validated via SecurityValidator
- `fileSize` must be ≤ 10MB (enforced by readFileSafe)
- `content` must be valid UTF-8
- `nodes` must form valid tree (no cycles)

**Relationships:**
- Contains many `MarkdownNode`
- Source for `ConstitutionData` and `Feature` extraction

---

### 2. MarkdownNode

AST node representing a markdown element.

**Properties:**
```typescript
interface MarkdownNode {
  type: NodeType;
  level?: number;             // For headings (1-6)
  content: string;
  children?: MarkdownNode[];  // For lists
  metadata?: NodeMetadata;
}

type NodeType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'list-item'
  | 'code-block'
  | 'blockquote'
  | 'horizontal-rule';

interface NodeMetadata {
  lineNumber: number;         // Source line for error reporting
  language?: string;          // For code blocks
  ordered?: boolean;          // For lists
  indentLevel?: number;       // For nested lists
}
```

**Validation Rules:**
- `type` must be one of defined NodeType values
- `level` required for 'heading', range 1-6
- `content` must be non-empty string (except horizontal-rule)
- `children` only allowed for 'list' and 'list-item' types
- No circular references in children

**Relationships:**
- Belongs to `MarkdownDocument`
- Can contain child `MarkdownNode` elements (tree structure)

---

### 3. ConstitutionData

Extracted data for populating constitution.md template.

**Properties:**
```typescript
interface ConstitutionData {
  purpose: string;                        // Project mission
  values: string[];                       // Core principles
  technicalStack?: TechnicalStack;        // Brownfield only
  developmentStandards: Standard[];       // Code quality, testing, etc.
  qualityMetrics: QualityMetric[];        // Performance, reliability targets
  governance: GovernanceRules;            // Decision-making process
  route: 'greenfield' | 'brownfield';     // Which template to use
}

interface TechnicalStack {
  languages: string[];                    // e.g., "TypeScript 5.3.0"
  frameworks: string[];                   // e.g., "React 18.2"
  databases: string[];                    // e.g., "PostgreSQL 15"
  infrastructure: string[];               // e.g., "AWS Lambda"
  buildTools: string[];                   // e.g., "Vite, ESBuild"
}

interface Standard {
  category: 'code-quality' | 'testing' | 'security' | 'documentation';
  description: string;
  enforcementLevel: 'required' | 'recommended' | 'optional';
}

interface QualityMetric {
  name: string;                          // e.g., "Test Coverage"
  target: string;                        // e.g., "≥ 80%"
  current?: string;                      // e.g., "67%"
  measurement: string;                   // How to measure
}

interface GovernanceRules {
  decisionMaking: string;                // Process description
  changeApproval: string;                // Who approves changes
  conflictResolution: string;            // How to handle disagreements
}
```

**Validation Rules:**
- `purpose` must be non-empty, 50-500 characters
- `values` must have 3-10 items
- `technicalStack` required if `route === 'brownfield'`, forbidden if greenfield
- `developmentStandards` must have ≥ 3 items
- `qualityMetrics` must have ≥ 2 items

**Relationships:**
- Extracted from `MarkdownDocument` (functional-specification.md)
- Used to populate constitution template

---

### 4. Feature

Represents a distinct feature/capability of the system.

**Properties:**
```typescript
interface Feature {
  id: string;                            // "001", "002", etc.
  name: string;                          // Human-readable name
  slug: string;                          // URL-safe: "user-authentication"
  description: string;                   // What this feature does
  userStories: UserStory[];              // Requirements as user stories
  acceptanceCriteria: AcceptanceCriterion[];  // Testable conditions
  status: ImplementationStatus;          // ✅/⚠️/❌
  dependencies: string[];                // Other feature IDs this depends on
  technicalRequirements?: TechnicalRequirements;  // Brownfield only
  sourceSection: MarkdownNode;           // Origin in functional-spec
}

interface UserStory {
  role: string;                          // "user", "admin", "developer"
  goal: string;                          // What they want to do
  benefit: string;                       // Why they want it
  raw: string;                           // Original "As a X, I want Y, so that Z"
}

interface AcceptanceCriterion {
  description: string;
  checked: boolean;                      // True if [x], false if [ ]
  testable: boolean;                     // Can this be automated?
}

type ImplementationStatus =
  | '✅ COMPLETE'
  | '⚠️ PARTIAL'
  | '❌ MISSING';

interface TechnicalRequirements {
  endpoints?: string[];                  // API endpoints
  dataModels?: string[];                 // Database tables/schemas
  components?: string[];                 // UI components
  dependencies?: string[];               // External libraries
  files?: string[];                      // Source files
}
```

**Validation Rules:**
- `id` must match `/^\d{3}$/` (e.g., "001", "042")
- `name` must be non-empty, 3-100 characters
- `slug` must match `/^[a-z0-9-]+$/` (lowercase, hyphens only)
- `description` must be 20-1000 characters
- `userStories` must have ≥ 1 item
- `acceptanceCriteria` must have ≥ 2 items
- `dependencies` must reference valid feature IDs
- `technicalRequirements` only for Brownfield route

**Relationships:**
- Extracted from `MarkdownDocument` (functional-specification.md)
- Many-to-many with other `Feature` entities (dependencies)
- Generates one `SpecFile` and optionally one `PlanFile`

---

### 5. ImplementationPlan

Generated plan for completing a PARTIAL or MISSING feature.

**Properties:**
```typescript
interface ImplementationPlan {
  featureId: string;                     // References Feature.id
  featureName: string;                   // References Feature.name
  currentState: string;                  // What exists today
  targetState: string;                   // What we want to achieve
  technicalApproach: string;             // How to implement
  tasks: Task[];                         // Breakdown of work
  risks: Risk[];                         // Potential issues
  estimatedEffort: string;               // "4-6 hours", "2 weeks", etc.
  dependencies: string[];                // Feature IDs that must be complete first
}

interface Task {
  id: string;                            // "T1", "T2", etc.
  description: string;
  estimatedHours: number;
  dependencies: string[];                // Other task IDs
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'documentation';
}

interface Risk {
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}
```

**Validation Rules:**
- `featureId` must reference existing Feature
- `tasks` must have ≥ 1 item
- `tasks` must not have circular dependencies
- `risks` must have ≥ 1 item
- `estimatedEffort` must be parseable duration

**Relationships:**
- Belongs to one `Feature` (PARTIAL or MISSING status)
- Generates one `PlanFile`

---

### 6. SpecFile

Represents a generated spec.md file.

**Properties:**
```typescript
interface SpecFile {
  featureId: string;
  filePath: string;                      // specs/001-feature-name/spec.md
  content: string;                       // Generated markdown
  template: TemplateType;
  generatedAt: Date;
  checksum: string;                      // SHA-256 of content
}

type TemplateType = 'feature-spec-greenfield' | 'feature-spec-brownfield';
```

**Validation Rules:**
- `filePath` must match `/^specs\/\d{3}-[a-z0-9-]+\/spec\.md$/`
- `content` must be valid markdown
- `content` must be 500-50000 characters

**Relationships:**
- Belongs to one `Feature`
- Written to file system in specs/ directory

---

### 7. PlanFile

Represents a generated plan.md file.

**Properties:**
```typescript
interface PlanFile {
  featureId: string;
  filePath: string;                      // specs/001-feature-name/plan.md
  content: string;                       // Generated markdown
  generatedAt: Date;
  checksum: string;                      // SHA-256 of content
}
```

**Validation Rules:**
- `filePath` must match `/^specs\/\d{3}-[a-z0-9-]+\/plan\.md$/`
- `content` must be valid markdown
- `content` must be 200-20000 characters

**Relationships:**
- Belongs to one `Feature` (PARTIAL/MISSING only)
- Belongs to one `ImplementationPlan`
- Written to file system in specs/ directory

---

### 8. GenerationResult

Output of the complete generation process.

**Properties:**
```typescript
interface GenerationResult {
  success: boolean;
  constitutionPath?: string;             // .specify/memory/constitution.md
  specFiles: SpecFile[];                 // All generated specs
  planFiles: PlanFile[];                 // All generated plans
  errors: GenerationError[];             // Any failures
  warnings: string[];                    // Non-fatal issues
  summary: ResultSummary;
  duration: number;                      // Milliseconds
}

interface GenerationError {
  phase: 'parsing' | 'extraction' | 'generation' | 'writing';
  message: string;
  filePath?: string;
  lineNumber?: number;
}

interface ResultSummary {
  totalFeatures: number;
  completeFeatures: number;              // ✅
  partialFeatures: number;               // ⚠️
  missingFeatures: number;               // ❌
  plansGenerated: number;
  filesCreated: number;
}
```

**Validation Rules:**
- If `success === true`, must have `constitutionPath` and `specFiles.length > 0`
- If `success === false`, must have `errors.length > 0`
- `duration` must be > 0

**Relationships:**
- Contains all `SpecFile` entities
- Contains all `PlanFile` entities
- Returned to MCP client as final result

---

## Data Flow

```
┌─────────────────────────────────────┐
│   Input: docs/reverse-engineering/  │
│   - functional-specification.md     │
│   - technical-debt-analysis.md      │
│   - data-architecture.md            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Parse: MarkdownDocument           │
│   - Read files securely             │
│   - Parse to MarkdownNode tree      │
│   - Validate structure              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Extract: Data Entities            │
│   - ConstitutionData from func-spec │
│   - Feature[] from func-spec        │
│   - Status from tech-debt-analysis  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Generate: Implementation Plans    │
│   - For each PARTIAL/MISSING        │
│   - Create ImplementationPlan       │
│   - Generate tasks and risks        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Populate: Templates               │
│   - Constitution template           │
│   - Feature spec template           │
│   - Implementation plan template    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Write: Files to Disk              │
│   - .specify/memory/constitution.md │
│   - specs/001-name/spec.md          │
│   - specs/001-name/plan.md          │
│   (Atomic, security validated)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Output: GenerationResult          │
│   - Success status                  │
│   - File paths                      │
│   - Summary statistics              │
└─────────────────────────────────────┘
```

---

## State Transitions

### Feature Status Lifecycle

```
[Parse functional-spec.md]
         │
         ▼
[Detect initial status]
         │
         ├─→ ✅ COMPLETE (all criteria met)
         │
         ├─→ ⚠️ PARTIAL (some implemented)
         │
         └─→ ❌ MISSING (not started)
                │
                ▼
     [Generate plan.md]
                │
                ▼
     [User implements feature]
                │
                ▼
     [User updates spec: ⚠️ → ✅]
```

### Generation Process States

```
[Idle]
   │
   ▼
[Parsing] → [Error: Invalid markdown]
   │
   ▼
[Extracting] → [Error: No features found]
   │
   ▼
[Generating] → [Error: Template failed]
   │
   ▼
[Writing] → [Error: Permission denied]
   │
   ▼
[Complete]
```

---

## Validation Rules Summary

### Security Validations
- ✅ All file paths validated via SecurityValidator
- ✅ File sizes limited to 10MB via readFileSafe
- ✅ No code execution from markdown content
- ✅ Atomic operations with temp directories

### Data Validations
- ✅ Feature IDs are unique and sequential
- ✅ Feature slugs are URL-safe
- ✅ Dependencies reference valid features
- ✅ Markdown content is valid UTF-8
- ✅ No circular dependencies in features or tasks

### Business Logic Validations
- ✅ Constitution has all required sections
- ✅ Features have ≥1 user story and ≥2 acceptance criteria
- ✅ Plans only generated for PARTIAL/MISSING features
- ✅ Technical requirements only in Brownfield specs

---

## Error Handling

### Error Types

1. **ParseError**
   - Invalid markdown syntax
   - Corrupted UTF-8
   - File too large

2. **ValidationError**
   - Missing required fields
   - Invalid format (IDs, slugs, paths)
   - Circular dependencies

3. **ExtractionError**
   - No features found
   - Ambiguous feature boundaries
   - Missing required sections

4. **TemplateError**
   - Template file not found
   - Invalid template syntax
   - Missing required variables

5. **FileSystemError**
   - Permission denied
   - Path traversal attempt
   - Disk full

### Error Recovery Strategy

- **ParseError:** Fail with helpful message, suggest fixing doc
- **ValidationError:** Fail with specific field that's invalid
- **ExtractionError:** Suggest adding explicit structure to docs
- **TemplateError:** Fall back to default template if custom fails
- **FileSystemError:** Atomic rollback, no partial files left

---

## Performance Considerations

### Memory Usage
- **MarkdownDocument:** ~2x file size (content + AST)
- **Feature[]:** ~5KB per feature
- **Target:** <100MB total for typical project (50 features)

### Processing Time
- **Parsing:** ~10ms per KB of markdown
- **Extraction:** ~50ms per feature
- **Template population:** ~20ms per file
- **File writing:** ~5ms per file (atomic operations)
- **Target:** <30 seconds for 50 features

### Caching Strategy
- Cache parsed MarkdownDocument by checksum
- Skip re-parsing if file unchanged
- Invalidate on file modification

---

## Testing Data

### Fixtures Required

1. **sample-functional-spec.md**
   - 5 clear features
   - Mixed status (2 COMPLETE, 2 PARTIAL, 1 MISSING)
   - User stories and acceptance criteria
   - Dependencies between features

2. **sample-tech-debt.md**
   - References incomplete features
   - Mentions technical gaps
   - Lists TODOs

3. **minimal-functional-spec.md**
   - 1 feature only
   - Edge case for small projects

4. **malformed-functional-spec.md**
   - Invalid markdown
   - Missing sections
   - Tests error handling

5. **large-functional-spec.md**
   - 100+ features
   - Performance testing

---

**Data Model Status:** ✅ Complete
**Next:** Generate contracts/README.md
**Last Updated:** 2025-11-17
