/**
 * Skill Loader Utility
 *
 * Loads SKILL.md content from various locations to ensure MCP tools
 * use the same detailed prompts as the plugin.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Try to load SKILL.md from multiple possible locations
 */
export async function loadSkillFile(skillName: string): Promise<string | null> {
  const possiblePaths = [
    // If StackShift is installed locally
    path.join(
      process.env.HOME || '~',
      '.claude/plugins/marketplaces/jschulte/stackshift/skills',
      skillName,
      'SKILL.md'
    ),

    // If running from StackShift repo
    path.join(__dirname, '../../plugin/skills', skillName, 'SKILL.md'),
    path.join(process.cwd(), '.stackshift/plugin/skills', skillName, 'SKILL.md'),

    // If in project directory after web bootstrap
    path.join(process.cwd(), 'plugin/skills', skillName, 'SKILL.md'),
  ];

  for (const filePath of possiblePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (content && content.length > 100) {
        console.error(`✅ Loaded SKILL.md from: ${filePath}`);
        return content;
      }
    } catch (error) {
      // File doesn't exist at this path, try next
      continue;
    }
  }

  console.error(`⚠️  Could not find SKILL.md for ${skillName}, using fallback`);
  return null;
}

/**
 * Extract the main content from SKILL.md (skip YAML frontmatter)
 */
export function stripFrontmatter(content: string): string {
  // Remove YAML frontmatter (--- ... ---)
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  return withoutFrontmatter.trim();
}

/**
 * Load skill and return as formatted response
 */
export async function loadSkillAsResponse(skillName: string, fallbackGuidance: string) {
  const skillContent = await loadSkillFile(skillName);

  if (skillContent) {
    const mainContent = stripFrontmatter(skillContent);
    return {
      content: [
        {
          type: 'text',
          text: `# ${skillName} (from SKILL.md)\n\n${mainContent}`,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: fallbackGuidance,
        },
      ],
    };
  }
}
