/**
 * Diagram writer utility for saving Mermaid diagrams to files
 * @module diagram-writer
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import type { MermaidCode } from './types.js';

/**
 * Writer for saving diagram files
 */
export class DiagramWriter {
  /**
   * Write a single Mermaid diagram to file
   * @param mermaidCode - Diagram to write
   * @returns Path to written file
   */
  async write(mermaidCode: MermaidCode): Promise<string> {
    const outputPath = mermaidCode.outputPath;

    // Ensure directory exists
    await fs.mkdir(dirname(outputPath), { recursive: true });

    // Write Mermaid code to file
    await fs.writeFile(outputPath, mermaidCode.code, 'utf-8');

    return outputPath;
  }

  /**
   * Write multiple diagrams
   * @param diagrams - Diagrams to write
   * @returns Paths to written files
   */
  async writeAll(diagrams: MermaidCode[]): Promise<string[]> {
    const paths: string[] = [];

    for (const diagram of diagrams) {
      const path = await this.write(diagram);
      paths.push(path);
    }

    return paths;
  }

  /**
   * Write metadata file
   * @param metadata - Diagram metadata
   * @param outputPath - Output file path
   * @returns Path to written file
   */
  async writeMetadata(metadata: any, outputPath: string): Promise<string> {
    // Ensure directory exists
    await fs.mkdir(dirname(outputPath), { recursive: true });

    // Write JSON with pretty formatting
    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');

    return outputPath;
  }
}
