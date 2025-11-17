/**
 * API Contracts for TypeScript AST Parsing
 *
 * @module ast-parser.contract
 * @version 1.0.0
 */

import type { ClassNode, InterfaceNode, MethodNode, PropertyNode } from './types';

/**
 * TypeScript AST parser interface.
 * Extracts class and interface information from TypeScript source files.
 */
export interface IASTParser {
  /**
   * Parse a TypeScript file and extract classes and interfaces.
   *
   * @param filePath - Path to TypeScript file
   * @returns Parsed AST nodes
   * @throws {ParseError} If file cannot be parsed
   */
  parseFile(filePath: string): Promise<ParsedFile>;

  /**
   * Parse multiple TypeScript files.
   *
   * @param filePaths - Array of file paths
   * @returns Array of parsed files
   */
  parseFiles(filePaths: string[]): Promise<ParsedFile[]>;

  /**
   * Extract class from TypeScript AST node.
   *
   * @param node - TypeScript ClassDeclaration node
   * @param sourceFile - Source file path
   * @returns Extracted class information
   */
  extractClass(node: any, sourceFile: string): ClassNode;

  /**
   * Extract interface from TypeScript AST node.
   *
   * @param node - TypeScript InterfaceDeclaration node
   * @param sourceFile - Source file path
   * @returns Extracted interface information
   */
  extractInterface(node: any, sourceFile: string): InterfaceNode;

  /**
   * Extract method from class member.
   *
   * @param node - TypeScript MethodDeclaration node
   * @returns Extracted method information
   */
  extractMethod(node: any): MethodNode;

  /**
   * Extract property from class or interface member.
   *
   * @param node - TypeScript PropertyDeclaration node
   * @returns Extracted property information
   */
  extractProperty(node: any): PropertyNode;
}

/**
 * Result of parsing a single file.
 */
export interface ParsedFile {
  /** Source file path */
  filePath: string;

  /** Extracted classes */
  classes: ClassNode[];

  /** Extracted interfaces */
  interfaces: InterfaceNode[];

  /** Parse errors (if any) */
  errors: ParseError[];

  /** File successfully parsed */
  success: boolean;
}

/**
 * Parse error.
 */
export interface ParseError {
  /** Error message */
  message: string;

  /** Line number */
  line?: number;

  /** Column number */
  column?: number;

  /** Error code */
  code?: string;
}

/**
 * Relationship extractor interface.
 * Extracts relationships between classes and interfaces.
 */
export interface IRelationshipExtractor {
  /**
   * Extract inheritance relationships (extends).
   *
   * @param classes - Array of classes
   * @returns Array of inheritance relationships
   */
  extractInheritance(classes: ClassNode[]): Relationship[];

  /**
   * Extract implementation relationships (implements).
   *
   * @param classes - Array of classes
   * @param interfaces - Array of interfaces
   * @returns Array of implementation relationships
   */
  extractImplementation(
    classes: ClassNode[],
    interfaces: InterfaceNode[]
  ): Relationship[];

  /**
   * Extract usage relationships (uses).
   *
   * @param classes - Array of classes
   * @returns Array of usage relationships
   */
  extractUsage(classes: ClassNode[]): Relationship[];

  /**
   * Extract all relationships.
   *
   * @param classes - Array of classes
   * @param interfaces - Array of interfaces
   * @returns All relationships
   */
  extractAll(
    classes: ClassNode[],
    interfaces: InterfaceNode[]
  ): RelationshipGraph;
}

/**
 * Relationship between classes/interfaces.
 */
export interface Relationship {
  /** Source class/interface name */
  from: string;

  /** Target class/interface name */
  to: string;

  /** Relationship type */
  type: 'inherits' | 'implements' | 'uses' | 'composes';

  /** Source file */
  sourceFile: string;
}

/**
 * Complete relationship graph.
 */
export interface RelationshipGraph {
  /** Inheritance relationships */
  inheritance: Relationship[];

  /** Implementation relationships */
  implementation: Relationship[];

  /** Usage relationships */
  usage: Relationship[];

  /** Composition relationships */
  composition: Relationship[];
}

/**
 * Type resolver interface.
 * Resolves TypeScript types to simplified string representations.
 */
export interface ITypeResolver {
  /**
   * Resolve TypeScript type to string.
   *
   * @param typeNode - TypeScript type node
   * @returns String representation of type
   */
  resolveType(typeNode: any): string;

  /**
   * Check if type is a class/interface reference.
   *
   * @param typeName - Type name
   * @returns True if reference type
   */
  isReferenceType(typeName: string): boolean;

  /**
   * Simplify complex types (generics, unions) for display.
   *
   * @param typeName - Full type name
   * @returns Simplified type name
   */
  simplifyType(typeName: string): string;
}

/**
 * Custom errors
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public line?: number,
    public column?: number
  ) {
    super(`${message} at ${filePath}:${line ?? '?'}:${column ?? '?'}`);
    this.name = 'ParseError';
  }
}

export class UnsupportedSyntaxError extends Error {
  constructor(message: string) {
    super(`Unsupported TypeScript syntax: ${message}`);
    this.name = 'UnsupportedSyntaxError';
  }
}
