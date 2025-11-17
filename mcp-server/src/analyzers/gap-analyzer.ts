/**
 * Spec Gap Analyzer
 * Analyzes specifications against codebase implementation to identify gaps
 * Implements User Story 1 (FR1): Spec vs Implementation Gap Detection
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { SpecParser } from './utils/spec-parser.js';
import { FileSearcher } from './utils/file-searcher.js';
import { ASTParser, FunctionSignature } from './utils/ast-parser.js';
import { ConfidenceScorer } from './utils/confidence-scorer.js';
import { GapDetectionError } from '../types/errors.js';
import type {
  SpecGap,
  ParsedSpec,
  Requirement,
  GapStatus,
  Evidence,
  Priority,
} from '../types/roadmap.js';
import {
  createEvidence,
  createEffortEstimate,
  combineEvidence,
} from '../types/roadmap.js';

/**
 * Gap Analyzer Configuration
 */
export interface GapAnalyzerConfig {
  /**
   * Minimum confidence score to include a gap (0-100)
   */
  confidenceThreshold?: number;

  /**
   * Include stub implementations as gaps
   */
  includeStubs?: boolean;

  /**
   * Include partial implementations as gaps
   */
  includePartial?: boolean;

  /**
   * Languages to support
   */
  languageSupport?: string[];

  /**
   * Search for test files
   */
  checkTestCoverage?: boolean;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<GapAnalyzerConfig> = {
  confidenceThreshold: 50,
  includeStubs: true,
  includePartial: true,
  languageSupport: ['javascript', 'typescript'],
  checkTestCoverage: true,
  verbose: false,
};

/**
 * Spec Gap Analyzer
 * Analyzes specifications against codebase to identify implementation gaps
 */
export class SpecGapAnalyzer {
  private config: Required<GapAnalyzerConfig>;
  private specParser: SpecParser;
  private fileSearcher: FileSearcher;
  private astParser: ASTParser;
  private confidenceScorer: ConfidenceScorer;

  constructor(config: GapAnalyzerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.specParser = new SpecParser();
    this.fileSearcher = new FileSearcher({
      extensions: ['.ts', '.js', '.tsx', '.jsx'],
      includeTests: false,
    });
    this.astParser = new ASTParser();
    this.confidenceScorer = new ConfidenceScorer();
  }

  /**
   * Analyze all specifications in a directory
   * @param specsDir - Path to specs directory (specs/ or production-readiness-specs/)
   * @param codeDir - Path to codebase root
   * @returns Array of spec gaps found
   */
  async analyzeSpecs(specsDir: string, codeDir: string): Promise<SpecGap[]> {
    this.log(`Analyzing specs in ${specsDir} against code in ${codeDir}`);

    try {
      const specFiles = await this.findSpecFiles(specsDir);
      this.log(`Found ${specFiles.length} spec files`);

      const allGaps: SpecGap[] = [];

      for (const specFile of specFiles) {
        this.log(`Analyzing spec: ${specFile}`);
        const gaps = await this.analyzeSpec(specFile, codeDir);
        allGaps.push(...gaps);
      }

      // Filter by confidence threshold
      const filteredGaps = allGaps.filter(
        gap => gap.confidence >= this.config.confidenceThreshold
      );

      this.log(
        `Found ${filteredGaps.length} gaps (${allGaps.length} total, ${
          allGaps.length - filteredGaps.length
        } below confidence threshold)`
      );

      return filteredGaps;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GapDetectionError('analyzeSpecs', message);
    }
  }

  /**
   * Analyze a single specification file
   * @param specPath - Path to spec.md file
   * @param codeDir - Path to codebase root
   * @returns Array of gaps found in this spec
   */
  async analyzeSpec(specPath: string, codeDir: string): Promise<SpecGap[]> {
    try {
      const spec = await this.parseSpecFile(specPath);
      const gaps: SpecGap[] = [];

      // Analyze functional requirements
      for (const requirement of spec.functionalRequirements) {
        const gap = await this.verifyRequirement(requirement, spec, codeDir);
        if (gap) {
          gaps.push(gap);
        }
      }

      // Analyze non-functional requirements
      for (const requirement of spec.nonFunctionalRequirements) {
        const gap = await this.verifyRequirement(requirement, spec, codeDir);
        if (gap) {
          gaps.push(gap);
        }
      }

      return gaps;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GapDetectionError(specPath, message);
    }
  }

  /**
   * Verify a specific requirement is implemented
   * @param requirement - The requirement to verify
   * @param spec - Parsed spec
   * @param codeDir - Path to codebase root
   * @returns Gap details or null if implemented
   */
  async verifyRequirement(
    requirement: Requirement,
    spec: ParsedSpec,
    codeDir: string
  ): Promise<SpecGap | null> {
    this.log(`Verifying requirement: ${requirement.id} - ${requirement.title}`);

    const evidence: Evidence[] = [];
    let status: GapStatus = 'missing';

    // Check if requirement has implementation details
    if (requirement.implementation) {
      const implDetails = requirement.implementation;

      // Verify each claimed file
      for (const filePath of implDetails.files) {
        const fullPath = path.join(codeDir, filePath);
        const exists = await this.fileSearcher.fileExists(fullPath);

        if (exists) {
          evidence.push(
            createEvidence('exact-function-match', `File exists: ${filePath}`, 30, filePath)
          );

          // Check functions in this file
          for (const funcName of implDetails.functions || []) {
            const funcEvidence = await this.searchForFunction(fullPath, funcName, codeDir);
            evidence.push(...funcEvidence);
          }
        } else {
          evidence.push(
            createEvidence('file-not-found', `File not found: ${filePath}`, -50, filePath)
          );
        }
      }

      // Determine status from implementation
      status = implDetails.status;
    } else {
      // No implementation details, search for likely implementations
      const searchEvidence = await this.searchForRequirement(requirement, codeDir);
      evidence.push(...searchEvidence);

      // Determine status from evidence
      status = this.determineStatusFromEvidence(evidence);
    }

    // Check test coverage
    if (this.config.checkTestCoverage) {
      const testEvidence = await this.checkTestCoverage(requirement, codeDir);
      evidence.push(...testEvidence);
    }

    // Calculate confidence
    const confidenceScore = this.confidenceScorer.calculateScore(status, evidence);

    // Skip complete implementations unless configured otherwise
    if (status === 'complete' && confidenceScore.score >= 90) {
      this.log(`✅ ${requirement.id} is complete with high confidence`);
      return null;
    }

    // Skip partial implementations if not configured to include them
    if (status === 'partial' && !this.config.includePartial) {
      return null;
    }

    // Skip stubs if not configured to include them
    if (status === 'stub' && !this.config.includeStubs) {
      return null;
    }

    // Generate expected locations based on requirement
    const expectedLocations = this.generateExpectedLocations(requirement, spec);

    // Find actual locations from evidence
    const actualLocations = evidence
      .filter(e => e.location)
      .map(e => e.location as string);

    // Estimate effort
    const effort = this.estimateEffort(requirement, status, evidence);

    // Determine priority
    const priority = this.determinePriority(requirement, status, spec);

    // Generate impact and recommendation
    const impact = this.generateImpact(requirement, status, spec);
    const recommendation = this.generateRecommendation(requirement, status, evidence);

    // Create gap object
    const gap: SpecGap = {
      id: uuidv4(),
      spec: spec.id,
      requirement: requirement.id,
      description: requirement.title,
      status,
      confidence: confidenceScore.score,
      evidence,
      expectedLocations,
      actualLocations,
      effort,
      priority,
      impact,
      recommendation,
      dependencies: this.extractDependencies(requirement),
    };

    this.log(
      `⚠️  ${requirement.id} - Status: ${status}, Confidence: ${confidenceScore.score}%`
    );

    return gap;
  }

  /**
   * Parse spec file and extract requirements
   * @param specPath - Path to spec.md file
   * @returns Parsed specification
   */
  async parseSpecFile(specPath: string): Promise<ParsedSpec> {
    return this.specParser.parseSpec(specPath);
  }

  /**
   * Find all spec.md files recursively
   * @param specsDir - Directory to search
   * @returns Array of spec file paths
   */
  async findSpecFiles(specsDir: string): Promise<string[]> {
    const specFiles: string[] = [];

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specPath = path.join(specsDir, entry.name, 'spec.md');
          try {
            const stats = await fs.stat(specPath);
            if (stats.isFile()) {
              specFiles.push(specPath);
            }
          } catch {
            // Spec file doesn't exist, skip
          }

          // Recursively search subdirectories
          const subSpecs = await this.findSpecFiles(path.join(specsDir, entry.name));
          specFiles.push(...subSpecs);
        }
      }
    } catch (error) {
      // Directory might not exist or not be readable
      this.log(`Warning: Could not read directory ${specsDir}`);
    }

    return specFiles;
  }

  /**
   * Search for a function in a file
   * @param filePath - File to search
   * @param functionName - Function name to find
   * @param codeDir - Code directory root
   * @returns Array of evidence
   */
  async searchForFunction(
    filePath: string,
    functionName: string,
    codeDir: string
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    try {
      const parsed = await this.astParser.parseFile(filePath);
      const func = parsed.functions.find(f => f.name === functionName);

      if (func) {
        evidence.push(
          createEvidence(
            'exact-function-match',
            `Function ${functionName} found`,
            50,
            filePath,
            func.location.line
          )
        );

        // Check if it's a stub
        if (func.isStub) {
          evidence.push(
            createEvidence(
              'returns-guidance-text',
              `Function ${functionName} is a stub`,
              -35,
              filePath,
              func.location.line
            )
          );
        }
      } else {
        evidence.push(
          createEvidence(
            'function-not-found',
            `Function ${functionName} not found`,
            -40,
            filePath
          )
        );
      }
    } catch (error) {
      // AST parsing failed
      evidence.push(
        createEvidence(
          'file-not-found',
          `Could not parse file: ${error}`,
          -30,
          filePath
        )
      );
    }

    return evidence;
  }

  /**
   * Verify a function signature matches expected parameters
   * @param func - Function signature
   * @param expectedParams - Expected parameter names
   * @returns Evidence of verification
   */
  verifyFunctionSignature(func: FunctionSignature, expectedParams: string[]): Evidence {
    const matches = this.astParser.verifySignature(func, expectedParams);

    if (matches) {
      return createEvidence(
        'ast-signature-verified',
        `Signature verified: ${func.name}(${expectedParams.join(', ')})`,
        40
      );
    } else {
      return createEvidence(
        'name-similarity-only',
        `Signature mismatch: expected ${expectedParams.join(', ')}`,
        -20
      );
    }
  }

  /**
   * Detect if a function is a stub implementation
   * @param func - Function signature
   * @param fileContent - Full file content
   * @returns Evidence of stub detection
   */
  async detectStubFunction(func: FunctionSignature, fileContent: string): Promise<Evidence> {
    const isStub = await this.astParser.detectStub(func, fileContent);

    if (isStub) {
      return createEvidence(
        'returns-guidance-text',
        `Function ${func.name} is a stub implementation`,
        -35
      );
    } else {
      return createEvidence(
        'exact-function-match',
        `Function ${func.name} has real implementation`,
        30
      );
    }
  }

  /**
   * Search for requirement implementation
   * @param requirement - Requirement to search for
   * @param codeDir - Code directory
   * @returns Evidence from search
   */
  private async searchForRequirement(
    requirement: Requirement,
    codeDir: string
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    // Extract keywords from requirement title and description
    const keywords = this.extractKeywords(requirement.title + ' ' + requirement.description);

    // Search for files that might implement this requirement
    for (const keyword of keywords.slice(0, 3)) {
      // Limit to top 3 keywords
      const files = await this.fileSearcher.searchByName(codeDir, keyword);

      if (files.length > 0) {
        evidence.push(
          createEvidence(
            'name-similarity-only',
            `Found ${files.length} files matching "${keyword}"`,
            10
          )
        );
      }
    }

    return evidence;
  }

  /**
   * Check test coverage for requirement
   * @param requirement - Requirement to check
   * @param codeDir - Code directory
   * @returns Evidence of test coverage
   */
  private async checkTestCoverage(
    requirement: Requirement,
    codeDir: string
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    if (requirement.implementation) {
      for (const filePath of requirement.implementation.files) {
        const fullPath = path.join(codeDir, filePath);
        const testFiles = await this.fileSearcher.findTestFiles(fullPath, codeDir);

        if (testFiles.length > 0) {
          evidence.push(
            createEvidence(
              'test-file-exists',
              `Test file exists for ${filePath}`,
              20,
              testFiles[0]
            )
          );
        } else {
          evidence.push(
            createEvidence('test-file-missing', `No test file for ${filePath}`, -20, filePath)
          );
        }
      }
    }

    return evidence;
  }

  /**
   * Determine gap status from evidence
   * @param evidence - Array of evidence
   * @returns Gap status
   */
  private determineStatusFromEvidence(evidence: Evidence[]): GapStatus {
    const hasImplementation = evidence.some(
      e => e.type === 'exact-function-match' || e.type === 'ast-signature-verified'
    );

    const hasStub = evidence.some(
      e => e.type === 'returns-guidance-text' || e.type === 'returns-todo-comment'
    );

    const hasPartial = evidence.some(e => e.type === 'name-similarity-only');

    const hasNegative = evidence.some(
      e => e.type === 'file-not-found' || e.type === 'function-not-found'
    );

    if (hasStub) {
      return 'stub';
    } else if (hasImplementation && !hasNegative) {
      return 'complete';
    } else if (hasImplementation || hasPartial) {
      return 'partial';
    } else {
      return 'missing';
    }
  }

  /**
   * Generate expected file locations for a requirement
   * @param requirement - Requirement
   * @param spec - Spec
   * @returns Array of expected locations
   */
  private generateExpectedLocations(requirement: Requirement, spec: ParsedSpec): string[] {
    const locations: string[] = [];

    // Extract keywords and generate likely paths
    const keywords = this.extractKeywords(requirement.title);

    for (const keyword of keywords) {
      const kebab = keyword.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      locations.push(`src/${kebab}.ts`);
      locations.push(`src/${spec.id.toLowerCase()}/${kebab}.ts`);
    }

    return locations;
  }

  /**
   * Estimate effort for implementing a requirement
   * @param requirement - Requirement
   * @param status - Gap status
   * @param evidence - Evidence
   * @returns Effort estimate
   */
  private estimateEffort(
    requirement: Requirement,
    status: GapStatus,
    evidence: Evidence[]
  ): any {
    // Base effort by status
    const baseHours: Record<GapStatus, number> = {
      missing: 16,
      stub: 12,
      partial: 8,
      complete: 2,
    };

    let hours = baseHours[status];

    // Adjust for complexity (based on acceptance criteria count)
    const criteriaCount = requirement.acceptanceCriteria.length;
    if (criteriaCount > 5) {
      hours *= 1.5;
    } else if (criteriaCount > 3) {
      hours *= 1.2;
    }

    // Adjust for dependencies
    const hasDependencies = evidence.some(e => e.description.includes('depends on'));
    if (hasDependencies) {
      hours *= 1.3;
    }

    hours = Math.round(hours);

    return createEffortEstimate(hours, 'medium', 'complexity');
  }

  /**
   * Determine priority for a gap
   * @param requirement - Requirement
   * @param status - Gap status
   * @param spec - Spec
   * @returns Priority level
   */
  private determinePriority(
    requirement: Requirement,
    status: GapStatus,
    spec: ParsedSpec
  ): Priority {
    // Use requirement priority if available
    if (requirement.priority) {
      return requirement.priority;
    }

    // Otherwise use spec priority
    return spec.priority;
  }

  /**
   * Generate impact description
   * @param requirement - Requirement
   * @param status - Gap status
   * @param spec - Spec
   * @returns Impact description
   */
  private generateImpact(
    requirement: Requirement,
    status: GapStatus,
    spec: ParsedSpec
  ): string {
    if (status === 'missing') {
      return `${requirement.title} is not implemented. This blocks ${spec.title}.`;
    } else if (status === 'stub') {
      return `${requirement.title} is only a stub. Users will encounter non-functional code.`;
    } else if (status === 'partial') {
      return `${requirement.title} is partially implemented. Some acceptance criteria are not met.`;
    } else {
      return `${requirement.title} appears complete but may need verification.`;
    }
  }

  /**
   * Generate recommendation
   * @param requirement - Requirement
   * @param status - Gap status
   * @param evidence - Evidence
   * @returns Recommendation
   */
  private generateRecommendation(
    requirement: Requirement,
    status: GapStatus,
    evidence: Evidence[]
  ): string {
    if (status === 'missing') {
      return `Implement ${requirement.title} according to specification.`;
    } else if (status === 'stub') {
      return `Complete the stub implementation of ${requirement.title}.`;
    } else if (status === 'partial') {
      return `Finish implementing remaining acceptance criteria for ${requirement.title}.`;
    } else {
      return `Verify and test ${requirement.title} implementation.`;
    }
  }

  /**
   * Extract dependencies from requirement
   * @param requirement - Requirement
   * @returns Array of dependency IDs
   */
  private extractDependencies(requirement: Requirement): string[] {
    const deps: string[] = [];

    // Look for "depends on" in description
    const depMatch = requirement.description.match(/depends on ([A-Z]+\d+)/gi);
    if (depMatch) {
      deps.push(...depMatch.map(m => m.replace(/depends on /i, '')));
    }

    return deps;
  }

  /**
   * Extract keywords from text
   * @param text - Text to extract keywords from
   * @returns Array of keywords
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and split into keywords
    const commonWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
      'system',
      'must',
    ];

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.includes(w));

    // Return unique words, sorted by length (longer = more specific)
    return [...new Set(words)].sort((a, b) => b.length - a.length);
  }

  /**
   * Log message if verbose
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[SpecGapAnalyzer] ${message}`);
    }
  }
}

/**
 * Create a SpecGapAnalyzer instance
 */
export function createSpecGapAnalyzer(config?: GapAnalyzerConfig): SpecGapAnalyzer {
  return new SpecGapAnalyzer(config);
}
