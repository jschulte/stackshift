# Quickstart Guide: F005-mermaid-diagrams

**Feature:** Mermaid Diagram Generation
**Date:** 2025-11-17
**Estimated Time:** 12-16 hours

---

## Overview

This guide provides step-by-step instructions for implementing auto-generated Mermaid diagrams for StackShift documentation. Follow these steps to add visual diagrams for workflows, architecture, classes, and sequences.

---

## Prerequisites

- ✅ TypeScript 5.3.0+ (already installed)
- ✅ Node.js 18+ (already installed)
- ✅ Vitest 1.0+ (already installed)
- ✅ StackShift codebase cloned

No new dependencies required! 🎉

---

## Implementation Steps

### Phase 1: Project Setup (30 minutes)

#### Step 1.1: Create Directory Structure

```bash
# Create diagram generation scripts directory
mkdir -p scripts/generate-diagrams
mkdir -p scripts/generate-diagrams/parsers
mkdir -p scripts/generate-diagrams/generators
mkdir -p scripts/generate-diagrams/embedders

# Create output directory for diagrams
mkdir -p docs/diagrams

# Create tests directory
mkdir -p scripts/generate-diagrams/__tests__
```

#### Step 1.2: Create Main Entry Point

**File:** `scripts/generate-diagrams/index.ts`

```typescript
#!/usr/bin/env tsx

import { DiagramGenerator } from './diagram-generator';

async function main() {
  const generator = new DiagramGenerator({
    rootDir: process.cwd(),
    outputDir: 'docs/diagrams',
    verbose: process.argv.includes('--verbose')
  });

  console.log('🎨 Generating Mermaid diagrams...\n');

  const result = await generator.generateAll();

  console.log('\n✅ Generation complete!');
  console.log(`  Workflow: ${result.workflow ? '✓' : '✗'}`);
  console.log(`  Architecture: ${result.architecture ? '✓' : '✗'}`);
  console.log(`  Class diagrams: ${result.classDiagrams.length}`);
  console.log(`  Sequence diagrams: ${result.sequenceDiagrams.length}`);

  if (result.errors.length > 0) {
    console.warn(`\n⚠️  ${result.errors.length} errors encountered`);
    result.errors.forEach(err => console.warn(`  - ${err.message}`));
  }
}

main().catch(error => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
```

#### Step 1.3: Add npm Script

**File:** `package.json`

```json
{
  "scripts": {
    "generate-diagrams": "tsx scripts/generate-diagrams/index.ts",
    "generate-diagrams:verbose": "tsx scripts/generate-diagrams/index.ts --verbose"
  }
}
```

---

### Phase 2: Workflow Diagram Generator (2 hours)

#### Step 2.1: Create Workflow Diagram Generator

**File:** `scripts/generate-diagrams/generators/workflow-diagram.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { WorkflowDiagram, MermaidCode, GearState } from '../../../production-readiness-specs/F005-mermaid-diagrams/contracts/types';

export class WorkflowDiagramGenerator {
  async parse(stateFilePath: string): Promise<WorkflowDiagram> {
    // Read state file
    const content = await fs.readFile(stateFilePath, 'utf-8');
    const state = JSON.parse(content);

    // Define all states
    const states: WorkflowDiagram['states'] = [
      { id: 'analyze', label: 'Analyze', isInitial: true, isFinal: false },
      { id: 'reverse-engineer', label: 'Reverse Engineer', isInitial: false, isFinal: false },
      { id: 'create-specs', label: 'Create Specs', isInitial: false, isFinal: false },
      { id: 'gap-analysis', label: 'Gap Analysis', isInitial: false, isFinal: false },
      { id: 'complete-spec', label: 'Complete Spec', isInitial: false, isFinal: false },
      { id: 'implement', label: 'Implement', isInitial: false, isFinal: true },
      { id: 'cruise-control', label: 'Cruise Control', isInitial: false, isFinal: true }
    ];

    // Define transitions
    const transitions: WorkflowDiagram['transitions'] = [
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
      currentState: state.current_gear as GearState | undefined
    };
  }

  toMermaid(diagram: WorkflowDiagram): MermaidCode {
    const lines: string[] = ['stateDiagram-v2'];

    // Initial state
    const initialState = diagram.states.find(s => s.isInitial);
    if (initialState) {
      lines.push(`    [*] --> ${initialState.id}`);
    }

    // Transitions
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
```

#### Step 2.2: Test Workflow Generator

**File:** `scripts/generate-diagrams/__tests__/workflow-diagram.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { WorkflowDiagramGenerator } from '../generators/workflow-diagram';

describe('WorkflowDiagramGenerator', () => {
  test('generates valid state diagram', async () => {
    const generator = new WorkflowDiagramGenerator();

    // Mock workflow diagram
    const diagram = {
      type: 'state-machine' as const,
      states: [
        { id: 'analyze' as const, label: 'Analyze', isInitial: true, isFinal: false },
        { id: 'implement' as const, label: 'Implement', isInitial: false, isFinal: true }
      ],
      transitions: [
        { from: 'analyze' as const, to: 'implement' as const }
      ]
    };

    const mermaid = generator.toMermaid(diagram);

    expect(mermaid.diagramType).toBe('stateDiagram-v2');
    expect(mermaid.code).toContain('stateDiagram-v2');
    expect(mermaid.code).toContain('[*] --> analyze');
    expect(mermaid.code).toContain('analyze --> implement');
    expect(mermaid.code).toContain('implement --> [*]');
  });
});
```

---

### Phase 3: Architecture Diagram Generator (3 hours)

#### Step 3.1: Create Architecture Generator

**File:** `scripts/generate-diagrams/generators/architecture-diagram.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { ArchitectureDiagram, MermaidCode } from '../../../production-readiness-specs/F005-mermaid-diagrams/contracts/types';

export class ArchitectureDiagramGenerator {
  async analyze(rootDir: string): Promise<ArchitectureDiagram> {
    // Analyze directory structure
    const components: ArchitectureDiagram['components'] = [
      { id: 'mcp_tools', label: '7 MCP Tools', componentType: 'server' },
      { id: 'mcp_resources', label: 'Resources Layer', componentType: 'server' },
      { id: 'mcp_utils', label: 'Utilities', componentType: 'utility' },
      { id: 'plugin_skills', label: '7 Skills', componentType: 'plugin' },
      { id: 'plugin_agents', label: '2 Agents', componentType: 'agent' },
      { id: 'claude', label: 'Claude AI', componentType: 'external' }
    ];

    const relationships: ArchitectureDiagram['relationships'] = [
      { from: 'claude', to: 'plugin_skills', relationType: 'uses' },
      { from: 'plugin_skills', to: 'mcp_tools', relationType: 'communicates' },
      { from: 'mcp_tools', to: 'mcp_utils', relationType: 'uses' },
      { from: 'mcp_utils', to: 'mcp_resources', relationType: 'uses' }
    ];

    const subgraphs: ArchitectureDiagram['subgraphs'] = [
      { name: 'MCP Server', componentIds: ['mcp_tools', 'mcp_resources', 'mcp_utils'] },
      { name: 'Claude Code Plugin', componentIds: ['plugin_skills', 'plugin_agents'] }
    ];

    return {
      type: 'architecture',
      components,
      relationships,
      subgraphs
    };
  }

  toMermaid(diagram: ArchitectureDiagram): MermaidCode {
    const lines: string[] = ['graph TB'];

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

    // External components
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
```

---

### Phase 4: Class Diagram Generator (5-6 hours)

#### Step 4.1: Create AST Parser

**File:** `scripts/generate-diagrams/parsers/ast-parser.ts`

```typescript
import ts from 'typescript';
import fs from 'fs/promises';
import type { ClassNode, InterfaceNode, MethodNode, PropertyNode } from '../../../production-readiness-specs/F005-mermaid-diagrams/contracts/types';

export class ASTParser {
  async parseFile(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const classes: ClassNode[] = [];
    const interfaces: InterfaceNode[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        classes.push(this.extractClass(node, filePath));
      }
      if (ts.isInterfaceDeclaration(node)) {
        interfaces.push(this.extractInterface(node, filePath));
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { classes, interfaces };
  }

  private extractClass(node: ts.ClassDeclaration, sourceFile: string): ClassNode {
    const name = node.name?.text || 'Anonymous';
    const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false;

    const methods: MethodNode[] = [];
    const properties: PropertyNode[] = [];

    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member) && member.name) {
        methods.push(this.extractMethod(member));
      }
      if (ts.isPropertyDeclaration(member) && member.name) {
        properties.push(this.extractProperty(member));
      }
    });

    return {
      name,
      isExported,
      extends: node.heritageClauses?.[0]?.types[0]?.expression.getText(),
      implements: [],
      methods,
      properties,
      sourceFile
    };
  }

  private extractInterface(node: ts.InterfaceDeclaration, sourceFile: string): InterfaceNode {
    const name = node.name.text;
    const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false;

    const properties: PropertyNode[] = [];
    node.members.forEach(member => {
      if (ts.isPropertySignature(member) && member.name) {
        properties.push({
          name: member.name.getText(),
          type: member.type?.getText() || 'any',
          isReadonly: false,
          isOptional: !!member.questionToken
        });
      }
    });

    return {
      name,
      isExported,
      extends: [],
      properties,
      sourceFile
    };
  }

  private extractMethod(node: ts.MethodDeclaration): MethodNode {
    const name = node.name.getText();
    const visibility = this.getVisibility(node);
    const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;
    const isStatic = node.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;

    return {
      name,
      visibility,
      parameters: [],
      returnType: node.type?.getText() || 'void',
      isAsync,
      isStatic
    };
  }

  private extractProperty(node: ts.PropertyDeclaration): PropertyNode {
    return {
      name: node.name.getText(),
      visibility: this.getVisibility(node),
      type: node.type?.getText() || 'any',
      isReadonly: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false,
      isOptional: !!node.questionToken
    };
  }

  private getVisibility(node: ts.ClassElement): 'public' | 'private' | 'protected' {
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)) return 'private';
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword)) return 'protected';
    return 'public';
  }
}
```

#### Step 4.2: Create Class Diagram Generator

**File:** `scripts/generate-diagrams/generators/class-diagram.ts`

```typescript
import { ASTParser } from '../parsers/ast-parser';
import type { ClassDiagram, MermaidCode } from '../../../production-readiness-specs/F005-mermaid-diagrams/contracts/types';

export class ClassDiagramGenerator {
  private parser = new ASTParser();

  async parse(modulePath: string, moduleName: string): Promise<ClassDiagram> {
    const { classes, interfaces } = await this.parser.parseFile(modulePath);

    // Filter to exported only
    const exportedClasses = classes.filter(c => c.isExported);
    const exportedInterfaces = interfaces.filter(i => i.isExported);

    return {
      type: 'class',
      moduleName,
      classes: exportedClasses,
      interfaces: exportedInterfaces,
      relationships: []
    };
  }

  toMermaid(diagram: ClassDiagram): MermaidCode {
    const lines: string[] = ['classDiagram'];

    // Classes
    diagram.classes.forEach(cls => {
      lines.push(`    class ${cls.name} {`);

      // Properties
      cls.properties.forEach(prop => {
        const visibility = prop.visibility === 'private' ? '-' : prop.visibility === 'protected' ? '#' : '+';
        lines.push(`        ${visibility}${prop.type} ${prop.name}`);
      });

      // Methods
      cls.methods.forEach(method => {
        const visibility = method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+';
        lines.push(`        ${visibility}${method.name}()`);
      });

      lines.push('    }');
    });

    // Relationships
    diagram.classes.forEach(cls => {
      if (cls.extends) {
        lines.push(`    ${cls.extends} <|-- ${cls.name}`);
      }
    });

    const code = lines.join('\n');
    const markdownCode = `\`\`\`mermaid\n${code}\n\`\`\``;

    return {
      diagramType: 'classDiagram',
      code,
      markdownCode,
      outputPath: `docs/diagrams/class-${diagram.moduleName}.mmd`,
      generatedAt: new Date()
    };
  }
}
```

---

### Phase 5: Main Diagram Generator (2 hours)

**File:** `scripts/generate-diagrams/diagram-generator.ts`

```typescript
import { WorkflowDiagramGenerator } from './generators/workflow-diagram';
import { ArchitectureDiagramGenerator } from './generators/architecture-diagram';
import { ClassDiagramGenerator } from './generators/class-diagram';
import path from 'path';
import fs from 'fs/promises';

export class DiagramGenerator {
  constructor(private options: {
    rootDir: string;
    outputDir?: string;
    verbose?: boolean;
  }) {}

  async generateAll() {
    const result = {
      workflow: null,
      architecture: null,
      classDiagrams: [],
      sequenceDiagrams: [],
      metadata: null,
      errors: []
    };

    // Workflow diagram
    try {
      const workflowGen = new WorkflowDiagramGenerator();
      const stateFile = path.join(this.options.rootDir, '.stackshift-state.json');
      const diagram = await workflowGen.parse(stateFile);
      result.workflow = workflowGen.toMermaid(diagram);
      await this.writeFile(result.workflow);
    } catch (error) {
      result.errors.push({ type: 'generate', message: error.message });
    }

    // Architecture diagram
    try {
      const archGen = new ArchitectureDiagramGenerator();
      const diagram = await archGen.analyze(this.options.rootDir);
      result.architecture = archGen.toMermaid(diagram);
      await this.writeFile(result.architecture);
    } catch (error) {
      result.errors.push({ type: 'generate', message: error.message });
    }

    // Class diagrams (security, state-manager, file-utils)
    const modules = ['security', 'state-manager', 'file-utils'];
    for (const module of modules) {
      try {
        const classGen = new ClassDiagramGenerator();
        const modulePath = path.join(this.options.rootDir, `mcp-server/src/utils/${module}.ts`);
        const diagram = await classGen.parse(modulePath, module);
        const mermaid = classGen.toMermaid(diagram);
        result.classDiagrams.push(mermaid);
        await this.writeFile(mermaid);
      } catch (error) {
        result.errors.push({ type: 'generate', message: error.message, sourceFile: module });
      }
    }

    return result;
  }

  private async writeFile(mermaid: any) {
    const outputPath = path.join(this.options.rootDir, mermaid.outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, mermaid.code);
    if (this.options.verbose) {
      console.log(`  ✓ ${mermaid.outputPath}`);
    }
  }
}
```

---

### Phase 6: Testing & CI Integration (2 hours)

#### Step 6.1: Run Tests

```bash
npm test scripts/generate-diagrams/__tests__
```

#### Step 6.2: Add CI Check

**File:** `.github/workflows/ci.yml`

```yaml
- name: Check diagrams are up-to-date
  run: |
    npm run generate-diagrams
    git diff --exit-code docs/diagrams/ || (echo "⚠️  Diagrams are stale. Run 'npm run generate-diagrams'" && exit 1)
```

---

## Quick Test

```bash
# Generate all diagrams
npm run generate-diagrams

# Check output
ls -lh docs/diagrams/

# View diagrams
cat docs/diagrams/workflow.mmd
```

---

## Troubleshooting

### Issue: TypeScript parsing errors
**Solution:** Check that source files compile successfully with `npm run build`

### Issue: State file not found
**Solution:** Ensure `.stackshift-state.json` exists in the root directory

### Issue: Diagrams not rendering on GitHub
**Solution:** Verify Mermaid syntax at https://mermaid.live

---

## Next Steps

After implementation:
1. Run `npm run generate-diagrams` to create all diagrams
2. Embed diagrams in documentation (README.md, docs/*.md)
3. Commit generated diagrams and code
4. Push to GitHub and verify diagrams render correctly

---

**Implementation Status:** Ready to start
**Estimated Completion:** 12-16 hours
