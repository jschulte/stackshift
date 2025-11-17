/**
 * Tests for MarkdownParser
 */

import { describe, it, expect } from 'vitest';
import { MarkdownParser, ParseError } from '../markdown-parser.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  describe('parse()', () => {
    it('parses headings of all levels', () => {
      const content = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(6);
      expect(nodes[0]).toMatchObject({ type: 'heading', level: 1, content: 'H1' });
      expect(nodes[1]).toMatchObject({ type: 'heading', level: 2, content: 'H2' });
      expect(nodes[2]).toMatchObject({ type: 'heading', level: 3, content: 'H3' });
      expect(nodes[3]).toMatchObject({ type: 'heading', level: 4, content: 'H4' });
      expect(nodes[4]).toMatchObject({ type: 'heading', level: 5, content: 'H5' });
      expect(nodes[5]).toMatchObject({ type: 'heading', level: 6, content: 'H6' });
    });

    it('parses unordered lists', () => {
      const content = '- Item 1\n- Item 2\n* Item 3\n+ Item 4';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(4);
      nodes.forEach(node => {
        expect(node.type).toBe('list-item');
        expect(node.metadata?.ordered).toBe(false);
      });
      expect(nodes[0].content).toBe('Item 1');
      expect(nodes[1].content).toBe('Item 2');
      expect(nodes[2].content).toBe('Item 3');
      expect(nodes[3].content).toBe('Item 4');
    });

    it('parses ordered lists', () => {
      const content = '1. First\n2. Second\n3. Third';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(3);
      nodes.forEach(node => {
        expect(node.type).toBe('list-item');
        expect(node.metadata?.ordered).toBe(true);
      });
    });

    it('parses nested lists with correct indent levels', () => {
      const content = '- Item 1\n  - Nested 1a\n  - Nested 1b\n- Item 2\n    - Double nested';
      const nodes = parser.parse(content);

      expect(nodes[0].metadata?.indentLevel).toBe(0);
      expect(nodes[1].metadata?.indentLevel).toBe(1);
      expect(nodes[2].metadata?.indentLevel).toBe(1);
      expect(nodes[3].metadata?.indentLevel).toBe(0);
      expect(nodes[4].metadata?.indentLevel).toBe(2);
    });

    it('parses code blocks with language', () => {
      const content = '```typescript\nconst x = 1;\nconst y = 2;\n```';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        type: 'code-block',
        content: 'const x = 1;\nconst y = 2;',
        metadata: expect.objectContaining({ language: 'typescript' })
      });
    });

    it('parses code blocks without language', () => {
      const content = '```\nplain code\n```';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].type).toBe('code-block');
      expect(nodes[0].content).toBe('plain code');
      expect(nodes[0].metadata?.language).toBeUndefined();
    });

    it('parses paragraphs', () => {
      const content = 'This is a paragraph.\nThis is another paragraph.';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(2);
      expect(nodes[0]).toMatchObject({ type: 'paragraph', content: 'This is a paragraph.' });
      expect(nodes[1]).toMatchObject({ type: 'paragraph', content: 'This is another paragraph.' });
    });

    it('parses blockquotes', () => {
      const content = '> This is a quote\n> Continued quote';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(2);
      expect(nodes[0]).toMatchObject({ type: 'blockquote', content: 'This is a quote' });
      expect(nodes[1]).toMatchObject({ type: 'blockquote', content: 'Continued quote' });
    });

    it('parses horizontal rules', () => {
      const content = '---\n***\n___';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(3);
      nodes.forEach(node => {
        expect(node.type).toBe('horizontal-rule');
      });
    });

    it('includes line numbers in metadata', () => {
      const content = '# Title\n\nParagraph\n\n- List item';
      const nodes = parser.parse(content);

      expect(nodes[0].metadata?.lineNumber).toBe(1);
      expect(nodes[1].metadata?.lineNumber).toBe(3);
      expect(nodes[2].metadata?.lineNumber).toBe(5);
    });

    it('skips empty lines', () => {
      const content = '# Title\n\n\n\nParagraph';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(2);
    });

    it('throws ParseError on unclosed code block', () => {
      const content = '```typescript\nconst x = 1;\n';

      expect(() => parser.parse(content)).toThrow(ParseError);
      expect(() => parser.parse(content)).toThrow('Unclosed code block');
    });

    it('handles complex mixed content', () => {
      const content = `# Title
This is a paragraph.

## Subtitle

- List item 1
- List item 2

\`\`\`javascript
const code = true;
\`\`\`

> Quote

---`;

      const nodes = parser.parse(content);

      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.some(n => n.type === 'heading')).toBe(true);
      expect(nodes.some(n => n.type === 'paragraph')).toBe(true);
      expect(nodes.some(n => n.type === 'list-item')).toBe(true);
      expect(nodes.some(n => n.type === 'code-block')).toBe(true);
      expect(nodes.some(n => n.type === 'blockquote')).toBe(true);
      expect(nodes.some(n => n.type === 'horizontal-rule')).toBe(true);
    });

    it('handles checkboxes in list items', () => {
      const content = '- [ ] Unchecked\n- [x] Checked\n- [X] Also checked';
      const nodes = parser.parse(content);

      expect(nodes).toHaveLength(3);
      expect(nodes[0].content).toBe('[ ] Unchecked');
      expect(nodes[1].content).toBe('[x] Checked');
      expect(nodes[2].content).toBe('[X] Also checked');
    });
  });

  describe('findSection()', () => {
    it('finds section by exact title match', () => {
      const content = '# Title\nIntro\n## Features\nFeature 1\nFeature 2\n## Other';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^Features$/);

      expect(section).toBeDefined();
      expect(section!.content).toBe('Features');
      expect(section!.children).toHaveLength(2); // "Feature 1", "Feature 2"
    });

    it('finds section by case-insensitive match', () => {
      const content = '## FEATURES\nContent';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^features$/i);

      expect(section).toBeDefined();
      expect(section!.content).toBe('FEATURES');
    });

    it('returns null when section not found', () => {
      const content = '## Something Else';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^NotFound$/);

      expect(section).toBeNull();
    });

    it('stops at next heading of same level', () => {
      const content = '## Section A\nContent A\n## Section B\nContent B';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^Section A$/);

      expect(section!.children).toHaveLength(1);
      expect(section!.children![0].content).toBe('Content A');
    });

    it('stops at next heading of higher level', () => {
      const content = '### Subsection\nContent\n## Main Section';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^Subsection$/);

      expect(section!.children).toHaveLength(1);
    });

    it('includes all content until next same-level heading', () => {
      const content = '## Features\n### Sub1\nText1\n### Sub2\nText2\n## Other';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^Features$/);

      expect(section!.children).toHaveLength(4); // Sub1, Text1, Sub2, Text2
    });
  });

  describe('extractHeadings()', () => {
    it('extracts all H2 headings', () => {
      const content = '# H1\n## H2a\n## H2b\n### H3\n## H2c';
      const nodes = parser.parse(content);
      const h2s = parser.extractHeadings(nodes, 2);

      expect(h2s).toHaveLength(3);
      expect(h2s[0].content).toBe('H2a');
      expect(h2s[1].content).toBe('H2b');
      expect(h2s[2].content).toBe('H2c');
    });

    it('returns empty array when no headings match', () => {
      const content = '# H1\n## H2';
      const nodes = parser.parse(content);
      const h5s = parser.extractHeadings(nodes, 5);

      expect(h5s).toHaveLength(0);
    });

    it('extracts headings from section children', () => {
      const content = '## Parent\n### Child1\n### Child2';
      const nodes = parser.parse(content);
      const section = parser.findSection(nodes, /^Parent$/);
      const h3s = parser.extractHeadings(section!.children!, 3);

      expect(h3s).toHaveLength(2);
    });
  });

  describe('extractListItems()', () => {
    it('extracts list items from array of nodes', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      const nodes = parser.parse(content);
      const items = parser.extractListItems(nodes);

      expect(items).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });

    it('extracts list items from single node with children', () => {
      const node = {
        type: 'list' as const,
        content: '',
        children: [
          { type: 'list-item' as const, content: 'A' },
          { type: 'list-item' as const, content: 'B' }
        ]
      };
      const items = parser.extractListItems(node);

      expect(items).toEqual(['A', 'B']);
    });

    it('filters non-list-item nodes', () => {
      const nodes = [
        { type: 'list-item' as const, content: 'Item' },
        { type: 'paragraph' as const, content: 'Not a list item' },
        { type: 'list-item' as const, content: 'Another item' }
      ];
      const items = parser.extractListItems(nodes);

      expect(items).toEqual(['Item', 'Another item']);
    });

    it('returns empty array for non-list nodes', () => {
      const nodes = [
        { type: 'paragraph' as const, content: 'Text' }
      ];
      const items = parser.extractListItems(nodes);

      expect(items).toEqual([]);
    });
  });

  describe('Integration with fixtures', () => {
    it('parses sample-functional-spec.md successfully', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'sample-functional-spec.md');
      const content = await fs.readFile(fixturePath, 'utf-8');
      const nodes = parser.parse(content);

      expect(nodes.length).toBeGreaterThan(0);

      // Find Features section
      const featuresSection = parser.findSection(nodes, /^Features$/i);
      expect(featuresSection).toBeDefined();

      // Extract feature headings (should be H3)
      const features = parser.extractHeadings(featuresSection!.children!, 3);
      expect(features.length).toBeGreaterThanOrEqual(5);
    });

    it('handles malformed-functional-spec.md with unclosed code block', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'malformed-functional-spec.md');
      const content = await fs.readFile(fixturePath, 'utf-8');

      expect(() => parser.parse(content)).toThrow(ParseError);
    });

    it('parses large-functional-spec.md efficiently', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'large-functional-spec.md');
      const content = await fs.readFile(fixturePath, 'utf-8');

      const startTime = Date.now();
      const nodes = parser.parse(content);
      const duration = Date.now() - startTime;

      expect(nodes.length).toBeGreaterThan(100);
      expect(duration).toBeLessThan(1000); // Should parse in < 1 second
    });
  });
});
