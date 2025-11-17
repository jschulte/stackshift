/**
 * Metadata writer for diagram generation
 * @module metadata-writer
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { DiagramMetadata, GenerationResult } from './types.js';

/**
 * Writes metadata about generated diagrams
 */
export class MetadataWriter {
  /**
   * Write metadata to JSON file
   * @param result - Generation result
   * @param outputPath - Path to write metadata file
   */
  async write(result: GenerationResult, outputPath: string): Promise<void> {
    const metadata = this.buildMetadata(result);

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write metadata
    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  /**
   * Build complete metadata from generation result
   * @param result - Generation result
   * @returns Complete diagram metadata
   */
  private buildMetadata(result: GenerationResult): DiagramMetadata {
    const diagrams = [];

    // Add workflow diagram
    if (result.workflow) {
      diagrams.push({
        name: 'Workflow State Machine',
        type: 'stateDiagram-v2',
        path: result.workflow.outputPath,
        lines: result.workflow.code.split('\n').length,
        nodes: this.countNodes(result.workflow.code, 'stateDiagram')
      });
    }

    // Add architecture diagram
    if (result.architecture) {
      diagrams.push({
        name: 'System Architecture',
        type: 'graph',
        path: result.architecture.outputPath,
        lines: result.architecture.code.split('\n').length,
        nodes: this.countNodes(result.architecture.code, 'graph')
      });
    }

    // Add class diagrams
    for (const classDiagram of result.classDiagrams) {
      const moduleName = classDiagram.outputPath.match(/class-(.+)\.mmd$/)?.[1] || 'unknown';
      diagrams.push({
        name: `Class Diagram: ${moduleName}`,
        type: 'classDiagram',
        path: classDiagram.outputPath,
        lines: classDiagram.code.split('\n').length,
        nodes: this.countNodes(classDiagram.code, 'class')
      });
    }

    // Add sequence diagrams
    for (const seqDiagram of result.sequenceDiagrams) {
      const gearName = seqDiagram.outputPath.match(/sequence-(.+)\.mmd$/)?.[1] || 'unknown';
      diagrams.push({
        name: `Sequence Diagram: ${gearName}`,
        type: 'sequenceDiagram',
        path: seqDiagram.outputPath,
        lines: seqDiagram.code.split('\n').length,
        nodes: this.countNodes(seqDiagram.code, 'sequence')
      });
    }

    // Count source files parsed
    const sourceFilesParsed = result.classDiagrams.length;

    return {
      diagrams,
      generatedAt: new Date(),
      stackshiftVersion: '1.0.0',
      stats: {
        totalDiagrams: diagrams.length,
        generationTimeMs: result.metadata?.stats.generationTimeMs || 0,
        sourceFilesParsed,
        errors: result.errors.length
      }
    };
  }

  /**
   * Count nodes in a Mermaid diagram
   * @param code - Mermaid code
   * @param type - Diagram type
   * @returns Node count
   */
  private countNodes(code: string, type: string): number {
    if (type === 'stateDiagram') {
      // Count state declarations and transitions
      const stateMatches = code.match(/\[?\*?\]? ?-->|state \w+/g);
      return stateMatches ? stateMatches.length : 0;
    } else if (type === 'graph') {
      // Count nodes (lines with [])
      const nodeMatches = code.match(/\w+\[.+?\]/g);
      return nodeMatches ? nodeMatches.length : 0;
    } else if (type === 'class') {
      // Count class declarations
      const classMatches = code.match(/class \w+/g);
      return classMatches ? classMatches.length : 0;
    } else if (type === 'sequence') {
      // Count participants and messages
      const participantMatches = code.match(/participant \w+/g);
      const messageMatches = code.match(/\w+ -[->)] \w+/g);
      return (participantMatches?.length || 0) + (messageMatches?.length || 0);
    }

    return 0;
  }
}
