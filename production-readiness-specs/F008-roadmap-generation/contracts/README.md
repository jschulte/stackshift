# API Contracts: F008 Roadmap Generation

**Feature:** F008-roadmap-generation
**Date:** 2025-11-17
**Status:** ✅ Complete

---

## Overview

This directory contains the API contracts for the roadmap generation system. These contracts define the public interfaces for analyzers, generators, and exporters.

---

## Core Interfaces

### 1. Gap Analyzers

#### ISpecGapAnalyzer

Analyzes specifications against codebase to identify implementation gaps.

```typescript
interface ISpecGapAnalyzer {
  /**
   * Analyze all specifications in a directory
   * @param specsDir - Path to specs directory (specs/ or production-readiness-specs/)
   * @param codeDir - Path to codebase root
   * @returns Array of spec gaps found
   */
  analyzeSpecs(specsDir: string, codeDir: string): Promise<SpecGap[]>;

  /**
   * Analyze a single specification file
   * @param specPath - Path to spec.md file
   * @param codeDir - Path to codebase root
   * @returns Array of gaps found in this spec
   */
  analyzeSpec(specPath: string, codeDir: string): Promise<SpecGap[]>;

  /**
   * Verify a specific requirement is implemented
   * @param requirement - The requirement to verify
   * @param codeDir - Path to codebase root
   * @returns Gap details or null if implemented
   */
  verifyRequirement(requirement: Requirement, codeDir: string): Promise<SpecGap | null>;
}
```

#### IFeatureGapAnalyzer

Analyzes advertised features against actual capabilities.

```typescript
interface IFeatureGapAnalyzer {
  /**
   * Analyze documentation files for feature claims
   * @param docsDir - Path to documentation directory
   * @param codeDir - Path to codebase root
   * @returns Array of feature gaps found
   */
  analyzeFeatures(docsDir: string, codeDir: string): Promise<FeatureGap[]>;

  /**
   * Verify a specific claim
   * @param claim - The claim to verify
   * @param codeDir - Path to codebase root
   * @returns Feature gap details or null if accurate
   */
  verifyClaim(claim: DocumentationClaim, codeDir: string): Promise<FeatureGap | null>;

  /**
   * Calculate accuracy score for documentation
   * @param docsDir - Path to documentation
   * @param codeDir - Path to codebase
   * @returns Overall accuracy score (0-100)
   */
  calculateAccuracy(docsDir: string, codeDir: string): Promise<number>;
}
```

#### ICompletenessAnalyzer

Assesses overall application completeness.

```typescript
interface ICompletenessAnalyzer {
  /**
   * Analyze overall completeness
   * @param projectDir - Path to project root
   * @param specs - Parsed specifications
   * @param gaps - Identified gaps
   * @returns Completeness assessment
   */
  assessCompleteness(
    projectDir: string,
    specs: ParsedSpec[],
    gaps: SpecGap[]
  ): Promise<CompletenessAssessment>;

  /**
   * Calculate production readiness score
   * @param assessment - Completeness assessment
   * @returns Production readiness score (0-100)
   */
  calculateProductionReadiness(assessment: CompletenessAssessment): number;
}
```

---

### 2. Feature Brainstormer

#### IFeatureBrainstormer

Brainstorms desirable features using AI and analysis.

```typescript
interface IFeatureBrainstormer {
  /**
   * Brainstorm features for all categories
   * @param context - Project context
   * @param config - Brainstorming configuration
   * @returns Array of desirable features
   */
  brainstormFeatures(
    context: ProjectContext,
    config?: BrainstormConfig
  ): Promise<DesirableFeature[]>;

  /**
   * Brainstorm features for a specific category
   * @param category - Feature category
   * @param context - Project context
   * @returns Array of desirable features
   */
  brainstormCategory(
    category: FeatureCategory,
    context: ProjectContext
  ): Promise<DesirableFeature[]>;

  /**
   * Score and prioritize features
   * @param features - Features to score
   * @param context - Project context
   * @returns Scored and prioritized features
   */
  scoreFeatures(
    features: DesirableFeature[],
    context: ProjectContext
  ): Promise<ScoredFeature[]>;
}

interface BrainstormConfig {
  categories?: FeatureCategory[];
  maxFeaturesPerCategory?: number;
  includeCompetitiveAnalysis?: boolean;
  includeBestPractices?: boolean;
}
```

---

### 3. Roadmap Generator

#### IRoadmapGenerator

Generates complete roadmaps from gaps and features.

```typescript
interface IRoadmapGenerator {
  /**
   * Generate complete roadmap
   * @param gaps - Identified gaps
   * @param features - Brainstormed features
   * @param context - Project context
   * @param config - Generation configuration
   * @returns Complete roadmap
   */
  generateRoadmap(
    gaps: (SpecGap | FeatureGap)[],
    features: ScoredFeature[],
    context: ProjectContext,
    config?: RoadmapConfig
  ): Promise<Roadmap>;

  /**
   * Create phases from roadmap items
   * @param items - Roadmap items
   * @param config - Phasing strategy config
   * @returns Organized phases
   */
  createPhases(items: RoadmapItem[], config?: PhaseConfig): Promise<Phase[]>;

  /**
   * Estimate timeline for roadmap
   * @param roadmap - The roadmap
   * @param teamSize - Number of developers
   * @returns Timeline estimate
   */
  estimateTimeline(roadmap: Roadmap, teamSize: number): Timeline;
}

interface PhaseConfig {
  strategy: 'priority' | 'timeline' | 'dependency';
  maxPhases?: number;
  maxItemsPerPhase?: number;
}
```

#### IPrioritizer

Prioritizes roadmap items.

```typescript
interface IPrioritizer {
  /**
   * Assign priorities to roadmap items
   * @param items - Items to prioritize
   * @param context - Project context
   * @returns Prioritized items
   */
  prioritize(items: RoadmapItem[], context: ProjectContext): Promise<RoadmapItem[]>;

  /**
   * Resolve dependencies and order items
   * @param items - Items with dependencies
   * @returns Topologically sorted items
   */
  resolveDependencies(items: RoadmapItem[]): Promise<RoadmapItem[]>;

  /**
   * Detect circular dependencies
   * @param items - Items to check
   * @returns Circular dependency chains (empty if none)
   */
  detectCircularDependencies(items: RoadmapItem[]): string[][];
}
```

---

### 4. Exporters

#### IRoadmapExporter

Exports roadmaps to various formats.

```typescript
interface IRoadmapExporter {
  /**
   * Export roadmap to specified format
   * @param roadmap - The roadmap to export
   * @param format - Export format
   * @param options - Export options
   * @returns Export result
   */
  export(
    roadmap: Roadmap,
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<ExportResult>;

  /**
   * Export to Markdown (ROADMAP.md)
   * @param roadmap - The roadmap
   * @param templatePath - Optional custom template
   * @returns Markdown content
   */
  exportMarkdown(roadmap: Roadmap, templatePath?: string): Promise<string>;

  /**
   * Export to JSON
   * @param roadmap - The roadmap
   * @returns JSON string
   */
  exportJSON(roadmap: Roadmap): Promise<string>;

  /**
   * Export to CSV
   * @param roadmap - The roadmap
   * @returns CSV content
   */
  exportCSV(roadmap: Roadmap): Promise<string>;

  /**
   * Generate GitHub issues
   * @param roadmap - The roadmap
   * @param options - GitHub options
   * @returns Array of GitHub issues
   */
  exportGitHubIssues(
    roadmap: Roadmap,
    options?: GitHubExportOptions
  ): Promise<GitHubIssue[]>;
}

interface GitHubExportOptions {
  repository?: string;
  milestoneName?: string;
  defaultAssignee?: string;
  labelPrefix?: string;
  dryRun?: boolean;
}
```

---

### 5. Progress Tracker

#### IProgressTracker

Tracks roadmap progress over time.

```typescript
interface IProgressTracker {
  /**
   * Load current progress from roadmap file
   * @param roadmapPath - Path to ROADMAP.md
   * @returns Current progress
   */
  loadProgress(roadmapPath: string): Promise<RoadmapProgress>;

  /**
   * Update progress with new roadmap
   * @param oldProgress - Previous progress
   * @param newRoadmap - Updated roadmap
   * @returns Updated progress
   */
  updateProgress(
    oldProgress: RoadmapProgress,
    newRoadmap: Roadmap
  ): Promise<RoadmapProgress>;

  /**
   * Calculate delta between roadmap versions
   * @param oldRoadmap - Previous roadmap
   * @param newRoadmap - Current roadmap
   * @returns Delta with changes
   */
  calculateDelta(oldRoadmap: Roadmap, newRoadmap: Roadmap): Promise<RoadmapDelta>;

  /**
   * Calculate velocity (items completed per week)
   * @param progress - Current progress
   * @returns Velocity
   */
  calculateVelocity(progress: RoadmapProgress): number;

  /**
   * Estimate completion date based on velocity
   * @param progress - Current progress
   * @returns Estimated completion date
   */
  estimateCompletion(progress: RoadmapProgress): Date;
}
```

---

### 6. MCP Tool Interface

#### stackshift_generate_roadmap

MCP tool for generating roadmaps.

```typescript
/**
 * MCP Tool: Generate strategic roadmap from gap analysis
 */
interface GenerateRoadmapTool {
  name: 'stackshift_generate_roadmap';

  description: `
Analyzes gaps between specifications and implementation,
brainstorms desirable features, and generates a prioritized
strategic roadmap with effort estimates and timelines.
  `;

  inputSchema: {
    type: 'object';
    properties: {
      directory: {
        type: 'string';
        description: 'Project directory to analyze (defaults to current directory)';
      };
      outputFormat: {
        type: 'string';
        enum: ['markdown', 'json', 'csv', 'all'];
        description: 'Export format (defaults to markdown)';
        default: 'markdown';
      };
      includeFeatureBrainstorming: {
        type: 'boolean';
        description: 'Whether to brainstorm desirable features';
        default: true;
      };
      categories: {
        type: 'array';
        items: { type: 'string' };
        description: 'Feature categories to brainstorm';
      };
      confidenceThreshold: {
        type: 'number';
        minimum: 0;
        maximum: 100;
        description: 'Minimum confidence for gap inclusion (0-100)';
        default: 50;
      };
      teamSize: {
        type: 'number';
        minimum: 1;
        maximum: 10;
        description: 'Team size for timeline estimation';
        default: 2;
      };
    };
    required: ['directory'];
  };

  /**
   * Execute the roadmap generation
   */
  execute(args: GenerateRoadmapArgs): Promise<GenerateRoadmapResult>;
}

interface GenerateRoadmapArgs {
  directory: string;
  outputFormat?: ExportFormat | 'all';
  includeFeatureBrainstorming?: boolean;
  categories?: FeatureCategory[];
  confidenceThreshold?: number;
  teamSize?: number;
}

interface GenerateRoadmapResult {
  success: boolean;
  roadmap?: Roadmap;
  exports?: {
    markdown?: string;
    json?: string;
    csv?: string;
  };
  summary: {
    specsAnalyzed: number;
    gapsFound: number;
    featuresIdentified: number;
    totalItems: number;
    estimatedWeeks: number;
  };
  errors?: string[];
}
```

---

## Error Handling

### Error Types

```typescript
/**
 * Base error for roadmap generation
 */
class RoadmapGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RoadmapGenerationError';
  }
}

/**
 * Spec parsing errors
 */
class SpecParsingError extends RoadmapGenerationError {
  constructor(specPath: string, details: string) {
    super(
      `Failed to parse spec at ${specPath}: ${details}`,
      'SPEC_PARSING_ERROR',
      { specPath, details }
    );
  }
}

/**
 * Gap detection errors
 */
class GapDetectionError extends RoadmapGenerationError {
  constructor(requirement: string, details: string) {
    super(
      `Failed to detect gap for ${requirement}: ${details}`,
      'GAP_DETECTION_ERROR',
      { requirement, details }
    );
  }
}

/**
 * Export errors
 */
class ExportError extends RoadmapGenerationError {
  constructor(format: ExportFormat, details: string) {
    super(
      `Failed to export to ${format}: ${details}`,
      'EXPORT_ERROR',
      { format, details }
    );
  }
}
```

---

## Usage Examples

### Example 1: Basic Roadmap Generation

```typescript
import { GapAnalyzer, FeatureBrainstormer, RoadmapGenerator, RoadmapExporter } from './roadmap';

async function generateRoadmap(projectDir: string) {
  // 1. Analyze gaps
  const gapAnalyzer = new GapAnalyzer();
  const specGaps = await gapAnalyzer.analyzeSpecs(`${projectDir}/specs`, projectDir);
  const featureGaps = await gapAnalyzer.analyzeFeatures(`${projectDir}/docs`, projectDir);

  // 2. Brainstorm features
  const brainstormer = new FeatureBrainstormer();
  const context = await loadProjectContext(projectDir);
  const features = await brainstormer.brainstormFeatures(context);

  // 3. Generate roadmap
  const generator = new RoadmapGenerator();
  const roadmap = await generator.generateRoadmap(
    [...specGaps, ...featureGaps],
    features,
    context
  );

  // 4. Export
  const exporter = new RoadmapExporter();
  await exporter.exportMarkdown(roadmap, `${projectDir}/ROADMAP.md`);

  return roadmap;
}
```

### Example 2: Custom Configuration

```typescript
async function generateCustomRoadmap(projectDir: string) {
  const config: RoadmapConfig = {
    features: {
      astParsing: true,
      aiBrainstorming: true,
      multiLanguageSupport: false,
      githubIntegration: true,
    },
    gapDetection: {
      confidenceThreshold: 70, // Only high-confidence gaps
      includeStubs: true,
      includePartial: true,
      languageSupport: ['javascript', 'typescript'],
    },
    brainstorming: {
      enabled: true,
      categories: ['core-functionality', 'user-experience', 'integration'],
      maxFeaturesPerCategory: 10,
    },
    roadmap: {
      maxPhases: 4,
      phaseStrategy: 'priority',
      includeRisks: true,
      includeDependencies: true,
    },
  };

  const roadmap = await generateRoadmapWithConfig(projectDir, config);
  return roadmap;
}
```

### Example 3: Progress Tracking

```typescript
async function trackProgress(projectDir: string) {
  const tracker = new ProgressTracker();

  // Load previous progress
  const oldProgress = await tracker.loadProgress(`${projectDir}/ROADMAP.md`);

  // Generate new roadmap
  const newRoadmap = await generateRoadmap(projectDir);

  // Calculate delta
  const delta = await tracker.calculateDelta(oldProgress.roadmap, newRoadmap);

  console.log(`Added: ${delta.added.length} items`);
  console.log(`Completed: ${delta.completed.length} items`);
  console.log(`Regressions: ${delta.regressions.length} items`);

  // Update progress
  const newProgress = await tracker.updateProgress(oldProgress, newRoadmap);

  console.log(`Completion: ${newProgress.percentComplete}%`);
  console.log(`Velocity: ${newProgress.velocity} items/week`);
  console.log(`ETA: ${newProgress.estimatedCompletion.toLocaleDateString()}`);
}
```

---

## Testing Contracts

### Mock Implementations

```typescript
/**
 * Mock gap analyzer for testing
 */
class MockGapAnalyzer implements ISpecGapAnalyzer {
  private mockGaps: SpecGap[] = [];

  setMockGaps(gaps: SpecGap[]) {
    this.mockGaps = gaps;
  }

  async analyzeSpecs(specsDir: string, codeDir: string): Promise<SpecGap[]> {
    return this.mockGaps;
  }

  async analyzeSpec(specPath: string, codeDir: string): Promise<SpecGap[]> {
    return this.mockGaps.filter(g => g.spec === specPath);
  }

  async verifyRequirement(requirement: Requirement, codeDir: string): Promise<SpecGap | null> {
    return this.mockGaps.find(g => g.requirement === requirement.id) || null;
  }
}
```

---

## Status

✅ **All contracts defined**
- Gap analyzers
- Feature brainstormer
- Roadmap generator
- Exporters
- Progress tracker
- MCP tool interface
- Error types
- Usage examples

**Next Step:** Implement these interfaces in Phase 1
