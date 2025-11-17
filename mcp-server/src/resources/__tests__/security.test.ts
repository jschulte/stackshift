import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getStateResource, getProgressResource, getRouteResource } from '../index.js';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Resource Security Tests', () => {
  let testDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    // Create temp directory for testing
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));

    // Mock process.cwd() to return test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;
  });

  afterEach(async () => {
    // Restore process.cwd()
    process.cwd = originalCwd;

    // Cleanup test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('getStateResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'brownfield',
          currentStep: 'analyze',
          completedSteps: [],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getStateResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('stackshift://state');
      expect(result.contents[0].mimeType).toBe('application/json');

      const state = JSON.parse(result.contents[0].text);
      expect(state.path).toBe('brownfield');
    });

    test('rejects file larger than 10MB', async () => {
      // Create large file (11MB)
      const stateFile = join(testDir, '.stackshift-state.json');
      const largeData = 'A'.repeat(11 * 1024 * 1024);
      await writeFile(stateFile, `{"data": "${largeData}"}`);

      // Should handle error gracefully
      const result = await getStateResource();

      // Should return error response (not throw)
      expect(result.contents[0].text).toContain('error');
    });

    test('strips dangerous JSON properties', async () => {
      // Create state file with prototype pollution attempt
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'greenfield',
          __proto__: { admin: true },
          constructor: { malicious: true },
          prototype: { hacked: true },
        })
      );

      // Call resource handler
      const result = await getStateResource();

      // Verify dangerous properties are removed (check as own properties, not inherited)
      const state = JSON.parse(result.contents[0].text);
      expect(Object.prototype.hasOwnProperty.call(state, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(state, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(state, 'prototype')).toBe(false);
    });

    test('returns error when state file not found', async () => {
      // Don't create state file

      // Call resource handler
      const result = await getStateResource();

      // Should return error response
      const response = JSON.parse(result.contents[0].text);
      expect(response.error).toBe('No state file found');
    });
  });

  describe('getProgressResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'brownfield',
          currentStep: 'analyze',
          completedSteps: ['analyze'],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getProgressResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toContain('StackShift Progress');
      expect(result.contents[0].text).toContain('Complete');
    });
  });

  describe('getRouteResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'greenfield',
          currentStep: 'analyze',
          completedSteps: [],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getRouteResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toContain('Greenfield');
    });
  });
});
