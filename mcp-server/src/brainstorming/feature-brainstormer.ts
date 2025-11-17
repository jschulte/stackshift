/**
 * Feature Brainstormer
 * AI-powered brainstorming of desirable features across 8 categories
 * Implements User Story 3 (FR3): Desirable Feature Brainstorming
 */

import { ScoringEngine } from './scoring-engine.js';
import type {
  DesirableFeature,
  ScoredFeature,
  ProjectContext,
  FeatureCategory,
} from '../types/roadmap.js';

/**
 * Brainstorming Configuration
 */
export interface BrainstormConfig {
  /**
   * Categories to brainstorm (defaults to all 8)
   */
  categories?: FeatureCategory[];

  /**
   * Number of features to generate per category
   */
  featuresPerCategory?: number;

  /**
   * Use AI for brainstorming (requires MCP context)
   */
  useAI?: boolean;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<BrainstormConfig> = {
  categories: [
    'core-functionality',
    'developer-experience',
    'user-experience',
    'performance',
    'security',
    'testing',
    'documentation',
    'integrations',
  ],
  featuresPerCategory: 5,
  useAI: false, // Default to false since AI integration requires setup
  verbose: false,
};

/**
 * Feature categories and their descriptions
 */
const CATEGORY_DESCRIPTIONS: Record<FeatureCategory, string> = {
  'core-functionality': 'Core features that deliver primary business value',
  'developer-experience': 'Tools and features to improve developer productivity',
  'user-experience': 'Enhancements to user interface and user workflows',
  'performance': 'Optimizations for speed, scalability, and efficiency',
  'security': 'Security hardening, vulnerability fixes, and compliance',
  'testing': 'Testing infrastructure, coverage, and quality assurance',
  'documentation': 'User guides, API docs, and developer documentation',
  'integrations': 'Third-party integrations and ecosystem connections',
};

/**
 * Feature Brainstormer
 * Generates strategic feature suggestions using AI and scoring
 */
export class FeatureBrainstormer {
  private config: Required<BrainstormConfig>;
  private scoringEngine: ScoringEngine;

  constructor(config: BrainstormConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scoringEngine = new ScoringEngine({ verbose: this.config.verbose });
  }

  /**
   * Brainstorm features across all categories
   * @param context - Project context
   * @returns Scored features sorted by priority
   */
  async brainstormFeatures(context: ProjectContext): Promise<ScoredFeature[]> {
    this.log(`Brainstorming features for ${context.name}`);
    this.log(`Categories: ${this.config.categories.join(', ')}`);

    const allFeatures: DesirableFeature[] = [];

    for (const category of this.config.categories) {
      this.log(`Brainstorming ${category}...`);
      const categoryFeatures = await this.brainstormCategory(category, context);
      allFeatures.push(...categoryFeatures);
    }

    this.log(`Generated ${allFeatures.length} features`);

    // Deduplicate
    const deduplicated = this.deduplicateFeatures(allFeatures);
    this.log(`After deduplication: ${deduplicated.length} features`);

    // Score features
    const scored = await this.scoringEngine.scoreFeatures(deduplicated, context);

    return scored;
  }

  /**
   * Brainstorm features for a specific category
   * @param category - Feature category
   * @param context - Project context
   * @returns Array of desirable features
   */
  async brainstormCategory(
    category: FeatureCategory,
    context: ProjectContext
  ): Promise<DesirableFeature[]> {
    if (this.config.useAI) {
      // AI-powered brainstorming (requires MCP context)
      try {
        return await this.brainstormWithAI(category, context);
      } catch (error) {
        this.log(`AI brainstorming failed, falling back to heuristic: ${error}`);
        return this.brainstormHeuristic(category, context);
      }
    } else {
      // Heuristic-based brainstorming
      return this.brainstormHeuristic(category, context);
    }
  }

  /**
   * AI-powered brainstorming using Claude via MCP
   * @param category - Feature category
   * @param context - Project context
   * @returns Array of features
   */
  private async brainstormWithAI(
    category: FeatureCategory,
    context: ProjectContext
  ): Promise<DesirableFeature[]> {
    const prompt = this.buildPrompt(category, context);

    // Note: In actual MCP tool environment, Claude context would be available
    // For now, this is a placeholder that would need to be called from MCP tool
    this.log(`Would call AI with prompt for ${category}`);

    // Fallback to heuristic for standalone use
    return this.brainstormHeuristic(category, context);
  }

  /**
   * Build AI prompt for category brainstorming
   * @param category - Feature category
   * @param context - Project context
   * @returns Prompt string
   */
  buildPrompt(category: FeatureCategory, context: ProjectContext): string {
    const categoryDesc = CATEGORY_DESCRIPTIONS[category];

    return `You are a strategic product consultant helping to identify desirable features for a software project.

**Project:** ${context.name}
**Tech Stack:** ${context.techStack.join(', ')}
**Frameworks:** ${context.frameworks.join(', ') || 'None'}
**Lines of Code:** ${context.linesOfCode.toLocaleString()}
**Route:** ${context.route}

**Current Features:**
${context.currentFeatures.slice(0, 10).map(f => `- ${f}`).join('\n')}

**Category:** ${category}
**Description:** ${categoryDesc}

Please suggest ${this.config.featuresPerCategory} desirable features in the **${category}** category that would make this project more complete, robust, and valuable.

For each feature, provide:
1. **Title:** Clear, concise feature name
2. **Description:** 2-3 sentence explanation of what it does and why it's valuable
3. **Example:** Concrete example or use case
4. **Strategic Alignment:** How it aligns with project goals

Return your response as a JSON array of feature objects.`;
  }

  /**
   * Heuristic-based brainstorming (no AI required)
   * @param category - Feature category
   * @param context - Project context
   * @returns Array of features
   */
  private brainstormHeuristic(
    category: FeatureCategory,
    context: ProjectContext
  ): Promise<DesirableFeature[]> {
    const features: DesirableFeature[] = [];

    // Generate features based on category and project context
    const generators: Record<FeatureCategory, () => DesirableFeature[]> = {
      'core-functionality': () => this.generateCoreFunctionalityFeatures(context),
      'developer-experience': () => this.generateDeveloperExperienceFeatures(context),
      'user-experience': () => this.generateUserExperienceFeatures(context),
      'performance': () => this.generatePerformanceFeatures(context),
      'security': () => this.generateSecurityFeatures(context),
      'testing': () => this.generateTestingFeatures(context),
      'documentation': () => this.generateDocumentationFeatures(context),
      'integrations': () => this.generateIntegrationFeatures(context),
    };

    const categoryFeatures = generators[category]();
    features.push(...categoryFeatures.slice(0, this.config.featuresPerCategory));

    return Promise.resolve(features);
  }

  /**
   * Generate core functionality features
   */
  private generateCoreFunctionalityFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Configuration Management System',
        description: 'Centralized configuration management with validation, environment-specific configs, and hot-reloading. Reduces configuration errors and improves deployment flexibility.',
        category: 'core-functionality',
        example: 'Add config/default.json, config/production.json with schema validation',
        strategicAlignment: ['Operational excellence', 'Deployment flexibility'],
        dependencies: [],
      },
      {
        title: 'Plugin System',
        description: 'Extensible plugin architecture allowing third-party extensions without modifying core code. Enables community contributions and customization.',
        category: 'core-functionality',
        example: 'Plugin loader that discovers and initializes plugins from plugins/ directory',
        strategicAlignment: ['Extensibility', 'Community growth'],
        dependencies: [],
      },
      {
        title: 'State Management',
        description: 'Centralized state management with persistence, versioning, and recovery. Prevents data loss and enables resumable operations.',
        category: 'core-functionality',
        example: 'State store with save/load/recover methods and automatic persistence',
        strategicAlignment: ['Reliability', 'User experience'],
        dependencies: [],
      },
      {
        title: 'Batch Operations',
        description: 'Support for batch processing multiple items with progress tracking and rollback. Improves efficiency for bulk operations.',
        category: 'core-functionality',
        example: 'Process 100 files with progress bar and automatic retry on failures',
        strategicAlignment: ['Productivity', 'Scale'],
        dependencies: [],
      },
      {
        title: 'Webhook Support',
        description: 'Webhook system for real-time event notifications to external systems. Enables integration with third-party tools and automation workflows.',
        category: 'core-functionality',
        example: 'Send POST to configured URL when specific events occur',
        strategicAlignment: ['Integration', 'Automation'],
        dependencies: [],
      },
    ];
  }

  /**
   * Generate developer experience features
   */
  private generateDeveloperExperienceFeatures(context: ProjectContext): DesirableFeature[] {
    const features: DesirableFeature[] = [
      {
        title: 'CLI Debug Mode',
        description: 'Comprehensive debug mode with verbose logging, trace output, and performance profiling. Helps developers troubleshoot issues quickly.',
        category: 'developer-experience',
        example: 'Run with --debug flag to see detailed execution traces',
        strategicAlignment: ['Developer productivity', 'Debugging'],
        dependencies: [],
      },
      {
        title: 'Hot Module Reload',
        description: 'Automatic code reloading during development without restarting the process. Dramatically speeds up development iteration cycles.',
        category: 'developer-experience',
        example: 'Watch mode that reloads changed modules instantly',
        strategicAlignment: ['Developer productivity', 'Development speed'],
        dependencies: [],
      },
      {
        title: 'Interactive REPL',
        description: 'Read-Eval-Print-Loop for interactive exploration and testing. Allows developers to experiment with APIs without writing test scripts.',
        category: 'developer-experience',
        example: 'Launch REPL with project context pre-loaded',
        strategicAlignment: ['Developer productivity', 'Experimentation'],
        dependencies: [],
      },
      {
        title: 'Code Generation Templates',
        description: 'Scaffolding templates for common patterns and boilerplate code. Reduces repetitive work and ensures consistency.',
        category: 'developer-experience',
        example: 'Generate new feature skeleton with tests and docs',
        strategicAlignment: ['Developer productivity', 'Consistency'],
        dependencies: [],
      },
    ];

    if (context.language === 'typescript') {
      features.push({
        title: 'Type-Safe Builder Pattern',
        description: 'Fluent builder APIs with full TypeScript type safety. Provides excellent autocomplete and compile-time validation.',
        category: 'developer-experience',
        example: 'Builder().setOption(x).setConfig(y).build() with type checking',
        strategicAlignment: ['Type safety', 'Developer experience'],
        dependencies: [],
      });
    }

    return features;
  }

  /**
   * Generate user experience features
   */
  private generateUserExperienceFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Progress Indicators',
        description: 'Visual progress bars and status indicators for long-running operations. Keeps users informed and reduces uncertainty.',
        category: 'user-experience',
        example: 'Show spinner with percentage completion for file processing',
        strategicAlignment: ['User experience', 'Transparency'],
        dependencies: [],
      },
      {
        title: 'Interactive Prompts',
        description: 'User-friendly interactive prompts with validation and helpful defaults. Improves command-line UX and reduces errors.',
        category: 'user-experience',
        example: 'Ask questions with autocomplete, validation, and default values',
        strategicAlignment: ['User experience', 'Error prevention'],
        dependencies: [],
      },
      {
        title: 'Colorized Output',
        description: 'Color-coded terminal output for better readability and quick scanning. Helps users identify errors, warnings, and success messages instantly.',
        category: 'user-experience',
        example: 'Errors in red, warnings in yellow, success in green',
        strategicAlignment: ['User experience', 'Accessibility'],
        dependencies: [],
      },
      {
        title: 'Undo/Redo Support',
        description: 'Allow users to undo and redo operations safely. Reduces fear of making mistakes and encourages exploration.',
        category: 'user-experience',
        example: 'Ctrl+Z to undo last operation, with operation history',
        strategicAlignment: ['User experience', 'Safety'],
        dependencies: ['State Management'],
      },
    ];
  }

  /**
   * Generate performance features
   */
  private generatePerformanceFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Caching Layer',
        description: 'Intelligent caching with TTL and invalidation strategies. Dramatically improves performance for repeated operations.',
        category: 'performance',
        example: 'Cache expensive computations with automatic invalidation',
        strategicAlignment: ['Performance', 'User experience'],
        dependencies: [],
      },
      {
        title: 'Parallel Processing',
        description: 'Process multiple items concurrently using worker pools. Reduces total execution time by leveraging multiple CPU cores.',
        category: 'performance',
        example: 'Process files in parallel with configurable worker count',
        strategicAlignment: ['Performance', 'Scale'],
        dependencies: [],
      },
      {
        title: 'Lazy Loading',
        description: 'Load resources and modules on-demand instead of upfront. Improves startup time and memory usage.',
        category: 'performance',
        example: 'Load heavy dependencies only when needed',
        strategicAlignment: ['Performance', 'Resource usage'],
        dependencies: [],
      },
      {
        title: 'Stream Processing',
        description: 'Process data in streams instead of loading everything into memory. Enables handling of large files without memory issues.',
        category: 'performance',
        example: 'Process 1GB file using 10MB memory via streaming',
        strategicAlignment: ['Performance', 'Scale'],
        dependencies: [],
      },
    ];
  }

  /**
   * Generate security features
   */
  private generateSecurityFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Input Validation',
        description: 'Comprehensive input validation and sanitization to prevent injection attacks. Critical security hardening.',
        category: 'security',
        example: 'Validate all user inputs against schema before processing',
        strategicAlignment: ['Security', 'Reliability'],
        dependencies: [],
      },
      {
        title: 'Audit Logging',
        description: 'Detailed audit trail of all security-relevant operations. Essential for compliance and incident investigation.',
        category: 'security',
        example: 'Log all authentication attempts, data modifications, and errors',
        strategicAlignment: ['Security', 'Compliance'],
        dependencies: [],
      },
      {
        title: 'Secret Management',
        description: 'Secure storage and handling of API keys, tokens, and credentials. Prevents accidental exposure of secrets.',
        category: 'security',
        example: 'Encrypt secrets in .env file, support credential vaults',
        strategicAlignment: ['Security', 'Best practices'],
        dependencies: [],
      },
      {
        title: 'Rate Limiting',
        description: 'Protect against abuse with configurable rate limits and throttling. Prevents DoS attacks and resource exhaustion.',
        category: 'security',
        example: 'Limit API calls to 100 per minute per user',
        strategicAlignment: ['Security', 'Availability'],
        dependencies: [],
      },
    ];
  }

  /**
   * Generate testing features
   */
  private generateTestingFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Integration Test Suite',
        description: 'Comprehensive integration tests covering end-to-end workflows. Catches issues that unit tests miss.',
        category: 'testing',
        example: 'Test complete user workflows from CLI to output',
        strategicAlignment: ['Quality', 'Reliability'],
        dependencies: [],
      },
      {
        title: 'Performance Benchmarks',
        description: 'Automated performance benchmarks to detect regressions. Ensures performance doesn\'t degrade over time.',
        category: 'testing',
        example: 'Benchmark suite that fails if performance drops >10%',
        strategicAlignment: ['Quality', 'Performance'],
        dependencies: [],
      },
      {
        title: 'Snapshot Testing',
        description: 'Snapshot tests for generated output to catch unintended changes. Prevents regression in generated artifacts.',
        category: 'testing',
        example: 'Capture and compare generated file outputs',
        strategicAlignment: ['Quality', 'Regression prevention'],
        dependencies: [],
      },
      {
        title: 'Test Fixtures Factory',
        description: 'Reusable test data generators and fixtures. Simplifies test setup and ensures consistency.',
        category: 'testing',
        example: 'Factory to create valid test projects with various configurations',
        strategicAlignment: ['Testing efficiency', 'Maintainability'],
        dependencies: [],
      },
    ];
  }

  /**
   * Generate documentation features
   */
  private generateDocumentationFeatures(context: ProjectContext): DesirableFeature[] {
    return [
      {
        title: 'Interactive Examples',
        description: 'Runnable code examples in documentation with live output. Helps users learn by doing.',
        category: 'documentation',
        example: 'Code snippets that users can execute and see results',
        strategicAlignment: ['User onboarding', 'Education'],
        dependencies: [],
      },
      {
        title: 'API Reference Generator',
        description: 'Auto-generate API documentation from code comments and types. Keeps docs in sync with code.',
        category: 'documentation',
        example: 'Generate API docs from JSDoc/TSDoc comments',
        strategicAlignment: ['Documentation quality', 'Maintainability'],
        dependencies: [],
      },
      {
        title: 'Troubleshooting Guide',
        description: 'Comprehensive troubleshooting guide for common issues. Reduces support burden and user frustration.',
        category: 'documentation',
        example: 'FAQ and troubleshooting section with solutions',
        strategicAlignment: ['User support', 'Self-service'],
        dependencies: [],
      },
      {
        title: 'Video Tutorials',
        description: 'Screen-recorded tutorials showing real usage scenarios. Valuable for visual learners and complex workflows.',
        category: 'documentation',
        example: '5-minute walkthrough videos for common tasks',
        strategicAlignment: ['User onboarding', 'Accessibility'],
        dependencies: [],
      },
    ];
  }

  /**
   * Generate integration features
   */
  private generateIntegrationFeatures(context: ProjectContext): DesirableFeature[] {
    const features: DesirableFeature[] = [
      {
        title: 'CI/CD Integration',
        description: 'Seamless integration with popular CI/CD platforms (GitHub Actions, GitLab CI). Enables automation in deployment pipelines.',
        category: 'integrations',
        example: 'GitHub Action for running tool in CI pipeline',
        strategicAlignment: ['Automation', 'DevOps'],
        dependencies: [],
      },
      {
        title: 'Docker Support',
        description: 'Official Docker images for containerized deployment. Simplifies deployment and ensures consistency across environments.',
        category: 'integrations',
        example: 'docker run command to use tool in container',
        strategicAlignment: ['Deployment', 'Portability'],
        dependencies: [],
      },
      {
        title: 'IDE Extensions',
        description: 'Extensions for popular IDEs (VS Code, IntelliJ) with inline features. Brings tool capabilities directly into developer workflow.',
        category: 'integrations',
        example: 'VS Code extension with commands and syntax highlighting',
        strategicAlignment: ['Developer experience', 'Workflow integration'],
        dependencies: [],
      },
    ];

    if (context.frameworks.includes('MCP')) {
      features.push({
        title: 'MCP Server Ecosystem',
        description: 'Expand MCP server capabilities with additional tools and resources. Enhances the Model Context Protocol integration.',
        category: 'integrations',
        example: 'Add more MCP tools for different analysis types',
        strategicAlignment: ['AI integration', 'Ecosystem'],
        dependencies: [],
      });
    }

    return features;
  }

  /**
   * Deduplicate features by title similarity
   */
  private deduplicateFeatures(features: DesirableFeature[]): DesirableFeature[] {
    const seen = new Map<string, DesirableFeature>();

    for (const feature of features) {
      const key = feature.title.toLowerCase().trim();

      if (!seen.has(key)) {
        seen.set(key, feature);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Log message if verbose
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[FeatureBrainstormer] ${message}`);
    }
  }
}

/**
 * Create a FeatureBrainstormer instance
 */
export function createFeatureBrainstormer(config?: BrainstormConfig): FeatureBrainstormer {
  return new FeatureBrainstormer(config);
}
