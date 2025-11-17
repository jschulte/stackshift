# Quickstart: Implementing Automated Spec Generation

**Feature:** F002-automated-spec-generation
**For:** Developers implementing this feature
**Estimated Time:** 24-30 hours
**Prerequisites:** Understanding of TypeScript, Node.js fs APIs, markdown syntax

---

## Overview

This guide walks through implementing automated spec generation from reverse-engineering documentation. You'll build 4 main components:

1. **MarkdownParser** - Parse markdown into AST
2. **SpecGenerator** - Extract data from parsed docs
3. **TemplateEngine** - Populate Spec Kit templates
4. **FileWriter** - Securely write generated files

---

## Development Environment Setup

### 1. Clone and Install

```bash
cd /path/to/stackshift
git checkout claude/plan-spec-generation-01HuBbSA8FWUFd6WTsFKTdtz
npm install
npm run build
```

### 2. Run Tests (Before Changes)

```bash
cd mcp-server
npm test

# Should see 268 tests passing
# Note: create-specs tests currently check guidance text
```

### 3. Create Feature Branch (if needed)

```bash
git checkout -b implement/automated-spec-generation
```

---

## Implementation Order

Follow this order to build incrementally with tests:

```
1. MarkdownParser (3-4 hours)
   └─ Test with fixtures
2. TemplateEngine (2-3 hours)
   └─ Test with sample data
3. SpecGenerator (3-4 hours)
   └─ Test with parsed docs
4. FileWriter (2-3 hours)
   └─ Test with temp directories
5. Integration (2-3 hours)
   └─ Update create-specs tool
6. Testing (4-6 hours)
   └─ Comprehensive test suite
7. Documentation (2 hours)
   └─ Update README, SKILL.md
```

---

## Step 1: MarkdownParser (3-4 hours)

### Create the File

```bash
touch mcp-server/src/utils/markdown-parser.ts
touch mcp-server/src/utils/__tests__/markdown-parser.test.ts
```

### Implementation Skeleton

```typescript
// mcp-server/src/utils/markdown-parser.ts

export interface MarkdownNode {
  type: 'heading' | 'paragraph' | 'list' | 'list-item' | 'code-block';
  level?: number;
  content: string;
  children?: MarkdownNode[];
  metadata?: { lineNumber: number; ordered?: boolean; indentLevel?: number };
}

export class ParseError extends Error {
  constructor(message: string, public lineNumber?: number) {
    super(message);
    this.name = 'ParseError';
  }
}

export class MarkdownParser {
  parse(content: string): MarkdownNode[] {
    const lines = content.split('\n');
    const nodes: MarkdownNode[] = [];
    let currentCodeBlock: { language?: string; lines: string[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Code block detection
      if (line.startsWith('```')) {
        if (currentCodeBlock) {
          // Closing code block
          nodes.push({
            type: 'code-block',
            content: currentCodeBlock.lines.join('\n'),
            metadata: { lineNumber }
          });
          currentCodeBlock = null;
        } else {
          // Opening code block
          const language = line.slice(3).trim();
          currentCodeBlock = { language, lines: [] };
        }
        continue;
      }

      if (currentCodeBlock) {
        currentCodeBlock.lines.push(line);
        continue;
      }

      // Heading detection
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        nodes.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2].trim(),
          metadata: { lineNumber }
        });
        continue;
      }

      // List detection
      const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const indentLevel = listMatch[1].length / 2; // 2 spaces = 1 level
        const ordered = /^\d+\./.test(listMatch[2]);
        nodes.push({
          type: 'list-item',
          content: listMatch[3].trim(),
          metadata: { lineNumber, ordered, indentLevel }
        });
        continue;
      }

      // Paragraph (non-empty lines)
      if (line.trim()) {
        nodes.push({
          type: 'paragraph',
          content: line.trim(),
          metadata: { lineNumber }
        });
      }
    }

    return nodes;
  }

  findSection(nodes: MarkdownNode[], titlePattern: RegExp): MarkdownNode | null {
    const headingIndex = nodes.findIndex(
      n => n.type === 'heading' && titlePattern.test(n.content)
    );

    if (headingIndex === -1) return null;

    const heading = nodes[headingIndex];
    const children: MarkdownNode[] = [];

    // Collect all nodes until next heading of same or higher level
    for (let i = headingIndex + 1; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'heading' && node.level! <= heading.level!) {
        break; // End of section
      }
      children.push(node);
    }

    return { ...heading, children };
  }

  extractHeadings(nodes: MarkdownNode[], level: number): MarkdownNode[] {
    return nodes.filter(n => n.type === 'heading' && n.level === level);
  }

  extractListItems(node: MarkdownNode): string[] {
    if (!node.children) return [];
    return node.children
      .filter(n => n.type === 'list-item')
      .map(n => n.content);
  }
}
```

### Test Cases

```typescript
// mcp-server/src/utils/__tests__/markdown-parser.test.ts

import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../markdown-parser.js';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  it('parses headings', () => {
    const content = `# H1\n## H2\n### H3`;
    const nodes = parser.parse(content);

    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toMatchObject({ type: 'heading', level: 1, content: 'H1' });
    expect(nodes[1]).toMatchObject({ type: 'heading', level: 2, content: 'H2' });
    expect(nodes[2]).toMatchObject({ type: 'heading', level: 3, content: 'H3' });
  });

  it('parses lists', () => {
    const content = `- Item 1\n- Item 2\n  - Nested`;
    const nodes = parser.parse(content);

    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toMatchObject({ type: 'list-item', content: 'Item 1' });
    expect(nodes[1]).toMatchObject({ type: 'list-item', content: 'Item 2' });
    expect(nodes[2].metadata?.indentLevel).toBe(1);
  });

  it('parses code blocks', () => {
    const content = `\`\`\`typescript\nconst x = 1;\n\`\`\``;
    const nodes = parser.parse(content);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: 'code-block', content: 'const x = 1;' });
  });

  it('finds sections', () => {
    const content = `# Title\nIntro\n## Features\nFeature 1\nFeature 2\n## Other`;
    const nodes = parser.parse(content);
    const section = parser.findSection(nodes, /^features$/i);

    expect(section).toBeDefined();
    expect(section!.content).toBe('Features');
    expect(section!.children).toHaveLength(2); // "Feature 1", "Feature 2"
  });

  it('extracts headings by level', () => {
    const content = `# H1\n## H2a\n## H2b\n### H3`;
    const nodes = parser.parse(content);
    const h2s = parser.extractHeadings(nodes, 2);

    expect(h2s).toHaveLength(2);
    expect(h2s[0].content).toBe('H2a');
    expect(h2s[1].content).toBe('H2b');
  });
});
```

### Test It

```bash
npm test -- markdown-parser.test.ts
```

---

## Step 2: TemplateEngine (2-3 hours)

### Create the File

```bash
touch mcp-server/src/utils/template-engine.ts
touch mcp-server/src/utils/__tests__/template-engine.test.ts
```

### Implementation

```typescript
// mcp-server/src/utils/template-engine.ts

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TemplateData {
  [key: string]: string | string[] | boolean | number | undefined;
}

export class TemplateError extends Error {
  constructor(message: string, public missingVariables?: string[]) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class TemplateEngine {
  constructor(private templateDir: string = 'plugin/templates') {}

  async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templateDir, `${templateName}.md`);
    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new TemplateError(`Template not found: ${templateName}`);
    }
  }

  populate(template: string, data: TemplateData): string {
    let result = template;

    // 1. Handle conditionals: {{#if key}}...{{/if}}
    result = this.handleConditionals(result, data);

    // 2. Handle loops: {{#each items}}...{{/each}}
    result = this.handleLoops(result, data);

    // 3. Handle simple variables: {{key}}
    result = this.handleVariables(result, data);

    return result;
  }

  private handleConditionals(template: string, data: TemplateData): string {
    // {{#if key}}content{{/if}}
    const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return template.replace(ifPattern, (_, key, content) => {
      return data[key] ? content : '';
    });
  }

  private handleLoops(template: string, data: TemplateData): string {
    // {{#each items}}...{{/each}}
    const eachPattern = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    return template.replace(eachPattern, (_, key, content) => {
      const items = data[key];
      if (!Array.isArray(items)) return '';

      return items.map((item) => {
        if (typeof item === 'string') {
          return content.replace(/\{\{this\}\}/g, item);
        } else {
          // Object with properties
          let itemContent = content;
          for (const [prop, value] of Object.entries(item)) {
            itemContent = itemContent.replace(
              new RegExp(`\\{\\{${prop}\\}\\}`, 'g'),
              String(value)
            );
          }
          return itemContent;
        }
      }).join('');
    });
  }

  private handleVariables(template: string, data: TemplateData): string {
    // {{key}}
    const varPattern = /\{\{(\w+)\}\}/g;
    return template.replace(varPattern, (_, key) => {
      const value = data[key];
      if (value === undefined) return '';
      return String(value);
    });
  }

  validateTemplate(template: string, data: TemplateData): string[] {
    const varPattern = /\{\{(\w+)\}\}/g;
    const required = new Set<string>();
    let match;

    while ((match = varPattern.exec(template)) !== null) {
      required.add(match[1]);
    }

    const missing: string[] = [];
    for (const key of required) {
      if (!(key in data)) {
        missing.push(key);
      }
    }

    return missing;
  }
}
```

### Test Cases

```typescript
// mcp-server/src/utils/__tests__/template-engine.test.ts

import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../template-engine.js';

describe('TemplateEngine', () => {
  const engine = new TemplateEngine();

  it('replaces simple variables', () => {
    const template = 'Hello, {{name}}!';
    const result = engine.populate(template, { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('handles conditionals', () => {
    const template = '{{#if show}}Content{{/if}}';
    expect(engine.populate(template, { show: true })).toBe('Content');
    expect(engine.populate(template, { show: false })).toBe('');
  });

  it('handles loops with strings', () => {
    const template = '{{#each items}}- {{this}}\n{{/each}}';
    const result = engine.populate(template, { items: ['A', 'B', 'C'] });
    expect(result).toBe('- A\n- B\n- C\n');
  });

  it('handles loops with objects', () => {
    const template = '{{#each users}}{{name}}: {{age}}\n{{/each}}';
    const result = engine.populate(template, {
      users: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ]
    });
    expect(result).toContain('Alice: 30');
    expect(result).toContain('Bob: 25');
  });

  it('validates missing variables', () => {
    const template = 'Hello, {{name}} {{age}}!';
    const missing = engine.validateTemplate(template, { name: 'Alice' });
    expect(missing).toEqual(['age']);
  });
});
```

### Test It

```bash
npm test -- template-engine.test.ts
```

---

## Step 3: SpecGenerator (3-4 hours)

### Create the File

```bash
touch mcp-server/src/utils/spec-generator.ts
touch mcp-server/src/utils/__tests__/spec-generator.test.ts
```

### Implementation (Key Parts)

```typescript
// mcp-server/src/utils/spec-generator.ts

import { MarkdownParser, MarkdownNode } from './markdown-parser.js';

export class SpecGenerator {
  private parser = new MarkdownParser();

  async extractFeatures(
    funcSpec: string,
    techDebt?: string
  ): Promise<Feature[]> {
    const nodes = this.parser.parse(funcSpec);

    // Find features section
    const featuresSection = this.parser.findSection(nodes, /^features$/i);
    if (!featuresSection) {
      throw new Error(
        'No "Features" section found in functional-specification.md. ' +
        'Please add a "## Features" heading with feature descriptions.'
      );
    }

    // Extract features as H2 headings
    const featureHeadings = this.parser.extractHeadings(
      featuresSection.children || [],
      2
    );

    if (featureHeadings.length === 0) {
      // Fallback: use H3 if no H2
      featureHeadings.push(
        ...this.parser.extractHeadings(featuresSection.children || [], 3)
      );
    }

    // Convert to Feature objects
    const features: Feature[] = featureHeadings.map((heading, index) => {
      const id = String(index + 1).padStart(3, '0'); // "001", "002", etc.
      const name = heading.content;
      const slug = this.slugify(name);

      // Extract description (next paragraph after heading)
      const description = this.extractDescription(heading, featuresSection.children || []);

      // Extract user stories
      const userStories = this.extractUserStories(heading, featuresSection.children || []);

      // Extract acceptance criteria
      const acceptanceCriteria = this.extractAcceptanceCriteria(
        heading,
        featuresSection.children || []
      );

      // Detect status
      const status = this.detectStatus(name, techDebt);

      return {
        id,
        name,
        slug,
        description,
        userStories,
        acceptanceCriteria,
        status,
        dependencies: [],
        sourceSection: heading
      };
    });

    return features;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private detectStatus(featureName: string, techDebt?: string): ImplementationStatus {
    if (!techDebt) return '⚠️ PARTIAL'; // Conservative default

    const lowerDebt = techDebt.toLowerCase();
    const lowerName = featureName.toLowerCase();

    if (lowerDebt.includes(lowerName)) {
      if (/not implemented|missing|TODO/i.test(techDebt)) {
        return '❌ MISSING';
      }
      if (/incomplete|partial|needs work/i.test(techDebt)) {
        return '⚠️ PARTIAL';
      }
    }

    return '⚠️ PARTIAL'; // Conservative default
  }

  private extractDescription(heading: MarkdownNode, sectionChildren: MarkdownNode[]): string {
    // Find first paragraph after this heading
    const headingIndex = sectionChildren.indexOf(heading);
    for (let i = headingIndex + 1; i < sectionChildren.length; i++) {
      if (sectionChildren[i].type === 'paragraph') {
        return sectionChildren[i].content;
      }
      if (sectionChildren[i].type === 'heading') {
        break; // Next section
      }
    }
    return '';
  }

  private extractUserStories(heading: MarkdownNode, sectionChildren: MarkdownNode[]): UserStory[] {
    // Look for list items starting with "As a"
    const stories: UserStory[] = [];
    const headingIndex = sectionChildren.indexOf(heading);

    for (let i = headingIndex + 1; i < sectionChildren.length; i++) {
      const node = sectionChildren[i];
      if (node.type === 'heading') break;
      if (node.type === 'list-item' && node.content.startsWith('As a')) {
        const match = node.content.match(/As a (.+?), I want (.+?), so that (.+)/i);
        if (match) {
          stories.push({
            role: match[1].trim(),
            goal: match[2].trim(),
            benefit: match[3].trim(),
            raw: node.content
          });
        }
      }
    }

    return stories;
  }

  private extractAcceptanceCriteria(
    heading: MarkdownNode,
    sectionChildren: MarkdownNode[]
  ): AcceptanceCriterion[] {
    // Look for checklist items: - [ ] or - [x]
    const criteria: AcceptanceCriterion[] = [];
    const headingIndex = sectionChildren.indexOf(heading);

    for (let i = headingIndex + 1; i < sectionChildren.length; i++) {
      const node = sectionChildren[i];
      if (node.type === 'heading') break;
      if (node.type === 'list-item') {
        const checkedMatch = node.content.match(/^\[([x ])\]\s*(.+)/i);
        if (checkedMatch) {
          criteria.push({
            description: checkedMatch[2].trim(),
            checked: checkedMatch[1].toLowerCase() === 'x',
            testable: true // Assume testable by default
          });
        }
      }
    }

    return criteria;
  }
}
```

### Test with Fixture

```typescript
// Create: mcp-server/src/utils/__tests__/fixtures/sample-functional-spec.md

const SAMPLE_SPEC = `# Functional Specification

## Features

### User Authentication

Allows users to register and log in to the application.

- As a user, I want to register an account, so that I can save my data
- As a user, I want to log in, so that I can access my dashboard

**Acceptance Criteria:**
- [x] User can register with email and password
- [ ] User can reset forgotten password
- [x] JWT tokens issued on login

### Fish Management

Manage aquarium fish records.

- As a user, I want to add fish, so that I can track them
- As a user, I want to delete fish, so that I can remove sold fish

**Acceptance Criteria:**
- [x] CRUD operations for fish
- [ ] Photo upload for fish
`;

// Test it
describe('SpecGenerator', () => {
  it('extracts features from functional spec', async () => {
    const generator = new SpecGenerator();
    const features = await generator.extractFeatures(SAMPLE_SPEC);

    expect(features).toHaveLength(2);
    expect(features[0].name).toBe('User Authentication');
    expect(features[0].slug).toBe('user-authentication');
    expect(features[0].userStories).toHaveLength(2);
    expect(features[0].acceptanceCriteria).toHaveLength(3);
  });
});
```

---

## Step 4: FileWriter (2-3 hours)

### Create the File

```bash
touch mcp-server/src/utils/spec-file-generator.ts
touch mcp-server/src/utils/__tests__/spec-file-generator.test.ts
```

### Implementation

```typescript
// mcp-server/src/utils/spec-file-generator.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { createDefaultValidator } from './security.js';

export class FileWriter {
  async initializeSpecKit(directory: string): Promise<void> {
    const validator = createDefaultValidator();
    const validDir = validator.validateDirectory(directory);

    await fs.mkdir(path.join(validDir, '.specify/memory'), { recursive: true });
    await fs.mkdir(path.join(validDir, '.specify/templates'), { recursive: true });
    await fs.mkdir(path.join(validDir, '.specify/scripts'), { recursive: true });
    await fs.mkdir(path.join(validDir, 'specs'), { recursive: true });
  }

  async writeConstitution(directory: string, content: string): Promise<string> {
    const validator = createDefaultValidator();
    const validDir = validator.validateDirectory(directory);
    const filePath = path.join(validDir, '.specify/memory/constitution.md');

    await this.writeAtomic(filePath, content);
    return filePath;
  }

  async writeSpec(directory: string, feature: Feature, content: string): Promise<string> {
    const validator = createDefaultValidator();
    const validDir = validator.validateDirectory(directory);
    const featureDir = path.join(validDir, 'specs', `${feature.id}-${feature.slug}`);

    await fs.mkdir(featureDir, { recursive: true });
    const filePath = path.join(featureDir, 'spec.md');

    await this.writeAtomic(filePath, content);
    return filePath;
  }

  async writePlan(directory: string, feature: Feature, content: string): Promise<string> {
    const validator = createDefaultValidator();
    const validDir = validator.validateDirectory(directory);
    const featureDir = path.join(validDir, 'specs', `${feature.id}-${feature.slug}`);
    const filePath = path.join(featureDir, 'plan.md');

    await this.writeAtomic(filePath, content);
    return filePath;
  }

  private async writeAtomic(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;

    try {
      await fs.writeFile(tempPath, content, 'utf-8');
      await fs.rename(tempPath, filePath); // Atomic on POSIX
    } catch (error) {
      // Clean up temp file if exists
      try {
        await fs.unlink(tempPath);
      } catch {}
      throw error;
    }
  }
}
```

---

## Step 5: Integration (2-3 hours)

### Update create-specs.ts

```typescript
// mcp-server/src/tools/create-specs.ts

import { MarkdownParser } from '../utils/markdown-parser.js';
import { SpecGenerator } from '../utils/spec-generator.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { FileWriter } from '../utils/spec-file-generator.js';

export async function createSpecsToolHandler(args: CreateSpecsArgs) {
  try {
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = state.path;

    // Load docs
    const funcSpecPath = path.join(directory, 'docs/reverse-engineering/functional-specification.md');
    const techDebtPath = path.join(directory, 'docs/reverse-engineering/technical-debt-analysis.md');

    const funcSpecContent = await readFileSafe(funcSpecPath);
    const techDebtContent = await readFileSafe(techDebtPath).catch(() => undefined);

    // Generate
    const generator = new SpecGenerator();
    const features = await generator.extractFeatures(funcSpecContent, techDebtContent);

    const engine = new TemplateEngine();
    const writer = new FileWriter();

    await writer.initializeSpecKit(directory);

    // Generate constitution
    const constitutionTemplate = await engine.loadTemplate(
      route === 'greenfield' ? 'constitution-agnostic' : 'constitution-prescriptive'
    );
    const constitutionContent = engine.populate(constitutionTemplate, {
      /* extracted data */
    });
    await writer.writeConstitution(directory, constitutionContent);

    // Generate specs
    const specPaths: string[] = [];
    const planPaths: string[] = [];

    for (const feature of features) {
      const specTemplate = await engine.loadTemplate('feature-spec');
      const specContent = engine.populate(specTemplate, feature);
      const specPath = await writer.writeSpec(directory, feature, specContent);
      specPaths.push(specPath);

      if (feature.status !== '✅ COMPLETE') {
        // Generate plan
        const planContent = `# Implementation Plan: ${feature.name}\n\n...`;
        const planPath = await writer.writePlan(directory, feature, planContent);
        planPaths.push(planPath);
      }
    }

    await stateManager.completeStep('create-specs');

    return {
      content: [{
        type: 'text',
        text: `
Spec generation complete!

Constitution: .specify/memory/constitution.md
Specifications: ${features.length} features
Implementation Plans: ${planPaths.length} plans

Ready for Gear 4: Gap Analysis
Run: stackshift_gap_analysis
`
      }]
    };
  } catch (error) {
    throw new Error(
      `Spec generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

---

## Step 6: Testing (4-6 hours)

### Update Existing Tests

```typescript
// mcp-server/src/tools/__tests__/create-specs.test.ts

// OLD: Check for guidance text
// NEW: Check for actual file generation

describe('create-specs tool', () => {
  it('generates specs from reverse-engineering docs', async () => {
    const tempDir = await fs.mkdtemp('/tmp/stackshift-test-');

    // Setup: Create fake docs
    await fs.mkdir(`${tempDir}/docs/reverse-engineering`, { recursive: true });
    await fs.writeFile(
      `${tempDir}/docs/reverse-engineering/functional-specification.md`,
      SAMPLE_FUNCTIONAL_SPEC
    );

    // Act
    const result = await createSpecsToolHandler({ directory: tempDir });

    // Assert
    expect(result.content[0].text).toContain('Spec generation complete');

    const constitutionExists = await fs.access(
      `${tempDir}/.specify/memory/constitution.md`
    ).then(() => true).catch(() => false);
    expect(constitutionExists).toBe(true);

    const spec001Exists = await fs.access(
      `${tempDir}/specs/001-user-authentication/spec.md`
    ).then(() => true).catch(() => false);
    expect(spec001Exists).toBe(true);

    // Cleanup
    await fs.rm(tempDir, { recursive: true });
  });
});
```

### Run Full Test Suite

```bash
npm test
# Should pass all tests including new ones
```

---

## Step 7: Documentation (2 hours)

### Update SKILL.md

```markdown
<!-- plugin/skills/create-specs/SKILL.md -->

# Create Specifications (Automated)

**Step 3 of 6** in the Reverse Engineering process.

**New in v1.2:** Specs are now automatically generated from your reverse-engineering documentation!

## What This Skill Does

1. **Parses** `docs/reverse-engineering/functional-specification.md`
2. **Extracts** features, user stories, and acceptance criteria
3. **Generates** individual spec files in `specs/###-feature-name/`
4. **Creates** implementation plans for incomplete features
5. **Initializes** `.specify/` directory structure

## Usage

Simply run:
```
> /stackshift:create-specs
```

The skill will:
- ✅ Create `.specify/memory/constitution.md`
- ✅ Generate `specs/001-feature-name/spec.md` for each feature
- ✅ Create `plan.md` for PARTIAL/MISSING features

## Troubleshooting

**Error: "No Features section found"**
- Add a `## Features` heading to your functional-specification.md
- List features as H2 or H3 headings under it

**Error: "Could not parse markdown"**
- Check for unclosed code blocks (` ``` `)
- Ensure file is valid UTF-8

**Generated specs look wrong?**
- Manually edit the generated files (they're just markdown!)
- Re-run the skill to regenerate (will prompt before overwriting)
```

### Update README.md

Add a note in the Features section:

```markdown
## Features

- **Gear 3: Create Specs** - **Now Automated!** Transforms reverse-engineering docs into GitHub Spec Kit format without manual work
```

---

## Testing Checklist

Before submitting:

- [ ] Unit tests pass (markdown-parser, template-engine, spec-generator, file-writer)
- [ ] Integration test passes (full create-specs workflow)
- [ ] Security tests pass (path validation, atomic operations)
- [ ] Manual test: Run on a real project
- [ ] Performance test: Handle 50+ features in <30 seconds
- [ ] Error handling: Test with missing/malformed docs
- [ ] Documentation: README, SKILL.md updated

---

## Performance Tips

1. **Caching:** Cache parsed documents by checksum to avoid re-parsing
2. **Streaming:** For 100+ features, consider streaming progress
3. **Parallelization:** File writes can be parallelized (but keep atomic operations)
4. **Memory:** Don't hold all generated content in memory, write as you go

---

## Common Pitfalls

1. **Forgetting security validation:** Always use `SecurityValidator` for paths
2. **Not using atomic operations:** Always temp file + rename
3. **Hardcoding template paths:** Use `TemplateEngine` to load templates
4. **Poor error messages:** Include line numbers, file paths in errors
5. **Not testing edge cases:** Empty docs, huge docs, malformed markdown

---

## Next Steps After Implementation

1. **Merge PR:** Get code review and merge
2. **Update version:** Bump to v1.2.0
3. **Test in production:** Run on 5-10 real projects
4. **Collect feedback:** Monitor GitHub issues for problems
5. **Iterate:** Improve based on real-world usage

---

**Happy coding! 🚀**

If you get stuck, refer to:
- `data-model.md` - Entity definitions
- `contracts/README.md` - API interfaces
- `research.md` - Design decisions
- `impl-plan.md` - Full implementation plan
