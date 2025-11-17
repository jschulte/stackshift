/**
 * Tests for workflow diagram generator
 * @module workflow-diagram.test
 */

import { describe, test, expect } from 'vitest';
import { WorkflowDiagramGenerator } from '../generators/workflow-diagram.js';

describe('WorkflowDiagramGenerator', () => {
  const generator = new WorkflowDiagramGenerator();

  describe('toMermaid', () => {
    test('includes all 7 gear states', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false },
          { id: 'reverse-engineer' as const, label: 'Reverse Engineer', isInitial: false, isFinal: false },
          { id: 'create-specs' as const, label: 'Create Specs', isInitial: false, isFinal: false },
          { id: 'gap-analysis' as const, label: 'Gap Analysis', isInitial: false, isFinal: false },
          { id: 'complete-spec' as const, label: 'Complete Spec', isInitial: false, isFinal: false },
          { id: 'implement' as const, label: 'Implement', isInitial: false, isFinal: true },
          { id: 'cruise-control' as const, label: 'Cruise Control', isInitial: false, isFinal: true }
        ],
        transitions: [
          { from: 'analyze' as const, to: 'reverse-engineer' as const },
          { from: 'reverse-engineer' as const, to: 'create-specs' as const },
          { from: 'create-specs' as const, to: 'gap-analysis' as const },
          { from: 'gap-analysis' as const, to: 'complete-spec' as const },
          { from: 'complete-spec' as const, to: 'implement' as const },
          { from: 'analyze' as const, to: 'cruise-control' as const, label: 'auto' }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      // Check diagram type
      expect(mermaid.diagramType).toBe('stateDiagram-v2');
      expect(mermaid.code).toContain('stateDiagram-v2');

      // Check all states are mentioned
      expect(mermaid.code).toContain('analyze');
      expect(mermaid.code).toContain('reverse-engineer');
      expect(mermaid.code).toContain('create-specs');
      expect(mermaid.code).toContain('gap-analysis');
      expect(mermaid.code).toContain('complete-spec');
      expect(mermaid.code).toContain('implement');
      expect(mermaid.code).toContain('cruise-control');
    });

    test('includes valid state transitions', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false },
          { id: 'reverse-engineer' as const, label: 'Reverse Engineer', isInitial: false, isFinal: false },
          { id: 'create-specs' as const, label: 'Create Specs', isInitial: false, isFinal: false }
        ],
        transitions: [
          { from: 'analyze' as const, to: 'reverse-engineer' as const },
          { from: 'reverse-engineer' as const, to: 'create-specs' as const }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      // Check transitions
      expect(mermaid.code).toContain('analyze --> reverse-engineer');
      expect(mermaid.code).toContain('reverse-engineer --> create-specs');
    });

    test('includes initial state transition', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false },
          { id: 'reverse-engineer' as const, label: 'Reverse Engineer', isInitial: false, isFinal: false }
        ],
        transitions: [
          { from: 'analyze' as const, to: 'reverse-engineer' as const }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      // Check initial state
      expect(mermaid.code).toContain('[*] --> analyze');
    });

    test('includes final state transitions', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false },
          { id: 'implement' as const, label: 'Implement', isInitial: false, isFinal: true },
          { id: 'cruise-control' as const, label: 'Cruise Control', isInitial: false, isFinal: true }
        ],
        transitions: [
          { from: 'analyze' as const, to: 'implement' as const },
          { from: 'analyze' as const, to: 'cruise-control' as const }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      // Check final states
      expect(mermaid.code).toContain('implement --> [*]');
      expect(mermaid.code).toContain('cruise-control --> [*]');
    });

    test('wraps code in markdown code block', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false }
        ],
        transitions: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.markdownCode).toContain('```mermaid');
      expect(mermaid.markdownCode).toContain('```');
      expect(mermaid.markdownCode).toContain(mermaid.code);
    });

    test('sets correct output path', () => {
      const diagram = {
        type: 'state-machine' as const,
        states: [
          { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false }
        ],
        transitions: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.outputPath).toBe('docs/diagrams/workflow.mmd');
    });
  });
});
