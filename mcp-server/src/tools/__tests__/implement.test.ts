/**
 * Implement Tool Tests
 *
 * Tests for Gear 6: Implement from Spec
 * - Security validation (CWE-22, CWE-367)
 * - Route-specific behavior (greenfield vs brownfield)
 * - State management
 * - Feature parameter validation
 * - Response formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { implementToolHandler } from '../implement.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { StateManager } from '../../utils/state-manager.js';

describe('Implement Tool Tests', () => {
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
    it('should reject path traversal attempts in directory', async () => {
      const traversalAttempts = [
        '../../../../etc',
        '../../../.ssh',
        '/etc/passwd',
        '/var/log',
        '../../../etc/passwd',
      ];

      for (const maliciousPath of traversalAttempts) {
        await expect(
          implementToolHandler({ directory: maliciousPath })
        ).rejects.toThrow(/outside allowed workspace/);
      }
    });

    it('should reject path traversal attempts in feature name', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const maliciousFeatures = [
        '../../../etc/passwd',
        '../../config',
        'feature/../../../etc',
        'feature/../../file',
      ];

      for (const maliciousFeature of maliciousFeatures) {
        await expect(
          implementToolHandler({ directory: testDir, feature: maliciousFeature })
        ).rejects.toThrow(/cannot contain path separators/);
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      // Create state with greenfield route
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Security - State Management (CWE-367)', () => {
    it('should handle concurrent calls safely', async () => {
      // Setup initial state
      await stateManager.initialize(testDir, 'greenfield');

      // Run multiple implement calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        implementToolHandler({ directory: testDir })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('implement');
    });
  });

  describe('Route Handling', () => {
    it('should handle greenfield route correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Greenfield (Build New)');
      expect(result.content[0].text).toContain('Building in NEW tech stack');
      expect(result.content[0].text).toContain('Choose your stack');
      expect(result.content[0].text).toContain('all are tech-agnostic');
      expect(result.content[0].text).toContain('Implement ALL features from scratch');
      expect(result.content[0].text).not.toContain('Filling gaps in existing stack');
    });

    it('should handle brownfield route correctly', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Brownfield (Fill Gaps)');
      expect(result.content[0].text).toContain('Filling gaps in existing stack');
      expect(result.content[0].text).toContain('Review prioritized roadmap');
      expect(result.content[0].text).toContain('Complete PARTIAL features');
      expect(result.content[0].text).toContain('Implement MISSING features');
      expect(result.content[0].text).not.toContain('Building in NEW tech stack');
    });

    it('should handle null route gracefully', async () => {
      // Create state without route (null)
      await stateManager.initialize(testDir, null);

      const result = await implementToolHandler({ directory: testDir });

      // Should show route info (ternary defaults to brownfield)
      expect(result.content[0].text).toContain('Route:');
      expect(result.content).toBeDefined();
    });
  });

  describe('Feature Parameter Validation', () => {
    it('should accept valid feature names', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const validFeatures = [
        'user-authentication',
        'user_authentication',
        'UserAuthentication',
        'feature123',
        'a',
        'a'.repeat(200), // Max length
      ];

      for (const feature of validFeatures) {
        const result = await implementToolHandler({
          directory: testDir,
          feature,
        });

        expect(result.content).toBeDefined();
        expect(result.content[0].text).toContain(`Implementing Feature: ${feature}`);
      }
    });

    it('should reject non-string feature parameter', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        implementToolHandler({ directory: testDir, feature: 123 as any })
      ).rejects.toThrow(/must be a string/);
    });

    it('should reject empty feature name', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        implementToolHandler({ directory: testDir, feature: '' })
      ).rejects.toThrow(/Implementation failed.*Invalid feature name length/);
    });

    it('should reject too long feature name', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const tooLong = 'a'.repeat(201);

      await expect(
        implementToolHandler({ directory: testDir, feature: tooLong })
      ).rejects.toThrow(/Implementation failed.*Invalid feature name length/);
    });

    it('should reject feature names with path separators', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const invalidNames = [
        'feature/name',
        'feature\\name',
        'feature..name',
        '../feature',
        'feature/..',
      ];

      for (const name of invalidNames) {
        await expect(
          implementToolHandler({ directory: testDir, feature: name })
        ).rejects.toThrow(/cannot contain path separators/);
      }
    });

    it('should show generic implementation flow when no feature provided', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Implementation Process');
      expect(result.content[0].text).toContain('Call with feature parameter to implement specific feature');
      expect(result.content[0].text).not.toContain('Implementing Feature:');
    });

    it('should show specific feature flow when feature provided', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({
        directory: testDir,
        feature: 'user-auth',
      });

      expect(result.content[0].text).toContain('Implementing Feature: user-auth');
      expect(result.content[0].text).toContain('GitHub Spec Kit Workflow');
      expect(result.content[0].text).toContain('/speckit.tasks user-auth');
      expect(result.content[0].text).toContain('/speckit.implement user-auth');
    });
  });

  describe('State Updates', () => {
    it('should mark implement step as complete', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await implementToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('implement');
      expect(finalState.currentStep).toBe(null); // All complete!
    });

    it('should preserve existing completed steps', async () => {
      await stateManager.initialize(testDir, 'brownfield');
      // Complete all previous steps
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('reverse-engineer');
      await stateManager.completeStep('create-specs');
      await stateManager.completeStep('gap-analysis');
      await stateManager.completeStep('complete-spec');

      await implementToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('analyze');
      expect(finalState.completedSteps).toContain('reverse-engineer');
      expect(finalState.completedSteps).toContain('create-specs');
      expect(finalState.completedSteps).toContain('gap-analysis');
      expect(finalState.completedSteps).toContain('complete-spec');
      expect(finalState.completedSteps).toContain('implement');
    });

    it('should store feature in stepDetails when provided', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await implementToolHandler({
        directory: testDir,
        feature: 'payment-processing',
      });

      const finalState = await stateManager.load();
      expect(finalState.stepDetails?.['implement']?.feature).toBe('payment-processing');
      expect(finalState.stepDetails?.['implement']?.status).toBe('completed');
    });

    it('should store "all" when no feature provided', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      await implementToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.stepDetails?.['implement']?.feature).toBe('all');
    });

    it('should set currentStep to null (workflow complete)', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await implementToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.currentStep).toBe(null);
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string directory parameter', async () => {
      await expect(
        implementToolHandler({ directory: 123 as any })
      ).rejects.toThrow();
    });

    it('should reject empty string directory', async () => {
      await expect(
        implementToolHandler({ directory: '' })
      ).rejects.toThrow();
    });

    it('should accept valid directory path', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# StackShift - Gear 6: Implement from Spec');
    });

    it('should include Spec Kit workflow for specific feature', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await implementToolHandler({
        directory: testDir,
        feature: 'notifications',
      });

      expect(result.content[0].text).toContain('GitHub Spec Kit Workflow');
      expect(result.content[0].text).toContain('/speckit.tasks notifications');
      expect(result.content[0].text).toContain('/speckit.implement notifications');
      expect(result.content[0].text).toContain('/speckit.analyze');
    });

    it('should include implementation phases', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Systematic Implementation');
      expect(result.content[0].text).toContain('Phase 1: P0 Critical');
      expect(result.content[0].text).toContain('Phase 2: P1 High Value');
      expect(result.content[0].text).toContain('Phase 3: P2/P3');
    });

    it('should include completion status checklist', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Completion Status');
      expect(result.content[0].text).toContain('All specs marked COMPLETE');
      expect(result.content[0].text).toContain('/speckit.analyze\` shows no gaps');
      expect(result.content[0].text).toContain('All tests passing');
      expect(result.content[0].text).toContain('Application ready for production');
    });

    it('should show different success messages per route', async () => {
      // Greenfield
      await stateManager.initialize(testDir, 'greenfield');
      let result = await implementToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('built a new application from the business logic');
      expect(result.content[0].text).toContain('your chosen tech stack');

      // Brownfield
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });
      stateManager = new StateManager(testDir);
      await stateManager.initialize(testDir, 'brownfield');
      result = await implementToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('brought your existing application under GitHub Spec Kit');
      expect(result.content[0].text).toContain('spec-driven going forward');
    });

    it('should include ongoing development commands', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Ongoing Spec-Driven Development');
      expect(result.content[0].text).toContain('/speckit.specify');
      expect(result.content[0].text).toContain('/speckit.plan');
      expect(result.content[0].text).toContain('/speckit.tasks');
      expect(result.content[0].text).toContain('/speckit.implement');
      expect(result.content[0].text).toContain('/speckit.analyze');
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for missing state', async () => {
      // Try to call without initializing state first
      await expect(
        implementToolHandler({ directory: testDir })
      ).rejects.toThrow(/State file does not exist/);
    });

    it('should wrap errors with descriptive message', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try with a directory that doesn't exist for validation
      const nonExistentPath = path.join(testDir, 'nonexistent', 'path');

      await expect(
        implementToolHandler({ directory: nonExistentPath })
      ).rejects.toThrow(/Implementation failed/);
    });
  });

  describe('Workflow Integration', () => {
    it('should indicate Spec Kit commands', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await implementToolHandler({
        directory: testDir,
        feature: 'test-feature',
      });

      expect(result.content[0].text).toContain('/speckit.tasks');
      expect(result.content[0].text).toContain('/speckit.implement');
      expect(result.content[0].text).toContain('/speckit.analyze');
    });

    it('should show route-specific implementation strategy', async () => {
      // Greenfield
      await stateManager.initialize(testDir, 'greenfield');
      let result = await implementToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('Implement ALL features from scratch');
      expect(result.content[0].text).toContain('Achieve 100% completion in chosen stack');

      // Brownfield
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });
      stateManager = new StateManager(testDir);
      await stateManager.initialize(testDir, 'brownfield');
      result = await implementToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('Complete PARTIAL features');
      expect(result.content[0].text).toContain('Implement MISSING features');
    });

    it('should show expected flow when implementing specific feature', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await implementToolHandler({
        directory: testDir,
        feature: 'analytics-dashboard',
      });

      expect(result.content[0].text).toContain('Expected Flow');
      expect(result.content[0].text).toContain('.specify/memory/plans/analytics-dashboard.md');
      expect(result.content[0].text).toContain('Generates actionable tasks');
      expect(result.content[0].text).toContain('Tests against acceptance criteria');
      expect(result.content[0].text).toContain('❌ MISSING → ✅ COMPLETE');
    });
  });
});
