# Agent Context: F002-automated-spec-generation

**Feature:** Automated Spec Generation
**Purpose:** Technology patterns and AI agent context for this feature
**Auto-Updated:** Via `scripts/bash/update-agent-context.sh` or `scripts/powershell/update-agent-context.ps1`

---

## Technology Stack

### Core Technologies

**Markdown Parsing:**
- **Approach:** Custom lightweight parser (zero dependencies)
- **Implementation:** Line-by-line regex-based parsing
- **Patterns:**
  - Heading: `/^(#{1,6})\s+(.+)$/`
  - List: `/^(\s*)([-*]|\d+\.)\s+(.+)$/`
  - Code block: `/^```(\w*)$/` (delimiter detection)
- **Output:** AST of `MarkdownNode[]` with type, content, children
- **Security:** No code execution, read-only parsing

**Template Engine:**
- **Approach:** Custom template system (zero dependencies)
- **Syntax:**
  - Variables: `{{variableName}}`
  - Conditionals: `{{#if key}}...{{/if}}`
  - Loops: `{{#each items}}{{this}}{{/each}}`
- **Implementation:** Regex-based string replacement
- **Templates Location:** `plugin/templates/*.md`

**File Operations:**
- **Security:** All paths via `SecurityValidator.validateDirectory()`
- **Atomicity:** Temp file + atomic rename pattern
- **Limits:** 10MB max file size via `readFileSafe()`
- **Pattern:**
  ```typescript
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filePath); // Atomic on POSIX
  ```

---

## Design Patterns

### 1. Parser Pattern

```typescript
interface MarkdownNode {
  type: NodeType;
  level?: number;
  content: string;
  children?: MarkdownNode[];
  metadata?: NodeMetadata;
}

class MarkdownParser {
  parse(content: string): MarkdownNode[];
  findSection(nodes: MarkdownNode[], pattern: RegExp): MarkdownNode | null;
  extractHeadings(nodes: MarkdownNode[], level: number): MarkdownNode[];
}
```

**Usage:**
```typescript
const parser = new MarkdownParser();
const ast = parser.parse(markdownContent);
const section = parser.findSection(ast, /^features$/i);
```

### 2. Template Pattern

```typescript
class TemplateEngine {
  async loadTemplate(name: string): Promise<string>;
  populate(template: string, data: TemplateData): string;
  validateTemplate(template: string, data: TemplateData): string[];
}
```

**Usage:**
```typescript
const engine = new TemplateEngine();
const template = await engine.loadTemplate('constitution-brownfield');
const content = engine.populate(template, { purpose: '...', values: [...] });
```

### 3. Generator Pattern

```typescript
class SpecGenerator {
  async extractFeatures(funcSpec: string, techDebt?: string): Promise<Feature[]>;
  async extractConstitution(funcSpec: string, route: Route): Promise<ConstitutionData>;
  async generatePlans(features: Feature[], techDebt?: string): Promise<Map<string, Plan>>;
}
```

**Usage:**
```typescript
const generator = new SpecGenerator();
const features = await generator.extractFeatures(funcSpecContent, techDebtContent);
```

### 4. Writer Pattern

```typescript
class FileWriter {
  async initializeSpecKit(directory: string): Promise<void>;
  async writeConstitution(directory: string, content: string): Promise<string>;
  async writeSpec(directory: string, feature: Feature, content: string): Promise<string>;
  async writePlan(directory: string, feature: Feature, content: string): Promise<string>;
  private async writeAtomic(filePath: string, content: string): Promise<void>;
}
```

**Usage:**
```typescript
const writer = new FileWriter();
await writer.initializeSpecKit(projectDir);
await writer.writeConstitution(projectDir, constitutionContent);
```

---

## Data Flow

```
1. Load Documents
   ├─ docs/reverse-engineering/functional-specification.md
   └─ docs/reverse-engineering/technical-debt-analysis.md

2. Parse Markdown
   ├─ MarkdownParser.parse() → MarkdownNode[]
   └─ findSection() → Features section

3. Extract Data
   ├─ SpecGenerator.extractFeatures() → Feature[]
   └─ SpecGenerator.extractConstitution() → ConstitutionData

4. Generate Plans
   └─ SpecGenerator.generatePlans() → Map<id, Plan>

5. Populate Templates
   ├─ TemplateEngine.loadTemplate()
   └─ TemplateEngine.populate() → markdown content

6. Write Files (Atomic)
   ├─ FileWriter.writeConstitution()
   ├─ FileWriter.writeSpec() (for each feature)
   └─ FileWriter.writePlan() (for PARTIAL/MISSING)

7. Update State
   └─ StateManager.completeStep('create-specs')
```

---

## Feature Detection Heuristics

### Primary Strategy
1. Find "Features" section (case-insensitive regex)
2. Extract H2 headings as features
3. If <3 features, try H3 headings
4. If still <3, look for numbered lists
5. Fail with helpful error if none found

### Status Detection
1. Check `technical-debt-analysis.md` for feature name
2. If found + mentions "missing" → ❌ MISSING
3. If found + mentions "incomplete" → ⚠️ PARTIAL
4. Check acceptance criteria checkbox ratio
   - All checked [x] → ✅ COMPLETE
   - None checked [ ] → ❌ MISSING
   - Mixed → ⚠️ PARTIAL
5. Default to ⚠️ PARTIAL (conservative)

### User Story Extraction
Pattern: `As a (.+?), I want (.+?), so that (.+)`
- Role: First capture group
- Goal: Second capture group
- Benefit: Third capture group

### Acceptance Criteria Extraction
Pattern: `- \[([x ])\] (.+)`
- Checked: `[x]` → true, `[ ]` → false
- Description: Capture group 2

---

## Error Handling

### Error Types

1. **ParseError** - Invalid markdown syntax
   - Includes line number
   - Helpful message about what's wrong

2. **ExtractionError** - Can't find required data
   - Phase: constitution | features | plans
   - Suggests what to add to docs

3. **TemplateError** - Template issues
   - Missing variables listed
   - Template name included

4. **FileSystemError** - File I/O problems
   - Error code (EACCES, ENOENT)
   - File path included

### Recovery Strategy

- **All errors:** Atomic rollback (no partial files)
- **ParseError:** Guide user to fix markdown
- **ExtractionError:** Suggest adding structure to docs
- **TemplateError:** Check template file exists
- **FileSystemError:** Check permissions, disk space

---

## Performance Characteristics

### Time Complexity
- **Parsing:** O(n) where n = lines of markdown
- **Feature extraction:** O(m) where m = number of features
- **Template population:** O(t) where t = template size
- **File writing:** O(f) where f = number of features

### Space Complexity
- **Parsed AST:** ~2x file size (content + structure)
- **Feature array:** ~5KB per feature
- **Total memory:** <100MB for typical project (50 features)

### Targets
- **Parsing:** ~10ms per KB
- **Generation:** <30 seconds for 50 features
- **Memory:** <100MB peak usage

---

## Security Considerations

### Input Validation
- ✅ All file paths via `SecurityValidator`
- ✅ File size limited to 10MB (`readFileSafe`)
- ✅ No code execution from markdown
- ✅ UTF-8 encoding validation

### Path Security
- ✅ No path traversal (../../etc/passwd)
- ✅ Restricted to project directory
- ✅ Feature slugs sanitized (lowercase, alphanumeric + hyphens)

### Atomic Operations
- ✅ All writes use temp file + rename
- ✅ Rollback on any error
- ✅ No partial state left on disk

---

## Testing Strategy

### Unit Tests
- **MarkdownParser:** All node types, edge cases
- **TemplateEngine:** Variables, conditionals, loops
- **SpecGenerator:** Feature extraction, status detection
- **FileWriter:** Directory creation, atomic writes

### Integration Tests
- **End-to-end:** docs → specs generation
- **Routes:** Greenfield vs Brownfield
- **Error cases:** Missing docs, malformed content
- **Idempotency:** Re-running doesn't corrupt

### Security Tests
- **Path validation:** All file operations
- **Input sanitization:** Malicious markdown
- **Resource limits:** Large files (>10MB)
- **Atomicity:** Failed operations rollback

### Test Fixtures
- `sample-functional-spec.md` - Well-formed example
- `sample-tech-debt.md` - Status detection
- `malformed-spec.md` - Error handling
- `large-spec.md` - Performance testing

---

## Integration Points

### Existing StackShift Components

**Security:**
- `SecurityValidator` from `mcp-server/src/utils/security.ts`
- `createDefaultValidator()` function
- `validateDirectory()` method

**File Utilities:**
- `readFileSafe()` from `mcp-server/src/utils/file-utils.ts`
- 10MB limit enforcement

**State Management:**
- `StateManager` from `mcp-server/src/utils/state-manager.ts`
- `completeStep('create-specs')` method

**MCP Protocol:**
- `createSpecsToolHandler()` in `mcp-server/src/tools/create-specs.ts`
- Returns MCP response with text content

### Template Files (Inputs)

- `plugin/templates/constitution-agnostic-template.md` (Greenfield)
- `plugin/templates/constitution-prescriptive-template.md` (Brownfield)
- `plugin/templates/feature-spec-template.md`

### Generated Files (Outputs)

- `.specify/memory/constitution.md`
- `specs/###-feature-name/spec.md`
- `specs/###-feature-name/plan.md`

---

## Future Enhancements

### Phase 2 (If Needed)

1. **Incremental Generation:** Resume from checkpoint if interrupted
2. **Custom Templates:** Support project-specific templates
3. **Multi-language Specs:** Generate specs in multiple languages
4. **Validation:** Verify generated specs against Spec Kit schema
5. **Mermaid Diagrams:** Auto-generate diagrams from data models
6. **Cross-reference Detection:** Auto-detect dependencies between features

---

## AI Agent Patterns

### For Code Generation

When generating code for this feature:

1. **Always use SecurityValidator:**
   ```typescript
   const validator = createDefaultValidator();
   const validDir = validator.validateDirectory(directory);
   ```

2. **Always use atomic writes:**
   ```typescript
   const tempPath = `${filePath}.tmp`;
   await fs.writeFile(tempPath, content);
   await fs.rename(tempPath, filePath);
   ```

3. **Always handle errors:**
   ```typescript
   try {
     // operation
   } catch (error) {
     throw new SpecificError(
       'User-friendly message',
       additionalContext
     );
   }
   ```

4. **Always include metadata:**
   ```typescript
   metadata: {
     lineNumber,  // For error reporting
     // ... other context
   }
   ```

### For Testing

When generating tests:

1. **Use temp directories:**
   ```typescript
   const tempDir = await fs.mkdtemp('/tmp/stackshift-test-');
   // ... test code
   await fs.rm(tempDir, { recursive: true });
   ```

2. **Use fixtures for markdown:**
   ```typescript
   const SAMPLE_SPEC = `# Functional Specification\n## Features\n### User Auth`;
   ```

3. **Test edge cases:**
   - Empty files
   - Malformed markdown
   - Missing sections
   - Huge files (>1MB)

---

**Agent Context Status:** ✅ Complete
**Last Updated:** 2025-11-17
**Auto-Update Command:** `scripts/bash/update-agent-context.sh F002`

---

## Notes for AI Agents

This feature demonstrates StackShift's commitment to:
- Zero dependencies (custom parser vs external library)
- Security first (all paths validated, atomic operations)
- Clean architecture (parser, generator, engine, writer separation)
- Comprehensive testing (unit, integration, security)
- User-friendly errors (helpful messages with context)

When working on this or similar features, follow these established patterns.
