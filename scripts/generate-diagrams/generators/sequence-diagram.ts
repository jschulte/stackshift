/**
 * Sequence diagram generator for gear workflows
 * @module sequence-diagram
 */

import type { MermaidCode, SequenceDiagram, SequenceStep, GearState } from '../types.js';

/**
 * Generates Mermaid sequence diagrams showing tool interactions
 */
export class SequenceDiagramGenerator {
  /**
   * Analyze a gear workflow and identify participants and steps
   * @param gear - Gear name (e.g., 'analyze', 'reverse-engineer')
   * @returns SequenceDiagram with participants and interactions
   */
  analyze(gear: GearState): SequenceDiagram {
    const participants = this.identifyParticipants(gear);
    const steps = this.extractSteps(gear);

    return {
      type: 'sequence',
      gearName: gear,
      participants,
      steps
    };
  }

  /**
   * Convert sequence diagram to Mermaid syntax
   * @param diagram - SequenceDiagram to convert
   * @returns Mermaid code with sequenceDiagram syntax
   */
  toMermaid(diagram: SequenceDiagram): MermaidCode {
    const lines: string[] = ['sequenceDiagram'];

    // Add participants
    for (const participant of diagram.participants) {
      lines.push(`    participant ${participant.id} as ${participant.label}`);
    }

    lines.push('');

    // Add steps
    for (const step of diagram.steps) {
      if (step.type === 'message') {
        const arrow = step.async ? '-)' : '->';
        lines.push(`    ${step.from} ${arrow} ${step.to}: ${step.message}`);
      } else if (step.type === 'note') {
        lines.push(`    Note over ${step.participant}: ${step.message}`);
      } else if (step.type === 'activate') {
        lines.push(`    activate ${step.participant}`);
      } else if (step.type === 'deactivate') {
        lines.push(`    deactivate ${step.participant}`);
      }
    }

    const code = lines.join('\n');
    const markdownCode = `\`\`\`mermaid\n${code}\n\`\`\``;

    return {
      diagramType: 'sequenceDiagram',
      code,
      markdownCode,
      outputPath: `docs/diagrams/sequence-${diagram.gearName}.mmd`,
      generatedAt: new Date()
    };
  }

  /**
   * Identify participants for a gear
   * @param gear - Gear name
   * @returns List of participants
   */
  private identifyParticipants(gear: GearState): Array<{ id: string; label: string }> {
    const baseParticipants = [
      { id: 'Claude', label: 'Claude AI' },
      { id: 'Tool', label: `${this.capitalize(gear)} Tool` },
      { id: 'Utils', label: 'Utilities' },
      { id: 'State', label: 'StateManager' }
    ];

    // Add gear-specific participants
    if (gear === 'analyze') {
      return [
        ...baseParticipants,
        { id: 'FileUtils', label: 'FileUtils' },
        { id: 'Security', label: 'SecurityValidator' }
      ];
    } else if (gear === 'reverse-engineer') {
      return [
        ...baseParticipants,
        { id: 'AST', label: 'AST Parser' },
        { id: 'FileUtils', label: 'FileUtils' }
      ];
    } else if (gear === 'create-specs') {
      return [
        ...baseParticipants,
        { id: 'SpecWriter', label: 'Spec Writer' },
        { id: 'FileUtils', label: 'FileUtils' }
      ];
    }

    return baseParticipants;
  }

  /**
   * Extract interaction steps for a gear
   * @param gear - Gear name
   * @returns List of sequence steps
   */
  private extractSteps(gear: GearState): SequenceStep[] {
    if (gear === 'analyze') {
      return [
        { type: 'message', from: 'Claude', to: 'Tool', message: 'analyze(directory)', async: false },
        { type: 'activate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'Security', message: 'validateDirectory()', async: false },
        { type: 'message', from: 'Security', to: 'Tool', message: 'validated path', async: false },
        { type: 'message', from: 'Tool', to: 'FileUtils', message: 'findFiles(patterns)', async: false },
        { type: 'message', from: 'FileUtils', to: 'Tool', message: 'file list', async: false },
        { type: 'message', from: 'Tool', to: 'Utils', message: 'detectTechStack(files)', async: false },
        { type: 'message', from: 'Utils', to: 'Tool', message: 'tech stack info', async: false },
        { type: 'message', from: 'Tool', to: 'State', message: 'update(analysisResults)', async: false },
        { type: 'message', from: 'State', to: 'Tool', message: 'state updated', async: false },
        { type: 'deactivate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'Claude', message: 'analysis complete', async: false },
        { type: 'note', participant: 'State', message: 'State persisted to .stackshift-state.json' }
      ];
    } else if (gear === 'reverse-engineer') {
      return [
        { type: 'message', from: 'Claude', to: 'Tool', message: 'reverseEngineer()', async: false },
        { type: 'activate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'State', message: 'load()', async: false },
        { type: 'message', from: 'State', to: 'Tool', message: 'current state', async: false },
        { type: 'message', from: 'Tool', to: 'FileUtils', message: 'readSourceFiles()', async: false },
        { type: 'message', from: 'FileUtils', to: 'Tool', message: 'source code', async: false },
        { type: 'message', from: 'Tool', to: 'AST', message: 'parse(sourceCode)', async: false },
        { type: 'message', from: 'AST', to: 'Tool', message: 'AST nodes', async: false },
        { type: 'message', from: 'Tool', to: 'Utils', message: 'extractBusinessLogic(ast)', async: false },
        { type: 'message', from: 'Utils', to: 'Tool', message: 'business logic', async: false },
        { type: 'message', from: 'Tool', to: 'State', message: 'update(reverseEngineeringResults)', async: false },
        { type: 'message', from: 'State', to: 'Tool', message: 'state updated', async: false },
        { type: 'deactivate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'Claude', message: 'reverse engineering complete', async: false },
        { type: 'note', participant: 'State', message: 'Business logic extracted' }
      ];
    } else if (gear === 'create-specs') {
      return [
        { type: 'message', from: 'Claude', to: 'Tool', message: 'createSpecs()', async: false },
        { type: 'activate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'State', message: 'load()', async: false },
        { type: 'message', from: 'State', to: 'Tool', message: 'business logic', async: false },
        { type: 'message', from: 'Tool', to: 'SpecWriter', message: 'generateSpec(businessLogic)', async: false },
        { type: 'note', participant: 'SpecWriter', message: 'Convert to Spec Kit format' },
        { type: 'message', from: 'SpecWriter', to: 'Tool', message: 'spec documents', async: false },
        { type: 'message', from: 'Tool', to: 'FileUtils', message: 'writeSpecs(specs)', async: false },
        { type: 'message', from: 'FileUtils', to: 'Tool', message: 'files written', async: false },
        { type: 'message', from: 'Tool', to: 'State', message: 'update(specsCreated)', async: false },
        { type: 'message', from: 'State', to: 'Tool', message: 'state updated', async: false },
        { type: 'deactivate', participant: 'Tool' },
        { type: 'message', from: 'Tool', to: 'Claude', message: 'specs created', async: false },
        { type: 'note', participant: 'State', message: 'Specs written to spec-kit/' }
      ];
    }

    // Default generic workflow
    return [
      { type: 'message', from: 'Claude', to: 'Tool', message: `${gear}()`, async: false },
      { type: 'message', from: 'Tool', to: 'Utils', message: 'process()', async: false },
      { type: 'message', from: 'Utils', to: 'Tool', message: 'result', async: false },
      { type: 'message', from: 'Tool', to: 'State', message: 'update()', async: false },
      { type: 'message', from: 'Tool', to: 'Claude', message: 'complete', async: false }
    ];
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
