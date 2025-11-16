# Test Documentation: StackShift

**Date:** 2025-11-16  
**Version:** 1.0.0  
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

StackShift uses Vitest for testing with V8 coverage reporting. Current test coverage is ~30% (3 test files, 67+ test cases). Target coverage is 80%.

---

## Test Framework

**Framework:** Vitest 1.0+  
**Runner:** Vitest CLI  
**Coverage:** V8 (native)  
**Assertions:** Vitest assertions (Jest-compatible)  
**Mocking:** Vitest mocking utilities  

**Configuration:** `mcp-server/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.config.ts']
    }
  }
});
```

---

## Current Test Coverage

### Test Suites

**1. security.test.ts** (214 lines, 18 tests)
- Path traversal protection (CWE-22)
- Command injection protection (CWE-78)
- File path validation
- Route validation
- Clarifications strategy validation
- Implementation scope validation

**2. state-manager.test.ts** (261 lines, 15 tests)
- State initialization
- State validation (prototype pollution, structure)
- Atomic operations (TOCTOU prevention)
- Concurrent updates (10 parallel)
- Step management
- State persistence

**3. analyze.security.test.ts** (251 lines, 15+ tests)
- Command injection prevention (integration)
- Path traversal prevention (integration)
- Input validation
- State file security
- Race condition prevention (5 concurrent calls)
- Tech stack detection security
- File counting security

**Total:** 67+ test cases

---

### Coverage Breakdown

| Component | Coverage | Tests | Status |
|-----------|----------|-------|--------|
| security.ts | 100% | 18 | ✅ |
| state-manager.ts | 100% | 15 | ✅ |
| analyze.ts | 90% | 15+ | ✅ |
| reverse-engineer.ts | 0% | 0 | ❌ |
| create-specs.ts | 0% | 0 | ❌ |
| gap-analysis.ts | 0% | 0 | ❌ |
| complete-spec.ts | 0% | 0 | ❌ |
| implement.ts | 0% | 0 | ❌ |
| cruise-control.ts | 0% | 0 | ❌ |
| file-utils.ts | 0% | 0 | ❌ |
| skill-loader.ts | 0% | 0 | ❌ |

**Overall:** ~30% coverage

---

## Test Commands

```bash
cd mcp-server

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Security tests only
npm run test:security

# Single test file
npm test -- security.test.ts

# Specific test
npm test -- -t "prevents path traversal"
```

---

## Test Patterns

### Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionToTest } from '../module';

describe('Module: functionToTest', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do expected behavior', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(() => functionToTest(invalidInput)).toThrow('Error message');
  });
});
```

---

### Integration Test Pattern

```typescript
describe('Tool: stackshift_analyze', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test files
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' })
    );
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('analyzes project and creates state', async () => {
    const result = await analyzeToolHandler({ 
      directory: testDir,
      route: 'brownfield'
    });

    expect(result.content[0].text).toContain('Analysis Complete');
    
    const state = await new StateManager(testDir).load();
    expect(state.path).toBe('brownfield');
  });
});
```

---

### Security Test Pattern

```typescript
describe('Security: Path Traversal Prevention', () => {
  const validator = createDefaultValidator();

  it('rejects parent directory traversal', () => {
    expect(() => {
      validator.validateDirectory('../../../../etc');
    }).toThrow('Path traversal attempt detected');
  });

  it('rejects absolute paths outside workspace', () => {
    expect(() => {
      validator.validateDirectory('/etc/passwd');
    }).toThrow('Path is outside allowed workspace');
  });

  it('accepts valid relative path', () => {
    const result = validator.validateDirectory('./subdir');
    expect(result).toContain(process.cwd());
  });
});
```

---

### Concurrency Test Pattern

```typescript
describe('Concurrency: State Manager', () => {
  it('handles 10 concurrent updates', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      stateManager.update(state => ({
        ...state,
        metadata: { ...state.metadata, counter: i }
      }))
    );

    await Promise.all(promises);

    const finalState = await stateManager.load();
    expect(finalState.metadata).toHaveProperty('counter');
    expect(finalState.metadata.counter).toBeGreaterThanOrEqual(0);
    expect(finalState.metadata.counter).toBeLessThan(10);
  });
});
```

---

## Required Test Additions

### Priority: High (P0)

**reverse-engineer.ts Tests:**
```typescript
- should create docs/reverse-engineering/ directory
- should load state and verify route
- should return route-specific guidance (greenfield vs brownfield)
- should mark step as completed
- should advance to create-specs
```

**create-specs.ts Tests:**
```typescript
- should verify reverse-engineer completed
- should provide Spec Kit initialization guidance
- should return route-specific constitution template
- should mark step as completed
```

**gap-analysis.ts Tests:**
```typescript
- should verify create-specs completed
- should provide /speckit.analyze guidance
- should return expected outcomes by route
- should mark step as completed
```

**complete-spec.ts Tests:**
```typescript
- should validate clarifications array (max 100)
- should validate clarification strings (max 5000 chars)
- should accept valid clarifications
- should reject empty questions/answers
- should handle interactive mode (no clarifications)
```

**implement.ts Tests:**
```typescript
- should validate feature name (max 200 chars)
- should reject path separators in feature name
- should accept valid feature name
- should handle all-features mode
- should mark step as completed
```

**cruise-control.ts Tests:**
```typescript
- should require route parameter
- should validate clarifications strategy
- should validate implementation scope
- should configure auto_mode in state
- should mark step as completed
```

---

### Priority: Medium (P1)

**file-utils.ts Tests:**
```typescript
- should find files matching patterns
- should respect max depth limit
- should respect max files limit
- should skip node_modules
- should count files correctly
- should read file safely with size limit
- should parse JSON safely (prototype pollution check)
```

**skill-loader.ts Tests:**
```typescript
- should load SKILL.md from multiple locations
- should strip frontmatter
- should return null if not found
- should provide fallback guidance
```

---

### Priority: Low (P2)

**Integration Tests:**
```typescript
- Full Brownfield workflow (all 6 gears)
- Full Greenfield workflow (all 6 gears)
- Cruise control with defer strategy
- Cruise control with prompt strategy
- Resume from checkpoint (interrupted workflow)
```

**E2E Tests:**
```typescript
- Real project analysis
- Real specification generation
- Real gap analysis
```

---

## Test Data & Fixtures

### Test Directory Structure

```
mcp-server/src/tools/__tests__/
├── fixtures/
│   ├── sample-project/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── tests/
│   │       └── index.test.ts
│   └── state-samples/
│       ├── initial.json
│       ├── after-analyze.json
│       └── complete.json
└── *.test.ts
```

### Sample State Files

**Initial State:**
```json
{
  "version": "1.0.0",
  "created": "2025-11-16T00:00:00.000Z",
  "updated": "2025-11-16T00:00:00.000Z",
  "path": null,
  "currentStep": null,
  "completedSteps": [],
  "metadata": {
    "projectName": "test-project",
    "projectPath": "/path/to/test"
  },
  "stepDetails": {}
}
```

---

## Coverage Goals

### Target: 80% Overall Coverage

**By Component:**
- MCP Tools: 80% (all 7 tools)
- Utilities: 90% (security, state, files, skills)
- Resources: 70% (MCP resources)

**By Type:**
- Unit Tests: 70% of coverage
- Integration Tests: 20% of coverage
- Security Tests: 10% of coverage

---

## Testing Best Practices

### Dos
- ✅ Test public interfaces (not private implementation)
- ✅ Use descriptive test names (should...)
- ✅ Test edge cases and error paths
- ✅ Clean up test files (beforeEach/afterEach)
- ✅ Use temporary directories for file tests
- ✅ Test security validations thoroughly
- ✅ Test concurrency where applicable

### Don'ts
- ❌ Don't test implementation details
- ❌ Don't leave test files in /tmp
- ❌ Don't use fixed paths (use tmpdir())
- ❌ Don't skip error testing
- ❌ Don't ignore flaky tests
- ❌ Don't commit `.only` tests

---

## CI Integration (Future)

**GitHub Actions Workflow:**
```yaml
name: Test
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd mcp-server && npm install
      - run: cd mcp-server && npm test
      - run: cd mcp-server && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Effort Estimates

**To Reach 80% Coverage:**
- reverse-engineer.ts tests: ~2 hours
- create-specs.ts tests: ~2 hours
- gap-analysis.ts tests: ~2 hours
- complete-spec.ts tests: ~2 hours
- implement.ts tests: ~2 hours
- cruise-control.ts tests: ~2 hours
- file-utils.ts tests: ~2 hours
- skill-loader.ts tests: ~1 hour
- Integration tests: ~4 hours

**Total:** ~19 hours

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-16
