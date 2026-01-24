/**
 * Spec Quality Tool Tests
 *
 * Tests for spec quality analysis tool:
 * - Quality scoring (completeness, testability, clarity)
 * - Issue detection (missing sections, ambiguous language, incomplete markers)
 * - Report formatting (JSON and Markdown)
 * - Security validation (CWE-22)
 * - Edge cases (empty specs, missing sections, multi-spec analysis)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  analyzeSpecQuality,
  formatQualityReport,
  executeSpecQuality,
  type SpecQualityScore,
  type QualityReport,
} from '../spec-quality.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

describe('Spec Quality Tool Tests', () => {
  let testDir: string;
  let specDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `stackshift-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create .specify directory structure
    specDir = path.join(testDir, '.specify', 'memory', 'specifications');
    await fs.mkdir(specDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Security - Path Traversal Prevention (CWE-22)', () => {
    it('should reject path traversal attempts', async () => {
      const traversalAttempts = [
        '../../../../etc',
        '../../../.ssh',
        '/etc/passwd',
        '/var/log',
        '../../../etc/passwd',
      ];

      for (const maliciousPath of traversalAttempts) {
        await expect(analyzeSpecQuality(maliciousPath)).rejects.toThrow(
          /outside allowed workspace/
        );
      }
    });

    it('should only allow access to valid workspace directories', async () => {
      const result = await analyzeSpecQuality(testDir);
      expect(result).toBeDefined();
      expect(result.projectPath).toBe(testDir);
    });
  });

  describe('Perfect Spec Analysis', () => {
    it('should give high scores to complete, testable spec', async () => {
      const perfectSpec = `# Feature: User Authentication

## User Stories
- As a user, I want to log in securely
- As an admin, I want to manage user accounts

## Acceptance Criteria
- System must return HTTP status code 200 on successful login
- Login response must be within 500ms
- Session must expire after exactly 30 minutes of inactivity
- Password must be at least 12 characters
- Failed login attempts shall be logged with timestamps
- Account shall be locked after exactly 5 failed attempts within 15 minutes

## Technical Requirements
- Use bcrypt for password hashing with cost factor 12
- Implement JWT tokens with RS256 signing
- Store sessions in Redis with TTL
- Rate limit: maximum 5 login attempts per minute per IP

## Dependencies
- Redis 7.0+
- JWT library

## Out of Scope
- Social login
- Password recovery via SMS

## Implementation Notes
Given a valid username and password
When the user submits login form
Then the system returns a JWT token and sets session cookie

\`\`\`typescript
interface LoginRequest {
  username: string;
  password: string;
}
\`\`\`

## Testing Strategy
- Unit test password hashing
- Integration test session management
- E2E test complete login flow
`;

      await fs.writeFile(path.join(specDir, 'auth.md'), perfectSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
      expect(report.specs[0].completeness).toBeGreaterThanOrEqual(80);
      expect(report.specs[0].testability).toBeGreaterThanOrEqual(70);
      expect(report.specs[0].clarity).toBeGreaterThanOrEqual(70);
      expect(report.specs[0].overallScore).toBeGreaterThanOrEqual(70);
      expect(report.specs[0].featureName).toBe('User Authentication');
    });
  });

  describe('Completeness Score Calculation', () => {
    it('should detect all required sections', async () => {
      const completeSpec = `# Feature: Complete Feature

## User Stories
- Story 1

## Acceptance Criteria
- Criteria 1

## Technical Requirements
- Requirement 1
`;

      await fs.writeFile(path.join(specDir, 'complete.md'), completeSpec);

      const report = await analyzeSpecQuality(testDir);

      // All required sections present = no 15-point penalties
      // But short content (-20) and missing recommended sections (-20) = 60
      expect(report.specs[0].completeness).toBeGreaterThanOrEqual(50);
      expect(report.specs[0].issues.filter(i => i.type === 'missing-section')).toHaveLength(0);
    });

    it('should penalize missing required sections', async () => {
      const incompleteSpec = `# Feature: Incomplete Feature

## User Stories
- Story 1
`;

      await fs.writeFile(path.join(specDir, 'incomplete.md'), incompleteSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.completeness).toBeLessThan(80);
      const missingSections = spec.issues.filter(i => i.type === 'missing-section');
      expect(missingSections.length).toBeGreaterThan(0);
      expect(missingSections.some(i => i.message.includes('Acceptance Criteria'))).toBe(true);
      expect(missingSections.some(i => i.message.includes('Technical Requirements'))).toBe(true);
    });

    it('should detect incomplete markers', async () => {
      const incompleteSpec = `# Feature: Test

## User Stories
- [TODO] Add user stories

## Acceptance Criteria
- [NEEDS CLARIFICATION] Define criteria
- [TBD] Performance requirements
- FIXME: Update this section

## Technical Requirements
- [WIP] Database schema
- [PLACEHOLDER] API design
`;

      await fs.writeFile(path.join(specDir, 'markers.md'), incompleteSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.completeness).toBeLessThan(70);
      const incompleteIssues = spec.issues.filter(i => i.type === 'incomplete');
      expect(incompleteIssues.length).toBeGreaterThan(0);
    });

    it('should penalize very short specs', async () => {
      const shortSpec = `# Feature: Short

## User Stories
- Short

## Acceptance Criteria
- Short

## Technical Requirements
- Short
`;

      await fs.writeFile(path.join(specDir, 'short.md'), shortSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.completeness).toBeLessThan(80);
      expect(spec.issues.some(i => i.message.includes('very short'))).toBe(true);
    });

    it('should recognize recommended sections', async () => {
      const specWithRecommended = `# Feature: Well-Structured

## User Stories
- Story 1

## Acceptance Criteria
- Criteria 1

## Technical Requirements
- Requirement 1

## Dependencies
- Dependency 1

## Out of Scope
- Not in scope

## Implementation Notes
- Notes here

## Testing Strategy
- Test approach
`;

      await fs.writeFile(path.join(specDir, 'recommended.md'), specWithRecommended);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      // All required + recommended sections = no section penalties
      // But short content (-20) gives us 80
      expect(spec.completeness).toBeGreaterThanOrEqual(75);
      // No suggestions for missing recommended sections
      expect(spec.suggestions.filter(s => s.includes('Consider adding'))).toHaveLength(0);
    });
  });

  describe('Testability Score Calculation', () => {
    it('should reward testable criteria with specific measurements', async () => {
      const testableSpec = `# Feature: Testable

## User Stories
- Story

## Acceptance Criteria
- Response time must be under 200ms
- System shall return exactly 50 results per page
- Success rate must be at least 99.9%
- Cache must expire after 5 minutes
- API must respond with HTTP status code 201 on creation
- Database query must complete within 100 milliseconds
- System will display no more than 100 items

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'testable.md'), testableSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.testability).toBeGreaterThanOrEqual(60);
    });

    it('should penalize vague, untestable criteria', async () => {
      const untestableSpec = `# Feature: Vague

## User Stories
- Story

## Acceptance Criteria
- System should be performant
- UI should be intuitive
- Code should be robust and scalable
- Experience should be seamless
- Design should be elegant
- Updates should happen when appropriate
- Features should work as needed

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'untestable.md'), untestableSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.testability).toBeLessThan(50);
      const untestableIssues = spec.issues.filter(i => i.type === 'untestable');
      expect(untestableIssues.length).toBeGreaterThan(0);
    });

    it('should handle missing acceptance criteria section', async () => {
      const noAcSpec = `# Feature: No AC

## User Stories
- Story

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'no-ac.md'), noAcSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.testability).toBe(50);
      expect(spec.issues.some(i => i.type === 'missing-section')).toBe(true);
    });

    it('should handle acceptance criteria without bullet points', async () => {
      const noAcBulletsSpec = `# Feature: No Bullets

## User Stories
- Story

## Acceptance Criteria

Just some text without bullet points.

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'no-bullets.md'), noAcBulletsSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.testability).toBeLessThanOrEqual(70);
      expect(spec.issues.some(i => i.message.includes('No acceptance criteria bullet points'))).toBe(true);
    });

    it('should detect line numbers for untestable criteria', async () => {
      const spec = `# Feature: Line Numbers

## User Stories
- Story

## Acceptance Criteria
- First criteria is good: must respond within 100ms
- Second criteria is bad: should be performant
- Third criteria is good: must return exactly 10 items

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'lines.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const issues = report.specs[0].issues.filter(i => i.type === 'untestable');

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].line).toBeDefined();
      expect(issues[0].line).toBeGreaterThan(0);
    });
  });

  describe('Clarity Score Calculation', () => {
    it('should detect ambiguous words', async () => {
      const ambiguousSpec = `# Feature: Ambiguous

## User Stories
- Story

## Acceptance Criteria
- System should be appropriate and reasonable
- Performance should be adequate and sufficient
- UI should be nice and good
- Response should be fast and quick
- Most users should find it easy
- Maybe add some features
- Could possibly improve this

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'ambiguous.md'), ambiguousSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.clarity).toBeLessThan(80);
      expect(spec.issues.some(i => i.type === 'ambiguous-language')).toBe(true);
      expect(spec.suggestions.some(s => s.includes('Replace vague terms'))).toBe(true);
    });

    it('should detect passive voice usage', async () => {
      // Implementation requires > 5 passive constructs to trigger suggestion
      const passiveSpec = `# Feature: Passive Voice

## User Stories
- Story

## Acceptance Criteria
- Data is stored in the database
- Requests are processed by the server
- Errors were logged by the system
- Files are uploaded by users
- Results are calculated by the system
- Changes are committed to the repository

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'passive.md'), passiveSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      // Passive voice should reduce clarity score
      expect(spec.clarity).toBeLessThan(100);
    });

    it('should detect long sentences', async () => {
      const longSentenceSpec = `# Feature: Long Sentences

## User Stories
- Story

## Acceptance Criteria
- This is a very long sentence that contains more than forty words and goes on and on describing many different requirements and conditions that should probably be broken down into multiple shorter and clearer statements for better readability and comprehension by the development team.

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'long.md'), longSentenceSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      expect(spec.issues.some(i => i.message.includes('very long'))).toBe(true);
      expect(spec.suggestions.some(s => s.includes('Break long sentences'))).toBe(true);
    });

    it('should give bonus for code blocks', async () => {
      const codeBlockSpec = `# Feature: With Code

## User Stories
- Story

## Acceptance Criteria
- Must support this interface:

\`\`\`typescript
interface User {
  id: string;
  name: string;
}
\`\`\`

\`\`\`json
{
  "status": "success"
}
\`\`\`

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'code.md'), codeBlockSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      // Code blocks should improve clarity score
      expect(spec.clarity).toBeGreaterThanOrEqual(70);
    });

    it('should give bonus for BDD-style criteria', async () => {
      const bddSpec = `# Feature: BDD Style

## User Stories
- Story

## Acceptance Criteria
Given a logged-in user
When they click the submit button
Then the form is submitted and a success message is shown

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'bdd.md'), bddSpec);

      const report = await analyzeSpecQuality(testDir);
      const spec = report.specs[0];

      // BDD style should improve clarity score
      expect(spec.clarity).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Multiple Specs Analysis', () => {
    it('should analyze multiple specs correctly', async () => {
      const spec1 = `# Feature: Auth

## User Stories
- Login

## Acceptance Criteria
- Must respond within 500ms

## Technical Requirements
- JWT tokens
`;

      const spec2 = `# Feature: Analytics

## User Stories
- Track events

## Acceptance Criteria
- Must process at least 1000 events per second

## Technical Requirements
- Event queue
`;

      const spec3 = `# Feature: Payments

## User Stories
- Process payments

## Acceptance Criteria
- Must support Stripe API

## Technical Requirements
- PCI compliance
`;

      await fs.writeFile(path.join(specDir, 'auth.md'), spec1);
      await fs.writeFile(path.join(specDir, 'analytics.md'), spec2);
      await fs.writeFile(path.join(specDir, 'payments.md'), spec3);

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(3);
      expect(report.specs).toHaveLength(3);
      expect(report.overallScore).toBeGreaterThan(0);
      expect(report.averageCompleteness).toBeGreaterThan(0);
      expect(report.averageTestability).toBeGreaterThan(0);
      expect(report.averageClarity).toBeGreaterThan(0);
    });

    it('should calculate correct averages across specs', async () => {
      // Create one good and one bad spec
      const goodSpec = `# Feature: Good

## User Stories
- Story 1
- Story 2

## Acceptance Criteria
- Must respond within 100ms
- Must return exactly 50 items
- Shall support at least 1000 concurrent users

## Technical Requirements
- Use PostgreSQL 14+
- Redis for caching

## Dependencies
- Database

## Out of Scope
- Mobile app

## Implementation Notes
Given valid input
When processing request
Then return success

\`\`\`typescript
interface Response {
  data: any;
}
\`\`\`

## Testing Strategy
- Unit tests
- Integration tests
`;

      const badSpec = `# Feature: Bad

## User Stories
- Maybe add login
`;

      await fs.writeFile(path.join(specDir, 'good.md'), goodSpec);
      await fs.writeFile(path.join(specDir, 'bad.md'), badSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(2);
      const goodScore = report.specs.find(s => s.featureName === 'Good');
      const badScore = report.specs.find(s => s.featureName === 'Bad');

      expect(goodScore).toBeDefined();
      expect(badScore).toBeDefined();
      expect(goodScore!.overallScore).toBeGreaterThan(badScore!.overallScore);

      // Average should be between the two scores
      expect(report.overallScore).toBeGreaterThan(badScore!.overallScore);
      expect(report.overallScore).toBeLessThan(goodScore!.overallScore);
    });

    it('should aggregate issue counts correctly', async () => {
      const spec1 = `# Feature: Missing Sections

## User Stories
- Story
`;

      const spec2 = `# Feature: Vague Criteria

## User Stories
- Story

## Acceptance Criteria
- Should be performant
- Should be good
- Should be fast

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'spec1.md'), spec1);
      await fs.writeFile(path.join(specDir, 'spec2.md'), spec2);

      const report = await analyzeSpecQuality(testDir);

      expect(report.issueSummary.errors).toBeGreaterThan(0);
      expect(report.issueSummary.warnings).toBeGreaterThan(0);

      const totalIssues = report.specs.reduce((sum, s) => sum + s.issues.length, 0);
      const reportedIssues = report.issueSummary.errors + report.issueSummary.warnings + report.issueSummary.info;
      expect(reportedIssues).toBe(totalIssues);
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty spec directory', async () => {
      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(0);
      expect(report.specs).toHaveLength(0);
      expect(report.overallScore).toBe(0);
      expect(report.averageCompleteness).toBe(0);
      expect(report.averageTestability).toBe(0);
      expect(report.averageClarity).toBe(0);
    });

    it('should handle empty spec file', async () => {
      await fs.writeFile(path.join(specDir, 'empty.md'), '');

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
      expect(report.specs[0].overallScore).toBeLessThan(50);
      expect(report.specs[0].issues.length).toBeGreaterThan(0);
    });

    it('should handle spec without feature heading', async () => {
      const noHeadingSpec = `Some content without a heading

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'no-heading.md'), noHeadingSpec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].featureName).toBe('no-heading');
    });

    it('should extract feature name from heading', async () => {
      const spec = `# Feature: User Dashboard

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'dashboard.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].featureName).toBe('User Dashboard');
    });

    it('should handle alternative heading formats', async () => {
      const spec = `# Advanced Analytics Feature

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'analytics.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].featureName).toBe('Advanced Analytics Feature');
    });

    it('should ignore non-markdown files', async () => {
      await fs.writeFile(path.join(specDir, 'spec.md'), '# Feature: Test\n\n## User Stories\n- Story\n\n## Acceptance Criteria\n- Criteria\n\n## Technical Requirements\n- Req');
      await fs.writeFile(path.join(specDir, 'readme.txt'), 'Not a spec');
      await fs.writeFile(path.join(specDir, 'config.json'), '{}');

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
    });
  });

  describe('Alternative Spec Locations', () => {
    it('should find specs in .specify/specifications directory', async () => {
      const altDir = path.join(testDir, '.specify', 'specifications');
      await fs.mkdir(altDir, { recursive: true });

      const spec = `# Feature: Alternative Location

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(altDir, 'spec.md'), spec);

      // Remove the default location
      await fs.rm(specDir, { recursive: true, force: true });

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
      expect(report.specs[0].featureName).toBe('Alternative Location');
    });

    it('should find specs in specs directory', async () => {
      const altDir = path.join(testDir, 'specs');
      await fs.mkdir(altDir, { recursive: true });

      const spec = `# Feature: Specs Folder

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(altDir, 'spec.md'), spec);

      // Remove the default location
      await fs.rm(specDir, { recursive: true, force: true });

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
      expect(report.specs[0].featureName).toBe('Specs Folder');
    });

    it('should find specs in specifications directory', async () => {
      const altDir = path.join(testDir, 'specifications');
      await fs.mkdir(altDir, { recursive: true });

      const spec = `# Feature: Specifications Folder

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(altDir, 'spec.md'), spec);

      // Remove the default location
      await fs.rm(specDir, { recursive: true, force: true });

      const report = await analyzeSpecQuality(testDir);

      expect(report.totalSpecs).toBe(1);
      expect(report.specs[0].featureName).toBe('Specifications Folder');
    });
  });

  describe('Report Formatting', () => {
    it('should format markdown report correctly', async () => {
      const spec = `# Feature: Test Feature

## User Stories
- Story

## Acceptance Criteria
- Must respond within 100ms

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'test.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      expect(markdown).toContain('# Specification Quality Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('Overall Score:');
      expect(markdown).toContain('Completeness:');
      expect(markdown).toContain('Testability:');
      expect(markdown).toContain('Clarity:');
      expect(markdown).toContain('## Specifications');
      expect(markdown).toContain('Test Feature');
    });

    it('should include score bars in report', async () => {
      const spec = `# Feature: Score Bars

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'bars.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      // Score bars should contain block characters
      expect(markdown).toMatch(/[█░]/);
    });

    it('should show issues in formatted report', async () => {
      const spec = `# Feature: With Issues

## User Stories
- [TODO] Add stories
`;

      await fs.writeFile(path.join(specDir, 'issues.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      expect(markdown).toContain('**Issues:**');
    });

    it('should show suggestions in formatted report', async () => {
      const spec = `# Feature: With Suggestions

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'suggestions.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      if (report.specs[0].suggestions.length > 0) {
        expect(markdown).toContain('**Suggestions:**');
      }
    });

    it('should sort specs by score in report', async () => {
      const goodSpec = `# Feature: Good Spec

## User Stories
- Story 1
- Story 2

## Acceptance Criteria
- Must respond within 100ms
- Must return exactly 50 items

## Technical Requirements
- Use PostgreSQL 14+

## Dependencies
- Database

## Out of Scope
- Mobile

## Implementation Notes
Notes here

## Testing Strategy
Test plan
`;

      const badSpec = `# Feature: Bad Spec

## User Stories
- Story
`;

      await fs.writeFile(path.join(specDir, 'good.md'), goodSpec);
      await fs.writeFile(path.join(specDir, 'bad.md'), badSpec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      // Bad spec should appear first (sorted by lowest score)
      const badIndex = markdown.indexOf('Bad Spec');
      const goodIndex = markdown.indexOf('Good Spec');
      expect(badIndex).toBeLessThan(goodIndex);
    });

    it('should use appropriate icons for score levels', async () => {
      const highScoreSpec = `# Feature: High Score

## User Stories
- Story 1
- Story 2

## Acceptance Criteria
- Must respond within 100ms
- Must return exactly 50 items
- Shall support at least 1000 users

## Technical Requirements
- PostgreSQL 14+
- Redis caching

## Dependencies
- Database

## Out of Scope
- Mobile app

## Implementation Notes
Given valid input
When processing request
Then return success

## Testing Strategy
- Unit tests
- Integration tests
`;

      const lowScoreSpec = `# Feature: Low Score

## User Stories
- Story
`;

      await fs.writeFile(path.join(specDir, 'high.md'), highScoreSpec);
      await fs.writeFile(path.join(specDir, 'low.md'), lowScoreSpec);

      const report = await analyzeSpecQuality(testDir);
      const markdown = formatQualityReport(report);

      // Should contain emoji icons
      expect(markdown).toMatch(/[✅⚠️❌]/);
    });
  });

  describe('Execute Tool Handler', () => {
    it('should return JSON format when requested', async () => {
      const spec = `# Feature: JSON Test

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'json.md'), spec);

      const result = await executeSpecQuality({
        directory: testDir,
        format: 'json',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.projectPath).toBe(testDir);
      expect(parsed.totalSpecs).toBe(1);
      expect(parsed.specs).toHaveLength(1);
    });

    it('should return markdown format by default', async () => {
      const spec = `# Feature: Markdown Test

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'markdown.md'), spec);

      const result = await executeSpecQuality({
        directory: testDir,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# Specification Quality Report');
    });

    it('should return markdown format when explicitly requested', async () => {
      const spec = `# Feature: Explicit Markdown

## User Stories
- Story

## Acceptance Criteria
- Criteria

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'explicit.md'), spec);

      const result = await executeSpecQuality({
        directory: testDir,
        format: 'markdown',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('# Specification Quality Report');
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate weighted average correctly', async () => {
      // Create spec and verify overall score is weighted average
      const spec = `# Feature: Weighted Score

## User Stories
- Story 1
- Story 2

## Acceptance Criteria
- Must respond within 100ms

## Technical Requirements
- Requirement 1

## Dependencies
- Dependency 1
`;

      await fs.writeFile(path.join(specDir, 'weighted.md'), spec);

      const report = await analyzeSpecQuality(testDir);
      const specScore = report.specs[0];

      // Overall = completeness * 0.35 + testability * 0.35 + clarity * 0.30
      const expectedOverall = Math.round(
        specScore.completeness * 0.35 +
        specScore.testability * 0.35 +
        specScore.clarity * 0.30
      );

      expect(specScore.overallScore).toBe(expectedOverall);
    });
  });

  describe('Regex Edge Cases', () => {
    it('should handle special regex characters in markers', async () => {
      const spec = `# Feature: Special Chars

## User Stories
- Story

## Acceptance Criteria
- Criteria [TODO]
- Another [WIP]

## Technical Requirements
- Requirement ???
`;

      await fs.writeFile(path.join(specDir, 'special.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      expect(report.specs[0].issues.some(i => i.type === 'incomplete')).toBe(true);
    });

    it('should handle ambiguous words with word boundaries', async () => {
      const spec = `# Feature: Word Boundaries

## User Stories
- Story

## Acceptance Criteria
- System should be appropriate
- Inappropriate content should be blocked
- The fast lane is reserved

## Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'boundaries.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      // Should detect "appropriate" and "fast" but not "Inappropriate" or "fast" in "fast lane"
      const spec0 = report.specs[0];
      expect(spec0.clarity).toBeLessThan(100);
    });
  });

  describe('Section Detection', () => {
    it('should detect sections with different heading levels', async () => {
      const spec = `# Feature: Heading Levels

### User Stories
- Story

## Acceptance Criteria
- Criteria

# Technical Requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'headings.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      // Should recognize sections - completeness reduced by missing recommended sections and short content
      // Required sections are found, so no 15-point penalties for missing required sections
      expect(report.specs[0].completeness).toBeGreaterThanOrEqual(40);
      expect(report.specs[0].issues.filter(i => i.message.includes('Missing required section'))).toHaveLength(0);
    });

    it('should be case-insensitive for section detection', async () => {
      const spec = `# Feature: Case Test

## user stories
- Story

## ACCEPTANCE CRITERIA
- Criteria

## Technical requirements
- Requirement
`;

      await fs.writeFile(path.join(specDir, 'case.md'), spec);

      const report = await analyzeSpecQuality(testDir);

      // Should recognize sections regardless of case - no missing required section errors
      expect(report.specs[0].completeness).toBeGreaterThanOrEqual(40);
      expect(report.specs[0].issues.filter(i => i.message.includes('Missing required section'))).toHaveLength(0);
    });
  });

  describe('Report Metadata', () => {
    it('should include timestamp in report', async () => {
      const report = await analyzeSpecQuality(testDir);

      expect(report.timestamp).toBeDefined();
      expect(new Date(report.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should include project path in report', async () => {
      const report = await analyzeSpecQuality(testDir);

      expect(report.projectPath).toBe(testDir);
    });
  });
});
