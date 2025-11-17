# API Contracts: Automated Spec Generation

**Feature:** F002-automated-spec-generation
**Created:** 2025-11-17
**Purpose:** Define internal interfaces for automated spec generation components

---

## Overview

This document defines the TypeScript interfaces (contracts) for the automated spec generation system. These are **internal APIs** (not exposed via MCP protocol), used for communication between components within the StackShift codebase.

---

## Component Architecture

```
┌───────────────────────────────────────┐
│ create-specs Tool (MCP Handler)      │
│ Orchestrates the entire process      │
└───────────┬───────────────────────────┘
            │
            ├─→ MarkdownParser
            ├─→ SpecGenerator
            ├─→ TemplateEngine
            └─→ FileWriter
```

---

## 1. MarkdownParser Interface

**Purpose:** Parse markdown files into structured AST

**File:** `mcp-server/src/utils/markdown-parser.ts`

### Interface

```typescript
export interface IMarkdownParser {
  /**
   * Parse markdown content into AST
   * @param content - Raw markdown string
   * @returns Array of root-level nodes
   * @throws ParseError if markdown is invalid
   */
  parse(content: string): MarkdownNode[];

  /**
   * Find a section by title (case-insensitive)
   * @param nodes - AST to search
   * @param titlePattern - Regex pattern for section title
   * @returns Matching node or null
   */
  findSection(nodes: MarkdownNode[], titlePattern: RegExp): MarkdownNode | null;

  /**
   * Extract all headings of a specific level
   * @param nodes - AST to search
   * @param level - Heading level (1-6)
   * @returns Array of heading nodes
   */
  extractHeadings(nodes: MarkdownNode[], level: number): MarkdownNode[];

  /**
   * Extract list items from a node
   * @param node - List node
   * @returns Array of list item contents
   */
  extractListItems(node: MarkdownNode): string[];
}
```

### Types

```typescript
export interface MarkdownNode {
  type: NodeType;
  level?: number;             // For headings
  content: string;
  children?: MarkdownNode[];
  metadata?: NodeMetadata;
}

export type NodeType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'list-item'
  | 'code-block'
  | 'blockquote'
  | 'horizontal-rule';

export interface NodeMetadata {
  lineNumber: number;
  language?: string;          // For code blocks
  ordered?: boolean;          // For lists
  indentLevel?: number;
}
```

### Error Types

```typescript
export class ParseError extends Error {
  constructor(
    message: string,
    public lineNumber?: number,
    public column?: number
  ) {
    super(message);
    this.name = 'ParseError';
  }
}
```

### Usage Example

```typescript
const parser = new MarkdownParser();
const ast = parser.parse(markdownContent);
const featuresSection = parser.findSection(ast, /^features$/i);
const features = parser.extractHeadings(featuresSection?.children || [], 2);
```

---

## 2. SpecGenerator Interface

**Purpose:** Extract structured data from parsed markdown

**File:** `mcp-server/src/utils/spec-generator.ts`

### Interface

```typescript
export interface ISpecGenerator {
  /**
   * Extract constitution data from functional specification
   * @param doc - Parsed functional-specification.md
   * @param route - Greenfield or Brownfield
   * @returns Constitution data for template population
   * @throws ExtractionError if required data missing
   */
  extractConstitution(
    doc: MarkdownDocument,
    route: 'greenfield' | 'brownfield'
  ): Promise<ConstitutionData>;

  /**
   * Extract features from functional specification
   * @param doc - Parsed functional-specification.md
   * @param debtDoc - Parsed technical-debt-analysis.md (optional)
   * @returns Array of feature definitions
   * @throws ExtractionError if no features found
   */
  extractFeatures(
    doc: MarkdownDocument,
    debtDoc?: MarkdownDocument
  ): Promise<Feature[]>;

  /**
   * Generate implementation plans for incomplete features
   * @param features - Extracted features
   * @param debtDoc - Technical debt analysis (optional)
   * @returns Map of feature ID to plan content
   */
  generatePlans(
    features: Feature[],
    debtDoc?: MarkdownDocument
  ): Promise<Map<string, ImplementationPlan>>;

  /**
   * Detect implementation status for a feature
   * @param feature - Feature to check
   * @param debtDoc - Technical debt analysis
   * @returns Status indicator
   */
  detectStatus(
    feature: Feature,
    debtDoc?: MarkdownDocument
  ): ImplementationStatus;
}
```

### Types

```typescript
export interface MarkdownDocument {
  filePath: string;
  content: string;
  nodes: MarkdownNode[];
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  lastModified: Date;
  checksum: string;
}

export type ImplementationStatus = '✅ COMPLETE' | '⚠️ PARTIAL' | '❌ MISSING';
```

### Error Types

```typescript
export class ExtractionError extends Error {
  constructor(
    message: string,
    public phase: 'constitution' | 'features' | 'plans',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}
```

### Usage Example

```typescript
const generator = new SpecGenerator();
const funcSpec = await loadDocument('docs/reverse-engineering/functional-specification.md');
const techDebt = await loadDocument('docs/reverse-engineering/technical-debt-analysis.md');

const constitution = await generator.extractConstitution(funcSpec, 'brownfield');
const features = await generator.extractFeatures(funcSpec, techDebt);
const plans = await generator.generatePlans(features, techDebt);
```

---

## 3. TemplateEngine Interface

**Purpose:** Load and populate markdown templates

**File:** `mcp-server/src/utils/template-engine.ts`

### Interface

```typescript
export interface ITemplateEngine {
  /**
   * Load a template file
   * @param templateName - Name without extension
   * @returns Template content
   * @throws TemplateError if not found
   */
  loadTemplate(templateName: string): Promise<string>;

  /**
   * Populate template with data
   * @param template - Template content with {{variables}}
   * @param data - Key-value pairs for substitution
   * @returns Populated markdown
   * @throws TemplateError if variable missing
   */
  populate(template: string, data: TemplateData): string;

  /**
   * Validate template has all required variables
   * @param template - Template to check
   * @param data - Data to validate against
   * @returns Array of missing variables
   */
  validateTemplate(template: string, data: TemplateData): string[];
}
```

### Types

```typescript
export interface TemplateData {
  [key: string]: string | string[] | boolean | number;
}

export interface TemplateOptions {
  templateDir?: string;       // Default: plugin/templates/
  strict?: boolean;           // Fail on missing variables
  preserveUnknown?: boolean;  // Keep {{unknown}} vs remove
}
```

### Template Syntax

**Variables:**
```markdown
{{variableName}}
```

**Conditionals:**
```markdown
{{#if condition}}
  Content shown if true
{{/if}}

{{#if condition}}
  If true
{{else}}
  If false
{{/if}}
```

**Lists:**
```markdown
{{#each items}}
  - {{this}}
{{/each}}

{{#each objects}}
  - {{name}}: {{description}}
{{/each}}
```

### Error Types

```typescript
export class TemplateError extends Error {
  constructor(
    message: string,
    public templateName?: string,
    public missingVariables?: string[]
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}
```

### Usage Example

```typescript
const engine = new TemplateEngine();
const template = await engine.loadTemplate('constitution-brownfield');
const populated = engine.populate(template, {
  purpose: 'Project mission',
  values: ['Security', 'Quality'],
  hasTechStack: true,
  languages: ['TypeScript', 'Go']
});
```

---

## 4. FileWriter Interface

**Purpose:** Securely write generated files to disk

**File:** `mcp-server/src/utils/spec-file-generator.ts`

### Interface

```typescript
export interface IFileWriter {
  /**
   * Initialize .specify/ directory structure
   * @param directory - Project root
   * @throws FileSystemError if creation fails
   */
  initializeSpecKit(directory: string): Promise<void>;

  /**
   * Write constitution file
   * @param directory - Project root
   * @param content - Constitution markdown
   * @returns Path to created file
   * @throws FileSystemError if write fails
   */
  writeConstitution(directory: string, content: string): Promise<string>;

  /**
   * Write feature specification file
   * @param directory - Project root
   * @param feature - Feature definition
   * @param content - Spec markdown
   * @returns Path to created file
   * @throws FileSystemError if write fails
   */
  writeSpec(directory: string, feature: Feature, content: string): Promise<string>;

  /**
   * Write implementation plan file
   * @param directory - Project root
   * @param feature - Feature definition
   * @param content - Plan markdown
   * @returns Path to created file
   * @throws FileSystemError if write fails
   */
  writePlan(directory: string, feature: Feature, content: string): Promise<string>;

  /**
   * Atomic write operation using temp file
   * @param filePath - Destination path
   * @param content - File content
   * @throws FileSystemError if write or rename fails
   */
  writeAtomic(filePath: string, content: string): Promise<void>;
}
```

### Types

```typescript
export interface WriteOptions {
  overwrite?: boolean;        // Default: false
  createDirectories?: boolean; // Default: true
  encoding?: BufferEncoding;  // Default: 'utf-8'
}

export interface WriteResult {
  path: string;
  bytesWritten: number;
  checksum: string;           // SHA-256
}
```

### Error Types

```typescript
export class FileSystemError extends Error {
  constructor(
    message: string,
    public code?: string,          // EACCES, ENOENT, etc.
    public filePath?: string
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}
```

### Security Requirements

- ✅ All paths validated via `SecurityValidator`
- ✅ Atomic operations (temp + rename)
- ✅ No path traversal (e.g., `../../etc/passwd`)
- ✅ Directory creation limited to project root
- ✅ Fail if trying to write outside workspace

### Usage Example

```typescript
const writer = new FileWriter();
await writer.initializeSpecKit('/path/to/project');

const constitutionPath = await writer.writeConstitution(
  '/path/to/project',
  constitutionContent
);

for (const feature of features) {
  await writer.writeSpec('/path/to/project', feature, specContent);
  if (feature.status !== '✅ COMPLETE') {
    await writer.writePlan('/path/to/project', feature, planContent);
  }
}
```

---

## 5. Main Orchestrator (create-specs Tool)

**Purpose:** Coordinate all components to generate specs

**File:** `mcp-server/src/tools/create-specs.ts`

### Flow

```typescript
export async function createSpecsToolHandler(args: CreateSpecsArgs): Promise<MCPResponse> {
  // 1. Validate directory
  const validator = createDefaultValidator();
  const directory = validator.validateDirectory(args.directory || process.cwd());

  // 2. Load state
  const stateManager = new StateManager(directory);
  const state = await stateManager.load();
  const route = state.path; // 'greenfield' or 'brownfield'

  // 3. Load reverse-engineering docs
  const funcSpec = await loadDocument('docs/reverse-engineering/functional-specification.md');
  const techDebt = await loadDocument('docs/reverse-engineering/technical-debt-analysis.md');

  // 4. Parse markdown
  const parser = new MarkdownParser();
  const funcSpecDoc = {
    ...funcSpec,
    nodes: parser.parse(funcSpec.content)
  };
  const techDebtDoc = techDebt ? {
    ...techDebt,
    nodes: parser.parse(techDebt.content)
  } : undefined;

  // 5. Extract data
  const generator = new SpecGenerator();
  const constitution = await generator.extractConstitution(funcSpecDoc, route);
  const features = await generator.extractFeatures(funcSpecDoc, techDebtDoc);
  const plans = await generator.generatePlans(features, techDebtDoc);

  // 6. Populate templates
  const engine = new TemplateEngine();
  const constitutionTemplate = await engine.loadTemplate(
    route === 'greenfield'
      ? 'constitution-agnostic'
      : 'constitution-prescriptive'
  );
  const constitutionContent = engine.populate(constitutionTemplate, constitution);

  const specTemplate = await engine.loadTemplate('feature-spec');
  const specContents = features.map(f => engine.populate(specTemplate, f));

  // 7. Write files
  const writer = new FileWriter();
  await writer.initializeSpecKit(directory);
  await writer.writeConstitution(directory, constitutionContent);

  const specPaths: string[] = [];
  const planPaths: string[] = [];

  for (let i = 0; i < features.length; i++) {
    const specPath = await writer.writeSpec(directory, features[i], specContents[i]);
    specPaths.push(specPath);

    if (features[i].status !== '✅ COMPLETE') {
      const planContent = engine.populate(
        await engine.loadTemplate('implementation-plan'),
        plans.get(features[i].id)!
      );
      const planPath = await writer.writePlan(directory, features[i], planContent);
      planPaths.push(planPath);
    }
  }

  // 8. Update state
  await stateManager.completeStep('create-specs');

  // 9. Return result
  return {
    content: [{
      type: 'text',
      text: formatSuccessMessage(specPaths, planPaths)
    }]
  };
}
```

---

## Error Handling Contract

### Error Hierarchy

```
Error
├── ParseError (markdown parsing)
├── ExtractionError (data extraction)
├── TemplateError (template processing)
├── FileSystemError (file operations)
└── ValidationError (data validation)
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    type: string;           // Error class name
    message: string;        // Human-readable message
    phase: string;          // 'parsing' | 'extraction' | 'generation' | 'writing'
    details?: Record<string, any>;
    filePath?: string;
    lineNumber?: number;
  };
}
```

### Recovery Strategy

| Error Type | Recovery Action |
|------------|----------------|
| ParseError | Fail immediately, guide user to fix markdown |
| ExtractionError | Fail immediately, suggest adding structure to docs |
| TemplateError | Fail immediately, report missing template/variables |
| FileSystemError | Rollback temp directory, fail with permission/path error |
| ValidationError | Fail immediately, report invalid data |

---

## Testing Contracts

### Mock Interfaces

For unit testing, provide mock implementations:

```typescript
export class MockMarkdownParser implements IMarkdownParser {
  // Simplified parsing for tests
}

export class MockTemplateEngine implements ITemplateEngine {
  // In-memory templates
}

export class MockFileWriter implements IFileWriter {
  // No actual file I/O
  public writtenFiles: Map<string, string> = new Map();
}
```

### Test Fixtures

```typescript
export const TEST_FIXTURES = {
  FUNCTIONAL_SPEC: path.join(__dirname, 'fixtures/sample-functional-spec.md'),
  TECH_DEBT: path.join(__dirname, 'fixtures/sample-tech-debt.md'),
  CONSTITUTION_TEMPLATE: 'constitution-brownfield',
  SPEC_TEMPLATE: 'feature-spec'
};
```

---

## Performance Contracts

### Timeouts

- `parse()`: 5 seconds per MB
- `extractFeatures()`: 10 seconds per 100 features
- `populate()`: 1 second per template
- `writeAtomic()`: 2 seconds per file

### Memory Limits

- `MarkdownDocument`: Max 10MB per file
- `Feature[]`: Max 1000 features
- `TemplateData`: Max 1MB per template

---

## Versioning

**API Version:** 1.0.0

**Breaking Changes:**
- Adding required parameters to interface methods
- Changing error types
- Removing public methods

**Non-Breaking Changes:**
- Adding optional parameters
- Adding new methods
- Adding new error types

**Deprecation Policy:**
- Deprecated methods marked with `@deprecated` JSDoc
- Removed after 1 major version (e.g., deprecated in 1.5, removed in 2.0)

---

## Integration Points

### External Dependencies

- `fs/promises`: File I/O (Node.js built-in)
- `path`: Path operations (Node.js built-in)
- `SecurityValidator`: From `mcp-server/src/utils/security.ts`
- `StateManager`: From `mcp-server/src/utils/state-manager.ts`
- `readFileSafe`: From `mcp-server/src/utils/file-utils.ts`

### No External Libraries

All interfaces use only Node.js built-in modules and existing StackShift utilities, maintaining the "minimal dependencies" principle.

---

**Contract Status:** ✅ Complete
**Next:** Generate quickstart.md
**Last Updated:** 2025-11-17
