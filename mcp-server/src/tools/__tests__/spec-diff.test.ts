/**
 * Spec Diff Tool Tests
 *
 * Tests for specification comparison functionality:
 * - Directory comparison
 * - Section diffing
 * - Report formatting
 * - Security validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import {
  compareSpecs,
  formatDiffReport,
  executeSpecDiff,
  specDiffTool,
  type DiffReport,
} from '../spec-diff.js';

describe('Spec Diff Tool Tests', () => {
  let testDir: string;
  let baseDir: string;
  let compareDir: string;

  async function createSpecFile(dir: string, filename: string, content: string) {
    const specDir = path.join(dir, '.specify', 'memory', 'specifications');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(path.join(specDir, filename), content);
  }

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `stackshift-diff-test-${randomBytes(8).toString('hex')}`);
    baseDir = path.join(testDir, 'base');
    compareDir = path.join(testDir, 'compare');

    await fs.mkdir(baseDir, { recursive: true });
    await fs.mkdir(compareDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Tool Definition', () => {
    it('should have correct tool name', () => {
      expect(specDiffTool.name).toBe('stackshift_spec_diff');
    });

    it('should have required input schema properties', () => {
      const props = specDiffTool.inputSchema.properties;
      expect(props).toHaveProperty('base_directory');
      expect(props).toHaveProperty('compare_directory');
      expect(props).toHaveProperty('format');
    });

    it('should mark base_directory and compare_directory as required', () => {
      expect(specDiffTool.inputSchema.required).toContain('base_directory');
      expect(specDiffTool.inputSchema.required).toContain('compare_directory');
    });
  });

  describe('compareSpecs', () => {
    it('should detect added specifications', async () => {
      // Only compareDir has a spec
      await createSpecFile(
        compareDir,
        'new-feature.md',
        '# Feature: New Feature\n\n## User Stories\n- As a user...'
      );

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.added).toBe(1);
      expect(report.removed).toBe(0);
      expect(report.modified).toBe(0);
      expect(report.diffs).toHaveLength(1);
      expect(report.diffs[0].changeType).toBe('added');
      expect(report.diffs[0].featureName).toBe('New Feature');
    });

    it('should detect removed specifications', async () => {
      // Only baseDir has a spec
      await createSpecFile(
        baseDir,
        'old-feature.md',
        '# Feature: Old Feature\n\n## User Stories\n- As a user...'
      );

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.added).toBe(0);
      expect(report.removed).toBe(1);
      expect(report.modified).toBe(0);
      expect(report.diffs).toHaveLength(1);
      expect(report.diffs[0].changeType).toBe('removed');
    });

    it('should detect modified specifications', async () => {
      await createSpecFile(
        baseDir,
        'feature.md',
        '# Feature: My Feature\n\n## User Stories\n- Old story'
      );
      await createSpecFile(
        compareDir,
        'feature.md',
        '# Feature: My Feature\n\n## User Stories\n- New story'
      );

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.added).toBe(0);
      expect(report.removed).toBe(0);
      expect(report.modified).toBe(1);
      expect(report.diffs).toHaveLength(1);
      expect(report.diffs[0].changeType).toBe('modified');
    });

    it('should detect unchanged specifications', async () => {
      const content = '# Feature: Same Feature\n\n## User Stories\n- Same story';
      await createSpecFile(baseDir, 'same.md', content);
      await createSpecFile(compareDir, 'same.md', content);

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.unchanged).toBe(1);
      expect(report.modified).toBe(0);
      expect(report.diffs).toHaveLength(0);
    });

    it('should handle multiple specs with different change types', async () => {
      // Added
      await createSpecFile(compareDir, 'added.md', '# Feature: Added');
      // Removed
      await createSpecFile(baseDir, 'removed.md', '# Feature: Removed');
      // Modified
      await createSpecFile(baseDir, 'modified.md', '# Feature: Modified\n\nOld content');
      await createSpecFile(compareDir, 'modified.md', '# Feature: Modified\n\nNew content');
      // Unchanged
      await createSpecFile(baseDir, 'unchanged.md', '# Feature: Unchanged');
      await createSpecFile(compareDir, 'unchanged.md', '# Feature: Unchanged');

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.added).toBe(1);
      expect(report.removed).toBe(1);
      expect(report.modified).toBe(1);
      expect(report.unchanged).toBe(1);
    });

    it('should include timestamp in report', async () => {
      const report = await compareSpecs(baseDir, compareDir);

      expect(report.timestamp).toBeDefined();
      expect(new Date(report.timestamp).getTime()).not.toBeNaN();
    });

    it('should handle empty directories', async () => {
      const report = await compareSpecs(baseDir, compareDir);

      expect(report.added).toBe(0);
      expect(report.removed).toBe(0);
      expect(report.modified).toBe(0);
      expect(report.totalSpecs).toBe(0);
    });

    it('should detect section-level changes', async () => {
      await createSpecFile(
        baseDir,
        'feature.md',
        '# Feature: Test\n\n## User Stories\n- Old story\n\n## Acceptance Criteria\n- Old criteria'
      );
      await createSpecFile(
        compareDir,
        'feature.md',
        '# Feature: Test\n\n## User Stories\n- New story\n\n## Technical Requirements\n- New requirement'
      );

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.diffs).toHaveLength(1);
      const diff = report.diffs[0];
      expect(diff.sections.length).toBeGreaterThan(0);

      // Should have section changes
      const sectionNames = diff.sections.map(s => s.section);
      expect(sectionNames).toContain('User Stories');
    });
  });

  describe('formatDiffReport', () => {
    it('should format report as markdown', async () => {
      await createSpecFile(compareDir, 'new.md', '# Feature: New');

      const report = await compareSpecs(baseDir, compareDir);
      const formatted = formatDiffReport(report);

      expect(formatted).toContain('# Specification Diff Report');
      expect(formatted).toContain('## Summary');
      expect(formatted).toContain('Added');
      expect(formatted).toContain('## Changes');
    });

    it('should show "No changes detected" when no diffs', async () => {
      const report: DiffReport = {
        timestamp: new Date().toISOString(),
        baseRef: '/base',
        compareRef: '/compare',
        totalSpecs: 0,
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: 0,
        diffs: [],
      };

      const formatted = formatDiffReport(report);

      expect(formatted).toContain('No changes detected');
    });

    it('should include appropriate icons for change types', async () => {
      await createSpecFile(compareDir, 'added.md', '# Feature: Added');
      await createSpecFile(baseDir, 'removed.md', '# Feature: Removed');

      const report = await compareSpecs(baseDir, compareDir);
      const formatted = formatDiffReport(report);

      // Should have different icons for added and removed
      expect(formatted).toMatch(/[+➕]/);
    });

    it('should include summary table', async () => {
      const report: DiffReport = {
        timestamp: new Date().toISOString(),
        baseRef: '/base',
        compareRef: '/compare',
        totalSpecs: 10,
        added: 2,
        removed: 1,
        modified: 3,
        unchanged: 4,
        diffs: [],
      };

      const formatted = formatDiffReport(report);

      expect(formatted).toContain('| Status | Count |');
      expect(formatted).toContain('| **Total** | **10** |');
    });
  });

  describe('executeSpecDiff', () => {
    it('should return markdown format by default', async () => {
      const result = await executeSpecDiff({
        base_directory: baseDir,
        compare_directory: compareDir,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# Specification Diff Report');
    });

    it('should return JSON format when requested', async () => {
      const result = await executeSpecDiff({
        base_directory: baseDir,
        compare_directory: compareDir,
        format: 'json',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('added');
      expect(parsed).toHaveProperty('removed');
    });
  });

  describe('Security - Path Traversal Prevention', () => {
    it('should reject path traversal attempts', async () => {
      const maliciousPaths = ['../../../../etc', '../../../.ssh', '/etc/passwd'];

      for (const maliciousPath of maliciousPaths) {
        await expect(compareSpecs(maliciousPath, compareDir)).rejects.toThrow(
          /outside allowed workspace/
        );
        await expect(compareSpecs(baseDir, maliciousPath)).rejects.toThrow(
          /outside allowed workspace/
        );
      }
    });
  });

  describe('Feature Name Extraction', () => {
    it('should extract feature name from header', async () => {
      await createSpecFile(compareDir, 'test.md', '# Feature: Authentication System\n\nContent');

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.diffs[0].featureName).toBe('Authentication System');
    });

    it('should extract feature name without prefix', async () => {
      await createSpecFile(compareDir, 'test.md', '# User Dashboard\n\nContent');

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.diffs[0].featureName).toBe('User Dashboard');
    });

    it('should fall back to filename if no header', async () => {
      await createSpecFile(compareDir, 'my-feature.md', 'No header content');

      const report = await compareSpecs(baseDir, compareDir);

      expect(report.diffs[0].featureName).toBe('my-feature');
    });
  });
});
