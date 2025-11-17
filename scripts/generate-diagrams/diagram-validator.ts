/**
 * Diagram validator for Mermaid syntax validation
 * @module diagram-validator
 */

import type { MermaidCode } from './types.js';

/**
 * Validation result
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
 * Validator for Mermaid diagrams
 */
export class DiagramValidator {
  /**
   * Validate Mermaid code syntax
   * @param mermaidCode - Mermaid code to validate
   * @returns Validation result
   */
  validate(mermaidCode: MermaidCode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic syntax validation
    if (!mermaidCode.code.trim()) {
      errors.push('Diagram code is empty');
    }

    // Validate diagram type syntax
    const firstLine = mermaidCode.code.trim().split('\n')[0];
    const validTypes = ['stateDiagram-v2', 'graph', 'classDiagram', 'sequenceDiagram'];

    if (!validTypes.some(type => firstLine.includes(type))) {
      errors.push(`Invalid diagram type. First line must contain one of: ${validTypes.join(', ')}`);
    }

    // Check for markdown code block format
    if (mermaidCode.markdownCode && !mermaidCode.markdownCode.includes('```mermaid')) {
      errors.push('Markdown code must be wrapped in ```mermaid code blocks');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if diagram meets complexity limits
   * @param mermaidCode - Mermaid code to check
   * @returns True if within limits
   */
  checkComplexity(mermaidCode: MermaidCode): boolean {
    const maxNodes = 20;

    // Count nodes (rough estimate based on line count and keywords)
    const lines = mermaidCode.code.split('\n').filter(line => line.trim().length > 0);
    const nodeCount = lines.filter(line => {
      // Count lines that define nodes (class, state, participant, node definitions)
      return line.includes('class ') ||
             line.includes('-->') ||
             line.includes('participant') ||
             line.includes('[') ||
             line.match(/^\s+\w+/);
    }).length;

    if (nodeCount > maxNodes) {
      console.warn(`Diagram has ${nodeCount} nodes, exceeds recommended maximum of ${maxNodes}`);
      return false;
    }

    return true;
  }
}
