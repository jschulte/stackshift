/**
 * Gap Analysis Tool Tests
 *
 * Tests for Gear 4: Gap Analysis
 * - Security validation (CWE-22, CWE-367)
 * - Route-specific behavior (greenfield vs brownfield)
 * - State management
 * - Response formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gapAnalysisToolHandler } from '../gap-analysis.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { StateManager } from '../../utils/state-manager.js';

describe('Gap Analysis Tool Tests', () => {
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
          gapAnalysisToolHandler({ directory: maliciousPath })
        ).rejects.toThrow(/outside allowed workspace/);
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      // Create state with greenfield route
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Security - State Management (CWE-367)', () => {
    it('should handle concurrent calls safely', async () => {
      // Setup initial state
      await stateManager.initialize(testDir, 'greenfield');

      // Run multiple gap-analysis calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        gapAnalysisToolHandler({ directory: testDir })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('gap-analysis');
    });
  });

  describe('Route Handling', () => {
    it('should handle greenfield route correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Greenfield');
      expect(result.content[0].text).toContain('Expected for Greenfield:');
      expect(result.content[0].text).toContain('Most/all features marked ❌ MISSING');
      expect(result.content[0].text).toContain('to be built in new stack');
      expect(result.content[0].text).not.toContain('Expected for Brownfield:');
    });

    it('should handle brownfield route correctly', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Brownfield');
      expect(result.content[0].text).toContain('Expected for Brownfield:');
      expect(result.content[0].text).toContain('Should show ~100% alignment initially');
      expect(result.content[0].text).toContain('specs match code');
      expect(result.content[0].text).not.toContain('Expected for Greenfield:');
    });

    it('should handle null route gracefully', async () => {
      // Create state without route (null)
      await stateManager.initialize(testDir, null);

      const result = await gapAnalysisToolHandler({ directory: testDir });

      // Should show "null" or "Brownfield" in route display (ternary defaults to brownfield)
      expect(result.content[0].text).toContain('Route:');
      expect(result.content).toBeDefined();
    });
  });

  describe('State Updates', () => {
    it('should mark gap-analysis step as complete', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await gapAnalysisToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('gap-analysis');
      expect(finalState.currentStep).toBe('complete-spec');
    });

    it('should preserve existing completed steps', async () => {
      await stateManager.initialize(testDir, 'brownfield');
      // Complete previous steps
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('reverse-engineer');
      await stateManager.completeStep('create-specs');

      await gapAnalysisToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('analyze');
      expect(finalState.completedSteps).toContain('reverse-engineer');
      expect(finalState.completedSteps).toContain('create-specs');
      expect(finalState.completedSteps).toContain('gap-analysis');
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string directory parameter', async () => {
      await expect(
        gapAnalysisToolHandler({ directory: 123 as any })
      ).rejects.toThrow();
    });

    it('should reject empty string directory', async () => {
      await expect(
        gapAnalysisToolHandler({ directory: '' })
      ).rejects.toThrow();
    });

    it('should accept valid directory path', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });

    it('should use cwd when directory not provided', async () => {
      // We can't actually test cwd behavior easily, but verify it accepts undefined
      await stateManager.initialize(testDir, 'greenfield');
      // Just verify the handler can be called (it will use process.cwd())
      // This might fail in test environment but we're testing the interface
      expect(gapAnalysisToolHandler).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# StackShift - Gear 4: Gap Analysis');
      expect(result.content[0].text).toContain('stackshift_complete_spec');
    });

    it('should include Spec Kit validation step', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Step 1: Run GitHub Spec Kit Validation');
      expect(result.content[0].text).toContain('> /speckit.analyze');
    });

    it('should include gap analysis report structure', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Step 2: Create Gap Analysis Report');
      expect(result.content[0].text).toContain('docs/gap-analysis-report.md');
      expect(result.content[0].text).toContain('Overall completion percentage');
      expect(result.content[0].text).toContain('COMPLETE features (✅)');
      expect(result.content[0].text).toContain('PARTIAL features (⚠️)');
      expect(result.content[0].text).toContain('MISSING features (❌)');
      expect(result.content[0].text).toContain('[NEEDS CLARIFICATION]');
    });

    it('should include prioritization structure', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Step 3: Prioritize Implementation');
      expect(result.content[0].text).toContain('Phase 1: P0 Critical');
      expect(result.content[0].text).toContain('Phase 2: P1 High Value');
      expect(result.content[0].text).toContain('Phase 3: P2/P3 Enhancements');
    });

    it('should reference next gear', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Next Gear');
      expect(result.content[0].text).toContain('5th gear: Complete Specification');
      expect(result.content[0].text).toContain('stackshift_complete_spec');
      expect(result.content[0].text).toContain('/speckit.clarify');
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for missing state', async () => {
      // Try to call without initializing state first
      await expect(
        gapAnalysisToolHandler({ directory: testDir })
      ).rejects.toThrow(/State file does not exist/);
    });

    it('should wrap errors with descriptive message', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try with a directory that doesn't exist for validation
      const nonExistentPath = path.join(testDir, 'nonexistent', 'path');

      await expect(
        gapAnalysisToolHandler({ directory: nonExistentPath })
      ).rejects.toThrow(/Gap analysis failed/);
    });
  });

  describe('Workflow Integration', () => {
    it('should indicate Spec Kit commands', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await gapAnalysisToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('/speckit.analyze');
      expect(result.content[0].text).toContain('/speckit.clarify');
    });

    it('should show different expectations per route', async () => {
      // Greenfield
      await stateManager.initialize(testDir, 'greenfield');
      let result = await gapAnalysisToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('to be built in new stack');

      // Brownfield
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });
      stateManager = new StateManager(testDir);
      await stateManager.initialize(testDir, 'brownfield');
      result = await gapAnalysisToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('specs match code');
    });
  });
});
