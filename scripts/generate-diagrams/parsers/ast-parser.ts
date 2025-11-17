/**
 * TypeScript AST parser for extracting class diagrams
 * @module ast-parser
 */

import * as ts from 'typescript';
import { promises as fs } from 'fs';
import type { ClassNode, InterfaceNode, MethodNode, PropertyNode } from '../types.js';

/**
 * Parses TypeScript source files to extract class and interface information
 */
export class ASTParser {
  /**
   * Parse a TypeScript file and extract classes and interfaces
   * @param filePath - Path to TypeScript file
   * @returns Parsed classes and interfaces
   */
  async parseFile(filePath: string): Promise<{
    classes: ClassNode[];
    interfaces: InterfaceNode[];
  }> {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Create source file
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const classes: ClassNode[] = [];
    const interfaces: InterfaceNode[] = [];

    // Visit all nodes in the AST
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const classNode = this.extractClass(node);
        if (classNode) {
          classes.push(classNode);
        }
      } else if (ts.isInterfaceDeclaration(node)) {
        const interfaceNode = this.extractInterface(node);
        if (interfaceNode) {
          interfaces.push(interfaceNode);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { classes, interfaces };
  }

  /**
   * Extract class information from a ClassDeclaration node
   * @param node - TypeScript ClassDeclaration node
   * @returns ClassNode or null if node cannot be processed
   */
  extractClass(node: ts.ClassDeclaration): ClassNode | null {
    const name = node.name?.text;
    if (!name) {
      return null;
    }

    const methods: MethodNode[] = [];
    const properties: PropertyNode[] = [];
    const extendsList: string[] = [];
    const implementsList: string[] = [];

    // Extract extends clause
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          clause.types.forEach((type: ts.ExpressionWithTypeArguments) => {
            const typeName = type.expression.getText();
            extendsList.push(typeName);
          });
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          clause.types.forEach((type: ts.ExpressionWithTypeArguments) => {
            const typeName = type.expression.getText();
            implementsList.push(typeName);
          });
        }
      }
    }

    // Extract members
    for (const member of node.members) {
      if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
        const method = this.extractMethod(member);
        if (method) {
          methods.push(method);
        }
      } else if (ts.isPropertyDeclaration(member)) {
        const property = this.extractProperty(member);
        if (property) {
          properties.push(property);
        }
      }
    }

    return {
      name,
      methods,
      properties,
      extends: extendsList.length > 0 ? extendsList[0] : undefined,
      implements: implementsList
    };
  }

  /**
   * Extract interface information from an InterfaceDeclaration node
   * @param node - TypeScript InterfaceDeclaration node
   * @returns InterfaceNode or null if node cannot be processed
   */
  extractInterface(node: ts.InterfaceDeclaration): InterfaceNode | null {
    const name = node.name.text;
    const properties: PropertyNode[] = [];
    const methods: MethodNode[] = [];
    const extendsList: string[] = [];

    // Extract extends clause
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          clause.types.forEach((type: ts.ExpressionWithTypeArguments) => {
            const typeName = type.expression.getText();
            extendsList.push(typeName);
          });
        }
      }
    }

    // Extract members
    for (const member of node.members) {
      if (ts.isMethodSignature(member)) {
        const method = this.extractMethodSignature(member);
        if (method) {
          methods.push(method);
        }
      } else if (ts.isPropertySignature(member)) {
        const property = this.extractPropertySignature(member);
        if (property) {
          properties.push(property);
        }
      }
    }

    return {
      name,
      properties,
      methods,
      extends: extendsList
    };
  }

  /**
   * Extract method information from a MethodDeclaration or ConstructorDeclaration
   * @param node - TypeScript MethodDeclaration or ConstructorDeclaration
   * @returns MethodNode or null if node cannot be processed
   */
  extractMethod(node: ts.MethodDeclaration | ts.ConstructorDeclaration): MethodNode | null {
    let name: string;
    if (ts.isConstructorDeclaration(node)) {
      name = 'constructor';
    } else {
      name = node.name?.getText() || '';
    }

    if (!name) {
      return null;
    }

    // Determine visibility
    let visibility: '+' | '-' | '#' = '+'; // public by default
    if (node.modifiers) {
      for (const modifier of node.modifiers) {
        if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
          visibility = '-';
        } else if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
          visibility = '#';
        }
      }
    }

    // Extract parameters
    const parameters: string[] = [];
    if (node.parameters) {
      for (const param of node.parameters) {
        const paramName = param.name.getText();
        const paramType = param.type ? param.type.getText() : 'any';
        parameters.push(`${paramName}: ${paramType}`);
      }
    }

    // Extract return type
    let returnType = 'void';
    if (node.type) {
      returnType = node.type.getText();
    }

    return {
      name,
      visibility,
      parameters,
      returnType
    };
  }

  /**
   * Extract method signature from an InterfaceDeclaration
   * @param node - TypeScript MethodSignature
   * @returns MethodNode or null if node cannot be processed
   */
  private extractMethodSignature(node: ts.MethodSignature): MethodNode | null {
    const name = node.name?.getText();
    if (!name) {
      return null;
    }

    const parameters: string[] = [];
    if (node.parameters) {
      for (const param of node.parameters) {
        const paramName = param.name.getText();
        const paramType = param.type ? param.type.getText() : 'any';
        parameters.push(`${paramName}: ${paramType}`);
      }
    }

    let returnType = 'void';
    if (node.type) {
      returnType = node.type.getText();
    }

    return {
      name,
      visibility: '+', // Interface methods are always public
      parameters,
      returnType
    };
  }

  /**
   * Extract property information from a PropertyDeclaration
   * @param node - TypeScript PropertyDeclaration
   * @returns PropertyNode or null if node cannot be processed
   */
  extractProperty(node: ts.PropertyDeclaration): PropertyNode | null {
    const name = node.name?.getText();
    if (!name) {
      return null;
    }

    // Determine visibility
    let visibility: '+' | '-' | '#' = '+'; // public by default
    if (node.modifiers) {
      for (const modifier of node.modifiers) {
        if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
          visibility = '-';
        } else if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
          visibility = '#';
        }
      }
    }

    // Extract type
    let type = 'any';
    if (node.type) {
      type = node.type.getText();
    } else if (node.initializer) {
      // Try to infer type from initializer
      const initText = node.initializer.getText();
      if (initText.startsWith('"') || initText.startsWith("'")) {
        type = 'string';
      } else if (!isNaN(Number(initText))) {
        type = 'number';
      } else if (initText === 'true' || initText === 'false') {
        type = 'boolean';
      }
    }

    return {
      name,
      visibility,
      type
    };
  }

  /**
   * Extract property signature from an InterfaceDeclaration
   * @param node - TypeScript PropertySignature
   * @returns PropertyNode or null if node cannot be processed
   */
  private extractPropertySignature(node: ts.PropertySignature): PropertyNode | null {
    const name = node.name?.getText();
    if (!name) {
      return null;
    }

    let type = 'any';
    if (node.type) {
      type = node.type.getText();
    }

    return {
      name,
      visibility: '+', // Interface properties are always public
      type
    };
  }
}
