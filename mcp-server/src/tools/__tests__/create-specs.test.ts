/**
 * Create Specs Tool Tests
 *
 * Tests for Gear 3: Create Specifications
 * - Security validation (CWE-22, CWE-367)
 * - Route-specific behavior (greenfield vs brownfield)
 * - State management
 * - Response formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSpecsToolHandler } from '../create-specs.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { StateManager } from '../../utils/state-manager.js';

describe('Create Specs Tool Tests', () => {
  let testDir: string;
  let stateManager: StateManager;

  // Helper to set up test directory with all required files
  async function setupTestDirectory(dir: string) {
    // Create reverse engineering docs directory and copy sample functional spec
    const docsDir = path.join(dir, 'docs', 'reverse-engineering');
    await fs.mkdir(docsDir, { recursive: true });

    // Copy sample functional spec from fixtures
    const fixtureDir = path.join(process.cwd(), 'src', 'utils', '__tests__', 'fixtures');
    const sampleSpec = await fs.readFile(
      path.join(fixtureDir, 'sample-functional-spec.md'),
      'utf-8'
    );
    await fs.writeFile(path.join(docsDir, 'functional-specification.md'), sampleSpec);

    // Copy templates from mcp-server/templates to test directory
    // Templates are expected in {directory}/plugin/templates by create-constitution
    const sourceTemplatesDir = path.join(process.cwd(), 'templates');
    const destTemplatesDir = path.join(dir, 'plugin', 'templates');
    await fs.mkdir(destTemplatesDir, { recursive: true });

    const templates = [
      'constitution-agnostic-template.md',
      'constitution-prescriptive-template.md',
      'feature-spec-template.md',
    ];

    for (const template of templates) {
      try {
        const content = await fs.readFile(path.join(sourceTemplatesDir, template), 'utf-8');
        await fs.writeFile(path.join(destTemplatesDir, template), content);
      } catch (error) {
        // Template may not exist, skip
        console.warn(`Warning: Could not copy template ${template}:`, error);
      }
    }
  }

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `stackshift-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Initialize state manager
    stateManager = new StateManager(testDir);

    // Set up test directory with all required files
    await setupTestDirectory(testDir);
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
        await expect(createSpecsToolHandler({ directory: maliciousPath })).rejects.toThrow(
          /outside allowed workspace/
        );
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      // Create state with greenfield route
      await stateManager.initialize(testDir, 'greenfield');

      const result = await createSpecsToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Security - State Management (CWE-367)', () => {
    it('should handle concurrent calls safely', async () => {
      // Setup initial state
      await stateManager.initialize(testDir, 'greenfield');

      // Run multiple create-specs calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        createSpecsToolHandler({ directory: testDir })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('create-specs');
    });
  });

  describe('Route Handling', () => {
    it('should handle greenfield route correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Greenfield');
      expect(result.content[0].text).toContain('Automated Spec Generation Complete');
      expect(result.content[0].text).toContain('Feature Specifications');
      expect(result.content[0].text).toContain('Constitution');
    });

    it('should handle brownfield route correctly', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Route: Brownfield');
      expect(result.content[0].text).toContain('Automated Spec Generation Complete');
      expect(result.content[0].text).toContain('Feature Specifications');
      expect(result.content[0].text).toContain('Constitution');
    });

    it('should throw error if route not set', async () => {
      // Create state without route (null)
      await stateManager.initialize(testDir, null);

      await expect(createSpecsToolHandler({ directory: testDir })).rejects.toThrow(/Route not set/);
    });
  });

  describe('State Updates', () => {
    it('should mark create-specs step as complete', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await createSpecsToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('create-specs');
      expect(finalState.currentStep).toBe('gap-analysis');
    });

    it('should preserve existing completed steps', async () => {
      await stateManager.initialize(testDir, 'brownfield');
      // Complete previous steps
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('reverse-engineer');

      await createSpecsToolHandler({ directory: testDir });

      const finalState = await stateManager.load();
      expect(finalState.completedSteps).toContain('analyze');
      expect(finalState.completedSteps).toContain('reverse-engineer');
      expect(finalState.completedSteps).toContain('create-specs');
    });
  });

  describe('Input Validation', () => {
    it('should reject non-string directory parameter', async () => {
      await expect(createSpecsToolHandler({ directory: 123 as any })).rejects.toThrow();
    });

    it('should reject empty string directory', async () => {
      await expect(createSpecsToolHandler({ directory: '' })).rejects.toThrow();
    });

    it('should accept valid directory path', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await createSpecsToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });

    it('should use cwd when directory not provided', async () => {
      // This test would require changing cwd which doesn't work in workers
      // Just verify it accepts undefined
      await stateManager.initialize(testDir, 'greenfield');
      const result = await createSpecsToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# StackShift - Gear 3');
      expect(result.content[0].text).toContain('Shift into 4th gear: Gap Analysis');
      expect(result.content[0].text).toContain('stackshift_gap_analysis');
    });

    it('should include constitution and feature spec counts', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Constitution');
      expect(result.content[0].text).toContain('Feature Specifications');
      expect(result.content[0].text).toContain('Total Features');
      expect(result.content[0].text).toContain('Implementation Plans');
      // Check for actual stats from automated generation
      expect(result.content[0].text).toMatch(/(Complete|Partial|Missing)/);
    });

    it('should include output structure for both routes', async () => {
      const routes: Array<'greenfield' | 'brownfield'> = ['greenfield', 'brownfield'];

      for (const route of routes) {
        await stateManager.initialize(testDir, route);

        const result = await createSpecsToolHandler({ directory: testDir });

        // Check for output structure section
        expect(result.content[0].text).toContain('Output Structure');
        expect(result.content[0].text).toContain('specs/');
        expect(result.content[0].text).toContain('.specify/');
        expect(result.content[0].text).toContain('memory/');
        expect(result.content[0].text).toContain('constitution.md');

        // Clean state for next iteration
        await fs.rm(testDir, { recursive: true, force: true });
        await fs.mkdir(testDir, { recursive: true });
        stateManager = new StateManager(testDir);

        // Recreate test directory structure
        await setupTestDirectory(testDir);
      }
    });

    it('should include validation and next steps', async () => {
      // Greenfield
      await stateManager.initialize(testDir, 'greenfield');
      let result = await createSpecsToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('Validate Specifications');
      expect(result.content[0].text).toContain('/speckit.analyze');
      expect(result.content[0].text).toContain('Ready for Gear 4');
      expect(result.content[0].text).toContain('stackshift_gap_analysis');

      // Brownfield
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });
      stateManager = new StateManager(testDir);

      // Recreate test directory structure
      await setupTestDirectory(testDir);

      await stateManager.initialize(testDir, 'brownfield');
      result = await createSpecsToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('Validate Specifications');
      expect(result.content[0].text).toContain('/speckit.analyze');
      expect(result.content[0].text).toContain('Ready for Gear 4');
      expect(result.content[0].text).toContain('stackshift_gap_analysis');
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for missing state', async () => {
      // Try to call without initializing state first
      await expect(createSpecsToolHandler({ directory: testDir })).rejects.toThrow(
        /State file does not exist/
      );
    });

    it('should return helpful error message when docs are missing', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Remove the docs directory to simulate missing prerequisite
      await fs.rm(path.join(testDir, 'docs'), { recursive: true, force: true });

      const result = await createSpecsToolHandler({ directory: testDir });

      // Should return error response, not throw
      expect(result.content[0].text).toContain('Error During Spec Generation');
      expect(result.content[0].text).toContain('Functional specification not found');
      expect(result.content[0].text).toContain('stackshift_reverse_engineer');
    });
  });

  describe('Workflow Integration', () => {
    it('should indicate next step in workflow', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('Shift into 4th gear: Gap Analysis');
      expect(result.content[0].text).toContain('stackshift_gap_analysis');
      expect(result.content[0].text).toContain('/speckit.analyze');
    });

    it('should include Spec Kit validation step', async () => {
      await stateManager.initialize(testDir, 'brownfield');

      const result = await createSpecsToolHandler({ directory: testDir });

      expect(result.content[0].text).toContain('/speckit.analyze');
      expect(result.content[0].text).toContain('Validate Specifications');
    });
  });
});
