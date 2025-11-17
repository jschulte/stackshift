# Research Findings: F002-automated-spec-generation

**Feature:** Automated Spec Generation
**Research Phase:** Phase 0
**Completed:** 2025-11-17

---

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the implementation plan by researching best practices, evaluating alternatives, and making justified technical decisions.

---

## 1. Markdown Parsing Strategy

### Question
Use external library (remark/marked/markdown-it) vs custom parser?

### Research

**Option A: remark (unified ecosystem)**
- **Pros:**
  - Robust AST-based parsing
  - Extensive plugin ecosystem
  - Well-maintained
  - TypeScript support
- **Cons:**
  - Heavy (~200KB minified)
  - Complex API for simple needs
  - Dependency chain (unified, vfile, etc.)

**Option B: marked**
- **Pros:**
  - Lightweight (~50KB minified)
  - Simple API
  - Fast performance
  - Popular (36K+ GitHub stars)
- **Cons:**
  - HTML-focused (we need structure)
  - Less TypeScript support
  - No built-in AST

**Option C: markdown-it**
- **Pros:**
  - Pluggable architecture
  - Good performance
  - CommonMark compliant
- **Cons:**
  - Medium size (~100KB)
  - HTML-centric
  - Complex for our needs

**Option D: Custom lightweight parser**
- **Pros:**
  - Zero dependencies
  - Exactly what we need
  - Full control
  - Minimal bundle size
- **Cons:**
  - Implementation time (~4 hours)
  - Edge case handling
  - Testing burden

### Decision

**Choice:** Custom lightweight parser

**Rationale:**
1. **Aligns with constitution's "Minimal Dependencies" (1 production dependency total)**
2. **Simple needs:** We only need to extract:
   - Headings (lines starting with `#`)
   - Lists (lines starting with `- `, `* `, or `1. `)
   - Code blocks (between ` ``` `)
   - Paragraphs
3. **No HTML rendering needed** - we're extracting data, not rendering
4. **Security:** No third-party code executing on user markdown
5. **Bundle size:** ~2KB vs 50-200KB
6. **Implementation time:** 3-4 hours is acceptable for zero dependencies

### Implementation Strategy

```typescript
interface MarkdownNode {
  type: 'heading' | 'list' | 'list-item' | 'code-block' | 'paragraph';
  level?: number;  // For headings (1-6)
  content: string;
  children?: MarkdownNode[];
}

function parseMarkdown(content: string): MarkdownNode[] {
  // Line-by-line parsing
  // Regex patterns for each element type
  // Build tree structure for nested lists
}
```

**Patterns to match:**
- Heading: `/^(#{1,6})\s+(.+)$/`
- List item: `/^(\s*)([-*]|\d+\.)\s+(.+)$/`
- Code block: `/^```(\w*)$/` (start/end)
- Paragraph: Any non-empty line not matching above

---

## 2. Feature Detection Heuristics

### Question
How to identify distinct features in functional-specification.md?

### Research

**Analyzed Sample functional-specification.md files:**

1. **StackShift's own docs** (`docs/reverse-engineering/functional-specification.md`):
   - Features as H2 headings under "Features" section
   - Clear structure: "## User Authentication", "## Fish Management", etc.

2. **Common patterns across projects:**
   - Features usually under H2 or H3
   - Often in a dedicated "Features" section
   - Sometimes numbered lists
   - User stories often grouped by feature

3. **Edge cases:**
   - No clear "Features" heading
   - Flat structure with many H2s
   - Nested feature hierarchies

### Decision

**Choice:** Hierarchical heuristic with fallbacks

**Rationale:**
1. **Primary:** Look for "Features" section (case-insensitive), extract all H2/H3 as features
2. **Fallback 1:** If no "Features" section, use all H2 headings as features
3. **Fallback 2:** If very few H2s (<3), look for H3s instead
4. **Fallback 3:** If still unclear, extract from numbered list items
5. **Last resort:** Error message guiding user to add explicit "Features" section

**Algorithm:**
```typescript
function extractFeatures(doc: MarkdownNode[]): Feature[] {
  // 1. Find "Features" section
  const featuresSection = findSection(doc, /^features$/i);

  if (featuresSection) {
    return extractFromSection(featuresSection, 2); // H2 level
  }

  // 2. Use all H2 headings
  const h2Features = extractHeadings(doc, 2);
  if (h2Features.length >= 3) {
    return h2Features;
  }

  // 3. Try H3 headings
  const h3Features = extractHeadings(doc, 3);
  if (h3Features.length >= 3) {
    return h3Features;
  }

  // 4. Look for numbered lists
  const listFeatures = extractFromLists(doc);
  if (listFeatures.length > 0) {
    return listFeatures;
  }

  // 5. Fail with helpful message
  throw new Error(
    'Could not detect features in functional-specification.md. ' +
    'Please add a "## Features" section with H2 or H3 headings for each feature.'
  );
}
```

### Alternatives Considered
- **ML-based extraction:** Too complex, overkill
- **Fixed heading level:** Too rigid, fails on varied structures
- **Manual configuration:** Defeats automation purpose

---

## 3. Implementation Status Detection

### Question
How to determine if feature is COMPLETE/PARTIAL/MISSING?

### Research

**Option A: Cross-reference with technical-debt-analysis.md**
- Search for feature name in debt analysis
- If mentioned as "incomplete" or "missing" → PARTIAL/MISSING
- If not mentioned → assume COMPLETE

**Option B: Codebase scanning**
- Search for feature-related files
- Check for TODOs/FIXMEs
- Too expensive, outside Gear 3 scope

**Option C: Default to PARTIAL**
- Conservative approach
- User manually updates to COMPLETE
- Prevents false confidence

**Option D: User story completion ratio**
- Count checkboxes: `- [x]` vs `- [ ]`
- If in functional-specification.md

### Decision

**Choice:** Hybrid approach (Options A + C + D)

**Rationale:**
1. **Step 1:** Check technical-debt-analysis.md for mentions
2. **Step 2:** If found and marked incomplete → ⚠️ PARTIAL or ❌ MISSING
3. **Step 3:** If not found, check for checkbox completion ratio in spec
4. **Step 4:** Default to ⚠️ PARTIAL (conservative, prevents false COMPLETE)
5. **Justification:** User can easily change ⚠️ → ✅, but wrong ✅ → ⚠️ is hidden

**Algorithm:**
```typescript
function detectStatus(feature: Feature, debtDoc: string): Status {
  // Check technical debt analysis
  if (debtDoc.toLowerCase().includes(feature.name.toLowerCase())) {
    if (/not implemented|missing|TODO/i.test(debtDoc)) {
      return '❌ MISSING';
    }
    if (/incomplete|partial|needs work/i.test(debtDoc)) {
      return '⚠️ PARTIAL';
    }
  }

  // Check checkbox ratio if available
  const total = feature.acceptanceCriteria.length;
  const complete = feature.acceptanceCriteria.filter(c => c.checked).length;

  if (total > 0) {
    if (complete === total) return '✅ COMPLETE';
    if (complete === 0) return '❌ MISSING';
    return '⚠️ PARTIAL';
  }

  // Conservative default
  return '⚠️ PARTIAL';
}
```

**User Guidance:** Spec will include comment:
```markdown
<!-- Status auto-detected as PARTIAL. Review and update to ✅ COMPLETE if fully implemented -->
```

---

## 4. Template Customization

### Question
Support custom templates from project .specify/templates/?

### Decision

**Choice:** Always use bundled templates, ignore project templates

**Rationale:**
1. **Consistency:** Ensures all StackShift-generated specs follow same format
2. **Simplicity:** No template merging logic needed
3. **Forward compatibility:** If user customizes template, future StackShift runs don't break
4. **Clear separation:** Bundled templates = StackShift output, custom templates = user additions

**Future Enhancement:** V2 could support custom templates with flag `--custom-templates`

---

## 5. Spec Kit CLI Integration

### Question
Shell out to `specify init` or use own initialization?

### Research

**Option A: Shell out to `specify init`**
- **Pros:** Official Spec Kit initialization, guaranteed compatibility
- **Cons:** Requires external CLI installed, shell command = security risk (CWE-78)

**Option B: Own initialization**
- **Pros:** No external dependency, no shell commands, full control
- **Cons:** Must stay compatible with Spec Kit format

### Decision

**Choice:** Own initialization (Option B)

**Rationale:**
1. **Security:** Aligns with constitution's "no shell commands" (Decision 2: Native File APIs)
2. **Reliability:** No dependency on external CLI installation
3. **Control:** Can customize for StackShift needs
4. **Simplicity:** Just create directories, no complex logic

**Implementation:**
```typescript
async function initializeSpecKit(directory: string): Promise<void> {
  // Create directories
  await fs.mkdir(path.join(directory, '.specify/memory'), { recursive: true });
  await fs.mkdir(path.join(directory, '.specify/templates'), { recursive: true });
  await fs.mkdir(path.join(directory, '.specify/scripts'), { recursive: true });
  await fs.mkdir(path.join(directory, 'specs'), { recursive: true });

  // No template/script copying needed for now
  // User can install Spec Kit CLI separately if desired
}
```

**Note:** If `specify init` already ran, we detect existing .specify/ and skip initialization

---

## 6. Progressive Enhancement

### Question
Generate all specs at once or support resuming?

### Decision

**Choice:** All-at-once, atomic operation

**Rationale:**
1. **Simplicity:** Generation is fast (<30 sec), no need for resume
2. **Atomicity:** All-or-nothing prevents inconsistent state
3. **Testing:** Easier to test complete operation
4. **Re-run safety:** If run again, can skip existing files or overwrite (user choice)

**Implementation:**
- Use temp directory for generation
- Only move to final location if ALL succeeded
- On error, clean up temp directory
- User re-runs Gear 3 if needed

**Future Enhancement:** Add `--incremental` flag if users request it

---

## 7. Output Verbosity

### Question
Stream progress vs store log vs minimal output?

### Decision

**Choice:** Structured progress messages in MCP response

**Rationale:**
1. **User feedback:** Shows operation is working, not hung
2. **No logging:** Keeps state clean, logs are for errors
3. **MCP-compatible:** Return text content in response

**Progress Format:**
```
Parsing reverse-engineering documentation...
✓ Found 8 files in docs/reverse-engineering/

Generating constitution...
✓ Created .specify/memory/constitution.md (Brownfield/Tech-Prescriptive)

Creating feature specifications...
✓ 001-user-authentication (⚠️ PARTIAL)
✓ 002-fish-management (⚠️ PARTIAL)
✓ 003-analytics-dashboard (❌ MISSING)
...

Summary:
- Constitution: .specify/memory/constitution.md
- Specifications: 12 features
- Implementation Plans: 8 plans

Ready for Gear 4: Gap Analysis
```

---

## 8. Error Recovery

### Question
Atomic all-or-nothing vs partial success?

### Decision

**Choice:** Atomic all-or-nothing with temp directory

**Rationale:**
1. **User clarity:** Either it worked or it didn't, no ambiguity
2. **No cleanup needed:** Failed run leaves no artifacts
3. **Easy retry:** User just runs Gear 3 again
4. **Prevents corruption:** Won't end up with half-generated specs

**Implementation:**
1. Create temp directory: `/tmp/stackshift-specs-{timestamp}/`
2. Generate all artifacts in temp
3. Validate all files created successfully
4. Atomically move temp → final location
5. On error: Delete temp directory, throw error

**Error Message Example:**
```
Spec generation failed: Could not parse functional-specification.md (line 42: invalid markdown)

No files were created. Please fix the error and run Gear 3 again.
Tip: Check that docs/reverse-engineering/ has complete documentation from Gear 2
```

---

## 9. Cross-references Between Specs

### Question
Auto-detect dependencies between features?

### Decision

**Choice:** Parse explicit "Depends on" mentions, leave empty otherwise

**Rationale:**
1. **Explicit is better:** Inferred dependencies are often wrong
2. **Simple parsing:** Look for "depends on [feature-name]" in feature description
3. **User can refine:** Generated specs are starting point, not final

**Implementation:**
```typescript
function extractDependencies(feature: Feature, allFeatures: Feature[]): string[] {
  const deps: string[] = [];
  const text = feature.description.toLowerCase();

  // Look for explicit mentions
  const dependsMatch = text.match(/depends on (.+)/i);
  if (dependsMatch) {
    const depNames = dependsMatch[1].split(/,| and /);
    deps.push(...depNames.map(n => n.trim()));
  }

  // Cross-reference feature names
  for (const other of allFeatures) {
    if (other.name !== feature.name && text.includes(other.name.toLowerCase())) {
      deps.push(other.name);
    }
  }

  return [...new Set(deps)]; // Deduplicate
}
```

**Spec Output:**
```markdown
## Dependencies
- user-authentication (for user context)
- api-infrastructure (for API endpoints)
```

---

## 10. Testing Strategy

### Question
Test fixtures vs mocks? Real files or in-memory?

### Decision

**Choice:** Real test fixtures + temporary directories

**Rationale:**
1. **Realism:** Tests use actual markdown files, catches real parsing issues
2. **Maintainability:** Fixtures are easier to update than complex mocks
3. **Coverage:** Can test full workflow with real files
4. **Isolation:** Each test gets own temp directory, parallel safe

**Test Structure:**
```
mcp-server/src/utils/__tests__/
├── fixtures/
│   ├── sample-functional-spec.md
│   ├── sample-tech-debt.md
│   └── sample-data-architecture.md
├── markdown-parser.test.ts
├── template-engine.test.ts
├── spec-generator.test.ts
└── spec-file-generator.test.ts
```

**Test Pattern:**
```typescript
describe('spec-generator', () => {
  it('generates specs from functional specification', async () => {
    // Arrange
    const tempDir = await fs.mkdtemp('/tmp/stackshift-test-');
    const fixtureContent = await fs.readFile('fixtures/sample-functional-spec.md', 'utf-8');

    // Act
    const specs = await generateSpecs(fixtureContent);

    // Assert
    expect(specs).toHaveLength(5);
    expect(specs[0].name).toBe('user-authentication');
    expect(specs[0].status).toBe('⚠️ PARTIAL');

    // Cleanup
    await fs.rm(tempDir, { recursive: true });
  });
});
```

**Coverage Goals:**
- Markdown parser: 95% (comprehensive edge cases)
- Template engine: 90% (all variable types)
- Spec generator: 85% (main paths + error handling)
- File generator: 90% (security boundaries)

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Markdown Parser** | Custom lightweight parser | Zero dependencies, aligns with constitution, simple needs |
| **Feature Detection** | Hierarchical heuristic with fallbacks | Handles varied doc structures, helpful error messages |
| **Status Detection** | Hybrid: debt analysis + checkboxes + default PARTIAL | Conservative, user-refinable, data-driven |
| **Template Customization** | Use bundled templates only | Consistency, simplicity, forward compatibility |
| **Spec Kit CLI** | Own initialization | Security (no shell), reliability (no external CLI) |
| **Progressive Enhancement** | All-at-once atomic | Fast enough, simpler, testable |
| **Output Verbosity** | Structured progress in MCP response | User feedback, no logging overhead |
| **Error Recovery** | Atomic all-or-nothing with temp dir | Clear outcomes, easy retry, no corruption |
| **Cross-references** | Parse explicit "depends on" mentions | Explicit better than inferred, user-refinable |
| **Testing Strategy** | Real fixtures + temp directories | Realistic, maintainable, comprehensive |

---

## Technical Specifications

### Markdown Parser API

```typescript
interface MarkdownNode {
  type: 'heading' | 'list' | 'list-item' | 'code-block' | 'paragraph';
  level?: number;
  content: string;
  children?: MarkdownNode[];
}

class MarkdownParser {
  parse(content: string): MarkdownNode[];
  findSection(nodes: MarkdownNode[], title: RegExp): MarkdownNode | null;
  extractHeadings(nodes: MarkdownNode[], level: number): MarkdownNode[];
}
```

### Template Engine API

```typescript
interface TemplateData {
  [key: string]: string | string[] | boolean;
}

class TemplateEngine {
  load(templatePath: string): Promise<string>;
  populate(template: string, data: TemplateData): string;
}
```

### Spec Generator API

```typescript
interface Feature {
  name: string;
  slug: string;
  number: string; // "001", "002", etc.
  description: string;
  userStories: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  status: '✅ COMPLETE' | '⚠️ PARTIAL' | '❌ MISSING';
  dependencies: string[];
  technicalRequirements?: Record<string, any>; // Brownfield only
}

class SpecGenerator {
  async generateFromDocs(docsPath: string, route: 'greenfield' | 'brownfield'): Promise<GeneratedSpecs>;
}

interface GeneratedSpecs {
  constitution: string;
  features: Feature[];
  plans: Map<string, string>; // feature slug → plan.md content
}
```

---

## Implementation Readiness

✅ **All clarifications resolved**
- Markdown parsing: Custom lightweight parser
- Feature detection: Hierarchical heuristic
- Status detection: Hybrid approach
- Template handling: Bundled only
- Spec Kit integration: Own initialization
- Enhancement strategy: Atomic all-at-once
- Verbosity: Structured progress
- Error recovery: Atomic with temp
- Cross-references: Explicit parsing
- Testing: Real fixtures

✅ **No new production dependencies required**

✅ **Security patterns defined**
- All file operations via SecurityValidator
- No shell commands
- Atomic operations with temp directories

✅ **Performance requirements met**
- Lightweight parser (<30 sec for 50+ features)
- Atomic operations prevent long-running state
- No external CLI calls

✅ **Ready to proceed to Phase 1 (Design Artifacts)**

---

**Research Status:** ✅ Complete
**Next Phase:** Phase 1 - Generate data-model.md, contracts/, quickstart.md, agent-context
**Last Updated:** 2025-11-17
