/**
 * Tests for SpecGenerator
 */

import { SpecGenerator, ExtractionError, MarkdownDocument, Feature } from '../spec-generator';
import { MarkdownParser } from '../markdown-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

describe('SpecGenerator', () => {
  let generator: SpecGenerator;
  let parser: MarkdownParser;

  beforeEach(() => {
    generator = new SpecGenerator();
    parser = new MarkdownParser();
  });

  // Helper to create MarkdownDocument from content
  async function createDocument(content: string, filePath: string = 'test.md'): Promise<MarkdownDocument> {
    const nodes = parser.parse(content);
    const stats = { size: content.length, mtime: new Date() };
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    return {
      filePath,
      content,
      nodes,
      metadata: {
        fileName: path.basename(filePath),
        fileSize: stats.size,
        lastModified: stats.mtime,
        checksum,
      },
    };
  }

  describe('extractConstitution', () => {
    it('should extract constitution data for greenfield route', async () => {
      const content = `# Functional Specification

## Purpose

This is a sample application that demonstrates the core principles of modern web development.

## Core Values

- Security first
- User-friendly design
- Scalable architecture
- Data-driven decisions
- Code quality

## Performance

- Page load time: < 2 seconds
- API response time: < 200ms

## Scalability

Horizontal scaling via load balancer

## Code Quality

All code must pass linting and type checking

## Testing

Minimum 80% test coverage required

## Security

HTTPS only, CSRF protection, rate limiting

## Documentation

All APIs must be documented
`;

      const doc = await createDocument(content);
      const constitution = await generator.extractConstitution(doc, 'greenfield');

      expect(constitution.route).toBe('greenfield');
      expect(constitution.purpose).toContain('sample application');
      expect(constitution.purpose.length).toBeGreaterThanOrEqual(50);
      expect(constitution.values).toHaveLength(5);
      expect(constitution.values).toContain('Security first');
      expect(constitution.technicalStack).toBeUndefined();
      expect(constitution.developmentStandards.length).toBeGreaterThanOrEqual(3);
      expect(constitution.qualityMetrics.length).toBeGreaterThanOrEqual(2);
      expect(constitution.governance).toBeDefined();
    });

    it('should extract constitution data for brownfield route with technical stack', async () => {
      const content = `# Functional Specification

## Purpose

A legacy application being modernized with new features and improved architecture.

## Values

- Backward compatibility
- Incremental improvements
- Test coverage
- Performance optimization

## Technical Stack

- Frontend: React 18.2, TypeScript
- Backend: Node.js 18, Express 4.18
- Database: PostgreSQL 15
- Infrastructure: AWS Lambda
- Build Tools: Vite, ESBuild

## Performance

- Page load time: < 2 seconds

## Scalability

Database read replicas

## Code Quality

ESLint and Prettier required

## Testing

Unit and integration tests required

## Security

JWT authentication, input sanitization
`;

      const doc = await createDocument(content);
      const constitution = await generator.extractConstitution(doc, 'brownfield');

      expect(constitution.route).toBe('brownfield');
      expect(constitution.technicalStack).toBeDefined();
      expect(constitution.technicalStack?.languages.length).toBeGreaterThan(0);
      expect(constitution.developmentStandards.length).toBeGreaterThanOrEqual(3);
    });

    it('should throw error if purpose is too short', async () => {
      const content = `# Functional Specification

## Purpose

Too short

## Values

- Value 1
- Value 2
- Value 3

## Code Quality

Standards

## Testing

Test

## Security

Secure
`;

      const doc = await createDocument(content);
      await expect(generator.extractConstitution(doc, 'greenfield')).rejects.toThrow(ExtractionError);
      await expect(generator.extractConstitution(doc, 'greenfield')).rejects.toThrow('50-500 characters');
    });

    it('should throw error if not enough core values', async () => {
      const content = `# Functional Specification

## Purpose

${'A'.repeat(100)}

## Values

- Value 1
- Value 2

## Code Quality

Standards

## Testing

Test

## Security

Secure
`;

      const doc = await createDocument(content);
      await expect(generator.extractConstitution(doc, 'greenfield')).rejects.toThrow(ExtractionError);
      await expect(generator.extractConstitution(doc, 'greenfield')).rejects.toThrow('3-10 core values');
    });

    it('should throw error if brownfield route missing technical stack', async () => {
      const content = `# Functional Specification

## Purpose

${'A'.repeat(100)}

## Values

- Value 1
- Value 2
- Value 3

## Code Quality

Standards

## Testing

Test

## Security

Secure
`;

      const doc = await createDocument(content);
      await expect(generator.extractConstitution(doc, 'brownfield')).rejects.toThrow(ExtractionError);
      await expect(generator.extractConstitution(doc, 'brownfield')).rejects.toThrow('Technical stack required');
    });
  });

  describe('extractFeatures', () => {
    it('should extract features from functional specification', async () => {
      const content = `# Functional Specification

## Features

### User Authentication

Allows users to register and log in to the application.

As a user, I want to register an account, so that I can save my preferences.
As a user, I want to log in with my credentials, so that I can access my dashboard.

**Acceptance Criteria:**
- [x] User can register with email and password
- [x] User can log in with valid credentials
- [ ] User can reset forgotten password

**Technical Requirements:**
- JWT tokens with 24-hour expiry
- bcrypt password hashing

### Content Management

Enables users to create and edit content.

As a content creator, I want to write articles, so that I can share information.

**Acceptance Criteria:**
- [x] Users can create new articles
- [ ] Users can edit existing articles
`;

      const doc = await createDocument(content);
      const features = await generator.extractFeatures(doc);

      expect(features).toHaveLength(2);

      const auth = features[0];
      expect(auth.id).toBe('001');
      expect(auth.name).toBe('User Authentication');
      expect(auth.slug).toBe('user-authentication');
      expect(auth.description).toContain('register and log in');
      expect(auth.userStories).toHaveLength(2);
      expect(auth.userStories[0].role).toBe('user');
      expect(auth.userStories[0].goal).toContain('register an account');
      expect(auth.acceptanceCriteria).toHaveLength(3);
      expect(auth.acceptanceCriteria[0].checked).toBe(true);
      expect(auth.acceptanceCriteria[2].checked).toBe(false);

      const content2 = features[1];
      expect(content2.id).toBe('002');
      expect(content2.name).toBe('Content Management');
      expect(content2.slug).toBe('content-management');
    });

    it('should detect feature status from tech debt doc', async () => {
      const funcSpecContent = `# Functional Specification

## Features

### User Authentication

User login and registration

### Payment Processing

Payment handling
`;

      const techDebtContent = `# Technical Debt Analysis

## User Authentication

✅ COMPLETE

What exists:
- Full authentication implementation
- JWT tokens
- Password hashing

## Payment Processing

⚠️ PARTIAL

What exists:
- Basic payment flow

What's missing:
- Refund handling
- Subscription support
`;

      const funcDoc = await createDocument(funcSpecContent);
      const debtDoc = await createDocument(techDebtContent);

      const features = await generator.extractFeatures(funcDoc, debtDoc);

      expect(features[0].status).toBe('✅ COMPLETE');
      expect(features[1].status).toBe('⚠️ PARTIAL');
    });

    it('should throw error if no Features section found', async () => {
      const content = `# Functional Specification

## Purpose

Some content
`;

      const doc = await createDocument(content);
      await expect(generator.extractFeatures(doc)).rejects.toThrow(ExtractionError);
      await expect(generator.extractFeatures(doc)).rejects.toThrow('No Features section found');
    });

    it('should throw error if no feature headings found', async () => {
      const content = `# Functional Specification

## Features

Some text but no feature headings
`;

      const doc = await createDocument(content);
      await expect(generator.extractFeatures(doc)).rejects.toThrow(ExtractionError);
      await expect(generator.extractFeatures(doc)).rejects.toThrow('No feature headings found');
    });
  });

  describe('detectStatus', () => {
    it('should detect COMPLETE status from explicit marker', async () => {
      const content = `# Technical Debt

## User Authentication

✅ COMPLETE

Fully implemented
`;

      const doc = await createDocument(content);
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature, doc);
      expect(status).toBe('✅ COMPLETE');
    });

    it('should detect PARTIAL status from explicit marker', async () => {
      const content = `# Technical Debt

## User Authentication

⚠️ PARTIAL

Some implementation exists
`;

      const doc = await createDocument(content);
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature, doc);
      expect(status).toBe('⚠️ PARTIAL');
    });

    it('should detect MISSING status from explicit marker', async () => {
      const content = `# Technical Debt

## User Authentication

❌ MISSING

No implementation
`;

      const doc = await createDocument(content);
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature, doc);
      expect(status).toBe('❌ MISSING');
    });

    it('should detect PARTIAL from "What exists" and "What\'s missing" sections', async () => {
      const content = `# Technical Debt

## User Authentication

What exists:
- Login endpoint
- JWT tokens

What's missing:
- Password reset
- 2FA
`;

      const doc = await createDocument(content);
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature, doc);
      expect(status).toBe('⚠️ PARTIAL');
    });

    it('should detect COMPLETE from acceptance criteria', async () => {
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [
          { description: 'Criterion 1', checked: true, testable: true },
          { description: 'Criterion 2', checked: true, testable: true },
        ],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature);
      expect(status).toBe('✅ COMPLETE');
    });

    it('should detect PARTIAL from partially checked acceptance criteria', async () => {
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [
          { description: 'Criterion 1', checked: true, testable: true },
          { description: 'Criterion 2', checked: false, testable: true },
        ],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature);
      expect(status).toBe('⚠️ PARTIAL');
    });

    it('should return MISSING if no debt doc provided', async () => {
      const feature: Feature = {
        id: '001',
        name: 'User Authentication',
        slug: 'user-authentication',
        description: 'Auth feature',
        userStories: [],
        acceptanceCriteria: [],
        status: '❌ MISSING',
        dependencies: [],
        sourceSection: { type: 'heading', level: 2, content: 'User Authentication' },
      };

      const status = generator.detectStatus(feature);
      expect(status).toBe('❌ MISSING');
    });
  });

  describe('generatePlans', () => {
    it('should generate plans only for incomplete features', async () => {
      const features: Feature[] = [
        {
          id: '001',
          name: 'Complete Feature',
          slug: 'complete-feature',
          description: 'Already done',
          userStories: [],
          acceptanceCriteria: [],
          status: '✅ COMPLETE',
          dependencies: [],
          sourceSection: { type: 'heading', level: 2, content: 'Complete Feature' },
        },
        {
          id: '002',
          name: 'Partial Feature',
          slug: 'partial-feature',
          description: 'Needs work',
          userStories: [
            {
              role: 'user',
              goal: 'do something',
              benefit: 'get value',
              raw: 'As a user, I want to do something, so that I can get value.',
            },
          ],
          acceptanceCriteria: [
            { description: 'Criterion 1', checked: false, testable: true },
          ],
          status: '⚠️ PARTIAL',
          dependencies: [],
          sourceSection: { type: 'heading', level: 2, content: 'Partial Feature' },
        },
      ];

      const plans = await generator.generatePlans(features);

      expect(plans.size).toBe(1);
      expect(plans.has('001')).toBe(false);
      expect(plans.has('002')).toBe(true);

      const plan = plans.get('002')!;
      expect(plan.featureId).toBe('002');
      expect(plan.featureName).toBe('Partial Feature');
      expect(plan.tasks.length).toBeGreaterThan(0);
      expect(plan.risks.length).toBeGreaterThan(0);
      expect(plan.estimatedEffort).toBeTruthy();
    });

    it('should include current state from debt doc for partial features', async () => {
      const techDebtContent = `# Technical Debt

## Partial Feature

What exists:
- Basic implementation
- Some tests

What's missing:
- Advanced features
- Complete test coverage
`;

      const debtDoc = await createDocument(techDebtContent);

      const features: Feature[] = [
        {
          id: '001',
          name: 'Partial Feature',
          slug: 'partial-feature',
          description: 'Needs work',
          userStories: [],
          acceptanceCriteria: [],
          status: '⚠️ PARTIAL',
          dependencies: [],
          sourceSection: { type: 'heading', level: 2, content: 'Partial Feature' },
        },
      ];

      const plans = await generator.generatePlans(features, debtDoc);
      const plan = plans.get('001')!;

      expect(plan.currentState).toContain('Basic implementation');
    });

    it('should generate tasks based on user stories', async () => {
      const features: Feature[] = [
        {
          id: '001',
          name: 'Feature',
          slug: 'feature',
          description: 'Description',
          userStories: [
            {
              role: 'user',
              goal: 'create account',
              benefit: 'save data',
              raw: 'As a user, I want to create account, so that I can save data.',
            },
            {
              role: 'user',
              goal: 'log in',
              benefit: 'access data',
              raw: 'As a user, I want to log in, so that I can access data.',
            },
          ],
          acceptanceCriteria: [],
          status: '❌ MISSING',
          dependencies: [],
          sourceSection: { type: 'heading', level: 2, content: 'Feature' },
        },
      ];

      const plans = await generator.generatePlans(features);
      const plan = plans.get('001')!;

      expect(plan.tasks.length).toBeGreaterThanOrEqual(4); // Design + 2 user stories + testing + docs
      expect(plan.tasks.some((t) => t.description.includes('create account'))).toBe(true);
      expect(plan.tasks.some((t) => t.description.includes('log in'))).toBe(true);
    });
  });

  describe('integration with fixture files', () => {
    it('should extract features from sample-functional-spec.md', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'sample-functional-spec.md');
      const content = await fs.readFile(fixturePath, 'utf-8');
      const doc = await createDocument(content, fixturePath);

      const features = await generator.extractFeatures(doc);

      expect(features.length).toBeGreaterThan(0);
      expect(features[0].name).toBe('User Authentication');
      expect(features[0].userStories.length).toBeGreaterThan(0);
      expect(features[0].acceptanceCriteria.length).toBeGreaterThan(0);
    });

    it('should extract features and detect status with tech debt doc', async () => {
      const funcSpecPath = path.join(__dirname, 'fixtures', 'sample-functional-spec.md');
      const techDebtPath = path.join(__dirname, 'fixtures', 'sample-tech-debt.md');

      const funcContent = await fs.readFile(funcSpecPath, 'utf-8');
      const techContent = await fs.readFile(techDebtPath, 'utf-8');

      const funcDoc = await createDocument(funcContent, funcSpecPath);
      const techDoc = await createDocument(techContent, techDebtPath);

      const features = await generator.extractFeatures(funcDoc, techDoc);

      expect(features.length).toBeGreaterThan(0);
      // At least one feature should have a detected status
      expect(features.some((f) => f.status !== '❌ MISSING')).toBe(true);
    });
  });
});
