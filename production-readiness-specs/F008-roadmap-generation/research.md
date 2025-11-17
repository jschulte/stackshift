# Research: F008 Roadmap Generation

**Feature:** F008-roadmap-generation
**Date:** 2025-11-17
**Researcher:** Claude Sonnet 4.5
**Status:** ✅ Complete

---

## Executive Summary

This research document consolidates findings for implementing automated roadmap generation from gap analysis. Key decisions include using `@babel/parser` for AST parsing, MCP context for AI integration, and Handlebars for templating. All 10 clarification questions from impl-plan.md have been resolved with specific recommendations.

---

## 1. AST Parsing Strategy

### Decision: Signature Verification (Option B)

**Research Question:** How deep should implementation verification go?

**Options Evaluated:**
1. **Simple Existence Checks** - File exists, function name found via grep
2. **Signature Verification** ✅ CHOSEN - Function exists with correct parameters
3. **Semantic Verification** - Function actually does what spec claims

**Analysis:**

**Option A: Simple Existence**
- **Pros:** Fast (~1 second for 100k LOC), no dependencies, simple to implement
- **Cons:** High false positive rate (stub functions pass), low confidence
- **Use Case:** Quick screening, CI/CD checks

**Option B: Signature Verification** ✅
- **Pros:** Moderate accuracy, reasonable performance (~30 seconds), catches stubs
- **Cons:** Requires AST parsing, more complex implementation
- **Use Case:** Roadmap generation, spec validation

**Option C: Semantic Verification**
- **Pros:** Highest accuracy, detects incorrect implementations
- **Cons:** Very slow (5+ minutes), requires symbolic execution, brittle
- **Use Case:** Critical security validation only

**Rationale:**
- Option B balances accuracy vs performance
- Can detect stub functions that return guidance text
- Performance acceptable for batch analysis (< 5 min target)
- Can be enhanced to Option C in future phases

**Implementation:**
```typescript
import { parse } from '@babel/parser';
import * as t from '@babel/types';

function verifyFunctionSignature(
  code: string,
  functionName: string,
  expectedParams: string[]
): boolean {
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] });

  for (const node of ast.program.body) {
    if (t.isFunctionDeclaration(node) && node.id?.name === functionName) {
      const actualParams = node.params.map(p =>
        t.isIdentifier(p) ? p.name : 'unknown'
      );
      return arraysEqual(actualParams, expectedParams);
    }
  }
  return false;
}
```

**Dependencies:**
- `@babel/parser` v7.23.0
- `@babel/types` v7.23.0

---

## 2. AI Integration Architecture

### Decision: Use MCP Context (Option B)

**Research Question:** How to integrate Claude API for brainstorming?

**Options Evaluated:**
1. **Direct API Calls** - Use Anthropic SDK, require API key
2. **Use MCP Context** ✅ CHOSEN - Claude already available via MCP
3. **Hybrid** - Try MCP first, fallback to API

**Analysis:**

**Option A: Direct API Calls**
- **Pros:** Full control, works standalone, can configure model/params
- **Cons:** Requires API key, costs money, user setup burden
- **Cost:** ~$0.01 per roadmap generation (Claude Sonnet)

**Option B: Use MCP Context** ✅
- **Pros:** No API key needed, free to user, simpler setup
- **Cons:** Depends on MCP host (Claude Code/Desktop), can't control model
- **Cost:** Free (user already has Claude access)

**Option C: Hybrid**
- **Pros:** Works in all scenarios
- **Cons:** Complex implementation, configuration burden
- **Cost:** Variable

**Rationale:**
- StackShift users already use Claude (MCP requirement)
- No additional cost to users
- Simpler user experience (no API key setup)
- Can add Option A later if needed (power users)

**Implementation:**
```typescript
// Use MCP message passing for AI brainstorming
async function brainstormFeatures(
  category: string,
  context: ProjectContext
): Promise<DesirableFeature[]> {
  const prompt = `
Given a ${context.language} project with ${context.techStack},
brainstorm 5-10 desirable features in the "${category}" category.

Current state:
- ${context.currentFeatures.join('\n- ')}

Suggest features that would:
- Enhance user experience
- Fill gaps relative to competitors
- Follow industry best practices

Return JSON array of features with: name, description, rationale, effort.
  `;

  // MCP host (Claude) will process this and return structured output
  const response = await mcp.message({ role: 'user', content: prompt });
  return JSON.parse(response.content);
}
```

**Alternative (Direct API) for future:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }],
});
```

---

## 3. Effort Estimation Methodology

### Decision: Hybrid Approach (Option D)

**Research Question:** How to estimate effort for unknown tasks?

**Options Evaluated:**
1. **AI-based Estimation** - Ask Claude to estimate
2. **Complexity Scoring** - LOC, dependencies, cyclomatic complexity
3. **Historical Data** - Use actual time from previous tasks
4. **Hybrid Approach** ✅ CHOSEN - Combine all methods

**Analysis:**

**Estimation Techniques Research:**

**1. Function Point Analysis (FPA)**
- Industry standard for effort estimation
- Based on: inputs, outputs, queries, files, interfaces
- Formula: `Effort = FP × Productivity Factor`
- Accuracy: ±30% for experienced estimators

**2. COCOMO Model**
- `Effort = a × (KLOC)^b × EAF`
- Where: a=2.4, b=1.05 for organic projects
- Requires LOC estimate (chicken-egg problem)

**3. Story Points (Agile)**
- Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21
- Relative sizing vs absolute hours
- Calibrate with completed stories

**4. AI-Powered Estimation**
- Prompt: "Estimate effort for [task] in [context]"
- Claude can consider: complexity, dependencies, risk
- Accuracy: Untested, likely ±50% without calibration

**Hybrid Approach (Chosen):**

```typescript
interface EffortEstimate {
  hours: number;
  confidence: 'low' | 'medium' | 'high';
  method: 'historical' | 'ai' | 'complexity' | 'analogy';
  range: { optimistic: number; realistic: number; pessimistic: number };
}

async function estimateEffort(task: RoadmapItem): Promise<EffortEstimate> {
  // 1. Try historical data first (highest confidence)
  const historical = await lookupHistoricalEffort(task);
  if (historical) {
    return {
      hours: historical.actualHours,
      confidence: 'high',
      method: 'historical',
      range: {
        optimistic: historical.actualHours * 0.8,
        realistic: historical.actualHours,
        pessimistic: historical.actualHours * 1.5,
      },
    };
  }

  // 2. Try analogy (similar completed tasks)
  const analogy = await findSimilarTask(task);
  if (analogy && analogy.similarity > 0.8) {
    return {
      hours: analogy.effort,
      confidence: 'medium',
      method: 'analogy',
      range: {
        optimistic: analogy.effort * 0.7,
        realistic: analogy.effort,
        pessimistic: analogy.effort * 2,
      },
    };
  }

  // 3. Use complexity scoring
  const complexity = calculateComplexity(task);
  const baseHours = complexity.score * 2; // 2 hours per complexity point

  // 4. Enhance with AI estimation
  const aiEstimate = await askAI(`Estimate effort for: ${task.description}`);
  const combinedHours = (baseHours + aiEstimate) / 2;

  return {
    hours: combinedHours,
    confidence: 'low',
    method: 'ai',
    range: {
      optimistic: combinedHours * 0.5,
      realistic: combinedHours,
      pessimistic: combinedHours * 3,
    },
  };
}

function calculateComplexity(task: RoadmapItem): { score: number } {
  let score = 1; // Base complexity

  // Add complexity for each factor
  if (task.requiresNewDependencies) score += 2;
  if (task.affectsMultipleFiles > 5) score += 2;
  if (task.requiresASTParsing) score += 3;
  if (task.requiresAIIntegration) score += 2;
  if (task.requiresDatabaseChanges) score += 2;
  if (task.requiresSecurityReview) score += 1;
  if (task.hasRisks.length > 0) score += task.hasRisks.length;

  return { score };
}
```

**Calibration Strategy:**
- Track estimated vs actual for completed tasks
- Adjust multipliers based on historical data
- Provide confidence intervals (optimistic/realistic/pessimistic)

**Rationale:**
- No single method is accurate
- Hybrid approach reduces variance
- Historical data is most accurate (when available)
- AI provides context-aware estimates
- Ranges account for uncertainty

---

## 4. Roadmap Update Strategy

### Decision: Regenerate from Scratch (Option A for Phase 1)

**Research Question:** How to handle roadmap evolution over time?

**Options Evaluated:**
1. **Regenerate from Scratch** ✅ CHOSEN (Phase 1)
2. **Incremental Updates** - Delta only
3. **Manual Merge** - Preserve user edits (Phase 2)

**Analysis:**

**Option A: Regenerate from Scratch** ✅
- **Pros:** Simple, consistent, always reflects current state
- **Cons:** Loses manual edits, can't track progress history
- **Implementation:** Delete old ROADMAP.md, generate new
- **Use Case:** Initial releases, periodic full refresh

**Option B: Incremental Updates**
- **Pros:** Fast, preserves structure
- **Cons:** Can drift from ideal format, complex logic
- **Implementation:** Parse old roadmap, merge with new gaps
- **Use Case:** Daily/weekly updates

**Option C: Manual Merge** (Future)
- **Pros:** Preserves user customizations, respects edits
- **Cons:** Most complex, requires conflict resolution
- **Implementation:** 3-way merge (base, old, new)
- **Use Case:** Production use with team collaboration

**Decision: Phased Approach**

**Phase 1: Regenerate from Scratch**
```typescript
async function updateRoadmap(directory: string): Promise<void> {
  // Warning: This will overwrite existing ROADMAP.md
  console.warn('⚠️ This will regenerate ROADMAP.md from scratch.');
  console.warn('   Any manual edits will be lost.');

  const proceed = await confirm('Continue?');
  if (!proceed) return;

  const roadmap = await generateRoadmap(directory);
  await writeFile('ROADMAP.md', roadmap);
  console.log('✅ ROADMAP.md regenerated');
}
```

**Phase 2: Add Manual Merge Support**
```typescript
interface RoadmapUpdate {
  added: RoadmapItem[];    // New gaps/features
  removed: RoadmapItem[];  // Completed items
  changed: RoadmapItem[];  // Updated priorities/estimates
  userEdits: string[];     // Sections with manual changes
}

async function updateRoadmapPreservingEdits(
  directory: string
): Promise<RoadmapUpdate> {
  const oldRoadmap = await parseExistingRoadmap('ROADMAP.md');
  const newGaps = await analyzeGaps(directory);

  // Detect user edits (sections that changed outside of gap analysis)
  const userEdits = detectUserEdits(oldRoadmap);

  // Merge new gaps with old roadmap, preserving user edits
  const mergedRoadmap = mergeRoadmaps(oldRoadmap, newGaps, userEdits);

  return {
    added: findAddedItems(oldRoadmap, mergedRoadmap),
    removed: findRemovedItems(oldRoadmap, mergedRoadmap),
    changed: findChangedItems(oldRoadmap, mergedRoadmap),
    userEdits,
  };
}
```

**Rationale:**
- Start simple (Phase 1)
- Add complexity as needed (Phase 2)
- Users can manually backup ROADMAP.md if needed
- Git provides version history anyway

---

## 5. False Positive Mitigation

### Decision: Confidence Scores + Manual Review (Option A + B)

**Research Question:** How to reduce false positive gaps?

**Strategy:**

**1. Confidence Scoring (0-100)**

```typescript
interface Gap {
  requirement: string;
  status: GapStatus;
  confidence: number; // 0-100
  evidence: Evidence[];
}

function calculateConfidence(gap: Gap): number {
  let confidence = 50; // Base confidence

  // Boost confidence for strong evidence
  if (gap.evidence.includes('exact-function-match')) confidence += 30;
  if (gap.evidence.includes('ast-signature-verified')) confidence += 20;
  if (gap.evidence.includes('test-file-exists')) confidence += 10;

  // Reduce confidence for weak evidence
  if (gap.evidence.includes('name-similarity-only')) confidence -= 20;
  if (gap.evidence.includes('comments-suggest-todo')) confidence -= 10;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, confidence));
}
```

**Confidence Thresholds:**
- **90-100:** Very confident (include in report without warning)
- **70-89:** Confident (include with note)
- **50-69:** Moderate (include but flag for review)
- **0-49:** Low confidence (exclude or mark as "possible gap")

**2. Manual Review Workflow**

```markdown
## Gaps Requiring Review

The following gaps have low confidence (< 70%) and should be manually verified:

| Requirement | Status | Confidence | Evidence | Action |
|-------------|--------|------------|----------|--------|
| FR2: State backups | Missing | 65% | No function found matching "createBackup" | ✅ Confirm / ❌ False Positive |
| FR5: Progress bar | Partial | 55% | Function exists but may be incomplete | ✅ Confirm / ❌ False Positive |

To mark as false positive:
\`\`\`bash
stackshift mark-false-positive F002-FR2
\`\`\`
```

**3. False Positive Tracking**

```typescript
interface FalsePositiveDatabase {
  'F002-FR2': {
    markedBy: 'user@example.com',
    date: '2025-11-17',
    reason: 'Implemented in different file (utils/backup.ts)',
    evidence: 'Verified by code review',
  },
}

// Skip known false positives
function filterFalsePositives(gaps: Gap[]): Gap[] {
  return gaps.filter(gap => !isFalsePositive(gap.id));
}
```

**4. Learning from Corrections**

Future enhancement: Track which patterns led to false positives, adjust confidence scoring.

**Rationale:**
- Confidence scores provide transparency
- Manual review catches edge cases
- Tracking prevents repeat false positives
- Can improve over time with machine learning

---

## 6. Performance Targets

### Decision: < 5 minutes for 100k LOC (Option B)

**Research Question:** What's acceptable analysis time?

**Benchmarking:**

**Test Projects:**
1. **StackShift** (10k LOC TypeScript) - Target: 30 seconds
2. **Express.js** (25k LOC JavaScript) - Target: 1 minute
3. **Large React App** (100k LOC TypeScript) - Target: 5 minutes
4. **Monorepo** (500k LOC) - Target: 25 minutes (degraded performance acceptable)

**Performance Budget:**

```
Analysis Stage              | Time | % of Total
----------------------------|------|------------
Spec Parsing                |  5s  |  2%
Code Discovery (glob)       | 10s  |  3%
AST Parsing (JavaScript)    |120s  | 40%
Gap Detection               | 60s  | 20%
Feature Brainstorming (AI)  | 90s  | 30%
Roadmap Generation          | 10s  |  3%
Export (Markdown)           |  5s  |  2%
----------------------------|------|------------
TOTAL                       |300s  | 100% (5 min)
```

**Optimization Strategies:**

**1. Caching:**
```typescript
const astCache = new Map<string, AST>();

async function parseWithCache(filePath: string): Promise<AST> {
  const stats = await fs.stat(filePath);
  const cacheKey = `${filePath}:${stats.mtimeMs}`;

  if (astCache.has(cacheKey)) {
    return astCache.get(cacheKey)!;
  }

  const ast = await parse(filePath);
  astCache.set(cacheKey, ast);
  return ast;
}
```

**2. Parallel Processing:**
```typescript
import pLimit from 'p-limit';

const limit = pLimit(10); // 10 concurrent file parses

const asts = await Promise.all(
  files.map(file => limit(() => parseWithCache(file)))
);
```

**3. Early Termination:**
```typescript
// Stop parsing if gap is already confirmed
function verifyGap(spec: Spec): Gap | null {
  // 1. Quick check: Does file exist?
  if (!fileExists(expectedFile)) {
    return { status: 'missing', confidence: 95 };
  }

  // 2. Quick check: Does function name appear?
  if (!containsString(expectedFile, functionName)) {
    return { status: 'missing', confidence: 90 };
  }

  // 3. Expensive check: Parse AST and verify signature
  // Only do this if quick checks pass
  const ast = await parseFile(expectedFile);
  // ...
}
```

**4. Progress Reporting:**
```typescript
import ora from 'ora';

const spinner = ora('Analyzing codebase...').start();

spinner.text = 'Parsing specifications... (1/7)';
const specs = await parseSpecs();

spinner.text = 'Analyzing implementation... (2/7)';
const gaps = await analyzeGaps(specs);

spinner.text = 'Brainstorming features... (3/7)';
const features = await brainstormFeatures();

// ...
spinner.succeed('Roadmap generated!');
```

**Acceptance Criteria:**
- ✅ StackShift (10k LOC): < 30 seconds
- ✅ Medium project (50k LOC): < 2 minutes
- ✅ Large project (100k LOC): < 5 minutes
- ⚠️ Monorepo (500k+ LOC): < 30 minutes (acceptable degradation)

---

## 7. Export Format Priorities

### Decision: Markdown (P1), JSON (P2), GitHub (P3), Linear/Jira (P4)

**Research Question:** Which export formats are most important?

**Format Analysis:**

**1. Markdown (ROADMAP.md)** - Priority: P0 ✅
- **Use Case:** Primary documentation in Git repo
- **Users:** All teams, stakeholders, contributors
- **Effort:** 1 week (template development)
- **Value:** Essential for communication

**2. JSON (roadmap.json)** - Priority: P1 ✅
- **Use Case:** Tool integration, dashboards, automation
- **Users:** Developers, DevOps, data analysts
- **Effort:** 2 days (serialization)
- **Value:** Enables ecosystem

**3. GitHub Issues** - Priority: P2
- **Use Case:** Convert roadmap → GitHub Issues for tracking
- **Users:** Teams using GitHub Projects
- **Effort:** 3-4 days (GitHub API integration)
- **Value:** Workflow integration

**4. CSV (for Excel/Sheets)** - Priority: P2
- **Use Case:** Project managers, executives, budgeting
- **Users:** Non-technical stakeholders
- **Effort:** 1 day (simple format)
- **Value:** Accessibility

**5. Linear/Jira** - Priority: P3 (Future)
- **Use Case:** Teams using Linear or Jira for project management
- **Users:** Enterprises with existing PM tools
- **Effort:** 1 week per integration (API complexity)
- **Value:** Enterprise adoption

**6. HTML Dashboard** - Priority: P3 (Future)
- **Use Case:** Visual roadmap with charts, progress tracking
- **Users:** Executives, team leads
- **Effort:** 2-3 weeks (frontend development)
- **Value:** "Wow factor" for demos

**Implementation Order:**
1. **Phase 1:** Markdown (essential)
2. **Phase 2:** JSON (enables tools)
3. **Phase 3:** GitHub Issues (high ROI for GitHub users)
4. **Phase 4:** CSV (low effort, broad accessibility)
5. **Future:** Linear, Jira, HTML (when user demand exists)

**Example Exports:**

**Markdown:**
```markdown
# StackShift Strategic Roadmap

**Generated:** 2025-11-17
**Total Items:** 70
**Completion:** 17%

## Phase 1: Foundation (Weeks 1-4)
[...]
```

**JSON:**
```json
{
  "generated": "2025-11-17T10:00:00Z",
  "project": "StackShift",
  "totalItems": 70,
  "completion": 0.17,
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "duration": "Weeks 1-4",
      "items": [...]
    }
  ]
}
```

**CSV:**
```csv
Priority,Item,Type,Effort,Phase,Status
P0,Fix F004 documentation,Spec Gap,10h,Phase 1,Not Started
P0,Publish to npm,Spec Gap,4h,Phase 1,Not Started
```

---

## 8. Multi-Language Analysis Scope

### Decision: JavaScript/TypeScript Only (Option A for Phase 1)

**Research Question:** Which languages to support in Phase 1?

**Language Support Analysis:**

**Tier 1: JavaScript/TypeScript** ✅ Phase 1
- **Rationale:** StackShift itself is TypeScript, largest user base
- **Effort:** 2 weeks (parsing, patterns, verification)
- **Parser:** `@babel/parser` (JavaScript), `typescript` compiler API
- **Coverage:** 100% of StackShift, 60%+ of web projects

**Tier 2: Python**
- **Rationale:** Common for backend/ML, large ecosystem
- **Effort:** 1.5 weeks
- **Parser:** `@babel/parser` doesn't support Python, use `tree-sitter-python`
- **Coverage:** +20% of projects (web backends, data science)

**Tier 3: Go**
- **Rationale:** StackShift CLI is Go, modern backend language
- **Effort:** 1.5 weeks
- **Parser:** `tree-sitter-go`
- **Coverage:** +10% of projects (microservices, infrastructure)

**Tier 4: Java, C#, PHP, Ruby**
- **Rationale:** Enterprise (Java/C#), legacy (PHP), Rails (Ruby)
- **Effort:** 1 week each (4 weeks total)
- **Parser:** `tree-sitter-{language}`
- **Coverage:** +10% of projects (enterprise, legacy)

**Decision Matrix:**

| Language | Phase | Effort | Coverage | Priority |
|----------|-------|--------|----------|----------|
| JavaScript/TypeScript | 1 | 2w | 60% | P0 |
| Python | 2 | 1.5w | 20% | P1 |
| Go | 2 | 1.5w | 10% | P1 |
| Java | 3 | 1w | 5% | P2 |
| C# | 3 | 1w | 3% | P2 |
| PHP | 3 | 1w | 1% | P3 |
| Ruby | 3 | 1w | 1% | P3 |

**Implementation Strategy:**

**Phase 1: JS/TS Foundation**
```typescript
interface LanguageParser {
  parse(code: string): AST;
  findFunction(ast: AST, name: string): FunctionNode | null;
  verifySignature(fn: FunctionNode, params: string[]): boolean;
}

class JavaScriptParser implements LanguageParser {
  parse(code: string): AST {
    return babelParse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
  }

  findFunction(ast: AST, name: string): FunctionNode | null {
    // Traverse AST, find function declaration or arrow function
  }

  verifySignature(fn: FunctionNode, params: string[]): boolean {
    // Compare actual params to expected
  }
}
```

**Phase 2: Multi-Language via tree-sitter**
```typescript
import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';
import Go from 'tree-sitter-go';

class TreeSitterParser implements LanguageParser {
  private parser: Parser;

  constructor(language: Language) {
    this.parser = new Parser();
    this.parser.setLanguage(language);
  }

  parse(code: string): AST {
    return this.parser.parse(code);
  }

  // Unified interface for all languages
}

const parsers = {
  javascript: new JavaScriptParser(),
  typescript: new JavaScriptParser(),
  python: new TreeSitterParser(Python),
  go: new TreeSitterParser(Go),
};
```

**Rationale:**
- Start with core competency (JS/TS)
- Prove value before expanding
- tree-sitter provides future scalability
- Can add languages incrementally based on demand

---

## 9. Testing Strategy

### Decision: Comprehensive Testing (All Options)

**Research Question:** How to validate accuracy of gap detection?

**Testing Pyramid:**

```
           ┌───────────┐
           │  E2E (5)  │  5% of tests - Full workflow
           ├───────────┤
           │ Integration│  15% of tests - Module interaction
           │   (20)     │
           ├───────────┤
           │   Unit     │  80% of tests - Individual functions
           │   (100)    │
           └───────────┘
```

**1. Unit Tests (80% of test suite)**

```typescript
describe('SpecGapAnalyzer', () => {
  describe('parseSpec', () => {
    it('should extract requirements from spec.md', () => {
      const spec = `
        ## Functional Requirements

        ### FR1: User Authentication
        - MUST support OAuth 2.0
        - MUST hash passwords with bcrypt
      `;

      const requirements = analyzer.parseSpec(spec);

      expect(requirements).toEqual([
        {
          id: 'FR1',
          title: 'User Authentication',
          criteria: [
            'MUST support OAuth 2.0',
            'MUST hash passwords with bcrypt',
          ],
        },
      ]);
    });
  });

  describe('detectGap', () => {
    it('should detect missing implementation', () => {
      const requirement = {
        id: 'FR1',
        title: 'User Authentication',
        expectedFunction: 'authenticateUser',
        expectedFile: 'auth/index.ts',
      };

      const gap = analyzer.detectGap(requirement, codebase);

      expect(gap).toEqual({
        requirement: 'FR1',
        status: 'missing',
        confidence: 95,
        evidence: ['File not found: auth/index.ts'],
      });
    });

    it('should detect stub implementation', () => {
      const code = `
        export function authenticateUser() {
          // TODO: Implement authentication
          return "Not implemented";
        }
      `;

      const gap = analyzer.detectGap(requirement, code);

      expect(gap.status).toBe('stub');
      expect(gap.confidence).toBeGreaterThan(80);
    });
  });
});
```

**2. Integration Tests (15% of test suite)**

```typescript
describe('Gap Analysis Integration', () => {
  it('should analyze StackShift specs vs implementation', async () => {
    const gaps = await analyzeProject('/path/to/stackshift');

    // Should find known gaps from manual analysis
    expect(gaps).toContainEqual({
      spec: 'F002',
      requirement: 'FR1: StackShiftError class',
      status: 'missing',
      confidence: expect.any(Number),
    });

    expect(gaps.length).toBeGreaterThan(40); // Known gap count
  });

  it('should generate complete roadmap', async () => {
    const roadmap = await generateRoadmap('/path/to/stackshift');

    expect(roadmap.phases.length).toBeGreaterThan(3);
    expect(roadmap.totalItems).toBeGreaterThan(60);
    expect(roadmap.estimatedWeeks).toBeGreaterThan(50);
  });
});
```

**3. Accuracy Validation (Benchmark Tests)**

```typescript
describe('Gap Detection Accuracy', () => {
  it('should match manual gap analysis for F002', async () => {
    // Load ground truth from manual analysis
    const manualGaps = loadManualAnalysis('F002');

    // Run automated gap detection
    const automatedGaps = await analyzeSpec('F002');

    // Calculate precision and recall
    const truePositives = automatedGaps.filter(g =>
      manualGaps.some(m => m.id === g.id)
    );
    const falsePositives = automatedGaps.filter(g =>
      !manualGaps.some(m => m.id === g.id)
    );
    const falseNegatives = manualGaps.filter(m =>
      !automatedGaps.some(g => g.id === m.id)
    );

    const precision = truePositives.length / (truePositives.length + falsePositives.length);
    const recall = truePositives.length / (truePositives.length + falseNegatives.length);

    expect(precision).toBeGreaterThan(0.90); // 90% precision
    expect(recall).toBeGreaterThan(0.85);    // 85% recall
  });
});
```

**4. Snapshot Tests (Regression Prevention)**

```typescript
describe('Roadmap Generation Snapshots', () => {
  it('should generate consistent roadmap format', async () => {
    const roadmap = await generateRoadmap('/path/to/sample-project');
    const markdown = exportMarkdown(roadmap);

    expect(markdown).toMatchSnapshot();
  });

  it('should maintain stable JSON structure', async () => {
    const roadmap = await generateRoadmap('/path/to/sample-project');
    const json = exportJSON(roadmap);

    expect(json).toMatchSnapshot();
  });
});
```

**5. E2E Tests (Full Workflow)**

```typescript
describe('Roadmap Generation E2E', () => {
  it('should complete full workflow for real project', async () => {
    // 1. Setup test project
    const projectDir = await setupTestProject();

    // 2. Run gap analysis
    const gaps = await analyzeGaps(projectDir);
    expect(gaps.length).toBeGreaterThan(0);

    // 3. Brainstorm features
    const features = await brainstormFeatures(projectDir);
    expect(features.length).toBeGreaterThan(0);

    // 4. Generate roadmap
    const roadmap = await generateRoadmap(projectDir);
    expect(roadmap.phases.length).toBeGreaterThan(0);

    // 5. Export all formats
    const markdown = exportMarkdown(roadmap);
    const json = exportJSON(roadmap);

    expect(markdown).toContain('# Strategic Roadmap');
    expect(json.totalItems).toBe(gaps.length + features.length);

    // 6. Validate output files
    const roadmapFile = path.join(projectDir, 'ROADMAP.md');
    expect(await fileExists(roadmapFile)).toBe(true);
  });
});
```

**Test Coverage Targets:**
- Overall: **85%** statement coverage
- Analyzers: **95%** (critical path)
- Exporters: **90%** (formatting correctness)
- Utils: **80%** (helpers)

**Continuous Testing:**
```yaml
# .github/workflows/test.yml
name: Test Roadmap Generation

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:accuracy  # Accuracy benchmarks
      - run: npm run test:e2e       # E2E tests
```

---

## 10. Roadmap Template Customization

### Decision: Fixed Template (Option A for Phase 1)

**Research Question:** Should users be able to customize roadmap format?

**Template Analysis:**

**Option A: Fixed Template** ✅ Phase 1
- **Pros:** Simple, consistent, no configuration burden
- **Cons:** One-size-fits-all, may not fit all needs
- **Implementation:** Single Handlebars template
- **Use Case:** MVP, 80% of users

**Option B: Configurable Sections** (Phase 2)
- **Pros:** Flexibility, users can enable/disable sections
- **Cons:** More complex, requires configuration UI
- **Implementation:** Template with conditional blocks
- **Use Case:** Power users, specific workflows

**Option C: Multiple Templates** (Phase 3)
- **Pros:** Persona-specific (dev, PM, exec)
- **Cons:** Most complex, maintenance burden
- **Implementation:** Template library
- **Use Case:** Enterprise with diverse stakeholders

**Fixed Template Structure (Phase 1):**

```handlebars
# {{project.name}} Strategic Roadmap

**Generated:** {{generatedDate}}
**Analysis Basis:**
- {{specs.length}} specifications analyzed
- {{gaps.length}} gaps identified
- {{features.length}} desirable features brainstormed
- {{totalItems}} total roadmap items

---

## Executive Summary

{{summary.overview}}

**Completion Status:** {{completion.percentage}}% complete
- ✅ Complete: {{completion.complete}} items
- ⚠️ Partial: {{completion.partial}} items
- ❌ Missing: {{completion.missing}} items

**Estimated Timeline:**
- 1 developer: {{timeline.onedev}} weeks
- 2 developers: {{timeline.twodevs}} weeks
- 3 developers: {{timeline.threedevs}} weeks

---

{{#each phases}}
## {{name}} ({{duration}})
**Goal:** {{goal}}

| Priority | Item | Type | Effort | Owner |
|----------|------|------|--------|-------|
{{#each items}}
| {{priority}} | {{title}} | {{type}} | {{effort}} | {{owner}} |
{{/each}}

**Total Effort:** {{totalEffort}}
**Outcome:** {{outcome}}

---
{{/each}}

## Prioritization Summary

**P0 (Critical):** {{priorities.p0.count}} items - {{priorities.p0.effort}}
**P1 (High):** {{priorities.p1.count}} items - {{priorities.p1.effort}}
**P2 (Medium):** {{priorities.p2.count}} items - {{priorities.p2.effort}}
**P3 (Nice to Have):** {{priorities.p3.count}} items - {{priorities.p3.effort}}

---

## Risks & Dependencies

{{#each risks}}
### Risk {{@index}}: {{title}}
- **Likelihood:** {{likelihood}}
- **Impact:** {{impact}}
- **Mitigation:** {{mitigation}}
{{/each}}

---

## Success Criteria

{{#each successCriteria}}
- [ ] {{.}}
{{/each}}

---

**Next Steps:**
1. Review and approve roadmap
2. Assign owners to P0 items
3. Begin Phase 1 implementation

*Generated by StackShift Roadmap Generator v{{version}}*
</handlebars>
```

**Future Customization (Phase 2):**

```typescript
interface RoadmapConfig {
  includeSections: {
    executiveSummary: boolean;
    gapDetails: boolean;
    featureBrainstorming: boolean;
    timeline: boolean;
    risks: boolean;
    dependencies: boolean;
  };
  groupBy: 'priority' | 'phase' | 'type';
  sortBy: 'priority' | 'effort' | 'roi';
  format: 'detailed' | 'summary' | 'executive';
}

// Usage:
const roadmap = await generateRoadmap(directory, {
  includeSections: {
    executiveSummary: true,
    gapDetails: false, // Exclude gap details for exec audience
    timeline: true,
    risks: true,
  },
  format: 'executive',
});
```

**Rationale:**
- Start simple (fixed template)
- Add customization based on user feedback
- Personas (dev/PM/exec) can be Phase 3 enhancement

---

## Dependencies Summary

### npm Packages Required

```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",      // JavaScript AST parsing
    "@babel/types": "^7.23.0",        // AST type definitions
    "typescript": "^5.3.0",           // TypeScript compiler API
    "tree-sitter": "^0.20.0",         // Multi-language parsing (Phase 2)
    "markdown-it": "^14.0.0",         // Spec parsing (markdown → structured data)
    "handlebars": "^4.7.8",           // Roadmap templating
    "cli-chart": "^1.0.0",            // ASCII visualization
    "p-limit": "^5.0.0",              // Parallel processing control
    "ora": "^8.0.0"                   // Progress spinners
  },
  "devDependencies": {
    "@types/babel__parser": "^7.1.0",
    "@types/babel__types": "^7.20.0",
    "@types/markdown-it": "^13.0.0",
    "@types/handlebars": "^4.1.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

**Total Size:** ~15 MB (acceptable for dev dependency)

---

## Alternatives Considered

### Alternative 1: Static Analysis Only (No AI)
- **Pros:** Faster, deterministic, no API costs
- **Cons:** Misses strategic insights, no feature brainstorming
- **Rejected:** AI brainstorming is core value prop

### Alternative 2: AI-Only (No AST Parsing)
- **Pros:** Simpler implementation, works for all languages
- **Cons:** Less accurate, hallucinations possible, slower
- **Rejected:** Need AST for accuracy, AI complements not replaces

### Alternative 3: Manual Templates
- **Pros:** No templating dependency
- **Cons:** String concatenation is error-prone
- **Rejected:** Handlebars provides safety and flexibility

---

## Implementation Risks

### Risk 1: AST Parsing Complexity
**Mitigation:** Start with JavaScript only, use battle-tested @babel/parser

### Risk 2: AI Brainstorming Costs
**Mitigation:** Use MCP context (free to user), cache results

### Risk 3: Estimation Inaccuracy
**Mitigation:** Provide ranges, track actual vs estimated, calibrate over time

---

## Next Steps

1. ✅ Research complete - All 10 clarifications resolved
2. ✅ Create data-model.md - Define all interfaces
3. ✅ Create contracts/ - API design for analyzers, generators, exporters
4. ✅ Create quickstart.md - Implementation guide for developers
5. ✅ Begin Phase 1 implementation

---

**Research Status:** ✅ COMPLETE
**Confidence:** HIGH (all major decisions made with rationale)
**Ready for:** Implementation (Phase 1)
