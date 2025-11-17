import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { loadSkillFile } from '../skill-loader.js';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Skill Loader Security Tests', () => {
  let testDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    // Save original HOME
    originalHome = process.env.HOME;

    // Create temp directory and set as HOME
    testDir = await mkdtemp(join(tmpdir(), 'skill-security-test-'));
    process.env.HOME = testDir;
  });

  afterEach(async () => {
    // Restore HOME
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    }

    // Cleanup
    await rm(testDir, { recursive: true, force: true });
  });

  test('rejects skill name with forward slash', async () => {
    await expect(loadSkillFile('../etc/passwd')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with backslash', async () => {
    await expect(loadSkillFile('..\\windows\\system32')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with parent directory reference', async () => {
    await expect(loadSkillFile('..')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with special characters', async () => {
    await expect(loadSkillFile('hack;rm -rf')).rejects.toThrow(
      'Invalid skill name: must be alphanumeric with hyphens/underscores only'
    );
  });

  test('rejects skill name with spaces', async () => {
    await expect(loadSkillFile('skill name')).rejects.toThrow(
      'Invalid skill name: must be alphanumeric with hyphens/underscores only'
    );
  });

  test('accepts valid skill name with hyphens', async () => {
    // This will return null (skill not found) but should not throw validation error
    const result = await loadSkillFile('reverse-engineer');
    // Either returns content or null, but doesn't throw
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  test('accepts valid skill name with underscores', async () => {
    const result = await loadSkillFile('create_specs');
    expect(typeof result === 'string' || result === null).toBe(true);
  });
});
