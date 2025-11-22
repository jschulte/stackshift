/**
 * Template Engine - Simple template system for populating markdown templates
 *
 * Custom implementation to avoid external dependencies while providing
 * sufficient functionality for variable substitution, conditionals, and loops.
 *
 * @module template-engine
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TemplateData {
  [key: string]: string | string[] | boolean | number | Record<string, any> | undefined;
}

/**
 * Error thrown when template operations fail
 */
export class TemplateError extends Error {
  constructor(
    message: string,
    public templateName?: string,
    public missingVariables?: string[]
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}

/**
 * Simple template engine for markdown templates
 *
 * Supports:
 * - Variables: {{variableName}}
 * - Conditionals: {{#if key}}...{{/if}}
 * - Loops: {{#each items}}...{{/each}}
 */
export class TemplateEngine {
  constructor(private templateDir: string = path.join(__dirname, '../../templates')) {}

  /**
   * Load a template file
   * @param templateName - Name without extension (e.g., "constitution-brownfield")
   * @returns Template content
   * @throws TemplateError if template not found
   */
  async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templateDir, `${templateName}.md`);

    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new TemplateError(
        `Template not found: ${templateName}`,
        templateName
      );
    }
  }

  /**
   * Populate template with data
   * @param template - Template content with {{variables}}
   * @param data - Key-value pairs for substitution
   * @returns Populated markdown
   * @throws TemplateError if required variable missing
   */
  populate(template: string, data: TemplateData): string {
    let result = template;

    // Process in order: loops → conditionals → variables
    // This ensures nested structures work correctly:
    // - Loops are expanded first, creating copies of their content
    // - Each loop iteration recursively calls populate() with merged item data
    // - That recursive call handles conditionals and variables with the correct context

    // 1. Handle loops: {{#each items}}...{{/each}}
    result = this.handleLoops(result, data);

    // 2. Handle conditionals: {{#if key}}...{{/if}} and {{#if key}}...{{else}}...{{/if}}
    result = this.handleConditionals(result, data);

    // 3. Handle simple variables: {{key}}
    result = this.handleVariables(result, data);

    return result;
  }

  /**
   * Handle conditional blocks
   * @private
   */
  private handleConditionals(template: string, data: TemplateData): string {
    // Handle {{#if key}}content{{else}}alt{{/if}}
    const ifElsePattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
    template = template.replace(ifElsePattern, (_, key, ifContent, elseContent) => {
      const value = data[key];
      const isTruthy = value !== undefined && value !== false && value !== '' && value !== 0;
      return isTruthy ? ifContent : elseContent;
    });

    // Handle {{#if key}}content{{/if}}
    const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    template = template.replace(ifPattern, (_, key, content) => {
      const value = data[key];
      const isTruthy = value !== undefined && value !== false && value !== '' && value !== 0;
      return isTruthy ? content : '';
    });

    return template;
  }

  /**
   * Handle loop blocks (with proper nesting support)
   * @private
   */
  private handleLoops(template: string, data: TemplateData): string {
    // We need to handle nested loops properly, so we can't use a simple regex
    // Instead, we'll find each {{#each}} and match it with its corresponding {{/each}}

    let result = template;
    let changed = true;

    // Keep processing until no more loops are found (handles nested loops from inside out)
    while (changed) {
      changed = false;
      const startPattern = /\{\{#each\s+(\w+)\}\}/;
      const match = startPattern.exec(result);

      if (!match) {
        break; // No more loops to process
      }

      const key = match[1];
      const startIndex = match.index;
      const contentStart = startIndex + match[0].length;

      // Find the matching {{/each}} by tracking nesting level
      let nesting = 1;
      let pos = contentStart;
      let contentEnd = -1;

      while (pos < result.length && nesting > 0) {
        const remaining = result.substring(pos);
        const nextOpen = remaining.match(/\{\{#each\s+\w+\}\}/);
        const nextClose = remaining.match(/\{\{\/each\}\}/);

        if (!nextClose) {
          throw new Error(`Unclosed {{#each ${key}}}`);
        }

        const closePos = pos + nextClose.index!;
        const openPos = nextOpen ? pos + nextOpen.index! : Infinity;

        if (openPos < closePos) {
          // Found a nested opening tag
          nesting++;
          pos = openPos + nextOpen![0].length;
        } else {
          // Found a closing tag
          nesting--;
          if (nesting === 0) {
            contentEnd = closePos;
          }
          pos = closePos + nextClose[0].length;
        }
      }

      if (contentEnd === -1) {
        throw new Error(`Unclosed {{#each ${key}}}`);
      }

      const content = result.substring(contentStart, contentEnd);
      const items = data[key];

      let replacement = '';
      if (Array.isArray(items)) {
        replacement = items.map((item, index) => {
          let itemData: TemplateData;

          // Handle {{this}} for primitive arrays
          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            itemData = {
              ...data,
              this: item,
              index,
            };
          }
          // Handle object properties - merge item properties with parent data
          else if (typeof item === 'object' && item !== null) {
            itemData = {
              ...data,
              ...item,
              index,
            };
          } else {
            itemData = { ...data, index };
          }

          // Recursively populate to handle nested structures (conditionals, nested loops)
          return this.populate(content, itemData);
        }).join('');
      }

      // Replace this loop with its expanded content
      const endTag = result.substring(contentEnd, contentEnd + '{{/each}}'.length);
      result = result.substring(0, startIndex) + replacement + result.substring(contentEnd + endTag.length);
      changed = true;
    }

    return result;
  }

  /**
   * Handle variable substitution
   * @private
   */
  private handleVariables(template: string, data: TemplateData): string {
    // Handle {{key}} - simple variable substitution
    const varPattern = /\{\{(\w+)\}\}/g;

    return template.replace(varPattern, (match, key) => {
      const value = data[key];

      if (value === undefined) {
        // Leave undefined variables as-is (will be caught by validation if needed)
        return match;
      }

      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        return value.join(', ');
      }

      // Convert objects to JSON (probably not what's wanted, but better than [object Object])
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return String(value);
    });
  }

  /**
   * Validate template has all required variables
   * @param template - Template to check
   * @param data - Data to validate against
   * @returns Array of missing variable names
   */
  validateTemplate(template: string, data: TemplateData): string[] {
    const missing: string[] = [];

    // Find all {{variable}} patterns (excluding control structures)
    const varPattern = /\{\{(?!#|\/)([\w]+)\}\}/g;
    const matches = template.matchAll(varPattern);

    const requiredVars = new Set<string>();
    for (const match of matches) {
      requiredVars.add(match[1]);
    }

    // Check which variables are missing from data
    for (const varName of requiredVars) {
      if (!(varName in data) && varName !== 'this' && varName !== 'index') {
        missing.push(varName);
      }
    }

    return missing;
  }
}
