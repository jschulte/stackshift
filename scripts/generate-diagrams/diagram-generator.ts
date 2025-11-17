/**
 * Main diagram generator orchestrator
 * @module diagram-generator
 */

import { join } from 'path';
import { DiagramWriter } from './diagram-writer.js';
import { DiagramValidator } from './diagram-validator.js';
import { DocumentationEmbedder } from './embedders/doc-embedder.js';
import { WorkflowDiagramGenerator } from './generators/workflow-diagram.js';
import { ArchitectureDiagramGenerator } from './generators/architecture-diagram.js';
import type {
  GenerationOptions,
  GenerationResult,
  GenerationError,
  DiagramMetadata,
  MermaidCode
} from './types.js';

/**
 * Main diagram generator class
 */
export class DiagramGenerator {
  private writer: DiagramWriter;
  private validator: DiagramValidator;
  private embedder: DocumentationEmbedder;
  private options: GenerationOptions;

  constructor(options: GenerationOptions) {
    this.options = options;
    this.writer = new DiagramWriter();
    this.validator = new DiagramValidator();
    this.embedder = new DocumentationEmbedder(options.rootDir);
  }

  /**
   * Generate all diagrams
   * @returns Generation result with all diagrams and errors
   */
  async generateAll(): Promise<GenerationResult> {
    const startTime = Date.now();
    const result: GenerationResult = {
      workflow: null,
      architecture: null,
      classDiagrams: [],
      sequenceDiagrams: [],
      metadata: null,
      errors: []
    };

    if (this.options.verbose) {
      console.log('🎨 Starting diagram generation...\n');
    }

    // Workflow diagram
    if (this.options.verbose) {
      console.log('📊 Generating workflow diagram...');
    }
    try {
      const workflowGen = new WorkflowDiagramGenerator();
      const stateFile = join(this.options.rootDir, '.stackshift-state.json');
      const diagram = await workflowGen.parse(stateFile);
      const mermaid = workflowGen.toMermaid(diagram);
      mermaid.outputPath = join(this.options.rootDir, mermaid.outputPath);
      await this.validateAndWrite(mermaid);
      result.workflow = mermaid;
    } catch (error: any) {
      result.errors.push({
        type: 'generate',
        message: `Failed to generate workflow diagram: ${error.message}`,
        sourceFile: '.stackshift-state.json'
      });
    }

    // Architecture diagram
    if (this.options.verbose) {
      console.log('🏗️  Generating architecture diagram...');
    }
    try {
      const archGen = new ArchitectureDiagramGenerator();
      const diagram = await archGen.analyze(this.options.rootDir);
      const mermaid = archGen.toMermaid(diagram);
      mermaid.outputPath = join(this.options.rootDir, mermaid.outputPath);
      await this.validateAndWrite(mermaid);
      result.architecture = mermaid;
    } catch (error: any) {
      result.errors.push({
        type: 'generate',
        message: `Failed to generate architecture diagram: ${error.message}`
      });
    }

    // Class diagrams
    if (this.options.verbose) {
      console.log('📝 Generating class diagrams...');
    }
    // Will be implemented in Phase 6

    // Sequence diagrams
    if (this.options.verbose) {
      console.log('🔄 Generating sequence diagrams...');
    }
    // Will be implemented in Phase 7

    // Embed diagrams in documentation
    if (this.options.verbose) {
      console.log('\n📚 Embedding diagrams in documentation...');
    }
    try {
      if (result.workflow) {
        await this.embedder.embedInReadme(result.workflow);
        if (this.options.verbose) {
          console.log('  ✓ Embedded workflow diagram in README.md');
        }
      }
      if (result.architecture) {
        await this.embedder.embedInArchitectureDocs(result.architecture);
        if (this.options.verbose) {
          console.log('  ✓ Embedded architecture diagram in docs/architecture.md');
        }
      }
    } catch (error: any) {
      result.errors.push({
        type: 'embed',
        message: `Failed to embed diagrams: ${error.message}`
      });
    }

    // Generate metadata
    const endTime = Date.now();
    result.metadata = {
      diagrams: [],
      generatedAt: new Date(),
      stackshiftVersion: '1.0.0',
      stats: {
        totalDiagrams: 0,
        generationTimeMs: endTime - startTime,
        sourceFilesParsed: 0,
        errors: result.errors.length
      }
    };

    if (this.options.verbose) {
      console.log(`\n✅ Generation complete in ${endTime - startTime}ms`);
    }

    return result;
  }

  /**
   * Validate and write a diagram
   * @param diagram - Diagram to validate and write
   * @returns Path to written file or null if validation failed
   */
  private async validateAndWrite(diagram: MermaidCode): Promise<string | null> {
    // Validate
    const validation = this.validator.validate(diagram);
    if (!validation.valid) {
      console.error(`❌ Validation failed for ${diagram.outputPath}:`);
      validation.errors.forEach(err => console.error(`  - ${err}`));
      return null;
    }

    // Check complexity
    if (!this.validator.checkComplexity(diagram)) {
      console.warn(`⚠️  Complexity warning for ${diagram.outputPath}`);
    }

    // Write
    try {
      const path = await this.writer.write(diagram);
      if (this.options.verbose) {
        console.log(`  ✓ ${path}`);
      }
      return path;
    } catch (error) {
      console.error(`❌ Failed to write ${diagram.outputPath}:`, error);
      return null;
    }
  }
}
