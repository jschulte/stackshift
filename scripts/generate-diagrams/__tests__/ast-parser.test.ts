/**
 * Tests for AST parser
 * @module ast-parser.test
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ASTParser } from '../parsers/ast-parser.js';

const TEST_DIR = join(process.cwd(), 'scripts', 'generate-diagrams', '__tests__', 'fixtures', 'ast');

describe('ASTParser', () => {
  let parser: ASTParser;
  let testFilePath: string;

  beforeEach(async () => {
    parser = new ASTParser();
    await fs.mkdir(TEST_DIR, { recursive: true });
    testFilePath = join(TEST_DIR, 'test-class.ts');
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('extractClass', () => {
    test('extracts class with public methods and properties', async () => {
      const code = `
export class TestClass {
  public name: string;
  private age: number;

  constructor(name: string) {
    this.name = name;
    this.age = 0;
  }

  public getName(): string {
    return this.name;
  }

  private getAge(): number {
    return this.age;
  }
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);

      expect(classes).toHaveLength(1);
      const cls = classes[0];
      expect(cls.name).toBe('TestClass');
      expect(cls.properties).toHaveLength(2);
      expect(cls.methods).toHaveLength(3); // constructor + 2 methods

      // Check properties
      const nameProp = cls.properties.find(p => p.name === 'name');
      expect(nameProp).toBeDefined();
      expect(nameProp?.visibility).toBe('+');
      expect(nameProp?.type).toBe('string');

      const ageProp = cls.properties.find(p => p.name === 'age');
      expect(ageProp).toBeDefined();
      expect(ageProp?.visibility).toBe('-');
      expect(ageProp?.type).toBe('number');

      // Check methods
      const constructor = cls.methods.find(m => m.name === 'constructor');
      expect(constructor).toBeDefined();
      expect(constructor?.parameters).toHaveLength(1);

      const getName = cls.methods.find(m => m.name === 'getName');
      expect(getName).toBeDefined();
      expect(getName?.visibility).toBe('+');
      expect(getName?.returnType).toBe('string');

      const getAge = cls.methods.find(m => m.name === 'getAge');
      expect(getAge).toBeDefined();
      expect(getAge?.visibility).toBe('-');
      expect(getAge?.returnType).toBe('number');
    });

    test('extracts class with inheritance', async () => {
      const code = `
class BaseClass {
  protected id: number;
}

export class DerivedClass extends BaseClass {
  public name: string;
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);

      expect(classes).toHaveLength(2);
      const derived = classes.find(c => c.name === 'DerivedClass');
      expect(derived).toBeDefined();
      expect(derived?.extends).toBe('BaseClass');
    });

    test('extracts class with interface implementation', async () => {
      const code = `
interface ILogger {
  log(message: string): void;
}

export class Logger implements ILogger {
  log(message: string): void {
    console.log(message);
  }
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);

      const logger = classes.find(c => c.name === 'Logger');
      expect(logger).toBeDefined();
      expect(logger?.implements).toContain('ILogger');
    });
  });

  describe('extractInterface', () => {
    test('extracts interface with properties and methods', async () => {
      const code = `
export interface IUser {
  name: string;
  age: number;
  getName(): string;
  setAge(age: number): void;
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { interfaces } = await parser.parseFile(testFilePath);

      expect(interfaces).toHaveLength(1);
      const iface = interfaces[0];
      expect(iface.name).toBe('IUser');
      expect(iface.properties).toHaveLength(2);
      expect(iface.methods).toHaveLength(2);

      // Check properties
      const nameProp = iface.properties.find(p => p.name === 'name');
      expect(nameProp).toBeDefined();
      expect(nameProp?.type).toBe('string');

      // Check methods
      const getName = iface.methods.find(m => m.name === 'getName');
      expect(getName).toBeDefined();
      expect(getName?.returnType).toBe('string');
    });

    test('extracts interface with inheritance', async () => {
      const code = `
interface IBase {
  id: number;
}

export interface IDerived extends IBase {
  name: string;
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { interfaces } = await parser.parseFile(testFilePath);

      const derived = interfaces.find(i => i.name === 'IDerived');
      expect(derived).toBeDefined();
      expect(derived?.extends).toContain('IBase');
    });
  });

  describe('extractMethod', () => {
    test('extracts method visibility markers correctly', async () => {
      const code = `
export class VisibilityTest {
  public publicMethod(): void {}
  private privateMethod(): void {}
  protected protectedMethod(): void {}
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);
      const cls = classes[0];

      const publicMethod = cls.methods.find(m => m.name === 'publicMethod');
      expect(publicMethod?.visibility).toBe('+');

      const privateMethod = cls.methods.find(m => m.name === 'privateMethod');
      expect(privateMethod?.visibility).toBe('-');

      const protectedMethod = cls.methods.find(m => m.name === 'protectedMethod');
      expect(protectedMethod?.visibility).toBe('#');
    });

    test('extracts method parameters with types', async () => {
      const code = `
export class ParamsTest {
  public process(id: number, name: string, active: boolean): void {}
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);
      const method = classes[0].methods[0];

      expect(method.parameters).toHaveLength(3);
      expect(method.parameters[0]).toBe('id: number');
      expect(method.parameters[1]).toBe('name: string');
      expect(method.parameters[2]).toBe('active: boolean');
    });
  });

  describe('extractProperty', () => {
    test('extracts property visibility markers correctly', async () => {
      const code = `
export class PropertyTest {
  public publicProp: string;
  private privateProp: number;
  protected protectedProp: boolean;
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);
      const cls = classes[0];

      const publicProp = cls.properties.find(p => p.name === 'publicProp');
      expect(publicProp?.visibility).toBe('+');

      const privateProp = cls.properties.find(p => p.name === 'privateProp');
      expect(privateProp?.visibility).toBe('-');

      const protectedProp = cls.properties.find(p => p.name === 'protectedProp');
      expect(protectedProp?.visibility).toBe('#');
    });

    test('extracts property types correctly', async () => {
      const code = `
export class TypeTest {
  name: string;
  age: number;
  active: boolean;
  items: string[];
}
`;
      await fs.writeFile(testFilePath, code, 'utf-8');

      const { classes } = await parser.parseFile(testFilePath);
      const props = classes[0].properties;

      expect(props.find(p => p.name === 'name')?.type).toBe('string');
      expect(props.find(p => p.name === 'age')?.type).toBe('number');
      expect(props.find(p => p.name === 'active')?.type).toBe('boolean');
      expect(props.find(p => p.name === 'items')?.type).toBe('string[]');
    });
  });
});
