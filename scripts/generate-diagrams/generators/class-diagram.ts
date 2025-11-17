/**
 * Class diagram generator for TypeScript modules
 * @module class-diagram
 */

import { ASTParser } from '../parsers/ast-parser.js';
import type { ClassNode, InterfaceNode, MermaidCode, ClassDiagram } from '../types.js';

/**
 * Generates Mermaid class diagrams from TypeScript source files
 */
export class ClassDiagramGenerator {
  private parser: ASTParser;

  constructor() {
    this.parser = new ASTParser();
  }

  /**
   * Parse a TypeScript module file and extract class diagram data
   * @param filePath - Path to TypeScript file
   * @param moduleName - Name of the module (e.g., 'security', 'state-manager')
   * @returns ClassDiagram with classes and interfaces
   */
  async parse(filePath: string, moduleName: string): Promise<ClassDiagram> {
    const { classes, interfaces } = await this.parser.parseFile(filePath);

    return {
      type: 'class',
      moduleName,
      classes,
      interfaces,
      relationships: this.extractRelationships(classes, interfaces)
    };
  }

  /**
   * Convert class diagram to Mermaid syntax
   * @param diagram - ClassDiagram to convert
   * @returns Mermaid code with classDiagram syntax
   */
  toMermaid(diagram: ClassDiagram): MermaidCode {
    const lines: string[] = ['classDiagram'];

    // Add classes
    for (const cls of diagram.classes) {
      lines.push(`    class ${cls.name} {`);

      // Add properties
      for (const prop of cls.properties) {
        lines.push(`        ${prop.visibility}${prop.type} ${prop.name}`);
      }

      // Add methods
      for (const method of cls.methods) {
        const params = method.parameters.join(', ');
        lines.push(`        ${method.visibility}${method.name}(${params}) ${method.returnType}`);
      }

      lines.push('    }');
      lines.push('');
    }

    // Add interfaces
    for (const iface of diagram.interfaces) {
      lines.push(`    class ${iface.name} {`);
      lines.push('        <<interface>>');

      // Add properties
      for (const prop of iface.properties) {
        lines.push(`        ${prop.visibility}${prop.type} ${prop.name}`);
      }

      // Add methods
      for (const method of iface.methods) {
        const params = method.parameters.join(', ');
        lines.push(`        ${method.visibility}${method.name}(${params}) ${method.returnType}`);
      }

      lines.push('    }');
      lines.push('');
    }

    // Add relationships
    for (const rel of diagram.relationships) {
      lines.push(`    ${rel.from} ${rel.type} ${rel.to}${rel.label ? `: ${rel.label}` : ''}`);
    }

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

  /**
   * Extract relationships between classes and interfaces
   * @param classes - List of classes
   * @param interfaces - List of interfaces
   * @returns List of relationships
   */
  private extractRelationships(
    classes: ClassNode[],
    interfaces: InterfaceNode[]
  ): Array<{ from: string; to: string; type: string; label?: string }> {
    const relationships: Array<{ from: string; to: string; type: string; label?: string }> = [];

    // Class inheritance
    for (const cls of classes) {
      if (cls.extends) {
        relationships.push({
          from: cls.name,
          to: cls.extends,
          type: '--|>'
        });
      }

      // Class implements interface
      if (cls.implements) {
        for (const iface of cls.implements) {
          relationships.push({
            from: cls.name,
            to: iface,
            type: '..|>'
          });
        }
      }
    }

    // Interface inheritance
    for (const iface of interfaces) {
      if (iface.extends) {
        for (const parent of iface.extends) {
          relationships.push({
            from: iface.name,
            to: parent,
            type: '--|>'
          });
        }
      }
    }

    // Detect composition relationships by looking at property types
    for (const cls of classes) {
      for (const prop of cls.properties) {
        // Check if property type matches another class or interface
        const matchedClass = classes.find(c => c.name === prop.type);
        const matchedInterface = interfaces.find(i => i.name === prop.type);

        if (matchedClass) {
          relationships.push({
            from: cls.name,
            to: matchedClass.name,
            type: '--*',
            label: prop.name
          });
        } else if (matchedInterface) {
          relationships.push({
            from: cls.name,
            to: matchedInterface.name,
            type: '--*',
            label: prop.name
          });
        }
      }
    }

    return relationships;
  }
}
