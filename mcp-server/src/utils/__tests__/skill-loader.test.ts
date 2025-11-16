/**
 * Skill Loader Tests
 *
 * Comprehensive tests for SKILL.md loading:
 * - Loading from multiple possible locations
 * - YAML frontmatter stripping
 * - Response formatting
 * - Error handling and fallbacks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadSkillFile, stripFrontmatter, loadSkillAsResponse } from '../skill-loader.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

describe('skill-loader', () => {
  let testDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    // Save original values
    originalHome = process.env.HOME;

    // Create unique temporary directory for each test
    testDir = path.join(tmpdir(), `skill-loader-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(testDir, { recursive: true });

    // Spy on console.error to suppress output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Restore original values
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    }
    vi.restoreAllMocks();

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('loadSkillFile', () => {
    it('should load SKILL.md from .claude/plugins directory', async () => {
      const skillName = 'test-skill';
      const skillContent = 'x'.repeat(150); // Must be > 100 chars
      const claudeDir = path.join(testDir, '.claude/plugins/marketplaces/jschulte/stackshift/skills', skillName);

      await fs.mkdir(claudeDir, { recursive: true });
      await fs.writeFile(path.join(claudeDir, 'SKILL.md'), skillContent);

      // Set HOME to test directory
      process.env.HOME = testDir;

      const result = await loadSkillFile(skillName);

      expect(result).toBe(skillContent);
    });

    it('should load SKILL.md from current working directory', async () => {
      const skillName = 'test-skill';
      const skillContent = 'This is a skill file with enough content to pass the 100 character minimum requirement for validation.';
      const skillsDir = path.join(testDir, 'plugin/skills', skillName);

      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      // Mock process.cwd() to return test directory
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      expect(result).toBe(skillContent);
    });

    it('should return null when SKILL.md not found in any location', async () => {
      const skillName = 'non-existent-skill';

      // Set HOME to empty test directory and mock cwd
      process.env.HOME = testDir;
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      expect(result).toBeNull();
    });

    it('should return null when file content is too short (< 100 chars)', async () => {
      const skillName = 'short-skill';
      const skillContent = 'Too short'; // < 100 chars
      const skillsDir = path.join(testDir, 'plugin/skills', skillName);

      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      expect(result).toBeNull();
    });

    it('should try multiple paths in order', async () => {
      const skillName = 'multi-path-skill';
      const skillContent = 'x'.repeat(150);

      // Create skill in one of the later paths (current working directory)
      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      // Set HOME to different directory (where file won't be found)
      process.env.HOME = path.join(testDir, 'fake-home');
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      // Should find it in cwd path even if HOME path fails
      expect(result).toBe(skillContent);
    });

    it('should handle read errors gracefully', async () => {
      const skillName = 'error-skill';

      // Point to a directory that exists but has no SKILL.md
      process.env.HOME = testDir;
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      // Should return null, not throw
      expect(result).toBeNull();
    });

    it('should load skill with valid frontmatter and content', async () => {
      const skillName = 'frontmatter-skill';
      const skillContent = `---
title: Test Skill
description: A test skill
---

This is the main content of the skill file with enough text to exceed the minimum character requirement.`;

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillFile(skillName);

      expect(result).toBe(skillContent);
      expect(result).toContain('title: Test Skill');
      expect(result).toContain('This is the main content');
    });
  });

  describe('stripFrontmatter', () => {
    it('should remove YAML frontmatter from content', () => {
      const content = `---
title: Test
description: A test
---

Main content here`;

      const result = stripFrontmatter(content);

      expect(result).toBe('Main content here');
      expect(result).not.toContain('---');
      expect(result).not.toContain('title:');
    });

    it('should handle content without frontmatter', () => {
      const content = 'Just regular content without frontmatter';

      const result = stripFrontmatter(content);

      expect(result).toBe(content);
    });

    it('should trim whitespace after removing frontmatter', () => {
      const content = `---
title: Test
---


Main content with extra newlines`;

      const result = stripFrontmatter(content);

      expect(result).toBe('Main content with extra newlines');
      expect(result).not.toMatch(/^\n/);
    });

    it('should handle empty content', () => {
      const content = '';

      const result = stripFrontmatter(content);

      expect(result).toBe('');
    });

    it('should handle frontmatter-only content', () => {
      const content = `---
title: Test
---`;

      const result = stripFrontmatter(content);

      // When there's only frontmatter without trailing newline, regex doesn't match
      // So the original content is returned trimmed
      expect(result).toBe(content.trim());
    });

    it('should preserve content with --- in the middle', () => {
      const content = `Main content
---
This is not frontmatter, it's a separator
---
More content`;

      const result = stripFrontmatter(content);

      // Should not remove --- that's not at the start
      expect(result).toBe(content.trim());
    });

    it('should handle complex frontmatter with nested values', () => {
      const content = `---
title: Complex Skill
metadata:
  author: Test Author
  version: 1.0
tags:
  - test
  - skill
---

# Skill Content

This is the actual skill content.`;

      const result = stripFrontmatter(content);

      expect(result).toContain('# Skill Content');
      expect(result).not.toContain('title: Complex Skill');
      expect(result).not.toContain('metadata:');
    });

    it('should preserve markdown formatting in content', () => {
      const content = `---
title: Markdown Test
---

# Heading

**Bold** and *italic* text

- List item 1
- List item 2

\`\`\`javascript
const code = true;
\`\`\``;

      const result = stripFrontmatter(content);

      expect(result).toContain('# Heading');
      expect(result).toContain('**Bold**');
      expect(result).toContain('- List item 1');
      expect(result).toContain('```javascript');
    });
  });

  describe('loadSkillAsResponse', () => {
    it('should return formatted response with skill content', async () => {
      const skillName = 'response-skill';
      const skillContent = `---
title: Response Test
---

This is the skill content that should be returned in the formatted response with enough characters.`;

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, 'Fallback guidance');

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0].text).toContain(`# ${skillName}`);
      expect(result.content[0].text).toContain('This is the skill content');
      expect(result.content[0].text).not.toContain('title: Response Test');
    });

    it('should return fallback guidance when skill not found', async () => {
      const skillName = 'missing-skill';
      const fallbackGuidance = 'This is the fallback guidance text';

      process.env.HOME = testDir;
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, fallbackGuidance);

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0].text).toBe(fallbackGuidance);
    });

    it('should strip frontmatter from skill content in response', async () => {
      const skillName = 'frontmatter-response-skill';
      const skillContent = `---
title: Frontmatter Test
author: Test Author
---

# Main Skill Content

This is the actual skill content without frontmatter and with enough characters to pass validation.`;

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, 'Fallback');

      expect(result.content[0].text).toContain('# Main Skill Content');
      expect(result.content[0].text).not.toContain('title: Frontmatter Test');
      expect(result.content[0].text).not.toContain('author: Test Author');
    });

    it('should include skill name in response header', async () => {
      const skillName = 'header-skill';
      const skillContent = 'x'.repeat(150);

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, 'Fallback');

      expect(result.content[0].text).toContain(`# ${skillName} (from SKILL.md)`);
    });

    it('should handle multi-line skill content', async () => {
      const skillName = 'multiline-skill';
      const skillContent = `---
title: Multiline
---

Line 1
Line 2
Line 3

Paragraph 2

Paragraph 3 with enough content to exceed the minimum character requirement for validation.`;

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent);

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, 'Fallback');

      expect(result.content[0].text).toContain('Line 1');
      expect(result.content[0].text).toContain('Line 2');
      expect(result.content[0].text).toContain('Paragraph 2');
      expect(result.content[0].text).toContain('Paragraph 3');
    });

    it('should return correct response structure', async () => {
      const skillName = 'structure-skill';
      const fallbackGuidance = 'Fallback text';

      process.env.HOME = testDir;
      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, fallbackGuidance);

      // Verify response structure
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.any(String)
          }
        ]
      });
    });

    it('should handle special characters in skill content', async () => {
      const skillName = 'special-chars-skill';
      const skillContent = `---
title: Special Characters
---

Content with "quotes" and 'apostrophes'
Unicode characters: 你好 🌍
Code: \`const x = 1;\`
Math: 2 + 2 = 4
Extra content to meet the minimum character requirement for validation purposes.`;

      const skillsDir = path.join(testDir, 'plugin/skills', skillName);
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(path.join(skillsDir, 'SKILL.md'), skillContent, 'utf-8');

      vi.spyOn(process, 'cwd').mockReturnValue(testDir);

      const result = await loadSkillAsResponse(skillName, 'Fallback');

      expect(result.content[0].text).toContain('"quotes"');
      expect(result.content[0].text).toContain('你好 🌍');
      expect(result.content[0].text).toContain('`const x = 1;`');
    });
  });
});
