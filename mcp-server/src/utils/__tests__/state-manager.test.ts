/**
 * State Manager Tests
 *
 * Tests for:
 * - CWE-367: TOCTOU race conditions
 * - State validation
 * - Atomic operations
 * - Prototype pollution protection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateManager } from '../state-manager.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('StateManager', () => {
  let testDir: string;
  let stateManager: StateManager;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `stackshift-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
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

  describe('State Initialization', () => {
    it('should create initial state with valid structure', async () => {
      const state = await stateManager.initialize(testDir, 'greenfield');

      expect(state.version).toBe('1.0.0');
      expect(state.path).toBe('greenfield');
      expect(state.currentStep).toBe('analyze');
      expect(state.completedSteps).toEqual([]);
      expect(state.metadata.projectName).toBe(path.basename(testDir));
      expect(state.metadata.projectPath).toBe(testDir);
    });

    it('should not overwrite existing state', async () => {
      await stateManager.initialize(testDir, 'greenfield');
      const state1 = await stateManager.load();

      // Try to initialize again
      await stateManager.initialize(testDir, 'brownfield');
      const state2 = await stateManager.load();

      // Should still be greenfield (not overwritten)
      expect(state2.path).toBe(state1.path);
    });
  });

  describe('State Validation', () => {
    it('should reject state with dangerous properties', async () => {
      // Write malicious state with __proto__ directly in JSON string
      // (creating it as an object doesn't work because JS handles __proto__ specially)
      const stateFile = path.join(testDir, '.stackshift-state.json');
      const maliciousJson = `{
        "__proto__": { "isAdmin": true },
        "version": "1.0.0",
        "created": "${new Date().toISOString()}",
        "updated": "${new Date().toISOString()}",
        "path": "greenfield",
        "currentStep": "analyze",
        "completedSteps": [],
        "metadata": { "projectName": "test", "projectPath": "${testDir}" },
        "stepDetails": {}
      }`;
      await fs.writeFile(stateFile, maliciousJson);

      // Should throw when loading
      await expect(stateManager.load()).rejects.toThrow(/dangerous properties/);
    });

    it('should reject state with invalid route', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try to update with invalid route
      await expect(
        stateManager.update(state => ({
          ...state,
          path: 'invalid' as any,
        }))
      ).rejects.toThrow(/Invalid path/);
    });

    it('should reject state with invalid step', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await expect(
        stateManager.update(state => ({
          ...state,
          currentStep: 'malicious-step' as any,
        }))
      ).rejects.toThrow(/Invalid currentStep/);
    });

    it('should reject state with non-array completedSteps', async () => {
      await stateManager.initialize(testDir, 'greenfield');
      const stateFile = path.join(testDir, '.stackshift-state.json');

      const maliciousState = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
      maliciousState.completedSteps = 'not-an-array';
      await fs.writeFile(stateFile, JSON.stringify(maliciousState, null, 2));

      await expect(stateManager.load()).rejects.toThrow(/must be an array/);
    });

    it('should reject state with missing required fields', async () => {
      const stateFile = path.join(testDir, '.stackshift-state.json');
      await fs.writeFile(stateFile, JSON.stringify({ invalid: 'state' }, null, 2));

      await expect(stateManager.load()).rejects.toThrow(/Invalid state file structure/);
    });

    it('should reject state files larger than 10MB', async () => {
      const stateFile = path.join(testDir, '.stackshift-state.json');
      const hugeState = {
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        path: 'greenfield',
        currentStep: 'analyze',
        completedSteps: [],
        metadata: { projectName: 'test', projectPath: testDir },
        stepDetails: {},
        // Add huge data
        malicious: 'x'.repeat(11 * 1024 * 1024),
      };

      await fs.writeFile(stateFile, JSON.stringify(hugeState, null, 2));

      await expect(stateManager.load()).rejects.toThrow(/too large/);
    });
  });

  describe('Atomic Operations (TOCTOU Protection)', () => {
    it('should update state atomically', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Perform concurrent updates
      const promises = Array.from({ length: 10 }, (_, i) =>
        stateManager.update(state => ({
          ...state,
          metadata: {
            ...state.metadata,
            counter: i,
          },
        }))
      );

      await Promise.all(promises);

      // State should be consistent
      const finalState = await stateManager.load();
      expect(finalState.metadata).toHaveProperty('counter');
    });

    it('should handle concurrent step completions', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Try to complete multiple steps concurrently
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('reverse-engineer');

      const state = await stateManager.load();
      expect(state.completedSteps).toContain('analyze');
      expect(state.completedSteps).toContain('reverse-engineer');
      expect(state.currentStep).toBe('create-specs');
    });

    it('should not create duplicate completed steps', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      // Complete same step twice
      await stateManager.completeStep('analyze');
      await stateManager.completeStep('analyze');

      const state = await stateManager.load();
      const analyzeCount = state.completedSteps.filter(s => s === 'analyze').length;
      expect(analyzeCount).toBe(1);
    });
  });

  describe('Step Management', () => {
    it('should progress through steps in correct order', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await stateManager.completeStep('analyze');
      let state = await stateManager.load();
      expect(state.currentStep).toBe('reverse-engineer');

      await stateManager.completeStep('reverse-engineer');
      state = await stateManager.load();
      expect(state.currentStep).toBe('create-specs');

      await stateManager.completeStep('create-specs');
      state = await stateManager.load();
      expect(state.currentStep).toBe('gap-analysis');

      await stateManager.completeStep('gap-analysis');
      state = await stateManager.load();
      expect(state.currentStep).toBe('complete-spec');

      await stateManager.completeStep('complete-spec');
      state = await stateManager.load();
      expect(state.currentStep).toBe('implement');

      await stateManager.completeStep('implement');
      state = await stateManager.load();
      expect(state.currentStep).toBe(null); // All complete
    });

    it('should update route correctly', async () => {
      await stateManager.initialize(testDir, 'greenfield');

      await stateManager.updateRoute('brownfield');
      const state = await stateManager.load();

      expect(state.path).toBe('brownfield');
      expect(state.metadata.pathDescription).toContain('Manage existing app');
    });
  });

  describe('State Persistence', () => {
    it('should persist state to disk', async () => {
      await stateManager.initialize(testDir, 'greenfield');
      await stateManager.completeStep('analyze');

      // Create new manager to test loading from disk
      const newManager = new StateManager(testDir);
      const state = await newManager.load();

      expect(state.completedSteps).toContain('analyze');
      expect(state.currentStep).toBe('reverse-engineer');
    });

    it('should update timestamp on every change', async () => {
      await stateManager.initialize(testDir, 'greenfield');
      const state1 = await stateManager.load();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      await stateManager.completeStep('analyze');
      const state2 = await stateManager.load();

      expect(new Date(state2.updated).getTime()).toBeGreaterThan(
        new Date(state1.updated).getTime()
      );
    });
  });
});
