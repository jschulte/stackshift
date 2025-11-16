/**
 * File Utilities Tests
 *
 * Comprehensive tests for safe file system operations:
 * - File finding and counting
 * - File existence checks
 * - Safe file reading with size limits
 * - Safe JSON parsing with prototype pollution prevention
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findFiles, countFiles, fileExists, readFileSafe, readJsonSafe } from '../file-utils.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('file-utils', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create unique temporary directory for each test
    testDir = path.join(tmpdir(), `file-utils-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('findFiles', () => {
    it('should find files matching a single pattern', async () => {
      // Create test files
      await fs.writeFile(path.join(testDir, 'test.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'other.ts'), 'other');
      await fs.writeFile(path.join(testDir, 'test.spec.ts'), 'spec');

      const results = await findFiles(testDir, ['.test.']);

      expect(results).toHaveLength(1);
      expect(results[0]).toContain('test.test.ts');
    });

    it('should find files matching multiple patterns', async () => {
      await fs.writeFile(path.join(testDir, 'foo.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'bar.spec.ts'), 'spec');
      await fs.writeFile(path.join(testDir, 'baz.ts'), 'regular');

      const results = await findFiles(testDir, ['.test.', '.spec.']);

      expect(results).toHaveLength(2);
      expect(results.some(r => r.includes('foo.test.ts'))).toBe(true);
      expect(results.some(r => r.includes('bar.spec.ts'))).toBe(true);
    });

    it('should search recursively in subdirectories', async () => {
      const subDir = path.join(testDir, 'subdir');
      await fs.mkdir(subDir);
      await fs.writeFile(path.join(subDir, 'nested.test.ts'), 'nested');
      await fs.writeFile(path.join(testDir, 'root.test.ts'), 'root');

      const results = await findFiles(testDir, ['.test.']);

      expect(results).toHaveLength(2);
      expect(results.some(r => r.includes('nested.test.ts'))).toBe(true);
      expect(results.some(r => r.includes('root.test.ts'))).toBe(true);
    });

    it('should skip node_modules directory', async () => {
      const nodeModules = path.join(testDir, 'node_modules');
      await fs.mkdir(nodeModules);
      await fs.writeFile(path.join(nodeModules, 'package.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'app.test.ts'), 'test');

      const results = await findFiles(testDir, ['.test.']);

      expect(results).toHaveLength(1);
      expect(results[0]).toContain('app.test.ts');
      expect(results[0]).not.toContain('node_modules');
    });

    it('should skip hidden directories except .specify', async () => {
      const gitDir = path.join(testDir, '.git');
      const specifyDir = path.join(testDir, '.specify');
      await fs.mkdir(gitDir);
      await fs.mkdir(specifyDir);
      await fs.writeFile(path.join(gitDir, 'hidden.test.ts'), 'hidden');
      await fs.writeFile(path.join(specifyDir, 'spec.test.ts'), 'spec');
      await fs.writeFile(path.join(testDir, 'visible.test.ts'), 'visible');

      const results = await findFiles(testDir, ['.test.']);

      expect(results).toHaveLength(2);
      expect(results.some(r => r.includes('spec.test.ts'))).toBe(true);
      expect(results.some(r => r.includes('visible.test.ts'))).toBe(true);
      expect(results.some(r => r.includes('hidden.test.ts'))).toBe(false);
    });

    it('should respect maxDepth limit', async () => {
      const deep1 = path.join(testDir, 'level1');
      const deep2 = path.join(deep1, 'level2');
      const deep3 = path.join(deep2, 'level3');

      await fs.mkdir(deep1);
      await fs.mkdir(deep2);
      await fs.mkdir(deep3);

      await fs.writeFile(path.join(deep1, 'file1.test.ts'), 'test');
      await fs.writeFile(path.join(deep2, 'file2.test.ts'), 'test');
      await fs.writeFile(path.join(deep3, 'file3.test.ts'), 'test');

      // maxDepth of 1 should find only level1
      const results = await findFiles(testDir, ['.test.'], 1);

      expect(results).toHaveLength(1);
      expect(results[0]).toContain('file1.test.ts');
    });

    it('should respect maxFiles limit', async () => {
      // Create more files than the limit
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(path.join(testDir, `file${i}.test.ts`), 'test');
      }

      const results = await findFiles(testDir, ['.test.'], 10, 5);

      // Should stop at maxFiles limit
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when no matches found', async () => {
      await fs.writeFile(path.join(testDir, 'file.ts'), 'no match');

      const results = await findFiles(testDir, ['.test.']);

      expect(results).toEqual([]);
    });

    it('should return empty array for empty directory', async () => {
      const results = await findFiles(testDir, ['.test.']);

      expect(results).toEqual([]);
    });

    it('should handle non-existent directory gracefully', async () => {
      const nonExistent = path.join(testDir, 'does-not-exist');

      const results = await findFiles(nonExistent, ['.test.']);

      expect(results).toEqual([]);
    });
  });

  describe('countFiles', () => {
    it('should count files matching patterns', async () => {
      await fs.writeFile(path.join(testDir, 'a.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'b.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'c.spec.ts'), 'spec');

      const count = await countFiles(testDir, ['.test.']);

      expect(count).toBe(2);
    });

    it('should return 0 when no matches found', async () => {
      await fs.writeFile(path.join(testDir, 'file.ts'), 'no match');

      const count = await countFiles(testDir, ['.test.']);

      expect(count).toBe(0);
    });

    it('should count files with multiple patterns', async () => {
      await fs.writeFile(path.join(testDir, 'a.test.ts'), 'test');
      await fs.writeFile(path.join(testDir, 'b.spec.ts'), 'spec');
      await fs.writeFile(path.join(testDir, 'c.ts'), 'regular');

      const count = await countFiles(testDir, ['.test.', '.spec.']);

      expect(count).toBe(2);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(testDir, 'exists.txt');
      await fs.writeFile(filePath, 'content');

      const exists = await fileExists(filePath);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const filePath = path.join(testDir, 'does-not-exist.txt');

      const exists = await fileExists(filePath);

      expect(exists).toBe(false);
    });

    it('should return true for existing directory', async () => {
      const exists = await fileExists(testDir);

      expect(exists).toBe(true);
    });

    it('should return false for inaccessible path', async () => {
      const exists = await fileExists('/root/inaccessible-file.txt');

      // Should not throw, just return false
      expect(exists).toBe(false);
    });
  });

  describe('readFileSafe', () => {
    it('should read file content successfully', async () => {
      const filePath = path.join(testDir, 'content.txt');
      const content = 'Hello, World!';
      await fs.writeFile(filePath, content);

      const result = await readFileSafe(filePath);

      expect(result).toBe(content);
    });

    it('should read files with UTF-8 encoding', async () => {
      const filePath = path.join(testDir, 'unicode.txt');
      const content = '你好世界 🌍';
      await fs.writeFile(filePath, content, 'utf-8');

      const result = await readFileSafe(filePath);

      expect(result).toBe(content);
    });

    it('should throw error for file larger than default maxSize', async () => {
      const filePath = path.join(testDir, 'large.txt');
      // Create file larger than 10MB default
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      await fs.writeFile(filePath, largeContent);

      await expect(readFileSafe(filePath)).rejects.toThrow(/File too large/);
    });

    it('should throw error for file larger than custom maxSize', async () => {
      const filePath = path.join(testDir, 'medium.txt');
      const content = 'x'.repeat(1500);
      await fs.writeFile(filePath, content);

      // Set maxSize to 1KB
      await expect(readFileSafe(filePath, 1024)).rejects.toThrow(/File too large/);
    });

    it('should read file smaller than custom maxSize', async () => {
      const filePath = path.join(testDir, 'small.txt');
      const content = 'x'.repeat(500);
      await fs.writeFile(filePath, content);

      // Set maxSize to 1KB
      const result = await readFileSafe(filePath, 1024);

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      const filePath = path.join(testDir, 'missing.txt');

      await expect(readFileSafe(filePath)).rejects.toThrow();
    });

    it('should read empty file', async () => {
      const filePath = path.join(testDir, 'empty.txt');
      await fs.writeFile(filePath, '');

      const result = await readFileSafe(filePath);

      expect(result).toBe('');
    });
  });

  describe('readJsonSafe', () => {
    it('should parse valid JSON file', async () => {
      const filePath = path.join(testDir, 'data.json');
      const data = { name: 'test', value: 42, nested: { key: 'value' } };
      await fs.writeFile(filePath, JSON.stringify(data));

      const result = await readJsonSafe(filePath);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid JSON', async () => {
      const filePath = path.join(testDir, 'invalid.json');
      await fs.writeFile(filePath, 'not valid json {');

      await expect(readJsonSafe(filePath)).rejects.toThrow();
    });

    it('should remove __proto__ property to prevent prototype pollution', async () => {
      const filePath = path.join(testDir, 'polluted.json');
      const maliciousJson = JSON.stringify({
        name: 'test',
        __proto__: { isAdmin: true }
      });
      await fs.writeFile(filePath, maliciousJson);

      const result = await readJsonSafe(filePath);

      expect(result).toHaveProperty('name', 'test');
      expect(result).not.toHaveProperty('__proto__');
    });

    it('should remove constructor property', async () => {
      const filePath = path.join(testDir, 'constructor.json');
      const json = JSON.stringify({
        name: 'test',
        constructor: { dangerous: true }
      });
      await fs.writeFile(filePath, json);

      const result = await readJsonSafe(filePath);

      expect(result).toHaveProperty('name', 'test');
      expect(result).not.toHaveProperty('constructor');
    });

    it('should remove prototype property', async () => {
      const filePath = path.join(testDir, 'prototype.json');
      const json = JSON.stringify({
        name: 'test',
        prototype: { harmful: true }
      });
      await fs.writeFile(filePath, json);

      const result = await readJsonSafe(filePath);

      expect(result).toHaveProperty('name', 'test');
      expect(result).not.toHaveProperty('prototype');
    });

    it('should throw error for file larger than maxSize', async () => {
      const filePath = path.join(testDir, 'large.json');
      // Create large JSON that exceeds 10MB
      const largeArray = Array(1000000).fill({ key: 'value' });
      await fs.writeFile(filePath, JSON.stringify(largeArray));

      await expect(readJsonSafe(filePath)).rejects.toThrow(/File too large/);
    });

    it('should parse JSON array', async () => {
      const filePath = path.join(testDir, 'array.json');
      const data = [1, 2, 3, { name: 'test' }];
      await fs.writeFile(filePath, JSON.stringify(data));

      const result = await readJsonSafe(filePath);

      expect(result).toEqual(data);
    });

    it('should parse JSON with special characters', async () => {
      const filePath = path.join(testDir, 'special.json');
      const data = {
        text: 'Special "quotes" and \\backslashes\\',
        unicode: '你好 🌍'
      };
      await fs.writeFile(filePath, JSON.stringify(data));

      const result = await readJsonSafe(filePath);

      expect(result).toEqual(data);
    });

    it('should handle nested objects and arrays', async () => {
      const filePath = path.join(testDir, 'nested.json');
      const data = {
        level1: {
          level2: {
            level3: [
              { id: 1, items: [1, 2, 3] },
              { id: 2, items: [4, 5, 6] }
            ]
          }
        }
      };
      await fs.writeFile(filePath, JSON.stringify(data));

      const result = await readJsonSafe(filePath);

      expect(result).toEqual(data);
    });
  });
});
