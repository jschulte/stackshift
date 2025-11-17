/**
 * Shared types for Mermaid diagram generation
 * @module types
 */

/**
 * StackShift gear states
 */
export type GearState =
  | 'analyze'
  | 'reverse-engineer'
  | 'create-specs'
  | 'gap-analysis'
  | 'complete-spec'
  | 'implement'
  | 'cruise-control';

/**
 * Mermaid diagram types
 */
export type DiagramType = 'stateDiagram-v2' | 'graph' | 'classDiagram' | 'sequenceDiagram';

/**
 * Generated Mermaid code with metadata
 */
export interface MermaidCode {
  /** Type of diagram */
  diagramType: DiagramType;

  /** Raw Mermaid code */
  code: string;

  /** Markdown-wrapped code for embedding */
  markdownCode: string;

  /** Output file path */
  outputPath: string;

  /** Generation timestamp */
  generatedAt: Date;
}

/**
 * Metadata about diagram generation
 */
export interface DiagramMetadata {
  /** All generated diagrams */
  diagrams: DiagramInfo[];

  /** Generation timestamp */
  generatedAt: Date;

  /** StackShift version */
  stackshiftVersion: string;

  /** Generation statistics */
  stats: GenerationStats;
}

/**
 * Information about a single diagram
 */
export interface DiagramInfo {
  /** Diagram name */
  name: string;

  /** Diagram type */
  type: string;

  /** File path */
  path: string;

  /** Line count */
  lines: number;

  /** Node count */
  nodes: number;
}

/**
 * Statistics about diagram generation
 */
export interface GenerationStats {
  /** Total diagrams generated */
  totalDiagrams: number;

  /** Total generation time (ms) */
  generationTimeMs: number;

  /** Source files parsed */
  sourceFilesParsed: number;

  /** Errors encountered */
  errors: number;
}

/**
 * Generation error
 */
export interface GenerationError {
  /** Error type */
  type: 'parse' | 'generate' | 'validate' | 'write' | 'embed';

  /** Error message */
  message: string;

  /** Source file that caused error */
  sourceFile?: string;

  /** Stack trace */
  stack?: string;
}

/**
 * Options for diagram generation
 */
export interface GenerationOptions {
  /** Root directory of StackShift */
  rootDir: string;

  /** Output directory for diagrams */
  outputDir?: string;

  /** Verbose logging */
  verbose?: boolean;
}

/**
 * Result of diagram generation
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
  metadata: DiagramMetadata | null;

  /** Errors encountered (non-fatal) */
  errors: GenerationError[];
}
