/**
 * Documentation embedder for inserting Mermaid diagrams into documentation files
 * @module doc-embedder
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { MermaidCode } from '../types.js';

/**
 * Marker comments for diagram embedding
 */
const MARKERS = {
  WORKFLOW_START: '<!-- DIAGRAM: workflow-start -->',
  WORKFLOW_END: '<!-- DIAGRAM: workflow-end -->',
  ARCHITECTURE_START: '<!-- DIAGRAM: architecture-start -->',
  ARCHITECTURE_END: '<!-- DIAGRAM: architecture-end -->',
};

/**
 * Handles embedding diagrams into documentation files
 */
export class DocumentationEmbedder {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * Embed workflow diagram in README.md after intro section
   */
  async embedInReadme(workflowDiagram: MermaidCode): Promise<void> {
    const readmePath = path.join(this.rootDir, 'README.md');

    // Read existing README
    let content: string;
    try {
      content = await fs.readFile(readmePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read README.md: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check if diagram is already embedded
    if (content.includes(MARKERS.WORKFLOW_START)) {
      // Replace existing diagram
      const regex = new RegExp(
        `${MARKERS.WORKFLOW_START}[\\s\\S]*?${MARKERS.WORKFLOW_END}`,
        'g'
      );
      content = content.replace(
        regex,
        this.createDiagramSection('Workflow State Machine', workflowDiagram, 'WORKFLOW')
      );
    } else {
      // Try multiple section patterns
      const sectionPatterns = [
        /##\s+.*Overview\s*\n/i,                    // ## Overview or similar
        /##\s+.*What StackShift Does\s*\n/i,        // ## What StackShift Does
        /##\s+.*Introduction\s*\n/i,                // ## Introduction
        /---\s*\n/                                   // After first horizontal rule
      ];

      let insertPosition = -1;
      let matchedPattern = null;

      for (const pattern of sectionPatterns) {
        const match = content.match(pattern);
        if (match) {
          matchedPattern = match;
          insertPosition = (match.index || 0) + match[0].length;
          break;
        }
      }

      if (insertPosition === -1) {
        // Fallback: insert before first ## heading after the file start
        const firstHeadingMatch = content.match(/##\s+/);
        if (firstHeadingMatch) {
          insertPosition = firstHeadingMatch.index || 0;
        } else {
          throw new Error('Could not find suitable location to embed workflow diagram in README.md');
        }
      }

      // If we matched a heading, find the end of that section's intro paragraph
      if (matchedPattern && matchedPattern[0].startsWith('##')) {
        const afterHeading = content.slice(insertPosition);
        const nextSectionMatch = afterHeading.match(/\n\n##|\n##/);
        const sectionEndOffset = nextSectionMatch
          ? nextSectionMatch.index || 0
          : Math.min(afterHeading.length, 1000); // Limit to 1000 chars

        insertPosition += sectionEndOffset;
      }

      content =
        content.slice(0, insertPosition) +
        '\n\n' +
        this.createDiagramSection('Workflow State Machine', workflowDiagram, 'WORKFLOW') +
        '\n' +
        content.slice(insertPosition);
    }

    // Write updated README
    await fs.writeFile(readmePath, content, 'utf-8');
  }

  /**
   * Embed architecture diagram in docs/architecture.md
   */
  async embedInArchitectureDocs(architectureDiagram: MermaidCode): Promise<void> {
    const archDocsPath = path.join(this.rootDir, 'docs', 'architecture.md');

    // Ensure docs directory exists
    await fs.mkdir(path.join(this.rootDir, 'docs'), { recursive: true });

    let content: string;
    try {
      content = await fs.readFile(archDocsPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# System Architecture\n\n';
    }

    // Check if diagram is already embedded
    if (content.includes(MARKERS.ARCHITECTURE_START)) {
      // Replace existing diagram
      const regex = new RegExp(
        `${MARKERS.ARCHITECTURE_START}[\\s\\S]*?${MARKERS.ARCHITECTURE_END}`,
        'g'
      );
      content = content.replace(
        regex,
        this.createDiagramSection('Component Architecture', architectureDiagram, 'ARCHITECTURE')
      );
    } else {
      // Find ## System Architecture section or create it
      const sectionMatch = content.match(/##\s+System Architecture\s*\n/);
      if (sectionMatch) {
        // Insert after the heading
        const insertPosition = (sectionMatch.index || 0) + sectionMatch[0].length;
        content =
          content.slice(0, insertPosition) +
          '\n' +
          this.createDiagramSection('Component Architecture', architectureDiagram, 'ARCHITECTURE') +
          '\n' +
          content.slice(insertPosition);
      } else {
        // Append to end of file
        content +=
          '\n## System Architecture\n\n' +
          this.createDiagramSection('Component Architecture', architectureDiagram, 'ARCHITECTURE') +
          '\n';
      }
    }

    // Write updated file
    await fs.writeFile(archDocsPath, content, 'utf-8');
  }

  /**
   * Create a diagram section with markers
   */
  private createDiagramSection(
    title: string,
    diagram: MermaidCode,
    markerType: 'WORKFLOW' | 'ARCHITECTURE'
  ): string {
    const startMarker = markerType === 'WORKFLOW'
      ? MARKERS.WORKFLOW_START
      : MARKERS.ARCHITECTURE_START;
    const endMarker = markerType === 'WORKFLOW'
      ? MARKERS.WORKFLOW_END
      : MARKERS.ARCHITECTURE_END;

    return `${startMarker}
### ${title}

${diagram.markdownCode}

*Last generated: ${diagram.generatedAt.toISOString()}*
${endMarker}`;
  }
}
