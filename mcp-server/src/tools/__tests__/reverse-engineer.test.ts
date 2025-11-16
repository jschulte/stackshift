/**
 * Reverse Engineer Tool Tests
 *
 * Tests for Gear 2: Reverse Engineer
 * - Security validation (CWE-22, CWE-367)
 * - Route-specific behavior (greenfield vs brownfield)
 * - State management
 * - Directory creation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { reverseEngineerToolHandler } from '../reverse-engineer.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { StateManager } from '../../utils/state-manager.js';

describe('Reverse Engineer Tool Tests', () => {
  let testDir: string;
  let stateManager: StateManager;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `stackshift-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Initialize state manager
    stateManager = new StateManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Security - Path Traversal Prevention (CWE-22)', () => {
    it('should reject path traversal attempts', async () => {
      const traversalAttempts = [
        '../../../../etc',
        '../../../.ssh',
        '/etc/passwd',
        '/var/log',
        '../../../etc/passwd',
      ];

      for (const maliciousPath of traversalAttempts) {
        await expect(reverseEngineerToolHandler({ directory: maliciousPath })).rejects.toThrow(
          /outside allowed workspace/
        );
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      // Create state with greenfield route
      await stateManager.initialize(testDir, 'greenfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Security - State Management (CWE-367)', () => {
    it('should handle concurrent calls safely', async () => {
      // Setup initial state
      await stateManager.initialize(testDir, 'greenfield');

      // Run multiple reverse-engineer calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        reverseEngineerToolHandler({ directory: testDir })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('reverse-engineer');
    });
  });

  describe('Route Handling', () => {
    it('should handle greenfield route correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Greenfield (Business Logic Only)');
      expect(result.content[0].text).toContain('Tech-agnostic specifications');
      expect(result.content[0].text).not.toContain('Framework and library versions');
    });

    it('should handle brownfield route correctly', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Brownfield (Full Stack)');
      expect(result.content[0].text).toContain('Framework and library versions');
      expect(result.content[0].text).toContain('Prescriptive specifications');
    });

    it('should throw error if route not set', async () => {
      // Create state without route (null)
      await stateManager.initialize(testDir, null);

      await expect(reverseEngineerToolHandler({ directory: testDir })).rejects.toThrow(
        /Route not set/
      );
    });
  });

  describe('Directory Creation', () => {
    it('should create docs/reverse-engineering directory', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await reverseEngineerToolHandler({ directory: testDir });

      const docsDir = path.join(testDir, 'docs', 'reverse-engineering');
      const stats = await fs.stat(docsDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      // Create directory manually first
      const docsDir = path.join(testDir, 'docs', 'reverse-engineering');
      await fs.mkdir(docsDir, { recursive: true });

      // Should not throw
      await expect(reverseEngineerToolHandler({ directory: testDir })).resolves.toBeDefined();
    });
  });

  describe('State Updates', () => {
    it('should mark reverse-engineer step as complete', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await reverseEngineerToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('reverse-engineer');
      expect(finalState.currentStep).toBe('create-specs');
    });

    it('should preserve existing completed steps', async () => {
      await stateManager.initialize(testDir, 'brownfield');
      // Complete analyze step first
      await stateManager.completeStep('analyze');

      await reverseEngineerToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('analyze');
      expect(finalState.completedSteps).toContain('reverse-engineer');
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string directory parameter', async () => {
      await expect(reverseEngineerToolHandler({ directory: 123 as any })).rejects.toThrow();
    });

    it('should reject empty string directory', async () => {
      await expect(reverseEngineerToolHandler({ directory: '' })).rejects.toThrow();
    });

    it('should accept valid directory path', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# StackShift - Gear 2');
      expect(result.content[0].text).toContain('stackshift_create_specs');
    });

    it('should list all expected documentation files', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await reverseEngineerToolHandler({ directory: testDir });

      const expectedDocs = [
        'functional-specification.md',
        'configuration-reference.md',
        'data-architecture.md',
        'operations-guide.md',
        'technical-debt-analysis.md',
        'observability-requirements.md',
        'visual-design-system.md',
        'test-documentation.md',
      ];

      for (const doc of expectedDocs) {
        expect(result.content[0].text).toContain(doc);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for invalid state', async () => {
      // Try to call without initializing state first
      await expect(reverseEngineerToolHandler({ directory: testDir })).rejects.toThrow(
        /State file does not exist/
      );
    });

    it('should wrap errors with descriptive message', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try with a directory that will fail validation after state loads
      // (using a very long path that might cause issues)
      const veryLongPath = testDir + '/' + 'a'.repeat(1000);

      await expect(reverseEngineerToolHandler({ directory: veryLongPath })).rejects.toThrow(
        /Reverse engineering failed/
      );
    });
  });
});
