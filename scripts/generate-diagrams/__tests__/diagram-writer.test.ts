/**
 * Tests for diagram writer utility
 * @module diagram-writer.test
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { DiagramWriter } from '../diagram-writer.js';
import type { MermaidCode } from '../types.js';

describe('DiagramWriter', () => {
  let writer: DiagramWriter;
  let testDir: string;

  beforeEach(async () => {
    writer = new DiagramWriter();
    testDir = join(tmpdir(), `diagram-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('writes diagram to file', async () => {
    const diagram: MermaidCode = {
      diagramType: 'stateDiagram-v2',
      code: 'stateDiagram-v2\n    [*] --> State1',
      markdownCode: '```mermaid\nstateDiagram-v2\n    [*] --> State1\n```',
      outputPath: join(testDir, 'test.mmd'),
      generatedAt: new Date()
    };

    const path = await writer.write(diagram);

    expect(path).toBe(diagram.outputPath);

    const content = await fs.readFile(path, 'utf-8');
    expect(content).toBe(diagram.code);
  });

  test('creates directories if they do not exist', async () => {
    const diagram: MermaidCode = {
      diagramType: 'graph',
      code: 'graph TD\n    A --> B',
      markdownCode: '```mermaid\ngraph TD\n    A --> B\n```',
      outputPath: join(testDir, 'nested', 'dir', 'test.mmd'),
      generatedAt: new Date()
    };

    const path = await writer.write(diagram);

    expect(path).toBe(diagram.outputPath);

    const content = await fs.readFile(path, 'utf-8');
    expect(content).toBe(diagram.code);
  });

  test('writes multiple diagrams', async () => {
    const diagrams: MermaidCode[] = [
      {
        diagramType: 'stateDiagram-v2',
        code: 'stateDiagram-v2\n    [*] --> State1',
        markdownCode: '```mermaid\nstateDiagram-v2\n    [*] --> State1\n```',
        outputPath: join(testDir, 'diagram1.mmd'),
        generatedAt: new Date()
      },
      {
        diagramType: 'graph',
        code: 'graph TD\n    A --> B',
        markdownCode: '```mermaid\ngraph TD\n    A --> B\n```',
        outputPath: join(testDir, 'diagram2.mmd'),
        generatedAt: new Date()
      }
    ];

    const paths = await writer.writeAll(diagrams);

    expect(paths).toHaveLength(2);

    for (let i = 0; i < diagrams.length; i++) {
      const content = await fs.readFile(paths[i], 'utf-8');
      expect(content).toBe(diagrams[i].code);
    }
  });

  test('writes metadata as JSON', async () => {
    const metadata = {
      diagrams: [{ name: 'test', type: 'workflow', path: '/test.mmd', lines: 5, nodes: 3 }],
      generatedAt: new Date(),
      stackshiftVersion: '1.0.0',
      stats: {
        totalDiagrams: 1,
        generationTimeMs: 100,
        sourceFilesParsed: 1,
        errors: 0
      }
    };

    const path = await writer.writeMetadata(metadata, join(testDir, 'metadata.json'));

    const content = await fs.readFile(path, 'utf-8');
    const parsed = JSON.parse(content);

    expect(parsed.diagrams).toHaveLength(1);
    expect(parsed.stackshiftVersion).toBe('1.0.0');
  });
});
