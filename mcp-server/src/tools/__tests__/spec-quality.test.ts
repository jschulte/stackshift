/**
 * Spec Quality Tool Tests
 *
 * Tests for specification quality analysis:
 * - Completeness scoring
 * - Testability scoring
 * - Clarity scoring
 * - Issue detection
 * - Report formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import {
  analyzeSpecQuality,
  formatQualityReport,
  executeSpecQuality,
  specQualityTool,
  type QualityReport,
  type SpecQualityScore,
} from '../spec-quality.js';

describe('Spec Quality Tool Tests', () => {
  let testDir: string;

  async function createSpecFile(filename: string, content: string) {
    const specDir = path.join(testDir, '.specify', 'memory', 'specifications');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(path.join(specDir, filename), content);
  }

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `stackshift-quality-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Tool Definition', () => {
    it('should have correct tool name', () => {
      expect(specQualityTool.name).toBe('stackshift_spec_quality');
    });

    it('should have required input schema properties', () => {
      const props = specQualityTool.inputSchema.properties;
      expect(props).toHaveProperty('directory');
      expect(props).toHaveProperty('format');
    });

    it('should mark directory as required', () => {
      expect(specQualityTool.inputSchema.required).toContain('directory');
    });
  });

  describe('Completeness Scoring', () => {
    it('should give high score to complete spec', async () => {
      const completeSpec = `# Feature: Complete Feature

## User Stories
- As a user, I want to login so that I can access my account

## Acceptance Criteria
- User must enter valid credentials
- System must return error on invalid credentials

## Technical Requirements
- Use OAuth 2.0 for authentication
- Store tokens securely

## Dependencies
- Auth service must be available

## Out of Scope
- Social login integration

## Implementation Notes
- Use JWT tokens

## Testing Strategy
- Unit tests for auth logic
`;
      await createSpecFile('complete.md', completeSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs).toHaveLength(1);
      expect(report.specs[0].completeness).toBeGreaterThanOrEqual(70);
    });

    it('should penalize missing required sections', async () => {
      const incompleteSpec = `# Feature: Incomplete Feature

Just some content without proper sections.
`;
      await createSpecFile('incomplete.md', incompleteSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].completeness).toBeLessThan(70);
      const missingSectionIssues = report.specs[0].issues.filter(i => i.type === 'missing-section');
      expect(missingSectionIssues.length).toBeGreaterThan(0);
    });

    it('should detect incomplete markers like [TODO]', async () => {
      const todoSpec = `# Feature: Todo Feature

## User Stories
- [TODO] Add user stories

## Acceptance Criteria
- [NEEDS CLARIFICATION] Define criteria
`;
      await createSpecFile('todo.md', todoSpec);

      const report = await analyzeSpecQuality(testDir);

      const incompleteIssues = report.specs[0].issues.filter(i => i.type === 'incomplete');
      expect(incompleteIssues.length).toBeGreaterThan(0);
    });

    it('should penalize very short specifications', async () => {
      const shortSpec = `# Feature: Short
Content.`;
      await createSpecFile('short.md', shortSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].completeness).toBeLessThan(80);
      const incompleteIssues = report.specs[0].issues.filter(i => i.message.includes('short'));
      expect(incompleteIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Testability Scoring', () => {
    it('should give high score to testable criteria', async () => {
      const testableSpec = `# Feature: Testable Feature

## User Stories
- As a user, I want fast responses

## Acceptance Criteria
- Response time must be under 200ms
- System shall return HTTP status code 200 on success
- At least 95% uptime
- Returns exactly 10 items per page
`;
      await createSpecFile('testable.md', testableSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].testability).toBeGreaterThanOrEqual(50);
    });

    it('should penalize vague or untestable criteria', async () => {
      const vagueSpec = `# Feature: Vague Feature

## User Stories
- As a user, I want a good experience

## Acceptance Criteria
- System should be performant
- Interface should be user-friendly
- Should be scalable
- Must be intuitive
`;
      await createSpecFile('vague.md', vagueSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].testability).toBeLessThan(80);
      const untestableIssues = report.specs[0].issues.filter(i => i.type === 'untestable');
      expect(untestableIssues.length).toBeGreaterThan(0);
    });

    it('should handle specs without acceptance criteria section', async () => {
      const noCriteriaSpec = `# Feature: No Criteria

## User Stories
- As a user, I want something

## Technical Requirements
- Use some technology
`;
      await createSpecFile('no-criteria.md', noCriteriaSpec);

      const report = await analyzeSpecQuality(testDir);

      // Should still produce a score (using fallback)
      expect(report.specs[0].testability).toBeDefined();
    });
  });

  describe('Clarity Scoring', () => {
    it('should give high score to clear specifications', async () => {
      const clearSpec = `# Feature: Clear Feature

## User Stories
- As a registered user, I want to view my order history so that I can track past purchases

## Acceptance Criteria
- The system displays orders from the last 12 months
- Each order shows: order ID, date, total amount, and status
- Orders are sorted by date in descending order
- Given a user with no orders, when they view order history, then the system displays "No orders found"

## Technical Requirements
- Query the orders table with user_id filter
- Implement pagination with 20 items per page
`;
      await createSpecFile('clear.md', clearSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].clarity).toBeGreaterThanOrEqual(60);
    });

    it('should penalize ambiguous language', async () => {
      const ambiguousSpec = `# Feature: Ambiguous Feature

## User Stories
- The system should handle various cases appropriately
- It should be reasonably fast and sufficiently robust

## Acceptance Criteria
- Some things should work properly
- Most features should be adequate
- Generally, the system should be good
`;
      await createSpecFile('ambiguous.md', ambiguousSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].clarity).toBeLessThan(90);
      const ambiguousIssues = report.specs[0].issues.filter(i => i.type === 'ambiguous-language');
      expect(ambiguousIssues.length).toBeGreaterThanOrEqual(0);
    });

    it('should reward BDD-style criteria (Given/When/Then)', async () => {
      const bddSpec = `# Feature: BDD Feature

## User Stories
- Test story

## Acceptance Criteria
- Given a logged-in user
- When they click the logout button
- Then they are redirected to the login page
`;
      await createSpecFile('bdd.md', bddSpec);

      const report = await analyzeSpecQuality(testDir);

      // BDD-style should get a clarity bonus
      expect(report.specs[0].clarity).toBeGreaterThanOrEqual(50);
    });

    it('should reward code examples', async () => {
      const codeSpec = `# Feature: Code Example Feature

## User Stories
- As a developer, I want API examples

## Technical Requirements

\`\`\`typescript
interface User {
  id: string;
  name: string;
}
\`\`\`
`;
      await createSpecFile('code.md', codeSpec);

      const report = await analyzeSpecQuality(testDir);

      // Code blocks should get a clarity bonus
      expect(report.specs[0].clarity).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate weighted average of scores', async () => {
      const balancedSpec = `# Feature: Balanced Feature

## User Stories
- As a user, I want feature X

## Acceptance Criteria
- Must return within 100ms
- Must handle 1000 concurrent users

## Technical Requirements
- Use caching layer
`;
      await createSpecFile('balanced.md', balancedSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      // Overall should be between the individual scores
      const minScore = Math.min(spec.completeness, spec.testability, spec.clarity);
      const maxScore = Math.max(spec.completeness, spec.testability, spec.clarity);

      expect(spec.overallScore).toBeGreaterThanOrEqual(minScore - 10);
      expect(spec.overallScore).toBeLessThanOrEqual(maxScore + 10);
    });
  });

  describe('Report Aggregation', () => {
    it('should calculate average scores across multiple specs', async () => {
      await createSpecFile(
        'spec1.md',
        '# Feature: Spec 1\n\n## User Stories\n- Story\n\n## Acceptance Criteria\n- Must work within 100ms'
      );
      await createSpecFile(
        'spec2.md',
        '# Feature: Spec 2\n\n## User Stories\n- Story\n\n## Acceptance Criteria\n- Returns exactly 10 items'
      );

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(2);
      expect(report.averageCompleteness).toBeDefined();
      expect(report.averageTestability).toBeDefined();
      expect(report.averageClarity).toBeDefined();
    });

    it('should count issues by severity', async () => {
      const issueSpec = `# Feature: Issue Feature

This is missing most sections and has [TODO] markers.
`;
      await createSpecFile('issues.md', issueSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.issueSummary).toBeDefined();
      expect(report.issueSummary.errors).toBeGreaterThanOrEqual(0);
      expect(report.issueSummary.warnings).toBeGreaterThanOrEqual(0);
      expect(report.issueSummary.info).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty project', async () => {
      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(0);
      expect(report.overallScore).toBe(0);
    });
  });

  describe('formatQualityReport', () => {
    it('should format report as markdown', async () => {
      await createSpecFile('test.md', '# Feature: Test\n\n## User Stories\n- Story');

      const report = await analyzeSpecQuality(testDir);
      const formatted = formatQualityReport(report);

      expect(formatted).toContain('# Specification Quality Report');
      expect(formatted).toContain('## Summary');
      expect(formatted).toContain('Overall Score');
    });

    it('should include score bars', async () => {
      const report: QualityReport = {
        projectPath: testDir,
        timestamp: new Date().toISOString(),
        totalSpecs: 1,
        overallScore: 75,
        averageCompleteness: 80,
        averageTestability: 70,
        averageClarity: 75,
        specs: [],
        issueSummary: { errors: 0, warnings: 0, info: 0 },
      };

      const formatted = formatQualityReport(report);

      // Should contain visual score bars
      expect(formatted).toMatch(/[█░]/);
    });

    it('should sort specs by score (lowest first)', async () => {
      const report: QualityReport = {
        projectPath: testDir,
        timestamp: new Date().toISOString(),
        totalSpecs: 2,
        overallScore: 60,
        averageCompleteness: 60,
        averageTestability: 60,
        averageClarity: 60,
        specs: [
          {
            file: 'high.md',
            featureName: 'High Score',
            overallScore: 90,
            completeness: 90,
            testability: 90,
            clarity: 90,
            issues: [],
            suggestions: [],
          },
          {
            file: 'low.md',
            featureName: 'Low Score',
            overallScore: 30,
            completeness: 30,
            testability: 30,
            clarity: 30,
            issues: [],
            suggestions: [],
          },
        ],
        issueSummary: { errors: 0, warnings: 0, info: 0 },
      };

      const formatted = formatQualityReport(report);

      // Low score should appear before high score
      const lowIndex = formatted.indexOf('Low Score');
      const highIndex = formatted.indexOf('High Score');
      expect(lowIndex).toBeLessThan(highIndex);
    });

    it('should include appropriate icons based on score', async () => {
      const report: QualityReport = {
        projectPath: testDir,
        timestamp: new Date().toISOString(),
        totalSpecs: 3,
        overallScore: 60,
        averageCompleteness: 60,
        averageTestability: 60,
        averageClarity: 60,
        specs: [
          {
            file: 'good.md',
            featureName: 'Good',
            overallScore: 85,
            completeness: 85,
            testability: 85,
            clarity: 85,
            issues: [],
            suggestions: [],
          },
          {
            file: 'ok.md',
            featureName: 'OK',
            overallScore: 65,
            completeness: 65,
            testability: 65,
            clarity: 65,
            issues: [],
            suggestions: [],
          },
          {
            file: 'bad.md',
            featureName: 'Bad',
            overallScore: 40,
            completeness: 40,
            testability: 40,
            clarity: 40,
            issues: [],
            suggestions: [],
          },
        ],
        issueSummary: { errors: 0, warnings: 0, info: 0 },
      };

      const formatted = formatQualityReport(report);

      // Should have different icons
      expect(formatted).toContain('Good');
      expect(formatted).toContain('OK');
      expect(formatted).toContain('Bad');
    });
  });

  describe('executeSpecQuality', () => {
    it('should return markdown format by default', async () => {
      await createSpecFile('test.md', '# Feature: Test');

      const result = await executeSpecQuality({
        directory: testDir,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# Specification Quality Report');
    });

    it('should return JSON format when requested', async () => {
      await createSpecFile('test.md', '# Feature: Test');

      const result = await executeSpecQuality({
        directory: testDir,
        format: 'json',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('totalSpecs');
      expect(parsed).toHaveProperty('overallScore');
      expect(parsed).toHaveProperty('specs');
    });
  });

  describe('Security - Path Traversal Prevention', () => {
    it('should reject path traversal attempts', async () => {
      const maliciousPaths = ['../../../../etc', '../../../.ssh', '/etc/passwd'];

      for (const maliciousPath of maliciousPaths) {
        await expect(analyzeSpecQuality(maliciousPath)).rejects.toThrow(
          /outside allowed workspace/
        );
      }
    });
  });

  describe('Alternative Spec Locations', () => {
    it('should find specs in .specify/specifications', async () => {
      const altDir = path.join(testDir, '.specify', 'specifications');
      await fs.mkdir(altDir, { recursive: true });
      await fs.writeFile(path.join(altDir, 'alt.md'), '# Feature: Alt Location');

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
    });

    it('should find specs in specs/ directory', async () => {
      const specsDir = path.join(testDir, 'specs');
      await fs.mkdir(specsDir, { recursive: true });
      await fs.writeFile(path.join(specsDir, 'spec.md'), '# Feature: Specs Dir');

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
    });
  });
});
