/**
 * API Contracts for Mermaid Diagram Generation
 *
 * @module diagram-generator.contract
 * @version 1.0.0
 */

import type {
  WorkflowDiagram,
  ArchitectureDiagram,
  ClassDiagram,
  SequenceDiagram,
  MermaidCode,
  DiagramMetadata,
  GearState
} from './types';

/**
 * Main diagram generator interface.
 * Orchestrates all diagram generation for StackShift.
 */
export interface IDiagramGenerator {
  /**
   * Generate all diagrams for StackShift.
   *
   * @param options - Generation options
   * @returns Generated diagrams and metadata
   * @throws {Error} If required source files are missing
   */
  generateAll(options?: GenerationOptions): Promise<GenerationResult>;

  /**
   * Generate workflow state machine diagram.
   *
   * @param stateFilePath - Path to .stackshift-state.json
   * @returns Workflow diagram
   * @throws {StateFileNotFoundError} If state file doesn't exist
   * @throws {InvalidStateError} If state file is malformed
   */
  generateWorkflowDiagram(stateFilePath: string): Promise<MermaidCode>;

  /**
   * Generate system architecture diagram.
   *
   * @param rootDir - StackShift root directory
   * @returns Architecture diagram
   * @throws {Error} If root directory is invalid
   */
  generateArchitectureDiagram(rootDir: string): Promise<MermaidCode>;

  /**
   * Generate class diagrams for all modules.
   *
   * @param srcDir - Source directory (mcp-server/src)
   * @param modules - Modules to generate diagrams for
   * @returns Array of class diagrams (one per module)
   * @throws {Error} If source directory doesn't exist
   */
  generateClassDiagrams(
    srcDir: string,
    modules: string[]
  ): Promise<MermaidCode[]>;

  /**
   * Generate sequence diagrams for tool interactions.
   *
   * @param srcDir - Source directory (mcp-server/src)
   * @param gears - Gears to generate sequence diagrams for
   * @returns Array of sequence diagrams (one per gear)
   * @throws {Error} If source directory doesn't exist
   */
  generateSequenceDiagrams(
    srcDir: string,
    gears: GearState[]
  ): Promise<MermaidCode[]>;
}

/**
 * Options for diagram generation.
 */
export interface GenerationOptions {
  /** Root directory of StackShift */
  rootDir: string;

  /** Output directory for diagrams */
  outputDir?: string;

  /** Modules to generate class diagrams for */
  modules?: string[];

  /** Gears to generate sequence diagrams for */
  gears?: GearState[];

  /** Skip validation (faster, less safe) */
  skipValidation?: boolean;

  /** Verbose logging */
  verbose?: boolean;
}

/**
 * Result of diagram generation.
 */
export interface GenerationResult {
  /** Generated workflow diagram */
  workflow: MermaidCode | null;

  /** Generated architecture diagram */
  architecture: MermaidCode | null;

  /** Generated class diagrams */
  classDiagrams: MermaidCode[];

  /** Generated sequence diagrams */
  sequenceDiagrams: MermaidCode[];

  /** Generation metadata */
  metadata: DiagramMetadata;

  /** Errors encountered (non-fatal) */
  errors: GenerationError[];
}

/**
 * Error during diagram generation.
 */
export interface GenerationError {
  /** Error type */
  type: 'parse' | 'generate' | 'validate' | 'write';

  /** Error message */
  message: string;

  /** Source file that caused error */
  sourceFile?: string;

  /** Stack trace */
  stack?: string;
}

/**
 * Workflow diagram generator interface.
 */
export interface IWorkflowDiagramGenerator {
  /**
   * Generate workflow state machine diagram from state file.
   *
   * @param stateFilePath - Path to .stackshift-state.json
   * @returns Workflow diagram model
   */
  parse(stateFilePath: string): Promise<WorkflowDiagram>;

  /**
   * Convert workflow model to Mermaid code.
   *
   * @param diagram - Workflow diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: WorkflowDiagram): MermaidCode;
}

/**
 * Architecture diagram generator interface.
 */
export interface IArchitectureDiagramGenerator {
  /**
   * Analyze file structure to generate architecture diagram.
   *
   * @param rootDir - StackShift root directory
   * @returns Architecture diagram model
   */
  analyze(rootDir: string): Promise<ArchitectureDiagram>;

  /**
   * Convert architecture model to Mermaid code.
   *
   * @param diagram - Architecture diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: ArchitectureDiagram): MermaidCode;
}

/**
 * Class diagram generator interface.
 */
export interface IClassDiagramGenerator {
  /**
   * Parse TypeScript files to extract class diagram.
   *
   * @param modulePath - Path to module directory
   * @param moduleName - Module name
   * @returns Class diagram model
   */
  parse(modulePath: string, moduleName: string): Promise<ClassDiagram>;

  /**
   * Convert class diagram model to Mermaid code.
   *
   * @param diagram - Class diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: ClassDiagram): MermaidCode;
}

/**
 * Sequence diagram generator interface.
 */
export interface ISequenceDiagramGenerator {
  /**
   * Analyze tool interactions to generate sequence diagram.
   *
   * @param toolPath - Path to tool file
   * @param gear - Gear name
   * @returns Sequence diagram model
   */
  analyze(toolPath: string, gear: GearState): Promise<SequenceDiagram>;

  /**
   * Convert sequence diagram model to Mermaid code.
   *
   * @param diagram - Sequence diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: SequenceDiagram): MermaidCode;
}

/**
 * Diagram validator interface.
 */
export interface IDiagramValidator {
  /**
   * Validate Mermaid code syntax.
   *
   * @param mermaidCode - Mermaid code to validate
   * @returns Validation result
   */
  validate(mermaidCode: MermaidCode): ValidationResult;

  /**
   * Check if diagram meets complexity limits.
   *
   * @param mermaidCode - Mermaid code to check
   * @returns True if within limits
   */
  checkComplexity(mermaidCode: MermaidCode): boolean;
}

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];
}

/**
 * File writer interface for saving diagrams.
 */
export interface IDiagramWriter {
  /**
   * Write Mermaid code to file.
   *
   * @param mermaidCode - Mermaid code to write
   * @returns Path to written file
   * @throws {Error} If write fails
   */
  write(mermaidCode: MermaidCode): Promise<string>;

  /**
   * Write multiple diagrams.
   *
   * @param diagrams - Diagrams to write
   * @returns Paths to written files
   */
  writeAll(diagrams: MermaidCode[]): Promise<string[]>;

  /**
   * Write metadata file.
   *
   * @param metadata - Diagram metadata
   * @param outputPath - Output file path
   * @returns Path to written file
   */
  writeMetadata(metadata: DiagramMetadata, outputPath: string): Promise<string>;
}

/**
 * Custom errors
 */
export class StateFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`State file not found: ${filePath}`);
    this.name = 'StateFileNotFoundError';
  }
}

export class InvalidStateError extends Error {
  constructor(message: string) {
    super(`Invalid state file: ${message}`);
    this.name = 'InvalidStateError';
  }
}

export class DiagramGenerationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DiagramGenerationError';
  }
}
