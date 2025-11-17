/**
 * Resource Handler Tests
 *
 * Comprehensive tests for getStateResource, getProgressResource, and getRouteResource
 * Target: 90%+ coverage of src/resources/index.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStateResource, getProgressResource, getRouteResource } from '../index.js';
import * as fs from 'fs/promises';
import { join } from 'path';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';

describe('Resource Handlers', () => {
  let testDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    // Create unique temp directory for each test
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));

    // Mock process.cwd() to return our test directory
    originalCwd = process.cwd;
    process.cwd = vi.fn().mockReturnValue(testDir);
  });

  afterEach(async () => {
    // Restore original cwd
    process.cwd = originalCwd;

    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('getStateResource', () => {
    it('should return state when file exists', async () => {
      // Arrange: Create valid state file
      const validState = {
        version: '1.0.0',
        created: '2024-01-01T00:00:00Z',
        currentStep: 'analyze',
        completedSteps: ['analyze'],
        path: 'brownfield'
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(validState)
      );

      // Act
      const result = await getStateResource();

      // Assert
      expect(result.contents).toBeDefined();
      expect(result.contents[0].uri).toBe('stackshift://state');
      expect(result.contents[0].mimeType).toBe('application/json');
      const parsedState = JSON.parse(result.contents[0].text);
      expect(parsedState.version).toBe('1.0.0');
      expect(parsedState.currentStep).toBe('analyze');
    });

    it('should handle missing state file', async () => {
      // Act: No state file created
      const result = await getStateResource();

      // Assert
      expect(result.contents).toBeDefined();
      expect(result.contents[0].uri).toBe('stackshift://state');
      const parsedError = JSON.parse(result.contents[0].text);
      expect(parsedError.error).toContain('No state file found');
    });

    it('should return correct MIME type and format', async () => {
      // Arrange
      const state = { version: '1.0.0' };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getStateResource();

      // Assert
      expect(result.contents[0].mimeType).toBe('application/json');
      expect(result.contents[0].text).toContain('"version"');
      expect(() => JSON.parse(result.contents[0].text)).not.toThrow();
    });

    it('should validate directory access before reading', async () => {
      // Arrange: Valid state file
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify({ version: '1.0.0' })
      );

      // Act & Assert: Should succeed with valid directory
      const result = await getStateResource();
      expect(result.contents).toBeDefined();
    });
  });

  describe('getProgressResource', () => {
    it('should calculate progress correctly (2/6 = 33%)', async () => {
      // Arrange: State with 2 completed steps
      const state = {
        version: '1.0.0',
        completedSteps: ['analyze', 'reverse-engineer'],
        currentStep: 'create-specs',
        path: 'brownfield',
        stepDetails: {
          'analyze': { completed: true },
          'reverse-engineer': { completed: true }
        }
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].uri).toBe('stackshift://progress');
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect(result.contents[0].text).toMatch(/3[0-9]%/); // Should be around 33%
      expect(result.contents[0].text.toLowerCase()).toContain('create');
    });

    it('should handle greenfield vs brownfield routes', async () => {
      // Arrange: Greenfield state
      const state = {
        version: '1.0.0',
        completedSteps: ['analyze'],
        currentStep: 'reverse-engineer',
        path: 'greenfield',
        stepDetails: {}
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].text.toLowerCase()).toContain('greenfield');
      expect(result.contents[0].text).toContain('17%'); // 1/6 steps = 16.67% rounds to 17%
    });

    it('should show completed status (100%)', async () => {
      // Arrange: All steps completed
      const state = {
        version: '1.0.0',
        completedSteps: [
          'analyze',
          'reverse-engineer',
          'create-specs',
          'gap-analysis',
          'complete-spec',
          'implement'
        ],
        currentStep: 'completed',
        path: 'brownfield',
        stepDetails: {}
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].text).toContain('100%');
      expect(result.contents[0].text).toContain('All gears complete');
    });

    it('should handle missing state file', async () => {
      // Act: No state file
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].uri).toBe('stackshift://progress');
      expect(result.contents[0].text).toContain('No progress data');
      expect(result.contents[0].text).toContain('stackshift_analyze');
    });

    it('should calculate current step correctly', async () => {
      // Arrange
      const state = {
        version: '1.0.0',
        completedSteps: ['analyze', 'reverse-engineer', 'create-specs'],
        currentStep: 'gap-analysis',
        path: 'brownfield',
        stepDetails: {}
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].text.toLowerCase()).toContain('gap');
    });

    it('should format markdown output correctly', async () => {
      // Arrange
      const state = {
        version: '1.0.0',
        completedSteps: ['analyze'],
        currentStep: 'reverse-engineer',
        path: 'brownfield',
        stepDetails: {}
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect(result.contents[0].text).toContain('#');
      expect(result.contents[0].text).toContain('**');
    });

    it('should handle empty completedSteps array', async () => {
      // Arrange
      const state = {
        version: '1.0.0',
        completedSteps: [],
        currentStep: 'analyze',
        path: 'brownfield',
        stepDetails: {}
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getProgressResource();

      // Assert
      expect(result.contents[0].text).toContain('0%');
      expect(result.contents[0].text).toContain('0/6');
    });
  });

  describe('getRouteResource', () => {
    it('should return route when selected', async () => {
      // Arrange
      const state = {
        version: '1.0.0',
        path: 'brownfield'
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getRouteResource();

      // Assert
      expect(result.contents[0].uri).toBe('stackshift://route');
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect(result.contents[0].text.toLowerCase()).toContain('brownfield');
    });

    it('should handle missing route (not selected yet)', async () => {
      // Arrange: State without path/route
      const state = {
        version: '1.0.0'
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getRouteResource();

      // Assert
      expect(result.contents[0].text).toContain('Not selected');
      expect(result.contents[0].text).toContain('stackshift_analyze');
    });

    it('should format response correctly', async () => {
      // Arrange
      const state = {
        version: '1.0.0',
        path: 'greenfield'
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getRouteResource();

      // Assert
      expect(result.contents[0].uri).toBe('stackshift://route');
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect(result.contents[0].text).toContain('Greenfield');
      expect(result.contents[0].text).toContain('tech-agnostic');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle state file with extra fields', async () => {
      // Arrange: State with extra/unknown fields
      const state = {
        version: '1.0.0',
        currentStep: 'analyze',
        completedSteps: ['analyze'],
        extraField: 'should be ignored',
        anotherField: 123
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act
      const result = await getStateResource();

      // Assert: Should not throw, extra fields present
      const parsedState = JSON.parse(result.contents[0].text);
      expect(parsedState.version).toBe('1.0.0');
    });

    it('should handle partial state data gracefully', async () => {
      // Arrange: Minimal state
      const state = {
        version: '1.0.0'
      };
      await writeFile(
        join(testDir, '.stackshift-state.json'),
        JSON.stringify(state)
      );

      // Act & Assert: Should not throw
      const stateResult = await getStateResource();
      const progressResult = await getProgressResource();
      const routeResult = await getRouteResource();

      expect(stateResult.contents).toBeDefined();
      expect(progressResult.contents).toBeDefined();
      expect(routeResult.contents).toBeDefined();
    });
  });
});
