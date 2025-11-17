# Quickstart: F008 Roadmap Generation Implementation

**Feature:** F008-roadmap-generation
**For:** Developers implementing the roadmap generation system
**Estimated Read Time:** 10 minutes

---

## Overview

This guide helps you get started implementing the automated roadmap generation feature for StackShift. You'll build a system that analyzes spec-implementation gaps, brainstorms features, and generates strategic roadmaps.

**What you'll build:**
- Gap analyzers (spec vs code, advertised vs actual)
- AI-powered feature brainstorming
- Roadmap generator with prioritization
- Multi-format exporters (Markdown, JSON, GitHub Issues)

**Prerequisites:**
- TypeScript 5.3+ installed
- Node.js 18+ installed
- Familiarity with AST parsing concepts
- Access to Claude AI (via MCP)

---

## Project Structure

```
mcp-server/src/
├── analyzers/                 # Phase 1 (4-5 weeks)
│   ├── gap-analyzer.ts
│   ├── feature-analyzer.ts
│   ├── completeness-analyzer.ts
│   └── __tests__/
├── brainstorming/             # Phase 2 (3-4 weeks)
│   ├── feature-brainstormer.ts
│   ├── scoring-engine.ts
│   └── __tests__/
├── roadmap/                   # Phase 3 (3-4 weeks)
│   ├── roadmap-generator.ts
│   ├── prioritizer.ts
│   ├── timeline-estimator.ts
│   └── __tests__/
├── exporters/                 # Phase 4 (2-3 weeks)
│   ├── markdown-exporter.ts
│   ├── json-exporter.ts
│   ├── github-exporter.ts
│   └── __tests__/
└── tools/
    └── generate-roadmap.ts    # MCP tool
```

---

## Phase 1: Gap Detection (Start Here!)

### Step 1: Set Up Dependencies

```bash
cd mcp-server
npm install --save @babel/parser @babel/types typescript markdown-it
npm install --save-dev @types/babel__parser @types/markdown-it
```

### Step 2: Create SpecGapAnalyzer

**File:** `mcp-server/src/analyzers/gap-analyzer.ts`

```typescript
import * as fs from 'fs/promises';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import MarkdownIt from 'markdown-it';
import type { SpecGap, ParsedSpec, Requirement, Evidence } from '../types';

export class SpecGapAnalyzer {
  private md = new MarkdownIt();

  /**
   * Analyze all specs in a directory
   */
  async analyzeSpecs(specsDir: string, codeDir: string): Promise<SpecGap[]> {
    const specFiles = await this.findSpecFiles(specsDir);
    const allGaps: SpecGap[] = [];

    for (const specFile of specFiles) {
      const gaps = await this.analyzeSpec(specFile, codeDir);
      allGaps.push(...gaps);
    }

    return allGaps;
  }

  /**
   * Analyze a single spec file
   */
  async analyzeSpec(specPath: string, codeDir: string): Promise<SpecGap[]> {
    // 1. Parse the spec.md file
    const spec = await this.parseSpecFile(specPath);

    // 2. For each requirement, check if it's implemented
    const gaps: SpecGap[] = [];

    for (const requirement of spec.functionalRequirements) {
      const gap = await this.verifyRequirement(requirement, codeDir);
      if (gap) {
        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Parse spec.md into structured data
   */
  private async parseSpecFile(specPath: string): Promise<ParsedSpec> {
    const content = await fs.readFile(specPath, 'utf-8');
    const tokens = this.md.parse(content, {});

    // Extract requirements using regex
    const requirementPattern = /### (FR\d+): (.+)/g;
    const requirements: Requirement[] = [];
    let match;

    while ((match = requirementPattern.exec(content)) !== null) {
      requirements.push({
        id: match[1],
        title: match[2],
        priority: 'P1', // Parse from spec
        description: '', // Parse from spec
        acceptanceCriteria: [], // Parse from spec
      });
    }

    return {
      id: this.extractSpecId(specPath),
      title: this.extractTitle(content),
      path: specPath,
      status: 'PARTIAL',
      priority: 'P1',
      effort: '',
      functionalRequirements: requirements,
      nonFunctionalRequirements: [],
      acceptanceCriteria: [],
      successCriteria: [],
      phases: [],
    };
  }

  /**
   * Verify if a requirement is implemented
   */
  private async verifyRequirement(
    requirement: Requirement,
    codeDir: string
  ): Promise<SpecGap | null> {
    // Search for implementation
    const evidence: Evidence[] = [];

    // Example: Check if a function exists
    const functionName = this.inferFunctionName(requirement);
    const found = await this.searchForFunction(codeDir, functionName);

    if (!found) {
      evidence.push({
        type: 'function-not-found',
        description: `Function "${functionName}" not found in codebase`,
        confidenceImpact: 30,
      });

      return {
        id: `${requirement.id}`,
        spec: this.extractSpecId(codeDir),
        requirement: requirement.id,
        description: requirement.description,
        status: 'missing',
        confidence: 85,
        evidence,
        expectedLocations: [this.inferExpectedLocation(requirement)],
        actualLocations: [],
        effort: { hours: 4, confidence: 'medium', method: 'ai', range: { optimistic: 2, realistic: 4, pessimistic: 8 }, display: '2-8 hours' },
        priority: requirement.priority,
        impact: 'Feature incomplete',
        recommendation: `Implement ${functionName} function`,
        dependencies: [],
      };
    }

    return null; // No gap, requirement is implemented
  }

  // Helper methods
  private extractSpecId(path: string): string {
    const match = path.match(/F(\d+)/);
    return match ? `F${match[1]}` : 'unknown';
  }

  private extractTitle(content: string): string {
    const match = content.match(/^# (.+)/m);
    return match ? match[1] : 'Untitled';
  }

  private inferFunctionName(requirement: Requirement): string {
    // Simple heuristic: extract first capitalized word sequence
    const match = requirement.title.match(/([A-Z][a-z]+(?:[A-Z][a-z]+)*)/);
    return match ? match[1] : 'unknown';
  }

  private inferExpectedLocation(requirement: Requirement): string {
    // Simple heuristic: guess file path from requirement
    return `src/${requirement.id.toLowerCase()}.ts`;
  }

  private async findSpecFiles(specsDir: string): Promise<string[]> {
    // Recursively find all spec.md files
    const entries = await fs.readdir(specsDir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = `${specsDir}/${entry.name}`;
      if (entry.isDirectory()) {
        files.push(...(await this.findSpecFiles(fullPath)));
      } else if (entry.name === 'spec.md') {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async searchForFunction(codeDir: string, functionName: string): Promise<boolean> {
    // Simplified: use ripgrep or glob + AST parsing
    // For now, just check if the function name appears in any .ts file
    const tsFiles = await this.findTSFiles(codeDir);

    for (const file of tsFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes(`function ${functionName}`) || content.includes(`const ${functionName}`)) {
        return true;
      }
    }

    return false;
  }

  private async findTSFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await this.findTSFiles(fullPath)));
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
```

### Step 3: Write Tests

**File:** `mcp-server/src/analyzers/__tests__/gap-analyzer.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { SpecGapAnalyzer } from '../gap-analyzer';
import { mkdtempSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SpecGapAnalyzer', () => {
  it('should detect missing function', async () => {
    const analyzer = new SpecGapAnalyzer();

    // Create temp spec file
    const tempDir = mkdtempSync(join(tmpdir(), 'spec-test-'));
    const specPath = join(tempDir, 'spec.md');
    writeFileSync(
      specPath,
      `
# Test Spec

## Functional Requirements

### FR1: User Authentication
The system MUST authenticate users.
      `.trim()
    );

    const gaps = await analyzer.analyzeSpec(specPath, tempDir);

    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].requirement).toBe('FR1');
    expect(gaps[0].status).toBe('missing');
  });

  it('should detect implemented function', async () => {
    // Similar test but with implementation present
  });
});
```

### Step 4: Run Tests

```bash
npm test -- gap-analyzer
```

---

## Phase 2: Feature Brainstorming

### Step 1: Create FeatureBrainstormer

**File:** `mcp-server/src/brainstorming/feature-brainstormer.ts`

```typescript
import type { DesirableFeature, ScoredFeature, ProjectContext, FeatureCategory } from '../types';

export class FeatureBrainstormer {
  /**
   * Brainstorm features using AI
   */
  async brainstormFeatures(context: ProjectContext): Promise<DesirableFeature[]> {
    const categories: FeatureCategory[] = [
      'core-functionality',
      'user-experience',
      'integration',
      'performance',
      'security',
      'developer-experience',
      'documentation',
      'testing',
    ];

    const allFeatures: DesirableFeature[] = [];

    for (const category of categories) {
      const features = await this.brainstormCategory(category, context);
      allFeatures.push(...features);
    }

    return allFeatures;
  }

  /**
   * Brainstorm features for a specific category
   */
  async brainstormCategory(
    category: FeatureCategory,
    context: ProjectContext
  ): Promise<DesirableFeature[]> {
    const prompt = this.buildPrompt(category, context);

    // Use MCP to call Claude
    // For now, return placeholder
    const aiResponse = await this.callAI(prompt);

    return this.parseAIResponse(aiResponse, category);
  }

  /**
   * Score features
   */
  async scoreFeatures(
    features: DesirableFeature[],
    context: ProjectContext
  ): Promise<ScoredFeature[]> {
    return features.map(feature => ({
      ...feature,
      impactScore: this.scoreImpact(feature),
      effortScore: this.scoreEffort(feature),
      roi: this.calculateROI(feature),
      strategicValue: this.scoreStrategicValue(feature, context),
      riskScore: this.scoreRisk(feature),
      priorityScore: 0,
      scoringDetails: {
        impactFactors: [],
        effortFactors: [],
        strategicFactors: [],
        riskFactors: [],
      },
    }));
  }

  // Helper methods
  private buildPrompt(category: FeatureCategory, context: ProjectContext): string {
    return `
Given a ${context.language} project (${context.name}) with technology stack: ${context.techStack.join(', ')},
brainstorm 5-10 desirable features in the "${category}" category.

Current features:
${context.currentFeatures.map(f => `- ${f}`).join('\n')}

Suggest features that would:
- Enhance ${category.replace('-', ' ')}
- Fill gaps relative to best practices
- Provide high user value

Return JSON array with: name, description, rationale, effort, dependencies.
    `.trim();
  }

  private async callAI(prompt: string): Promise<string> {
    // Placeholder: integrate with Claude via MCP
    return '[]';
  }

  private parseAIResponse(response: string, category: FeatureCategory): DesirableFeature[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((item: any, index: number) => ({
        id: `${category}-${index}`,
        category,
        name: item.name,
        description: item.description,
        rationale: item.rationale,
        value: item.value || 'Unspecified',
        effort: { hours: 0, confidence: 'low', method: 'placeholder', range: { optimistic: 0, realistic: 0, pessimistic: 0 }, display: 'TBD' },
        priority: 'P2',
        dependencies: item.dependencies || [],
        alternatives: [],
        risks: [],
        source: 'ai-generated',
      }));
    } catch {
      return [];
    }
  }

  private scoreImpact(feature: DesirableFeature): number {
    // Placeholder: implement impact scoring logic
    return 5;
  }

  private scoreEffort(feature: DesirableFeature): number {
    // Placeholder: implement effort scoring logic
    return 5;
  }

  private calculateROI(feature: DesirableFeature): number {
    return this.scoreImpact(feature) / this.scoreEffort(feature);
  }

  private scoreStrategicValue(feature: DesirableFeature, context: ProjectContext): number {
    // Placeholder
    return 5;
  }

  private scoreRisk(feature: DesirableFeature): number {
    // Placeholder
    return 5;
  }
}
```

---

## Phase 3: Roadmap Generation

### Step 1: Create RoadmapGenerator

**File:** `mcp-server/src/roadmap/roadmap-generator.ts`

```typescript
import type { Roadmap, RoadmapItem, Phase, SpecGap, FeatureGap, ScoredFeature, ProjectContext } from '../types';

export class RoadmapGenerator {
  /**
   * Generate complete roadmap
   */
  async generateRoadmap(
    gaps: (SpecGap | FeatureGap)[],
    features: ScoredFeature[],
    context: ProjectContext
  ): Promise<Roadmap> {
    // 1. Convert gaps and features to roadmap items
    const items = this.createRoadmapItems(gaps, features);

    // 2. Prioritize items
    const prioritized = await this.prioritize(items);

    // 3. Create phases
    const phases = await this.createPhases(prioritized);

    // 4. Estimate timeline
    const timeline = this.estimateTimeline(phases);

    return {
      metadata: {
        generated: new Date(),
        projectName: context.name,
        projectPath: context.path,
        toolVersion: '1.0.0',
        analysisBasis: {
          specsAnalyzed: 0,
          gapsFound: gaps.length,
          featuresIdentified: features.length,
          totalItems: items.length,
        },
      },
      summary: {
        overview: 'Strategic roadmap generated from gap analysis',
        currentState: '',
        targetState: '',
        completion: {} as any,
        highlights: [],
        nextSteps: [],
      },
      phases,
      allItems: items,
      priorities: this.groupByPriority(items),
      timeline,
      risks: [],
      dependencies: [],
      successCriteria: [],
      recommendations: [],
    };
  }

  // Implement helper methods...
}
```

---

## Phase 4: Export

### Step 1: Create MarkdownExporter

**File:** `mcp-server/src/exporters/markdown-exporter.ts`

```typescript
import Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import type { Roadmap } from '../types';

export class MarkdownExporter {
  async exportMarkdown(roadmap: Roadmap, outputPath?: string): Promise<string> {
    const template = await this.loadTemplate();
    const compiled = Handlebars.compile(template);
    const markdown = compiled(roadmap);

    if (outputPath) {
      await fs.writeFile(outputPath, markdown);
    }

    return markdown;
  }

  private async loadTemplate(): Promise<string> {
    // Load template from templates/roadmap.hbs
    return `
# {{metadata.projectName}} Strategic Roadmap

**Generated:** {{metadata.generated}}
**Total Items:** {{metadata.analysisBasis.totalItems}}

{{#each phases}}
## {{name}} ({{duration}})
**Goal:** {{goal}}

| Priority | Item | Effort |
|----------|------|--------|
{{#each items}}
| {{priority}} | {{title}} | {{effort.display}} |
{{/each}}
{{/each}}
    `.trim();
  }
}
```

---

## MCP Tool Integration

### Create MCP Tool

**File:** `mcp-server/src/tools/generate-roadmap.ts`

```typescript
import { McpToolInput, McpToolResult } from '../types';
import { SpecGapAnalyzer } from '../analyzers/gap-analyzer';
import { FeatureBrainstormer } from '../brainstorming/feature-brainstormer';
import { RoadmapGenerator } from '../roadmap/roadmap-generator';
import { MarkdownExporter } from '../exporters/markdown-exporter';

export async function generateRoadmapTool(input: McpToolInput): Promise<McpToolResult> {
  const { directory = process.cwd(), outputFormat = 'markdown' } = input;

  try {
    // 1. Analyze gaps
    const gapAnalyzer = new SpecGapAnalyzer();
    const gaps = await gapAnalyzer.analyzeSpecs(`${directory}/specs`, directory);

    // 2. Brainstorm features
    const brainstormer = new FeatureBrainstormer();
    const context = await loadContext(directory);
    const features = await brainstormer.brainstormFeatures(context);
    const scoredFeatures = await brainstormer.scoreFeatures(features, context);

    // 3. Generate roadmap
    const generator = new RoadmapGenerator();
    const roadmap = await generator.generateRoadmap(gaps, scoredFeatures, context);

    // 4. Export
    const exporter = new MarkdownExporter();
    const markdown = await exporter.exportMarkdown(roadmap, `${directory}/ROADMAP.md`);

    return {
      content: [{
        type: 'text',
        text: `✅ Roadmap generated successfully!\n\n${markdown.substring(0, 500)}...\n\nFull roadmap saved to: ${directory}/ROADMAP.md`,
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error generating roadmap: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function loadContext(directory: string): Promise<any> {
  // Load project context
  return {
    path: directory,
    name: 'StackShift',
    language: 'TypeScript',
    techStack: [],
    frameworks: [],
    currentFeatures: [],
    route: 'brownfield',
    linesOfCode: 10000,
    fileCount: 100,
    specs: [],
    docs: [],
  };
}
```

---

## Testing Strategy

### Run Full Test Suite

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing

```bash
# Test on StackShift itself
cd /path/to/stackshift
claude "/stackshift:generate-roadmap"

# Verify output
cat ROADMAP.md
```

---

## Common Pitfalls

### 1. AST Parsing Performance
**Problem:** Parsing large codebases is slow
**Solution:** Use caching, parallel processing, and early termination

### 2. AI Brainstorming Hallucinations
**Problem:** AI suggests irrelevant features
**Solution:** Use category-specific prompts, filtering, and confidence scores

### 3. Circular Dependencies
**Problem:** Roadmap items have circular dependencies
**Solution:** Detect and report circular dependencies, break cycles

### 4. Inaccurate Effort Estimates
**Problem:** Effort estimates are wildly wrong
**Solution:** Provide ranges (optimistic/realistic/pessimistic), track actual vs estimated

---

## Next Steps

1. ✅ Complete Phase 1 (Gap Detection) - 4-5 weeks
2. ✅ Complete Phase 2 (Feature Brainstorming) - 3-4 weeks
3. ✅ Complete Phase 3 (Roadmap Generation) - 3-4 weeks
4. ✅ Complete Phase 4 (Export) - 2-3 weeks
5. ✅ Integration testing - 1 week
6. ✅ User testing - 1 week
7. ✅ Launch! 🚀

---

## Resources

- **Spec:** [spec.md](./spec.md)
- **Impl Plan:** [impl-plan.md](./impl-plan.md)
- **Research:** [research.md](./research.md)
- **Data Model:** [data-model.md](./data-model.md)
- **Contracts:** [contracts/README.md](./contracts/README.md)

---

**Happy coding! 🎉**

For questions or issues, create a GitHub issue or reach out to the team.
