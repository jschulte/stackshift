/**
 * Complete Spec Tool Tests
 *
 * Tests for Gear 5: Complete Specification
 * - Security validation (CWE-22, CWE-367)
 * - State management
 * - Clarifications input validation
 * - Response formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { completeSpecToolHandler } from '../complete-spec.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { StateManager } from '../../utils/state-manager.js';

describe('Complete Spec Tool Tests', () => {
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
        await expect(
          completeSpecToolHandler({ directory: maliciousPath })
        ).rejects.toThrow(/outside allowed workspace/);
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      // Create state with greenfield route
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Security - State Management (CWE-367)', () => {
    it('should handle concurrent calls safely', async () => {
      // Setup initial state
      await stateManager.initialize(testDir, 'greenfield');

      // Run multiple complete-spec calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        completeSpecToolHandler({ directory: testDir })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('complete-spec');
    });
  });

  describe('Clarifications Input Validation', () => {
    it('should accept empty clarifications array', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({
        directory: testDir,
        clarifications: [],
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Use /speckit.clarify');
    });

    it('should accept valid clarifications', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await completeSpecToolHandler({
        directory: testDir,
        clarifications: [
          { question: 'What charts for analytics?', answer: 'Line and bar charts' },
          { question: 'Max upload size?', answer: '10MB' },
        ],
      });

      expect(result.content[0].text).toContain('Clarifications Provided');
      expect(result.content[0].text).toContain('Q1:');
      expect(result.content[0].text).toContain('What charts for analytics?');
      expect(result.content[0].text).toContain('Line and bar charts');
    });

    it('should reject too many clarifications (DoS prevention)', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const toManyClarifications = Array.from({ length: 101 }, (_, i) => ({
        question: `Question ${i}`,
        answer: `Answer ${i}`,
      }));

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: toManyClarifications,
        })
      ).rejects.toThrow(/Too many clarifications.*max 100/);
    });

    it('should reject non-object clarifications', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: ['invalid' as any],
        })
      ).rejects.toThrow(/Invalid clarification at index 0: not an object/);
    });

    it('should reject clarifications with non-string question', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: 123, answer: 'valid' } as any],
        })
      ).rejects.toThrow(/Invalid clarification at index 0: question must be a string/);
    });

    it('should reject clarifications with non-string answer', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: 'valid', answer: 123 } as any],
        })
      ).rejects.toThrow(/Invalid clarification at index 0: answer must be a string/);
    });

    it('should reject clarifications with empty question', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: '', answer: 'valid' }],
        })
      ).rejects.toThrow(/Invalid clarification question at index 0: length must be 1-5000/);
    });

    it('should reject clarifications with empty answer', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: 'valid', answer: '' }],
        })
      ).rejects.toThrow(/Invalid clarification answer at index 0: length must be 1-5000/);
    });

    it('should reject clarifications with too long question', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const tooLong = 'a'.repeat(5001);

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: tooLong, answer: 'valid' }],
        })
      ).rejects.toThrow(/Invalid clarification question at index 0: length must be 1-5000/);
    });

    it('should reject clarifications with too long answer', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const tooLong = 'a'.repeat(5001);

      await expect(
        completeSpecToolHandler({
          directory: testDir,
          clarifications: [{ question: 'valid', answer: tooLong }],
        })
      ).rejects.toThrow(/Invalid clarification answer at index 0: length must be 1-5000/);
    });

    it('should accept clarifications at max length', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const maxLength = 'a'.repeat(5000);

      const result = await completeSpecToolHandler({
        directory: testDir,
        clarifications: [{ question: maxLength, answer: maxLength }],
      });

      expect(result.content).toBeDefined();
    });
  });

  describe('State Updates', () => {
    it('should mark complete-spec step as complete', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await completeSpecToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('complete-spec');
      expect(finalState.currentStep).toBe('implement');
    });

    it('should preserve existing completed steps', async () => {
      await stateManager.initialize(testDir, 'brownfield');
      // Complete previous steps
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('reverse-engineer');
      await stateManager.completeStep('create-specs');
      await stateManager.completeStep('gap-analysis');

      await completeSpecToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('analyze');
      expect(finalState.completedSteps).toContain('reverse-engineer');
      expect(finalState.completedSteps).toContain('create-specs');
      expect(finalState.completedSteps).toContain('gap-analysis');
      expect(finalState.completedSteps).toContain('complete-spec');
    });

    it('should store clarifications count in stepDetails', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await completeSpecToolHandler({
        directory: testDir,
        clarifications: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
          { question: 'Q3', answer: 'A3' },
        ],
      });

      const finalState = await stateManager.load();
      expect(finalState.stepDetails?.['complete-spec']?.clarifications).toBe(3);
      expect(finalState.stepDetails?.['complete-spec']?.status).toBe('completed');
    });

    it('should store zero clarifications when none provided', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      await completeSpecToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.stepDetails?.['complete-spec']?.clarifications).toBe(0);
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string directory parameter', async () => {
      await expect(
        completeSpecToolHandler({ directory: 123 as any })
      ).rejects.toThrow();
    });

    it('should reject empty string directory', async () => {
      await expect(
        completeSpecToolHandler({ directory: '' })
      ).rejects.toThrow();
    });

    it('should accept valid directory path', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({ directory: testDir });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# StackShift - Gear 5: Complete Specification');
      expect(result.content[0].text).toContain('stackshift_implement');
    });

    it('should show interactive mode when no clarifications provided', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await completeSpecToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Use /speckit.clarify');
      expect(result.content[0].text).toContain('Identify all [NEEDS CLARIFICATION] markers');
      expect(result.content[0].text).toContain('Common Clarification Topics');
      expect(result.content[0].text).not.toContain('Clarifications Provided');
    });

    it('should show provided clarifications when supplied', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({
        directory: testDir,
        clarifications: [
          { question: 'Upload limit?', answer: '50MB' },
          { question: 'Session timeout?', answer: '30 minutes' },
        ],
      });

      expect(result.content[0].text).toContain('Clarifications Provided');
      expect(result.content[0].text).toContain('Q1:');
      expect(result.content[0].text).toContain('Upload limit?');
      expect(result.content[0].text).toContain('50MB');
      expect(result.content[0].text).toContain('Q2:');
      expect(result.content[0].text).toContain('Session timeout?');
      expect(result.content[0].text).toContain('30 minutes');
      expect(result.content[0].text).toContain('These clarifications will be incorporated');
    });

    it('should include specification readiness checklist', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await completeSpecToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Specification Readiness');
      expect(result.content[0].text).toContain('All [NEEDS CLARIFICATION] markers removed');
      expect(result.content[0].text).toContain('Acceptance criteria complete');
      expect(result.content[0].text).toContain('Implementation details finalized');
      expect(result.content[0].text).toContain('Ready for implementation');
    });

    it('should reference next gear', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await completeSpecToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Next Gear');
      expect(result.content[0].text).toContain('6th gear: Implement from Spec');
      expect(result.content[0].text).toContain('stackshift_implement');
      expect(result.content[0].text).toContain('/speckit.tasks');
      expect(result.content[0].text).toContain('/speckit.implement');
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for missing state', async () => {
      // Try to call without initializing state first
      await expect(
        completeSpecToolHandler({ directory: testDir })
      ).rejects.toThrow(/State file does not exist/);
    });

    it('should wrap errors with descriptive message', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try with a directory that doesn't exist for validation
      const nonExistentPath = path.join(testDir, 'nonexistent', 'path');

      await expect(
        completeSpecToolHandler({ directory: nonExistentPath })
      ).rejects.toThrow(/Spec completion failed/);
    });
  });

  describe('Workflow Integration', () => {
    it('should indicate Spec Kit commands', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await completeSpecToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('/speckit.clarify');
      expect(result.content[0].text).toContain('/speckit.tasks');
      expect(result.content[0].text).toContain('/speckit.implement');
    });

    it('should handle multiple clarifications correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const clarifications = Array.from({ length: 10 }, (_, i) => ({
        question: `Question ${i + 1}`,
        answer: `Answer ${i + 1}`,
      }));

      const result = await completeSpecToolHandler({
        directory: testDir,
        clarifications,
      });

      // Should include all 10 clarifications
      for (let i = 1; i <= 10; i++) {
        expect(result.content[0].text).toContain(`Q${i}:`);
        expect(result.content[0].text).toContain(`Question ${i}`);
        expect(result.content[0].text).toContain(`Answer ${i}`);
      }
    });
  });
});
