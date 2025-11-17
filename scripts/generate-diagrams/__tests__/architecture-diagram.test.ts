/**
 * Tests for architecture diagram generator
 * @module architecture-diagram.test
 */

import { describe, test, expect } from 'vitest';
import { ArchitectureDiagramGenerator } from '../generators/architecture-diagram.js';

describe('ArchitectureDiagramGenerator', () => {
  const generator = new ArchitectureDiagramGenerator();

  describe('analyze', () => {
    test('identifies all major components', async () => {
      const diagram = await generator.analyze(process.cwd());

      expect(diagram.type).toBe('architecture');

      // Check all components are present
      const componentIds = diagram.components.map(c => c.id);
      expect(componentIds).toContain('claude');
      expect(componentIds).toContain('plugin_skills');
      expect(componentIds).toContain('plugin_agents');
      expect(componentIds).toContain('mcp_tools');
      expect(componentIds).toContain('mcp_resources');
      expect(componentIds).toContain('mcp_utils');
    });
  });

  describe('toMermaid', () => {
    test('generates valid graph TB syntax', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.diagramType).toBe('graph');
      expect(mermaid.code).toContain('graph TB');
    });

    test('includes MCP Server subgraph', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('subgraph "MCP Server"');
      expect(mermaid.code).toContain('mcp_tools');
      expect(mermaid.code).toContain('mcp_resources');
      expect(mermaid.code).toContain('mcp_utils');
    });

    test('includes Claude Code Plugin subgraph', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('subgraph "Claude Code Plugin"');
      expect(mermaid.code).toContain('plugin_skills');
      expect(mermaid.code).toContain('plugin_agents');
    });

    test('includes component relationships', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      // Check key relationships
      expect(mermaid.code).toContain('claude --> plugin_skills');
      expect(mermaid.code).toContain('plugin_skills --> mcp_tools');
      expect(mermaid.code).toContain('mcp_tools --> mcp_utils');
      expect(mermaid.code).toContain('mcp_utils --> mcp_resources');
    });

    test('wraps code in markdown code block', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.markdownCode).toContain('```mermaid');
      expect(mermaid.markdownCode).toContain('```');
      expect(mermaid.markdownCode).toContain(mermaid.code);
    });

    test('sets correct output path', async () => {
      const diagram = await generator.analyze(process.cwd());
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.outputPath).toBe('docs/diagrams/architecture.mmd');
    });
  });
});
