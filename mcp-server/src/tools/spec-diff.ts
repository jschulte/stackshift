/**
 * Spec Diff Tool
 *
 * Visualizes differences between specifications:
 * - Compare specs between git commits
 * - Compare specs between directories
 * - Generate human-readable diff reports
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from '../utils/logger.js';
import { readFileSafe } from '../utils/file-utils.js';
import { createDefaultValidator } from '../utils/security.js';

const logger = createLogger('spec-diff');

/**
 * Change type for a specification
 */
export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

/**
 * Section change within a specification
 */
export interface SectionChange {
  section: string;
  changeType: ChangeType;
  oldContent?: string;
  newContent?: string;
  addedLines: string[];
  removedLines: string[];
}

/**
 * Diff result for a single specification
 */
export interface SpecDiff {
  file: string;
  featureName: string;
  changeType: ChangeType;
  sections: SectionChange[];
  summary: string;
}

/**
 * Overall diff report
 */
export interface DiffReport {
  timestamp: string;
  baseRef: string;
  compareRef: string;
  totalSpecs: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  diffs: SpecDiff[];
}

/**
 * Compare specifications between two directories
 */
export async function compareSpecs(
  baseDir: string,
  compareDir: string
): Promise<DiffReport> {
  const validator = createDefaultValidator();
  const validBase = validator.validateDirectory(baseDir);
  const validCompare = validator.validateDirectory(compareDir);

  logger.info('Comparing specifications', { baseDir: validBase, compareDir: validCompare });

  // Find spec directories
  const baseSpecDir = await findSpecDir(validBase);
  const compareSpecDir = await findSpecDir(validCompare);

  // Get spec files from both directories
  const baseFiles = await getSpecFiles(baseSpecDir);
  const compareFiles = await getSpecFiles(compareSpecDir);

  // Create sets for comparison
  const baseSet = new Set(baseFiles.map(f => path.basename(f)));
  const compareSet = new Set(compareFiles.map(f => path.basename(f)));

  const diffs: SpecDiff[] = [];
  let added = 0, removed = 0, modified = 0, unchanged = 0;

  // Find added files (in compare but not in base)
  for (const file of compareFiles) {
    const basename = path.basename(file);
    if (!baseSet.has(basename)) {
      const content = await readFileSafe(file, 2 * 1024 * 1024);
      const featureName = extractFeatureName(content, basename);

      diffs.push({
        file: basename,
        featureName,
        changeType: 'added',
        sections: [],
        summary: `New specification added: ${featureName}`,
      });
      added++;
    }
  }

  // Find removed files (in base but not in compare)
  for (const file of baseFiles) {
    const basename = path.basename(file);
    if (!compareSet.has(basename)) {
      const content = await readFileSafe(file, 2 * 1024 * 1024);
      const featureName = extractFeatureName(content, basename);

      diffs.push({
        file: basename,
        featureName,
        changeType: 'removed',
        sections: [],
        summary: `Specification removed: ${featureName}`,
      });
      removed++;
    }
  }

  // Compare files that exist in both
  for (const file of baseFiles) {
    const basename = path.basename(file);
    if (compareSet.has(basename)) {
      const compareFile = compareFiles.find(f => path.basename(f) === basename)!;

      const baseContent = await readFileSafe(file, 2 * 1024 * 1024);
      const compareContent = await readFileSafe(compareFile, 2 * 1024 * 1024);

      if (baseContent === compareContent) {
        unchanged++;
        continue;
      }

      const diff = await compareSpecContent(basename, baseContent, compareContent);
      diffs.push(diff);
      modified++;
    }
  }

  const totalSpecs = baseSet.size + (compareSet.size - baseSet.size);

  logger.info('Comparison complete', { added, removed, modified, unchanged });

  return {
    timestamp: new Date().toISOString(),
    baseRef: validBase,
    compareRef: validCompare,
    totalSpecs,
    added,
    removed,
    modified,
    unchanged,
    diffs,
  };
}

/**
 * Find the specifications directory
 */
async function findSpecDir(baseDir: string): Promise<string> {
  const candidates = [
    path.join(baseDir, '.specify', 'memory', 'specifications'),
    path.join(baseDir, '.specify', 'specifications'),
    path.join(baseDir, 'specs'),
    path.join(baseDir, 'specifications'),
  ];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return path.join(baseDir, '.specify', 'memory', 'specifications');
}

/**
 * Get all spec files in a directory
 */
async function getSpecFiles(specDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(specDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(specDir, f));
  } catch {
    return [];
  }
}

/**
 * Extract feature name from spec content
 */
function extractFeatureName(content: string, filename: string): string {
  const match = content.match(/^#\s+(?:Feature:\s*)?(.+)$/m);
  return match ? match[1].trim() : path.basename(filename, '.md');
}

/**
 * Compare content of two specifications
 */
async function compareSpecContent(
  filename: string,
  baseContent: string,
  compareContent: string
): Promise<SpecDiff> {
  const featureName = extractFeatureName(compareContent, filename);
  const sections: SectionChange[] = [];
  const changes: string[] = [];

  // Parse sections from both contents
  const baseSections = parseSections(baseContent);
  const compareSections = parseSections(compareContent);

  // Find all unique section names
  const allSections = new Set([...baseSections.keys(), ...compareSections.keys()]);

  for (const sectionName of allSections) {
    const baseSection = baseSections.get(sectionName);
    const compareSection = compareSections.get(sectionName);

    if (!baseSection && compareSection) {
      // Section added
      sections.push({
        section: sectionName,
        changeType: 'added',
        newContent: compareSection,
        addedLines: compareSection.split('\n'),
        removedLines: [],
      });
      changes.push(`+ Added section: ${sectionName}`);
    } else if (baseSection && !compareSection) {
      // Section removed
      sections.push({
        section: sectionName,
        changeType: 'removed',
        oldContent: baseSection,
        addedLines: [],
        removedLines: baseSection.split('\n'),
      });
      changes.push(`- Removed section: ${sectionName}`);
    } else if (baseSection && compareSection && baseSection !== compareSection) {
      // Section modified
      const { addedLines, removedLines } = diffLines(baseSection, compareSection);
      sections.push({
        section: sectionName,
        changeType: 'modified',
        oldContent: baseSection,
        newContent: compareSection,
        addedLines,
        removedLines,
      });

      if (addedLines.length > 0 || removedLines.length > 0) {
        changes.push(`~ Modified section: ${sectionName} (+${addedLines.length}/-${removedLines.length})`);
      }
    }
  }

  return {
    file: filename,
    featureName,
    changeType: 'modified',
    sections,
    summary: changes.length > 0 ? changes.join(', ') : 'Minor changes',
  };
}

/**
 * Parse sections from markdown content
 */
function parseSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = content.split('\n');

  let currentSection = 'Header';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.set(currentSection, currentContent.join('\n').trim());
      }

      currentSection = headerMatch[2].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections.set(currentSection, currentContent.join('\n').trim());
  }

  return sections;
}

/**
 * Simple line-by-line diff
 */
function diffLines(
  oldContent: string,
  newContent: string
): { addedLines: string[]; removedLines: string[] } {
  const oldLines = new Set(oldContent.split('\n').map(l => l.trim()).filter(l => l));
  const newLines = new Set(newContent.split('\n').map(l => l.trim()).filter(l => l));

  const addedLines: string[] = [];
  const removedLines: string[] = [];

  for (const line of newLines) {
    if (!oldLines.has(line)) {
      addedLines.push(line);
    }
  }

  for (const line of oldLines) {
    if (!newLines.has(line)) {
      removedLines.push(line);
    }
  }

  return { addedLines, removedLines };
}

/**
 * Format diff report as markdown
 */
export function formatDiffReport(report: DiffReport): string {
  const lines: string[] = [];

  lines.push('# Specification Diff Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push(`**Base:** ${report.baseRef}`);
  lines.push(`**Compare:** ${report.compareRef}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Status | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| ➕ Added | ${report.added} |`);
  lines.push(`| ➖ Removed | ${report.removed} |`);
  lines.push(`| 📝 Modified | ${report.modified} |`);
  lines.push(`| ✅ Unchanged | ${report.unchanged} |`);
  lines.push(`| **Total** | **${report.totalSpecs}** |`);
  lines.push('');

  if (report.diffs.length === 0) {
    lines.push('_No changes detected._');
    return lines.join('\n');
  }

  // Details
  lines.push('## Changes');
  lines.push('');

  for (const diff of report.diffs) {
    const icon = diff.changeType === 'added' ? '➕' :
                 diff.changeType === 'removed' ? '➖' : '📝';

    lines.push(`### ${icon} ${diff.featureName}`);
    lines.push('');
    lines.push(`**File:** \`${diff.file}\``);
    lines.push(`**Status:** ${diff.changeType}`);
    lines.push('');

    if (diff.sections.length > 0) {
      lines.push('**Section Changes:**');
      lines.push('');

      for (const section of diff.sections) {
        const sectionIcon = section.changeType === 'added' ? '+' :
                           section.changeType === 'removed' ? '-' : '~';

        lines.push(`- \`${sectionIcon}\` **${section.section}**`);

        if (section.addedLines.length > 0 && section.addedLines.length <= 5) {
          for (const line of section.addedLines.slice(0, 3)) {
            const truncated = line.length > 60 ? line.substring(0, 60) + '...' : line;
            lines.push(`  - + ${truncated}`);
          }
          if (section.addedLines.length > 3) {
            lines.push(`  - _...and ${section.addedLines.length - 3} more additions_`);
          }
        }

        if (section.removedLines.length > 0 && section.removedLines.length <= 5) {
          for (const line of section.removedLines.slice(0, 3)) {
            const truncated = line.length > 60 ? line.substring(0, 60) + '...' : line;
            lines.push(`  - - ${truncated}`);
          }
          if (section.removedLines.length > 3) {
            lines.push(`  - _...and ${section.removedLines.length - 3} more removals_`);
          }
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * MCP Tool definition for spec diff
 */
export const specDiffTool = {
  name: 'stackshift_spec_diff',
  description: 'Compare specifications between two directories or git commits',
  inputSchema: {
    type: 'object',
    properties: {
      base_directory: {
        type: 'string',
        description: 'Base directory or git ref for comparison',
      },
      compare_directory: {
        type: 'string',
        description: 'Directory or git ref to compare against base',
      },
      format: {
        type: 'string',
        enum: ['json', 'markdown'],
        description: 'Output format (default: markdown)',
      },
    },
    required: ['base_directory', 'compare_directory'],
  },
};

/**
 * Execute spec diff
 */
export async function executeSpecDiff(args: {
  base_directory: string;
  compare_directory: string;
  format?: 'json' | 'markdown';
}): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const report = await compareSpecs(args.base_directory, args.compare_directory);

  if (args.format === 'json') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: formatDiffReport(report),
      },
    ],
  };
}
