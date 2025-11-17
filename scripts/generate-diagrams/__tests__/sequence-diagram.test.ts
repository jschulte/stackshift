/**
 * Tests for sequence diagram generator
 * @module sequence-diagram.test
 */

import { describe, test, expect } from 'vitest';
import { SequenceDiagramGenerator } from '../generators/sequence-diagram.js';

describe('SequenceDiagramGenerator', () => {
  const generator = new SequenceDiagramGenerator();

  describe('analyze', () => {
    test('extracts participants for analyze gear', () => {
      const diagram = generator.analyze('analyze');

      expect(diagram.type).toBe('sequence');
      expect(diagram.gearName).toBe('analyze');
      expect(diagram.participants).toBeDefined();
      expect(diagram.steps).toBeDefined();

      // Check participants
      const participantIds = diagram.participants.map(p => p.id);
      expect(participantIds).toContain('Claude');
      expect(participantIds).toContain('Tool');
      expect(participantIds).toContain('Utils');
      expect(participantIds).toContain('State');
      expect(participantIds).toContain('FileUtils');
      expect(participantIds).toContain('Security');
    });

    test('extracts participants for reverse-engineer gear', () => {
      const diagram = generator.analyze('reverse-engineer');

      expect(diagram.gearName).toBe('reverse-engineer');

      const participantIds = diagram.participants.map(p => p.id);
      expect(participantIds).toContain('Claude');
      expect(participantIds).toContain('Tool');
      expect(participantIds).toContain('AST');
      expect(participantIds).toContain('FileUtils');
    });

    test('extracts participants for create-specs gear', () => {
      const diagram = generator.analyze('create-specs');

      expect(diagram.gearName).toBe('create-specs');

      const participantIds = diagram.participants.map(p => p.id);
      expect(participantIds).toContain('Claude');
      expect(participantIds).toContain('Tool');
      expect(participantIds).toContain('SpecWriter');
      expect(participantIds).toContain('FileUtils');
    });
  });

  describe('extractSteps', () => {
    test('extracts interaction steps for analyze gear', () => {
      const diagram = generator.analyze('analyze');

      expect(diagram.steps.length).toBeGreaterThan(0);

      // Check for key interactions
      const messages = diagram.steps.filter(s => s.type === 'message');
      expect(messages.length).toBeGreaterThan(0);

      // Should have Claude -> Tool interaction
      const claudeToTool = messages.find(
        s => s.type === 'message' && s.from === 'Claude' && s.to === 'Tool'
      );
      expect(claudeToTool).toBeDefined();

      // Should have Tool -> State interaction
      const toolToState = messages.find(
        s => s.type === 'message' && s.from === 'Tool' && s.to === 'State'
      );
      expect(toolToState).toBeDefined();

      // Should have note about state persistence
      const stateNote = diagram.steps.find(
        s => s.type === 'note' && s.participant === 'State'
      );
      expect(stateNote).toBeDefined();
    });

    test('includes activate/deactivate steps', () => {
      const diagram = generator.analyze('analyze');

      const activateSteps = diagram.steps.filter(s => s.type === 'activate');
      const deactivateSteps = diagram.steps.filter(s => s.type === 'deactivate');

      expect(activateSteps.length).toBeGreaterThan(0);
      expect(deactivateSteps.length).toBeGreaterThan(0);
    });
  });

  describe('toMermaid', () => {
    test('generates valid sequenceDiagram syntax', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.diagramType).toBe('sequenceDiagram');
      expect(mermaid.code).toContain('sequenceDiagram');
      expect(mermaid.markdownCode).toContain('```mermaid');
      expect(mermaid.markdownCode).toContain('```');
    });

    test('includes all participants', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('participant Claude');
      expect(mermaid.code).toContain('participant Tool');
      expect(mermaid.code).toContain('participant Utils');
      expect(mermaid.code).toContain('participant State');
      expect(mermaid.code).toContain('participant FileUtils');
      expect(mermaid.code).toContain('participant Security');
    });

    test('includes message arrows', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      // Check for synchronous messages (->)
      expect(mermaid.code).toContain('->');

      // Messages should have format: From -> To: message
      expect(mermaid.code).toMatch(/\w+ -> \w+: .+/);
    });

    test('includes notes', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('Note over');
    });

    test('includes activate/deactivate', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('activate Tool');
      expect(mermaid.code).toContain('deactivate Tool');
    });

    test('sets correct output path', () => {
      const diagram = generator.analyze('analyze');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.outputPath).toBe('docs/diagrams/sequence-analyze.mmd');
    });

    test('generates different diagrams for different gears', () => {
      const analyzeDiagram = generator.analyze('analyze');
      const reverseEngineerDiagram = generator.analyze('reverse-engineer');

      const analyzeMermaid = generator.toMermaid(analyzeDiagram);
      const reverseEngineerMermaid = generator.toMermaid(reverseEngineerDiagram);

      expect(analyzeMermaid.code).not.toBe(reverseEngineerMermaid.code);
      expect(analyzeMermaid.outputPath).toBe('docs/diagrams/sequence-analyze.mmd');
      expect(reverseEngineerMermaid.outputPath).toBe('docs/diagrams/sequence-reverse-engineer.mmd');
    });

    test('wraps code in markdown code block', () => {
      const diagram = generator.analyze('create-specs');
      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.markdownCode).toContain('```mermaid');
      expect(mermaid.markdownCode).toContain('```');
      expect(mermaid.markdownCode).toContain(mermaid.code);
    });
  });
});
