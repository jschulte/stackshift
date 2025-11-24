/**
 * Spec Quality Tool
 *
 * Analyzes specification quality and provides scores on:
 * - Completeness: Are all required sections present?
 * - Testability: Are acceptance criteria measurable?
 * - Clarity: Is the language unambiguous?
 * - Coverage: Are all features documented?
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from '../utils/logger.js';
import { readFileSafe } from '../utils/file-utils.js';
import { createDefaultValidator } from '../utils/security.js';

const logger = createLogger('spec-quality');

/**
 * Quality scores for a single specification
 */
export interface SpecQualityScore {
  /** Specification file path */
  file: string;
  /** Feature name */
  featureName: string;
  /** Overall score (0-100) */
  overallScore: number;
  /** Completeness score (0-100) - Are all sections present? */
  completeness: number;
  /** Testability score (0-100) - Are criteria measurable? */
  testability: number;
  /** Clarity score (0-100) - Is language unambiguous? */
  clarity: number;
  /** Issues found */
  issues: QualityIssue[];
  /** Suggestions for improvement */
  suggestions: string[];
}

/**
 * Quality issue found in a specification
 */
export interface QualityIssue {
  type: 'missing-section' | 'vague-criteria' | 'ambiguous-language' | 'incomplete' | 'untestable';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

/**
 * Overall quality report for a project
 */
export interface QualityReport {
  /** Project directory */
  projectPath: string;
  /** Timestamp of analysis */
  timestamp: string;
  /** Number of specs analyzed */
  totalSpecs: number;
  /** Overall project score (0-100) */
  overallScore: number;
  /** Average completeness across all specs */
  averageCompleteness: number;
  /** Average testability across all specs */
  averageTestability: number;
  /** Average clarity across all specs */
  averageClarity: number;
  /** Individual spec scores */
  specs: SpecQualityScore[];
  /** Summary of all issues */
  issueSummary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

// Required sections in a GitHub Spec Kit specification
const REQUIRED_SECTIONS = [
  'Feature',
  'User Stories',
  'Acceptance Criteria',
  'Technical Requirements',
];

const RECOMMENDED_SECTIONS = [
  'Dependencies',
  'Out of Scope',
  'Implementation Notes',
  'Testing Strategy',
];

// Ambiguous words that reduce clarity
const AMBIGUOUS_WORDS = [
  'appropriate',
  'reasonable',
  'adequate',
  'sufficient',
  'proper',
  'good',
  'nice',
  'fast',
  'slow',
  'many',
  'few',
  'some',
  'most',
  'quickly',
  'easily',
  'simply',
  'obviously',
  'clearly',
  'basically',
  'etc',
  'and so on',
  'and more',
  'similar',
  'various',
  'certain',
  'specific',
  'generally',
  'usually',
  'often',
  'sometimes',
  'maybe',
  'might',
  'could',
  'possibly',
  'perhaps',
];

// Markers that indicate incomplete specs
const INCOMPLETE_MARKERS = [
  '[NEEDS CLARIFICATION]',
  '[TODO]',
  '[TBD]',
  '[PLACEHOLDER]',
  '[WIP]',
  '[PENDING]',
  'TODO:',
  'FIXME:',
  '???',
  'XXX',
];

// Testable criteria patterns (good)
const TESTABLE_PATTERNS = [
  /\b\d+(\.\d+)?\s*(ms|milliseconds?|s|seconds?|minutes?|hours?)\b/i, // Time measurements
  /\b\d+(\.\d+)?\s*%\b/, // Percentages
  /\b(at least|at most|exactly|no more than|no less than)\s+\d+/i, // Quantity bounds
  /\b(returns?|responds?|displays?|shows?)\s+\d+/i, // Specific counts
  /\b(status code|http)\s*\d{3}\b/i, // HTTP status codes
  /\b(within|under|over|below|above)\s+\d+/i, // Thresholds
  /\bmust\s+(be|have|return|display|show|contain|include)/i, // Definitive requirements
  /\bshall\s+(be|have|return|display|show|contain|include)/i, // Definitive requirements
  /\bwill\s+(be|have|return|display|show|contain|include)/i, // Definitive requirements
];

// Untestable criteria patterns (bad)
const UNTESTABLE_PATTERNS = [
  /\bshould\s+be\s+(good|nice|fast|easy|user-friendly|intuitive)/i,
  /\bperformant\b/i,
  /\bscalable\b/i,
  /\brobust\b/i,
  /\bseamless(ly)?\b/i,
  /\bintuitive(ly)?\b/i,
  /\buser-friendly\b/i,
  /\belegant(ly)?\b/i,
  /\bwhen\s+appropriate\b/i,
  /\bas\s+needed\b/i,
];

/**
 * Analyze specification quality
 */
export async function analyzeSpecQuality(
  directory: string
): Promise<QualityReport> {
  const validator = createDefaultValidator();
  const validatedDir = validator.validateDirectory(directory);

  logger.info('Analyzing spec quality', { directory: validatedDir });

  // Find .specify directory
  const specifyDir = path.join(validatedDir, '.specify', 'memory', 'specifications');
  const specs: SpecQualityScore[] = [];

  try {
    const files = await fs.readdir(specifyDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const filePath = path.join(specifyDir, file);
      const score = await analyzeSpecFile(filePath);
      specs.push(score);
    }
  } catch (error) {
    // Try alternative spec locations
    const altLocations = [
      path.join(validatedDir, '.specify', 'specifications'),
      path.join(validatedDir, 'specs'),
      path.join(validatedDir, 'specifications'),
    ];

    for (const altDir of altLocations) {
      try {
        const files = await fs.readdir(altDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        for (const file of mdFiles) {
          const filePath = path.join(altDir, file);
          const score = await analyzeSpecFile(filePath);
          specs.push(score);
        }
        break; // Found specs in this location
      } catch {
        // Continue to next location
      }
    }
  }

  // Calculate aggregates
  const totalSpecs = specs.length;
  const overallScore = totalSpecs > 0
    ? Math.round(specs.reduce((sum, s) => sum + s.overallScore, 0) / totalSpecs)
    : 0;
  const averageCompleteness = totalSpecs > 0
    ? Math.round(specs.reduce((sum, s) => sum + s.completeness, 0) / totalSpecs)
    : 0;
  const averageTestability = totalSpecs > 0
    ? Math.round(specs.reduce((sum, s) => sum + s.testability, 0) / totalSpecs)
    : 0;
  const averageClarity = totalSpecs > 0
    ? Math.round(specs.reduce((sum, s) => sum + s.clarity, 0) / totalSpecs)
    : 0;

  const issueSummary = {
    errors: specs.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'error').length, 0),
    warnings: specs.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'warning').length, 0),
    info: specs.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'info').length, 0),
  };

  logger.info('Quality analysis complete', {
    totalSpecs,
    overallScore,
    errors: issueSummary.errors,
    warnings: issueSummary.warnings,
  });

  return {
    projectPath: validatedDir,
    timestamp: new Date().toISOString(),
    totalSpecs,
    overallScore,
    averageCompleteness,
    averageTestability,
    averageClarity,
    specs,
    issueSummary,
  };
}

/**
 * Analyze a single specification file
 */
async function analyzeSpecFile(filePath: string): Promise<SpecQualityScore> {
  const content = await readFileSafe(filePath, 2 * 1024 * 1024); // 2MB max
  const lines = content.split('\n');
  const issues: QualityIssue[] = [];
  const suggestions: string[] = [];

  // Extract feature name from first heading
  const featureMatch = content.match(/^#\s+(?:Feature:\s*)?(.+)$/m);
  const featureName = featureMatch ? featureMatch[1].trim() : path.basename(filePath, '.md');

  // 1. Check Completeness
  const completenessScore = calculateCompletenessScore(content, issues, suggestions);

  // 2. Check Testability
  const testabilityScore = calculateTestabilityScore(content, lines, issues, suggestions);

  // 3. Check Clarity
  const clarityScore = calculateClarityScore(content, lines, issues, suggestions);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    completenessScore * 0.35 +
    testabilityScore * 0.35 +
    clarityScore * 0.30
  );

  return {
    file: filePath,
    featureName,
    overallScore,
    completeness: completenessScore,
    testability: testabilityScore,
    clarity: clarityScore,
    issues,
    suggestions,
  };
}

/**
 * Calculate completeness score
 */
function calculateCompletenessScore(
  content: string,
  issues: QualityIssue[],
  suggestions: string[]
): number {
  let score = 100;
  const contentLower = content.toLowerCase();

  // Check required sections
  for (const section of REQUIRED_SECTIONS) {
    const sectionLower = section.toLowerCase();
    const hasSection = contentLower.includes(`## ${sectionLower}`) ||
                       contentLower.includes(`### ${sectionLower}`) ||
                       contentLower.includes(`# ${sectionLower}`);

    if (!hasSection) {
      score -= 15;
      issues.push({
        type: 'missing-section',
        severity: 'error',
        message: `Missing required section: "${section}"`,
      });
    }
  }

  // Check recommended sections (less penalty)
  for (const section of RECOMMENDED_SECTIONS) {
    const sectionLower = section.toLowerCase();
    const hasSection = contentLower.includes(`## ${sectionLower}`) ||
                       contentLower.includes(`### ${sectionLower}`);

    if (!hasSection) {
      score -= 5;
      suggestions.push(`Consider adding "${section}" section`);
    }
  }

  // Check for incomplete markers
  for (const marker of INCOMPLETE_MARKERS) {
    const count = (content.match(new RegExp(escapeRegex(marker), 'gi')) || []).length;
    if (count > 0) {
      score -= count * 5;
      issues.push({
        type: 'incomplete',
        severity: 'warning',
        message: `Found ${count} "${marker}" marker(s)`,
      });
    }
  }

  // Check minimum content length
  if (content.length < 500) {
    score -= 20;
    issues.push({
      type: 'incomplete',
      severity: 'warning',
      message: 'Specification is very short (< 500 characters)',
    });
    suggestions.push('Add more detail to the specification');
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate testability score
 */
function calculateTestabilityScore(
  content: string,
  lines: string[],
  issues: QualityIssue[],
  suggestions: string[]
): number {
  let score = 100;

  // Find acceptance criteria section
  const acStartIndex = lines.findIndex(l =>
    l.toLowerCase().includes('acceptance criteria') ||
    l.toLowerCase().includes('## criteria')
  );

  if (acStartIndex === -1) {
    return 50; // No criteria section found
  }

  // Find the end of the acceptance criteria section
  let acEndIndex = lines.length;
  for (let i = acStartIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^#{1,3}\s+/)) {
      acEndIndex = i;
      break;
    }
  }

  const acLines = lines.slice(acStartIndex, acEndIndex);
  const criteriaLines = acLines.filter(l => l.match(/^[-*]\s+/) || l.match(/^\d+\.\s+/));

  if (criteriaLines.length === 0) {
    score -= 30;
    issues.push({
      type: 'untestable',
      severity: 'warning',
      message: 'No acceptance criteria bullet points found',
    });
    suggestions.push('Add specific acceptance criteria as bullet points');
    return Math.max(0, score);
  }

  let testableCount = 0;
  let untestableCount = 0;

  for (let i = 0; i < criteriaLines.length; i++) {
    const line = criteriaLines[i];
    const lineNumber = acStartIndex + acLines.indexOf(line) + 1;

    // Check for testable patterns
    const isTestable = TESTABLE_PATTERNS.some(p => p.test(line));
    const isUntestable = UNTESTABLE_PATTERNS.some(p => p.test(line));

    if (isTestable) {
      testableCount++;
    } else if (isUntestable) {
      untestableCount++;
      issues.push({
        type: 'untestable',
        severity: 'warning',
        message: `Vague or untestable criteria: "${line.substring(0, 60)}..."`,
        line: lineNumber,
      });
    }
  }

  // Calculate score based on ratio of testable criteria
  const totalCriteria = criteriaLines.length;
  const testableRatio = totalCriteria > 0 ? testableCount / totalCriteria : 0;
  const untestableRatio = totalCriteria > 0 ? untestableCount / totalCriteria : 0;

  score = Math.round(100 * testableRatio - 50 * untestableRatio);

  if (untestableCount > 0) {
    suggestions.push(
      `Make ${untestableCount} criteria more specific with measurable values`
    );
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate clarity score
 */
function calculateClarityScore(
  content: string,
  lines: string[],
  issues: QualityIssue[],
  suggestions: string[]
): number {
  let score = 100;
  const contentLower = content.toLowerCase();

  // Check for ambiguous words
  let ambiguousCount = 0;
  for (const word of AMBIGUOUS_WORDS) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    const matches = content.match(regex) || [];
    ambiguousCount += matches.length;
  }

  if (ambiguousCount > 0) {
    const penalty = Math.min(30, ambiguousCount * 2);
    score -= penalty;

    if (ambiguousCount > 5) {
      issues.push({
        type: 'ambiguous-language',
        severity: 'warning',
        message: `Found ${ambiguousCount} ambiguous words/phrases`,
      });
      suggestions.push('Replace vague terms with specific, measurable language');
    }
  }

  // Check for passive voice (simple heuristic)
  const passiveMatches = content.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
  if (passiveMatches.length > 5) {
    score -= 10;
    suggestions.push('Consider using active voice for clearer requirements');
  }

  // Check for very long sentences (> 40 words)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 40);
  if (longSentences.length > 0) {
    score -= longSentences.length * 3;
    issues.push({
      type: 'ambiguous-language',
      severity: 'info',
      message: `${longSentences.length} sentences are very long (>40 words)`,
    });
    suggestions.push('Break long sentences into shorter, clearer statements');
  }

  // Bonus for having examples or code blocks
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
  if (codeBlocks > 0) {
    score += Math.min(10, codeBlocks * 3);
  }

  // Bonus for having "Given/When/Then" or BDD-style criteria
  if (contentLower.includes('given') && contentLower.includes('when') && contentLower.includes('then')) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format quality report as markdown
 */
export function formatQualityReport(report: QualityReport): string {
  const lines: string[] = [];

  lines.push('# Specification Quality Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push(`**Project:** ${report.projectPath}`);
  lines.push('');

  // Overall summary
  lines.push('## Summary');
  lines.push('');
  lines.push('```');
  lines.push(`Overall Score:    ${formatScoreBar(report.overallScore)} ${report.overallScore}/100`);
  lines.push(`Completeness:     ${formatScoreBar(report.averageCompleteness)} ${report.averageCompleteness}/100`);
  lines.push(`Testability:      ${formatScoreBar(report.averageTestability)} ${report.averageTestability}/100`);
  lines.push(`Clarity:          ${formatScoreBar(report.averageClarity)} ${report.averageClarity}/100`);
  lines.push('```');
  lines.push('');
  lines.push(`**Specs Analyzed:** ${report.totalSpecs}`);
  lines.push(`**Issues:** ${report.issueSummary.errors} errors, ${report.issueSummary.warnings} warnings, ${report.issueSummary.info} info`);
  lines.push('');

  // Individual specs
  if (report.specs.length > 0) {
    lines.push('## Specifications');
    lines.push('');

    // Sort by score (lowest first to highlight problem specs)
    const sortedSpecs = [...report.specs].sort((a, b) => a.overallScore - b.overallScore);

    for (const spec of sortedSpecs) {
      const icon = spec.overallScore >= 80 ? '✅' :
                   spec.overallScore >= 60 ? '⚠️' : '❌';

      lines.push(`### ${icon} ${spec.featureName}`);
      lines.push('');
      lines.push(`**Score:** ${spec.overallScore}/100`);
      lines.push('');
      lines.push('| Metric | Score |');
      lines.push('|--------|-------|');
      lines.push(`| Completeness | ${spec.completeness}/100 |`);
      lines.push(`| Testability | ${spec.testability}/100 |`);
      lines.push(`| Clarity | ${spec.clarity}/100 |`);
      lines.push('');

      if (spec.issues.length > 0) {
        lines.push('**Issues:**');
        for (const issue of spec.issues) {
          const icon = issue.severity === 'error' ? '❌' :
                       issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          const lineRef = issue.line ? ` (line ${issue.line})` : '';
          lines.push(`- ${icon} ${issue.message}${lineRef}`);
        }
        lines.push('');
      }

      if (spec.suggestions.length > 0) {
        lines.push('**Suggestions:**');
        for (const suggestion of spec.suggestions) {
          lines.push(`- 💡 ${suggestion}`);
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Format a score as a visual bar
 */
function formatScoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * MCP Tool definition for spec quality analysis
 */
export const specQualityTool = {
  name: 'stackshift_spec_quality',
  description: 'Analyze specification quality and get scores on completeness, testability, and clarity',
  inputSchema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Project directory containing .specify/ folder',
      },
      format: {
        type: 'string',
        enum: ['json', 'markdown'],
        description: 'Output format (default: markdown)',
      },
    },
    required: ['directory'],
  },
};

/**
 * Execute spec quality analysis
 */
export async function executeSpecQuality(args: {
  directory: string;
  format?: 'json' | 'markdown';
}): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const report = await analyzeSpecQuality(args.directory);

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
        text: formatQualityReport(report),
      },
    ],
  };
}
