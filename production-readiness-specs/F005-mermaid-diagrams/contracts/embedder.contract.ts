/**
 * API Contracts for Diagram Embedding
 *
 * @module embedder.contract
 * @version 1.0.0
 */

import type { MermaidCode } from './types';

/**
 * Documentation embedder interface.
 * Embeds generated Mermaid diagrams into documentation files.
 */
export interface IDocumentationEmbedder {
  /**
   * Embed diagram in a documentation file.
   *
   * @param docPath - Path to documentation file
   * @param diagram - Mermaid code to embed
   * @param marker - Marker to identify embedding location
   * @returns Updated documentation content
   * @throws {EmbedError} If embedding fails
   */
  embed(docPath: string, diagram: MermaidCode, marker: string): Promise<string>;

  /**
   * Embed multiple diagrams in documentation files.
   *
   * @param embeddings - Array of embedding specifications
   * @returns Array of updated file paths
   */
  embedAll(embeddings: EmbeddingSpec[]): Promise<string[]>;

  /**
   * Remove embedded diagram from documentation file.
   *
   * @param docPath - Path to documentation file
   * @param marker - Marker identifying diagram to remove
   * @returns Updated documentation content
   */
  remove(docPath: string, marker: string): Promise<string>;

  /**
   * Check if documentation file has embedded diagram.
   *
   * @param docPath - Path to documentation file
   * @param marker - Marker to check for
   * @returns True if diagram is embedded
   */
  hasEmbedded(docPath: string, marker: string): Promise<boolean>;
}

/**
 * Specification for embedding a diagram.
 */
export interface EmbeddingSpec {
  /** Documentation file path */
  docPath: string;

  /** Diagram to embed */
  diagram: MermaidCode;

  /** Embedding marker */
  marker: string;

  /** Embedding strategy */
  strategy?: EmbeddingStrategy;
}

/**
 * Strategy for embedding diagrams.
 */
export type EmbeddingStrategy =
  | 'replace' // Replace existing diagram
  | 'append' // Append to end of file
  | 'insert-after-marker' // Insert after marker comment
  | 'insert-before-marker'; // Insert before marker comment

/**
 * Marker parser interface.
 * Parses documentation files to find embedding markers.
 */
export interface IMarkerParser {
  /**
   * Find marker in documentation file.
   *
   * @param content - File content
   * @param marker - Marker to find
   * @returns Marker location
   */
  findMarker(content: string, marker: string): MarkerLocation | null;

  /**
   * Extract embedded diagram from file.
   *
   * @param content - File content
   * @param marker - Marker identifying diagram
   * @returns Extracted diagram code
   */
  extractDiagram(content: string, marker: string): string | null;

  /**
   * Replace diagram at marker location.
   *
   * @param content - File content
   * @param marker - Marker identifying diagram
   * @param newDiagram - New diagram code
   * @returns Updated content
   */
  replaceDiagram(content: string, marker: string, newDiagram: string): string;
}

/**
 * Location of a marker in a file.
 */
export interface MarkerLocation {
  /** Line number (1-indexed) */
  line: number;

  /** Column number (1-indexed) */
  column: number;

  /** Start offset in file */
  startOffset: number;

  /** End offset in file */
  endOffset: number;

  /** Marker type */
  type: 'comment' | 'heading' | 'placeholder';
}

/**
 * Markdown processor interface.
 * Processes Markdown files for diagram embedding.
 */
export interface IMarkdownProcessor {
  /**
   * Parse Markdown file.
   *
   * @param filePath - Path to Markdown file
   * @returns Parsed Markdown structure
   */
  parse(filePath: string): Promise<MarkdownDocument>;

  /**
   * Insert diagram into Markdown document.
   *
   * @param doc - Parsed Markdown document
   * @param diagram - Diagram to insert
   * @param location - Insertion location
   * @returns Updated document
   */
  insertDiagram(
    doc: MarkdownDocument,
    diagram: MermaidCode,
    location: InsertLocation
  ): MarkdownDocument;

  /**
   * Serialize Markdown document to string.
   *
   * @param doc - Markdown document
   * @returns Markdown content
   */
  serialize(doc: MarkdownDocument): string;
}

/**
 * Parsed Markdown document.
 */
export interface MarkdownDocument {
  /** File path */
  path: string;

  /** Document content */
  content: string;

  /** Headings in document */
  headings: MarkdownHeading[];

  /** Code blocks in document */
  codeBlocks: MarkdownCodeBlock[];

  /** Comments in document */
  comments: MarkdownComment[];
}

/**
 * Markdown heading.
 */
export interface MarkdownHeading {
  /** Heading level (1-6) */
  level: number;

  /** Heading text */
  text: string;

  /** Line number */
  line: number;
}

/**
 * Markdown code block.
 */
export interface MarkdownCodeBlock {
  /** Language */
  language: string;

  /** Code content */
  code: string;

  /** Start line */
  startLine: number;

  /** End line */
  endLine: number;

  /** Is Mermaid diagram */
  isMermaid: boolean;
}

/**
 * Markdown comment.
 */
export interface MarkdownComment {
  /** Comment text */
  text: string;

  /** Line number */
  line: number;
}

/**
 * Insertion location in Markdown.
 */
export interface InsertLocation {
  /** Insertion strategy */
  strategy: 'after-heading' | 'after-marker' | 'end-of-file' | 'line-number';

  /** Target heading (if strategy is 'after-heading') */
  heading?: string;

  /** Target marker (if strategy is 'after-marker') */
  marker?: string;

  /** Target line (if strategy is 'line-number') */
  line?: number;
}

/**
 * Custom errors
 */
export class EmbedError extends Error {
  constructor(message: string, public filePath: string) {
    super(`Failed to embed diagram in ${filePath}: ${message}`);
    this.name = 'EmbedError';
  }
}

export class MarkerNotFoundError extends Error {
  constructor(marker: string, filePath: string) {
    super(`Marker "${marker}" not found in ${filePath}`);
    this.name = 'MarkerNotFoundError';
  }
}
