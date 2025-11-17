/**
 * Tests for class diagram generator
 * @module class-diagram.test
 */

import { describe, test, expect } from 'vitest';
import { ClassDiagramGenerator } from '../generators/class-diagram.js';
import type { ClassDiagram } from '../types.js';

describe('ClassDiagramGenerator', () => {
  const generator = new ClassDiagramGenerator();

  describe('toMermaid', () => {
    test('generates valid classDiagram syntax', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'test',
        classes: [
          {
            name: 'TestClass',
            methods: [
              {
                name: 'testMethod',
                visibility: '+',
                parameters: ['arg: string'],
                returnType: 'void'
              }
            ],
            properties: [
              {
                name: 'testProp',
                visibility: '-',
                type: 'string'
              }
            ]
          }
        ],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.diagramType).toBe('classDiagram');
      expect(mermaid.code).toContain('classDiagram');
      expect(mermaid.code).toContain('class TestClass');
      expect(mermaid.code).toContain('-string testProp');
      expect(mermaid.code).toContain('+testMethod(arg: string) void');
    });

    test('includes method visibility markers (+, -, #)', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'visibility',
        classes: [
          {
            name: 'VisibilityClass',
            methods: [
              { name: 'publicMethod', visibility: '+', parameters: [], returnType: 'void' },
              { name: 'privateMethod', visibility: '-', parameters: [], returnType: 'void' },
              { name: 'protectedMethod', visibility: '#', parameters: [], returnType: 'void' }
            ],
            properties: []
          }
        ],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('+publicMethod() void');
      expect(mermaid.code).toContain('-privateMethod() void');
      expect(mermaid.code).toContain('#protectedMethod() void');
    });

    test('includes property visibility markers', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'props',
        classes: [
          {
            name: 'PropClass',
            methods: [],
            properties: [
              { name: 'publicProp', visibility: '+', type: 'string' },
              { name: 'privateProp', visibility: '-', type: 'number' },
              { name: 'protectedProp', visibility: '#', type: 'boolean' }
            ]
          }
        ],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('+string publicProp');
      expect(mermaid.code).toContain('-number privateProp');
      expect(mermaid.code).toContain('#boolean protectedProp');
    });

    test('includes interfaces with <<interface>> stereotype', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'interface',
        classes: [],
        interfaces: [
          {
            name: 'ITestInterface',
            methods: [
              { name: 'testMethod', visibility: '+', parameters: [], returnType: 'void' }
            ],
            properties: [
              { name: 'testProp', visibility: '+', type: 'string' }
            ]
          }
        ],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('class ITestInterface');
      expect(mermaid.code).toContain('<<interface>>');
      expect(mermaid.code).toContain('+string testProp');
      expect(mermaid.code).toContain('+testMethod() void');
    });

    test('includes inheritance relationships', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'inheritance',
        classes: [
          {
            name: 'BaseClass',
            methods: [],
            properties: []
          },
          {
            name: 'DerivedClass',
            methods: [],
            properties: [],
            extends: 'BaseClass'
          }
        ],
        interfaces: [],
        relationships: [
          { from: 'DerivedClass', to: 'BaseClass', type: '-->' }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('DerivedClass --> BaseClass');
    });

    test('includes interface implementation relationships', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'implements',
        classes: [
          {
            name: 'ConcreteClass',
            methods: [],
            properties: [],
            implements: ['IInterface']
          }
        ],
        interfaces: [
          {
            name: 'IInterface',
            methods: [],
            properties: []
          }
        ],
        relationships: [
          { from: 'ConcreteClass', to: 'IInterface', type: '..>' }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('ConcreteClass ..> IInterface');
    });

    test('includes composition relationships', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'composition',
        classes: [
          {
            name: 'Container',
            methods: [],
            properties: [
              { name: 'item', visibility: '-', type: 'Item' }
            ]
          },
          {
            name: 'Item',
            methods: [],
            properties: []
          }
        ],
        interfaces: [],
        relationships: [
          { from: 'Container', to: 'Item', type: '--*', label: 'item' }
        ]
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('Container --* Item: item');
    });

    test('wraps code in markdown code block', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'test',
        classes: [
          {
            name: 'TestClass',
            methods: [],
            properties: []
          }
        ],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.markdownCode).toContain('```mermaid');
      expect(mermaid.markdownCode).toContain('```');
      expect(mermaid.markdownCode).toContain(mermaid.code);
    });

    test('sets correct output path', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'my-module',
        classes: [],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.outputPath).toBe('docs/diagrams/class-my-module.mmd');
    });

    test('handles multiple methods with parameters', () => {
      const diagram: ClassDiagram = {
        type: 'class',
        moduleName: 'methods',
        classes: [
          {
            name: 'MethodClass',
            methods: [
              {
                name: 'method1',
                visibility: '+',
                parameters: ['arg1: string', 'arg2: number'],
                returnType: 'boolean'
              },
              {
                name: 'method2',
                visibility: '-',
                parameters: ['data: object'],
                returnType: 'Promise<void>'
              }
            ],
            properties: []
          }
        ],
        interfaces: [],
        relationships: []
      };

      const mermaid = generator.toMermaid(diagram);

      expect(mermaid.code).toContain('+method1(arg1: string, arg2: number) boolean');
      expect(mermaid.code).toContain('-method2(data: object) Promise<void>');
    });
  });
});
