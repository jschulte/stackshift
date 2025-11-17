/**
 * Markdown Parser - Lightweight markdown AST parser
 *
 * Custom implementation to avoid external dependencies while providing
 * sufficient functionality for extracting structured data from markdown.
 *
 * @module markdown-parser
 */

export type NodeType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'list-item'
  | 'code-block'
  | 'blockquote'
  | 'horizontal-rule';

export interface NodeMetadata {
  lineNumber: number;
  language?: string;      // For code blocks
  ordered?: boolean;      // For lists
  indentLevel?: number;   // For nested lists
}

export interface MarkdownNode {
  type: NodeType;
  level?: number;         // For headings (1-6)
  content: string;
  children?: MarkdownNode[];
  metadata?: NodeMetadata;
}

/**
 * Error thrown when markdown parsing fails
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public lineNumber?: number,
    public column?: number
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Lightweight markdown parser for extracting structured data
 */
export class MarkdownParser {
  /**
   * Parse markdown content into an AST
   * @param content - Raw markdown string
   * @returns Array of root-level nodes
   * @throws ParseError if markdown is invalid
   */
  parse(content: string): MarkdownNode[] {
    const lines = content.split('\n');
    const nodes: MarkdownNode[] = [];
    let currentCodeBlock: { language?: string; lines: string[]; startLine: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Code block detection
      if (line.startsWith('```')) {
        if (currentCodeBlock) {
          // Closing code block
          nodes.push({
            type: 'code-block',
            content: currentCodeBlock.lines.join('\n'),
            metadata: {
              lineNumber: currentCodeBlock.startLine,
              language: currentCodeBlock.language
            }
          });
          currentCodeBlock = null;
        } else {
          // Opening code block
          const language = line.slice(3).trim();
          currentCodeBlock = { language: language || undefined, lines: [], startLine: lineNumber };
        }
        continue;
      }

      if (currentCodeBlock) {
        currentCodeBlock.lines.push(line);
        continue;
      }

      // Heading detection
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        nodes.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2].trim(),
          metadata: { lineNumber }
        });
        continue;
      }

      // Horizontal rule detection
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        nodes.push({
          type: 'horizontal-rule',
          content: '',
          metadata: { lineNumber }
        });
        continue;
      }

      // Blockquote detection
      const blockquoteMatch = line.match(/^>\s*(.*)$/);
      if (blockquoteMatch) {
        nodes.push({
          type: 'blockquote',
          content: blockquoteMatch[1],
          metadata: { lineNumber }
        });
        continue;
      }

      // List detection (ordered and unordered)
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const indentLevel = Math.floor(listMatch[1].length / 2); // 2 spaces = 1 level
        const ordered = /^\d+\./.test(listMatch[2]);
        nodes.push({
          type: 'list-item',
          content: listMatch[3].trim(),
          metadata: { lineNumber, ordered, indentLevel }
        });
        continue;
      }

      // Paragraph (non-empty lines)
      if (line.trim()) {
        nodes.push({
          type: 'paragraph',
          content: line.trim(),
          metadata: { lineNumber }
        });
      }
    }

    // Check for unclosed code blocks
    if (currentCodeBlock) {
      throw new ParseError(
        'Unclosed code block',
        currentCodeBlock.startLine
      );
    }

    return nodes;
  }

  /**
   * Find a section by title (case-insensitive)
   * @param nodes - AST to search
   * @param titlePattern - Regex pattern for section title
   * @returns Matching heading node with children, or null
   */
  findSection(nodes: MarkdownNode[], titlePattern: RegExp): MarkdownNode | null {
    const headingIndex = nodes.findIndex(
      n => n.type === 'heading' && titlePattern.test(n.content)
    );

    if (headingIndex === -1) return null;

    const heading = nodes[headingIndex];
    const children: MarkdownNode[] = [];

    // Collect all nodes until next heading of same or higher level
    for (let i = headingIndex + 1; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'heading' && node.level! <= heading.level!) {
        break; // End of section
      }
      children.push(node);
    }

    return { ...heading, children };
  }

  /**
   * Extract all headings of a specific level
   * @param nodes - AST to search
   * @param level - Heading level (1-6)
   * @returns Array of heading nodes
   */
  extractHeadings(nodes: MarkdownNode[], level: number): MarkdownNode[] {
    return nodes.filter(n => n.type === 'heading' && n.level === level);
  }

  /**
   * Extract list items from a node or array of nodes
   * @param nodeOrNodes - List node or array of nodes
   * @returns Array of list item contents
   */
  extractListItems(nodeOrNodes: MarkdownNode | MarkdownNode[]): string[] {
    const nodes = Array.isArray(nodeOrNodes)
      ? nodeOrNodes
      : (nodeOrNodes.children || [nodeOrNodes]);

    return nodes
      .filter(n => n.type === 'list-item')
      .map(n => n.content);
  }
}
