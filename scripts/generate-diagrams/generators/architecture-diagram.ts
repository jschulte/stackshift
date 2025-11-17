/**
 * Architecture diagram generator for StackShift system components
 * @module architecture-diagram
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { MermaidCode } from '../types.js';

/**
 * Component node
 */
interface ComponentNode {
  id: string;
  label: string;
  componentType: 'server' | 'plugin' | 'agent' | 'utility' | 'external';
}

/**
 * Relationship between components
 */
interface Relationship {
  from: string;
  to: string;
  relationType: 'uses' | 'depends-on' | 'communicates' | 'contains';
}

/**
 * Subgraph (logical grouping)
 */
interface Subgraph {
  name: string;
  componentIds: string[];
}

/**
 * Architecture diagram model
 */
interface ArchitectureDiagram {
  type: 'architecture';
  components: ComponentNode[];
  relationships: Relationship[];
  subgraphs: Subgraph[];
}

/**
 * Generator for architecture component diagrams
 */
export class ArchitectureDiagramGenerator {
  /**
   * Analyze file structure and extract architecture diagram model
   * @param rootDir - StackShift root directory
   * @returns Architecture diagram model
   */
  async analyze(rootDir: string): Promise<ArchitectureDiagram> {
    // Define components based on known StackShift structure
    const components: ComponentNode[] = [
      { id: 'claude', label: 'Claude AI', componentType: 'external' },
      { id: 'plugin_skills', label: '7 Skills', componentType: 'plugin' },
      { id: 'plugin_agents', label: '2 Agents', componentType: 'plugin' },
      { id: 'mcp_tools', label: '7 MCP Tools', componentType: 'server' },
      { id: 'mcp_resources', label: 'Resources Layer', componentType: 'server' },
      { id: 'mcp_utils', label: 'Utilities', componentType: 'utility' }
    ];

    // Define relationships
    const relationships: Relationship[] = [
      { from: 'claude', to: 'plugin_skills', relationType: 'uses' },
      { from: 'plugin_skills', to: 'mcp_tools', relationType: 'communicates' },
      { from: 'mcp_tools', to: 'mcp_utils', relationType: 'uses' },
      { from: 'mcp_utils', to: 'mcp_resources', relationType: 'uses' }
    ];

    // Define subgraphs (logical groupings)
    const subgraphs: Subgraph[] = [
      {
        name: 'MCP Server',
        componentIds: ['mcp_tools', 'mcp_resources', 'mcp_utils']
      },
      {
        name: 'Claude Code Plugin',
        componentIds: ['plugin_skills', 'plugin_agents']
      }
    ];

    return {
      type: 'architecture',
      components,
      relationships,
      subgraphs
    };
  }

  /**
   * Convert architecture diagram model to Mermaid code
   * @param diagram - Architecture diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: ArchitectureDiagram): MermaidCode {
    const lines: string[] = ['graph TB'];
    lines.push('');

    // Subgraphs
    diagram.subgraphs.forEach(sg => {
      lines.push(`    subgraph "${sg.name}"`);
      sg.componentIds.forEach(id => {
        const comp = diagram.components.find(c => c.id === id);
        if (comp) {
          lines.push(`        ${comp.id}[${comp.label}]`);
        }
      });
      lines.push('    end');
      lines.push('');
    });

    // External components (not in subgraphs)
    diagram.components
      .filter(c => !diagram.subgraphs.some(sg => sg.componentIds.includes(c.id)))
      .forEach(comp => {
        lines.push(`    ${comp.id}[${comp.label}]`);
      });

    lines.push('');

    // Relationships
    diagram.relationships.forEach(rel => {
      lines.push(`    ${rel.from} --> ${rel.to}`);
    });

    const code = lines.join('\n');
    const markdownCode = `\`\`\`mermaid\n${code}\n\`\`\``;

    return {
      diagramType: 'graph',
      code,
      markdownCode,
      outputPath: 'docs/diagrams/architecture.mmd',
      generatedAt: new Date()
    };
  }
}
