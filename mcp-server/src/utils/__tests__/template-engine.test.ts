/**
 * Tests for TemplateEngine
 */

import { TemplateEngine, TemplateError, TemplateData } from '../template-engine';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;
  const testTemplateDir = path.join(__dirname, 'fixtures', 'templates');

  beforeEach(() => {
    engine = new TemplateEngine(testTemplateDir);
  });

  describe('loadTemplate', () => {
    it('should load a template file successfully', async () => {
      // Create a test template
      await fs.mkdir(testTemplateDir, { recursive: true });
      await fs.writeFile(
        path.join(testTemplateDir, 'test-template.md'),
        '# Hello {{name}}\n\nWelcome to {{project}}!'
      );

      const template = await engine.loadTemplate('test-template');
      expect(template).toBe('# Hello {{name}}\n\nWelcome to {{project}}!');
    });

    it('should throw TemplateError if template not found', async () => {
      await expect(engine.loadTemplate('non-existent')).rejects.toThrow(TemplateError);
      await expect(engine.loadTemplate('non-existent')).rejects.toThrow(
        'Template not found: non-existent'
      );
    });
  });

  describe('populate - simple variables', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{project}}!';
      const data: TemplateData = {
        name: 'Alice',
        project: 'StackShift',
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Hello Alice, welcome to StackShift!');
    });

    it('should handle multiple occurrences of same variable', () => {
      const template = '{{name}} likes {{name}}\'s {{project}}';
      const data: TemplateData = {
        name: 'Bob',
        project: 'app',
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Bob likes Bob\'s app');
    });

    it('should convert numbers to strings', () => {
      const template = 'Version: {{version}}';
      const data: TemplateData = {
        version: 42,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Version: 42');
    });

    it('should convert booleans to strings', () => {
      const template = 'Active: {{active}}';
      const data: TemplateData = {
        active: true,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Active: true');
    });

    it('should leave undefined variables as-is', () => {
      const template = 'Hello {{name}}, {{missing}} here';
      const data: TemplateData = {
        name: 'Alice',
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Hello Alice, {{missing}} here');
    });

    it('should convert arrays to comma-separated strings', () => {
      const template = 'Tags: {{tags}}';
      const data: TemplateData = {
        tags: ['typescript', 'node', 'testing'],
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Tags: typescript, node, testing');
    });
  });

  describe('populate - conditionals', () => {
    it('should show content when condition is truthy', () => {
      const template = '{{#if premium}}Premium features enabled{{/if}}';
      const data: TemplateData = {
        premium: true,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Premium features enabled');
    });

    it('should hide content when condition is falsy', () => {
      const template = '{{#if premium}}Premium features enabled{{/if}}';
      const data: TemplateData = {
        premium: false,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should treat undefined as falsy', () => {
      const template = '{{#if missing}}Content{{/if}}';
      const data: TemplateData = {};

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should treat empty string as falsy', () => {
      const template = '{{#if name}}Name: {{name}}{{/if}}';
      const data: TemplateData = {
        name: '',
      };

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should treat 0 as falsy', () => {
      const template = '{{#if count}}Count: {{count}}{{/if}}';
      const data: TemplateData = {
        count: 0,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should handle if-else blocks - truthy case', () => {
      const template = '{{#if premium}}Premium{{else}}Free{{/if}}';
      const data: TemplateData = {
        premium: true,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Premium');
    });

    it('should handle if-else blocks - falsy case', () => {
      const template = '{{#if premium}}Premium{{else}}Free{{/if}}';
      const data: TemplateData = {
        premium: false,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('Free');
    });

    it('should handle multiline conditionals', () => {
      const template = `{{#if enabled}}
Feature is enabled
- Item 1
- Item 2
{{/if}}`;
      const data: TemplateData = {
        enabled: true,
      };

      const result = engine.populate(template, data);
      expect(result).toContain('Feature is enabled');
      expect(result).toContain('- Item 1');
    });
  });

  describe('populate - loops', () => {
    it('should iterate over array of strings', () => {
      const template = '{{#each tags}}- {{this}}\n{{/each}}';
      const data: TemplateData = {
        tags: ['typescript', 'node', 'testing'],
      };

      const result = engine.populate(template, data);
      expect(result).toBe('- typescript\n- node\n- testing\n');
    });

    it('should iterate over array of objects', () => {
      const template = '{{#each users}}- {{name}} ({{email}})\n{{/each}}';
      const data: TemplateData = {
        users: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
        ],
      };

      const result = engine.populate(template, data);
      expect(result).toBe('- Alice (alice@example.com)\n- Bob (bob@example.com)\n');
    });

    it('should provide {{index}} in loops', () => {
      const template = '{{#each items}}{{index}}. {{this}}\n{{/each}}';
      const data: TemplateData = {
        items: ['First', 'Second', 'Third'],
      };

      const result = engine.populate(template, data);
      expect(result).toBe('0. First\n1. Second\n2. Third\n');
    });

    it('should handle empty arrays', () => {
      const template = '{{#each items}}- {{this}}\n{{/each}}';
      const data: TemplateData = {
        items: [],
      };

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should handle non-array values gracefully', () => {
      const template = '{{#each items}}- {{this}}\n{{/each}}';
      const data: TemplateData = {
        items: 'not-an-array' as any,
      };

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should handle undefined loop variables', () => {
      const template = '{{#each missing}}- {{this}}\n{{/each}}';
      const data: TemplateData = {};

      const result = engine.populate(template, data);
      expect(result).toBe('');
    });

    it('should handle nested object properties', () => {
      const template = '{{#each tasks}}## {{title}}\n\n{{description}}\n\n{{/each}}';
      const data: TemplateData = {
        tasks: [
          { title: 'Task 1', description: 'Do something' },
          { title: 'Task 2', description: 'Do another thing' },
        ],
      };

      const result = engine.populate(template, data);
      expect(result).toContain('## Task 1');
      expect(result).toContain('Do something');
      expect(result).toContain('## Task 2');
    });
  });

  describe('populate - complex scenarios', () => {
    it('should handle conditionals inside loops', () => {
      const template = `{{#each users}}
- {{name}}{{#if premium}} (Premium){{/if}}
{{/each}}`;
      const data: TemplateData = {
        users: [
          { name: 'Alice', premium: true },
          { name: 'Bob', premium: false },
          { name: 'Charlie', premium: true },
        ],
      };

      const result = engine.populate(template, data);
      expect(result).toContain('Alice (Premium)');
      expect(result).toContain('- Bob\n'); // No premium badge
      expect(result).toContain('Charlie (Premium)');
    });

    it('should handle variables after conditionals and loops', () => {
      const template = `# {{title}}

{{#if description}}
{{description}}
{{/if}}

## Items
{{#each items}}
- {{this}}
{{/each}}

Footer: {{footer}}`;
      const data: TemplateData = {
        title: 'My Document',
        description: 'A test document',
        items: ['Item 1', 'Item 2'],
        footer: 'Copyright 2025',
      };

      const result = engine.populate(template, data);
      expect(result).toContain('# My Document');
      expect(result).toContain('A test document');
      expect(result).toContain('- Item 1');
      expect(result).toContain('Footer: Copyright 2025');
    });

    it('should handle real-world implementation plan template', () => {
      const template = `# Implementation Plan: {{featureName}}

## Overview
{{overview}}

{{#if dependencies}}
## Dependencies
{{#each dependencies}}
- {{this}}
{{/each}}
{{/if}}

## Phases
{{#each phases}}
### Phase {{index}}: {{name}}

{{description}}

**Tasks:**
{{#each tasks}}
- [ ] {{this}}
{{/each}}

{{/each}}

## Timeline
Estimated completion: {{timeline}}`;

      const data: TemplateData = {
        featureName: 'User Authentication',
        overview: 'Implement secure user authentication',
        dependencies: ['bcrypt', 'jsonwebtoken'],
        phases: [
          {
            name: 'Setup',
            description: 'Initial setup and configuration',
            tasks: ['Install dependencies', 'Configure environment'],
          },
          {
            name: 'Implementation',
            description: 'Core feature implementation',
            tasks: ['Create auth routes', 'Add middleware'],
          },
        ],
        timeline: '2 weeks',
      };

      const result = engine.populate(template, data);
      expect(result).toContain('# Implementation Plan: User Authentication');
      expect(result).toContain('Implement secure user authentication');
      expect(result).toContain('- bcrypt');
      expect(result).toContain('### Phase 0: Setup');
      expect(result).toContain('### Phase 1: Implementation');
      expect(result).toContain('- [ ] Install dependencies');
      expect(result).toContain('Estimated completion: 2 weeks');
    });
  });

  describe('validateTemplate', () => {
    it('should return empty array when all variables provided', () => {
      const template = 'Hello {{name}}, welcome to {{project}}!';
      const data: TemplateData = {
        name: 'Alice',
        project: 'StackShift',
      };

      const missing = engine.validateTemplate(template, data);
      expect(missing).toEqual([]);
    });

    it('should return missing variable names', () => {
      const template = 'Hello {{name}}, welcome to {{project}}!';
      const data: TemplateData = {
        name: 'Alice',
      };

      const missing = engine.validateTemplate(template, data);
      expect(missing).toEqual(['project']);
    });

    it('should return multiple missing variables', () => {
      const template = '{{title}} - {{author}} - {{date}} - {{version}}';
      const data: TemplateData = {
        title: 'My Doc',
      };

      const missing = engine.validateTemplate(template, data);
      expect(missing).toContain('author');
      expect(missing).toContain('date');
      expect(missing).toContain('version');
      expect(missing).toHaveLength(3);
    });

    it('should ignore control structures', () => {
      const template = '{{#if premium}}Premium{{/if}} {{#each items}}{{this}}{{/each}}';
      const data: TemplateData = {
        premium: true,
        items: ['a'],
      };

      const missing = engine.validateTemplate(template, data);
      expect(missing).toEqual([]);
    });

    it('should not flag "this" and "index" as missing', () => {
      const template = '{{#each items}}{{index}}. {{this}}{{/each}}';
      const data: TemplateData = {
        items: ['a', 'b'],
      };

      const missing = engine.validateTemplate(template, data);
      expect(missing).toEqual([]);
    });

    it('should deduplicate repeated variables', () => {
      const template = '{{name}} {{name}} {{name}}';
      const data: TemplateData = {};

      const missing = engine.validateTemplate(template, data);
      expect(missing).toEqual(['name']);
    });
  });

  describe('integration tests', () => {
    it('should load and populate a real template', async () => {
      await fs.mkdir(testTemplateDir, { recursive: true });
      await fs.writeFile(
        path.join(testTemplateDir, 'feature-spec.md'),
        `# Feature Specification: {{featureName}}

**Feature ID:** {{featureId}}
**Status:** {{status}}

## Description
{{description}}

{{#if userStories}}
## User Stories
{{#each userStories}}
- {{this}}
{{/each}}
{{/if}}

{{#if technicalRequirements}}
## Technical Requirements
{{#each technicalRequirements}}
- {{this}}
{{/each}}
{{else}}
No technical requirements specified.
{{/if}}
`
      );

      const template = await engine.loadTemplate('feature-spec');
      const data: TemplateData = {
        featureName: 'User Authentication',
        featureId: 'F001',
        status: 'COMPLETE',
        description: 'Secure user authentication system',
        userStories: [
          'As a user, I want to log in',
          'As a user, I want to log out',
        ],
        technicalRequirements: [
          'JWT tokens',
          'bcrypt password hashing',
        ],
      };

      const result = engine.populate(template, data);

      expect(result).toContain('# Feature Specification: User Authentication');
      expect(result).toContain('**Feature ID:** F001');
      expect(result).toContain('**Status:** COMPLETE');
      expect(result).toContain('Secure user authentication system');
      expect(result).toContain('As a user, I want to log in');
      expect(result).toContain('JWT tokens');
      expect(result).not.toContain('No technical requirements');
    });

    it('should handle template with missing optional sections', async () => {
      await fs.mkdir(testTemplateDir, { recursive: true });
      await fs.writeFile(
        path.join(testTemplateDir, 'simple-spec.md'),
        `# {{title}}

{{#if description}}
{{description}}
{{else}}
No description provided.
{{/if}}
`
      );

      const template = await engine.loadTemplate('simple-spec');
      const data: TemplateData = {
        title: 'My Feature',
      };

      const result = engine.populate(template, data);

      expect(result).toContain('# My Feature');
      expect(result).toContain('No description provided.');
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    try {
      await fs.rm(testTemplateDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });
});
