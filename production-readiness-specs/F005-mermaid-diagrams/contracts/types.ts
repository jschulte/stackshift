/**
 * Shared Type Definitions for Diagram Generation
 *
 * @module types
 * @version 1.0.0
 */

// ============================================================================
// Gear States
// ============================================================================

export type GearState =
  | 'analyze'
  | 'reverse-engineer'
  | 'create-specs'
  | 'gap-analysis'
  | 'complete-spec'
  | 'implement'
  | 'cruise-control';

// ============================================================================
// AST Nodes
// ============================================================================

export interface ClassNode {
  name: string;
  isExported: boolean;
  extends?: string;
  implements: string[];
  methods: MethodNode[];
  properties: PropertyNode[];
  sourceFile: string;
  documentation?: string;
}

export interface InterfaceNode {
  name: string;
  isExported: boolean;
  extends: string[];
  properties: PropertyNode[];
  sourceFile: string;
}

export interface MethodNode {
  name: string;
  visibility: 'public' | 'private' | 'protected';
  parameters: ParameterNode[];
  returnType: string;
  isAsync: boolean;
  isStatic: boolean;
}

export interface PropertyNode {
  name: string;
  visibility?: 'public' | 'private' | 'protected';
  type: string;
  isReadonly: boolean;
  isOptional: boolean;
}

export interface ParameterNode {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: string;
}

// ============================================================================
// Diagram Models
// ============================================================================

export interface WorkflowDiagram {
  type: 'state-machine';
  states: WorkflowStateNode[];
  transitions: StateTransition[];
  currentState?: GearState;
}

export interface WorkflowStateNode {
  id: GearState;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
}

export interface StateTransition {
  from: GearState;
  to: GearState;
  label?: string;
}

export interface ArchitectureDiagram {
  type: 'architecture';
  components: ComponentNode[];
  relationships: Relationship[];
  subgraphs: Subgraph[];
}

export interface ComponentNode {
  id: string;
  label: string;
  componentType: 'server' | 'plugin' | 'agent' | 'utility';
  fileCount?: number;
}

export interface Relationship {
  from: string;
  to: string;
  relationType: 'uses' | 'depends-on' | 'communicates' | 'contains';
  label?: string;
}

export interface Subgraph {
  name: string;
  componentIds: string[];
}

export interface ClassDiagram {
  type: 'class';
  moduleName: string;
  classes: ClassNode[];
  interfaces: InterfaceNode[];
  relationships: ClassRelationship[];
}

export interface ClassRelationship {
  from: string;
  to: string;
  relationType: 'inherits' | 'implements' | 'uses' | 'composes';
}

export interface SequenceDiagram {
  type: 'sequence';
  title: string;
  gear: GearState;
  participants: Participant[];
  steps: SequenceStep[];
}

export interface Participant {
  id: string;
  label: string;
  type: 'user' | 'tool' | 'utility' | 'external';
}

export interface SequenceStep {
  from: string;
  to: string;
  message: string;
  order: number;
}

// ============================================================================
// Mermaid Output
// ============================================================================

export interface MermaidCode {
  diagramType: 'stateDiagram-v2' | 'graph' | 'classDiagram' | 'sequenceDiagram';
  code: string;
  markdownCode: string;
  outputPath: string;
  generatedAt: Date;
}

export interface DiagramMetadata {
  diagrams: DiagramInfo[];
  generatedAt: Date;
  stackshiftVersion: string;
  stats: GenerationStats;
}

export interface DiagramInfo {
  name: string;
  type: string;
  path: string;
  lines: number;
  nodes: number;
}

export interface GenerationStats {
  totalDiagrams: number;
  generationTimeMs: number;
  sourceFilesParsed: number;
  errors: number;
}
