/**
 * Workflow diagram generator for StackShift 6-gear process
 * @module workflow-diagram
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { GearState, MermaidCode } from '../types.js';

/**
 * Workflow state node
 */
interface WorkflowStateNode {
  id: GearState;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
}

/**
 * State transition
 */
interface StateTransition {
  from: GearState;
  to: GearState;
  label?: string;
}

/**
 * Workflow diagram model
 */
interface WorkflowDiagram {
  type: 'state-machine';
  states: WorkflowStateNode[];
  transitions: StateTransition[];
  currentState?: GearState;
}

/**
 * Generator for workflow state machine diagrams
 */
export class WorkflowDiagramGenerator {
  /**
   * Parse state file and extract workflow diagram model
   * @param stateFilePath - Path to .stackshift-state.json
   * @returns Workflow diagram model
   */
  async parse(stateFilePath: string): Promise<WorkflowDiagram> {
    let currentState: GearState | undefined;

    // Try to read state file
    try {
      const content = await fs.readFile(stateFilePath, 'utf-8');
      const state = JSON.parse(content);
      currentState = state.current_gear as GearState;
    } catch (error) {
      // State file missing or invalid - continue with default workflow
      console.warn(`Warning: Could not read state file at ${stateFilePath}`);
    }

    // Define all states in the 6-gear workflow
    const states: WorkflowStateNode[] = [
      { id: 'analyze', label: 'Analyze', isInitial: true, isFinal: false },
      { id: 'reverse-engineer', label: 'Reverse Engineer', isInitial: false, isFinal: false },
      { id: 'create-specs', label: 'Create Specs', isInitial: false, isFinal: false },
      { id: 'gap-analysis', label: 'Gap Analysis', isInitial: false, isFinal: false },
      { id: 'complete-spec', label: 'Complete Spec', isInitial: false, isFinal: false },
      { id: 'implement', label: 'Implement', isInitial: false, isFinal: true },
      { id: 'cruise-control', label: 'Cruise Control', isInitial: false, isFinal: true }
    ];

    // Define state transitions
    const transitions: StateTransition[] = [
      { from: 'analyze', to: 'reverse-engineer' },
      { from: 'reverse-engineer', to: 'create-specs' },
      { from: 'create-specs', to: 'gap-analysis' },
      { from: 'gap-analysis', to: 'complete-spec' },
      { from: 'complete-spec', to: 'implement' },
      // Cruise control shortcut
      { from: 'analyze', to: 'cruise-control', label: 'auto' }
    ];

    return {
      type: 'state-machine',
      states,
      transitions,
      currentState
    };
  }

  /**
   * Convert workflow diagram model to Mermaid code
   * @param diagram - Workflow diagram model
   * @returns Mermaid code
   */
  toMermaid(diagram: WorkflowDiagram): MermaidCode {
    const lines: string[] = ['stateDiagram-v2'];

    // Initial state
    const initialState = diagram.states.find(s => s.isInitial);
    if (initialState) {
      lines.push(`    [*] --> ${initialState.id}`);
    }

    // State transitions
    diagram.transitions.forEach(t => {
      if (t.label) {
        lines.push(`    ${t.from} --> ${t.to}: ${t.label}`);
      } else {
        lines.push(`    ${t.from} --> ${t.to}`);
      }
    });

    // Final states
    diagram.states.filter(s => s.isFinal).forEach(s => {
      lines.push(`    ${s.id} --> [*]`);
    });

    // Add note about current state if available
    if (diagram.currentState) {
      lines.push(`    note right of ${diagram.currentState}: Current State`);
    }

    const code = lines.join('\n');
    const markdownCode = `\`\`\`mermaid\n${code}\n\`\`\``;

    return {
      diagramType: 'stateDiagram-v2',
      code,
      markdownCode,
      outputPath: 'docs/diagrams/workflow.mmd',
      generatedAt: new Date()
    };
  }
}
