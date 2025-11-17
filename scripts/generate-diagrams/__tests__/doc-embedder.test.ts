/**
 * Tests for documentation embedder
 * @module doc-embedder.test
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DocumentationEmbedder } from '../embedders/doc-embedder.js';
import type { MermaidCode } from '../types.js';

// Test fixture directory
const TEST_DIR = join(process.cwd(), 'scripts', 'generate-diagrams', '__tests__', 'fixtures', 'embed');

describe('DocumentationEmbedder', () => {
  let embedder: DocumentationEmbedder;
  let testReadmePath: string;
  let testArchPath: string;

  const sampleWorkflowDiagram: MermaidCode = {
    diagramType: 'stateDiagram-v2',
    code: 'stateDiagram-v2\n    [*] --> analyze\n    analyze --> [*]',
    markdownCode: '```mermaid\nstateDiagram-v2\n    [*] --> analyze\n    analyze --> [*]\n```',
    outputPath: 'docs/diagrams/workflow.mmd',
    generatedAt: new Date('2025-11-17T00:00:00.000Z')
  };

  const sampleArchitectureDiagram: MermaidCode = {
    diagramType: 'graph',
    code: 'graph TB\n    A[Component A]\n    B[Component B]\n    A --> B',
    markdownCode: '```mermaid\ngraph TB\n    A[Component A]\n    B[Component B]\n    A --> B\n```',
    outputPath: 'docs/diagrams/architecture.mmd',
    generatedAt: new Date('2025-11-17T00:00:00.000Z')
  };

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.mkdir(join(TEST_DIR, 'docs'), { recursive: true });

    embedder = new DocumentationEmbedder(TEST_DIR);
    testReadmePath = join(TEST_DIR, 'README.md');
    testArchPath = join(TEST_DIR, 'docs', 'architecture.md');
  });

  afterEach(async () => {
    // Cleanup test files
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('embedInReadme', () => {
    test('inserts workflow diagram after Overview section', async () => {
      // Create test README with Overview section
      const initialContent = `# StackShift

## Overview

This is the overview paragraph explaining what StackShift does.

## Features

List of features here.
`;
      await fs.writeFile(testReadmePath, initialContent, 'utf-8');

      // Embed diagram
      await embedder.embedInReadme(sampleWorkflowDiagram);

      // Read result
      const result = await fs.readFile(testReadmePath, 'utf-8');

      // Check that diagram was inserted
      expect(result).toContain('<!-- DIAGRAM: workflow-start -->');
      expect(result).toContain('<!-- DIAGRAM: workflow-end -->');
      expect(result).toContain('### Workflow State Machine');
      expect(result).toContain(sampleWorkflowDiagram.markdownCode);
      expect(result).toContain('*Last generated: 2025-11-17T00:00:00.000Z*');

      // Check that existing content is preserved
      expect(result).toContain('## Overview');
      expect(result).toContain('This is the overview paragraph');
      expect(result).toContain('## Features');
      expect(result).toContain('List of features here');
    });

    test('replaces existing workflow diagram on re-run', async () => {
      // Create README with existing embedded diagram
      const initialContent = `# StackShift

## Overview

Overview text here.

<!-- DIAGRAM: workflow-start -->
### Workflow State Machine

\`\`\`mermaid
stateDiagram-v2
    [*] --> old
\`\`\`

*Last generated: 2025-01-01T00:00:00.000Z*
<!-- DIAGRAM: workflow-end -->

## Features

Features here.
`;
      await fs.writeFile(testReadmePath, initialContent, 'utf-8');

      // Embed new diagram
      await embedder.embedInReadme(sampleWorkflowDiagram);

      // Read result
      const result = await fs.readFile(testReadmePath, 'utf-8');

      // Check that old diagram was replaced
      expect(result).not.toContain('[*] --> old');
      expect(result).toContain('[*] --> analyze');
      expect(result).toContain('2025-11-17T00:00:00.000Z');

      // Check that there's only one diagram section
      const matches = result.match(/<!-- DIAGRAM: workflow-start -->/g);
      expect(matches).toHaveLength(1);
    });

    test('preserves existing content when embedding', async () => {
      const initialContent = `# StackShift

## Overview

Detailed overview with multiple paragraphs.

This is the second paragraph of the overview.

## Installation

Installation instructions here.

## Usage

Usage instructions here.
`;
      await fs.writeFile(testReadmePath, initialContent, 'utf-8');

      await embedder.embedInReadme(sampleWorkflowDiagram);

      const result = await fs.readFile(testReadmePath, 'utf-8');

      // Verify all original content is still present
      expect(result).toContain('Detailed overview with multiple paragraphs');
      expect(result).toContain('This is the second paragraph of the overview');
      expect(result).toContain('## Installation');
      expect(result).toContain('Installation instructions here');
      expect(result).toContain('## Usage');
      expect(result).toContain('Usage instructions here');
    });

    test('throws error if README.md does not exist', async () => {
      await expect(embedder.embedInReadme(sampleWorkflowDiagram)).rejects.toThrow(
        /Failed to read README.md/
      );
    });

    test('throws error if Overview section not found', async () => {
      const invalidContent = `# StackShift

## Introduction

No overview section here.
`;
      await fs.writeFile(testReadmePath, invalidContent, 'utf-8');

      await expect(embedder.embedInReadme(sampleWorkflowDiagram)).rejects.toThrow(
        /Could not find "## Overview" section/
      );
    });
  });

  describe('embedInArchitectureDocs', () => {
    test('creates architecture.md if it does not exist', async () => {
      await embedder.embedInArchitectureDocs(sampleArchitectureDiagram);

      const result = await fs.readFile(testArchPath, 'utf-8');

      expect(result).toContain('# System Architecture');
      expect(result).toContain('<!-- DIAGRAM: architecture-start -->');
      expect(result).toContain('### Component Architecture');
      expect(result).toContain(sampleArchitectureDiagram.markdownCode);
    });

    test('inserts diagram in existing architecture.md', async () => {
      const initialContent = `# System Architecture

This document describes the architecture.

## System Architecture

High-level overview here.
`;
      await fs.writeFile(testArchPath, initialContent, 'utf-8');

      await embedder.embedInArchitectureDocs(sampleArchitectureDiagram);

      const result = await fs.readFile(testArchPath, 'utf-8');

      expect(result).toContain('<!-- DIAGRAM: architecture-start -->');
      expect(result).toContain(sampleArchitectureDiagram.markdownCode);
      expect(result).toContain('High-level overview here');
    });

    test('replaces existing architecture diagram on re-run', async () => {
      const initialContent = `# System Architecture

## System Architecture

<!-- DIAGRAM: architecture-start -->
### Component Architecture

\`\`\`mermaid
graph TB
    Old[Old Component]
\`\`\`

*Last generated: 2025-01-01T00:00:00.000Z*
<!-- DIAGRAM: architecture-end -->
`;
      await fs.writeFile(testArchPath, initialContent, 'utf-8');

      await embedder.embedInArchitectureDocs(sampleArchitectureDiagram);

      const result = await fs.readFile(testArchPath, 'utf-8');

      expect(result).not.toContain('Old[Old Component]');
      expect(result).toContain('A[Component A]');
      expect(result).toContain('2025-11-17T00:00:00.000Z');
    });

    test('preserves existing content when embedding', async () => {
      const initialContent = `# System Architecture

Intro paragraph.

## System Architecture

Detailed architecture description.

## Components

List of components.
`;
      await fs.writeFile(testArchPath, initialContent, 'utf-8');

      await embedder.embedInArchitectureDocs(sampleArchitectureDiagram);

      const result = await fs.readFile(testArchPath, 'utf-8');

      expect(result).toContain('Intro paragraph');
      expect(result).toContain('Detailed architecture description');
      expect(result).toContain('## Components');
      expect(result).toContain('List of components');
    });
  });
});
