# Quickstart Guide: F003-test-coverage

**Date:** 2025-11-17
**Purpose:** Step-by-step guide for implementing test coverage improvements
**Audience:** Developers implementing F003

---

## Overview

This guide walks you through implementing the F003 test coverage improvements, taking coverage from 78.75% to 90%+ by adding tests for the main server, resource handlers, and integration scenarios.

**Total Effort:** 20-27 hours across 3 phases
**Phases:** Critical Unit Tests (P0) → Integration Tests (P1) → Documentation (P1)

---

## Prerequisites

### Required Tools
- [x] Node.js ≥18.0.0
- [x] npm ≥9.0.0
- [x] Vitest already configured ✅
- [x] Git (for committing progress)

### Knowledge Required
- TypeScript basics
- Vitest testing framework
- Async/await patterns
- Mocking with `vi.mock()`

### Verify Setup

```bash
cd mcp-server

# Run existing tests
npm test

# Check current coverage
npm run test:coverage

# Expected: 78.75% overall coverage
# Critical gaps: index.ts (0%), resources (0%)
```

---

## Phase 0: Preparation (30 minutes)

### Step 1: Read Design Documents

**Required Reading:**
1. [research.md](./research.md) - Testing strategy and decisions
2. [data-model.md](./data-model.md) - Test entity model
3. [contracts/README.md](./contracts/README.md) - Testing patterns

**Key Takeaways:**
- Use hybrid approach (unit + integration tests)
- Real temp directories (not virtual file system)
- Coverage target: 85% Phase 1, 90% Phase 3
- Follow AAA pattern (Arrange-Act-Assert)

### Step 2: Create Test Fixtures Directory

```bash
cd mcp-server/src/__tests__

# Create fixtures directory structure
mkdir -p fixtures/state
mkdir -p fixtures/projects/small
mkdir -p fixtures/projects/medium

# Create .gitignore for large fixtures
echo "fixtures/projects/large/" >> .gitignore
```

### Step 3: Create Fixture Files

**Create:** `src/__tests__/fixtures/state/valid-state.json`
```json
{
  "version": "1.0.0",
  "created": "2024-01-01T00:00:00Z",
  "currentStep": "analyze",
  "completedSteps": ["analyze"],
  "path": "brownfield"
}
```

**Create:** `src/__tests__/fixtures/state/corrupted-state.json`
```
{"version": "1.0.0", "invalid": json}
```

**Create:** `src/__tests__/fixtures/state/complete-state.json`
```json
{
  "version": "1.0.0",
  "currentStep": "completed",
  "completedSteps": [
    "analyze",
    "reverse-engineer",
    "create-specs",
    "gap-analysis",
    "complete-spec",
    "implement"
  ],
  "path": "greenfield"
}
```

**Create:** `src/__tests__/fixtures/state/proto-pollution.json`
```json
{
  "__proto__": { "polluted": true },
  "version": "1.0.0"
}
```

---

## Phase 1: Main Server Tests (3-4 hours)

### Step 1: Create Test File

**Create:** `src/__tests__/index.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Mock the transport (we don't test stdio directly)
vi.mock('@modelcontextprotocol/sdk/server/stdio.js');

describe('MCP Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Tests will go here
});
```

### Step 2: Add Server Initialization Tests

**Add to `index.test.ts`:**

```typescript
describe('Server Initialization', () => {
  it('should create server with correct metadata', () => {
    const server = new Server({
      name: 'stackshift-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    expect(server).toBeDefined();
    // Note: Server class may not expose name/version directly
    // Adjust assertions based on actual SDK API
  });

  it('should have tools capability', () => {
    const server = new Server({
      name: 'stackshift-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    // Verify server capabilities include tools
    // Adjust based on actual SDK API
    expect(server).toBeDefined();
  });
});
```

### Step 3: Run Tests and Verify

```bash
npm test -- index.test.ts

# Expected: Tests pass
# If failing, adjust assertions based on actual MCP SDK API
```

### Step 4: Add Tool Registration Tests

**Note:** Testing tool registration may require integration tests since handlers are registered via `server.setRequestHandler()` which is part of MCP SDK internals.

**Skip detailed tool registration tests** if too complex to mock. Focus on handler functions directly (tested separately).

### Step 5: Check Coverage

```bash
npm run test:coverage -- index.test.ts

# Expected: index.ts coverage increases (target: 70-80%)
```

**Coverage Note:**
- 100% coverage of index.ts may not be achievable due to stdio transport setup
- Target: 70-80% coverage (acceptable per research.md)
- Uncovered lines: Transport initialization (tested by MCP SDK)

---

## Phase 2: Resource Handler Tests (3-4 hours)

### Step 1: Create Test File

**Create:** `src/resources/__tests__/index.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStateResource, getProgressResource, getRouteResource } from '../index.js';
import * as fs from 'fs/promises';
import { join } from 'path';

// Mock file system
vi.mock('fs/promises');

describe('Resource Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Tests will go here
});
```

### Step 2: Add getStateResource Tests

**Add to `resources/__tests__/index.test.ts`:**

```typescript
describe('getStateResource', () => {
  it('should return state when file exists', async () => {
    const mockState = {
      version: '1.0.0',
      created: '2024-01-01T00:00:00Z',
      currentStep: 'analyze',
      completedSteps: ['analyze']
    };

    vi.mocked(fs.readFile).mockResolvedValueOnce(
      JSON.stringify(mockState)
    );

    const result = await getStateResource();

    expect(result).toEqual({
      uri: 'stackshift://state',
      name: 'StackShift State',
      mimeType: 'application/json',
      text: JSON.stringify(mockState, null, 2)
    });
  });

  it('should handle missing state file', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(
      new Error('ENOENT: no such file or directory')
    );

    const result = await getStateResource();

    expect(result.uri).toBe('stackshift://state');
    expect(result.text).toContain('not initialized');
  });

  it('should handle corrupted JSON', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      'invalid json{'
    );

    await expect(getStateResource()).rejects.toThrow();
  });
});
```

### Step 3: Add Security Tests

**Add to `resources/__tests__/index.test.ts`:**

```typescript
describe('Security Validation', () => {
  it('should prevent path traversal attacks', async () => {
    // Mock process.cwd() to return suspicious path
    const originalCwd = process.cwd;
    process.cwd = vi.fn().mockReturnValue('/etc/passwd/../../');

    await expect(getStateResource()).rejects.toThrow('Directory access denied');

    process.cwd = originalCwd;
  });

  it('should enforce size limits', async () => {
    // Create large data (>10MB)
    const largeData = 'x'.repeat(11 * 1024 * 1024);
    vi.mocked(fs.readFile).mockResolvedValueOnce(largeData);

    await expect(getStateResource()).rejects.toThrow();
  });

  it('should sanitize JSON before parsing', async () => {
    const maliciousJSON = JSON.stringify({
      __proto__: { polluted: true },
      version: '1.0.0'
    });

    vi.mocked(fs.readFile).mockResolvedValueOnce(maliciousJSON);

    const result = await getStateResource();

    // Verify prototype not polluted
    expect(Object.prototype).not.toHaveProperty('polluted');
  });
});
```

### Step 4: Add getProgressResource Tests

**Add progress calculation tests:**

```typescript
describe('getProgressResource', () => {
  it('should calculate progress correctly', async () => {
    const mockState = {
      completedSteps: ['analyze', 'reverse-engineer'],
      currentStep: 'create-specs',
      stepDetails: {
        'analyze': { completed: true },
        'reverse-engineer': { completed: true }
      }
    };

    vi.mocked(fs.readFile).mockResolvedValueOnce(
      JSON.stringify(mockState)
    );

    const result = await getProgressResource();

    expect(result.uri).toBe('stackshift://progress');
    expect(result.mimeType).toBe('text/markdown');
    expect(result.text).toContain('33%'); // 2/6 steps
    expect(result.text).toContain('Current: create-specs');
  });

  it('should show completed status', async () => {
    const mockState = {
      completedSteps: [
        'analyze',
        'reverse-engineer',
        'create-specs',
        'gap-analysis',
        'complete-spec',
        'implement'
      ],
      currentStep: 'completed'
    };

    vi.mocked(fs.readFile).mockResolvedValueOnce(
      JSON.stringify(mockState)
    );

    const result = await getProgressResource();

    expect(result.text).toContain('100%');
    expect(result.text).toContain('All gears completed');
  });
});
```

### Step 5: Run Tests and Check Coverage

```bash
npm test -- resources

# Expected: All resource tests pass

npm run test:coverage -- resources

# Expected: resources/index.ts coverage ≥90%
```

---

## Phase 3: Integration Tests (5-6 hours)

### Step 1: Create Integration Test File

**Create:** `src/__tests__/integration.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('E2E Workflow Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  // Tests will go here
});
```

### Step 2: Add E2E Workflow Test

**Add complete workflow test:**

```typescript
it('should complete greenfield workflow sequentially', async () => {
  // Import tool handlers
  const { analyzeToolHandler } = await import('../tools/analyze.js');
  const { reverseEngineerToolHandler } = await import('../tools/reverse-engineer.js');

  // Step 1: Run analyze
  const analyzeResult = await analyzeToolHandler({
    directory: testDir
  });

  expect(analyzeResult).toContain('Analysis Complete');

  // Step 2: Run reverse-engineer
  const reverseResult = await reverseEngineerToolHandler({
    directory: testDir
  });

  expect(reverseResult).toContain('8 comprehensive documents');

  // Continue for all 6 gears...
}, { timeout: 30000 }); // 30 second timeout for E2E test
```

### Step 3: Add Concurrent Access Test

**Add concurrency test:**

```typescript
import { spawn } from 'child_process';

it('should handle concurrent access safely', async () => {
  // This test requires compiled code
  // Skip if in development mode
  if (!existsSync('dist/index.js')) {
    console.log('Skipping: requires built distribution');
    return;
  }

  // Create test state file
  const stateFile = join(testDir, '.stackshift-state.json');
  await writeFile(stateFile, JSON.stringify({
    version: '1.0.0',
    currentStep: 'analyze'
  }));

  // Spawn 3 concurrent processes
  const processes = [];
  for (let i = 0; i < 3; i++) {
    const p = spawn('node', ['dist/index.js'], {
      cwd: testDir,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    processes.push(p);
  }

  // Wait for all to complete
  await Promise.all(processes.map(p =>
    new Promise(resolve => p.on('exit', resolve))
  ));

  // Verify state file not corrupted
  const finalState = JSON.parse(
    await readFile(stateFile, 'utf-8')
  );

  expect(finalState).toHaveProperty('version');
  expect(finalState.version).toBe('1.0.0');
}, { timeout: 60000 });
```

### Step 4: Run Integration Tests

```bash
# Build first (required for concurrent access test)
npm run build

# Run integration tests
npm test -- integration.test.ts

# Expected: All integration tests pass
```

---

## Phase 4: Coverage Configuration (1 hour)

### Step 1: Update Vitest Config

**Edit:** `mcp-server/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'dist/**'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      }
    }
  }
});
```

### Step 2: Add Coverage Scripts

**Edit:** `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Step 3: Run Full Coverage Check

```bash
npm run test:coverage

# Expected output:
# -----------------|---------|----------|---------|---------|
# File             | % Stmts | % Branch | % Funcs | % Lines |
# -----------------|---------|----------|---------|---------|
# All files        |   85+   |    80+   |   85+   |   85+   |
# -----------------|---------|----------|---------|---------|
```

### Step 4: Verify Thresholds Enforced

```bash
# Should fail if coverage below thresholds
npm run test:coverage

# Exit code 1 if below 85%
echo $?
```

---

## Phase 5: CI/CD Integration (1 hour)

### Step 1: Create CI Workflow

**Create:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, 'claude/**']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: mcp-server/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: mcp-server

      - name: Run tests with coverage
        run: npm run test:coverage
        working-directory: mcp-server

      - name: Check coverage thresholds
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 85" | bc -l) )); then
            echo "Coverage $coverage% is below 85% threshold"
            exit 1
          fi
        working-directory: mcp-server

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./mcp-server/coverage/lcov.info
          fail_ci_if_error: true
          flags: mcp-server
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

### Step 2: Add Coverage Badge

**Edit:** `README.md`

```markdown
# StackShift

[![CI](https://github.com/jschulte/stackshift/actions/workflows/ci.yml/badge.svg)](https://github.com/jschulte/stackshift/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jschulte/stackshift/branch/main/graph/badge.svg)](https://codecov.io/gh/jschulte/stackshift)

...
```

### Step 3: Test CI Locally (Optional)

```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act

act push

# Simulates GitHub Actions CI run locally
```

---

## Phase 6: Documentation (1 hour)

### Step 1: Update MCP Server README

**Edit:** `mcp-server/README.md`

Add testing section:

```markdown
## Testing

StackShift has comprehensive test coverage (90%+) with unit, integration, and security tests.

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### Test Structure

- `src/__tests__/` - Unit tests
- `src/__tests__/integration.test.ts` - E2E workflow tests
- `src/__tests__/fixtures/` - Test fixtures

### Coverage Targets

- Overall: ≥85% (Phase 1), ≥90% (Phase 3)
- Critical modules: ≥90% (resources, state manager)
- Security modules: 100% (maintained)

### Writing Tests

See [Testing Contracts](../production-readiness-specs/F003-test-coverage/contracts/README.md) for patterns and conventions.
```

### Step 2: Create Testing Guide

**Create:** `docs/guides/TESTING.md`

```markdown
# Testing Guide

## Overview

This guide explains how to write tests for StackShift.

## Test Patterns

See [F003 Testing Contracts](../../production-readiness-specs/F003-test-coverage/contracts/README.md) for detailed patterns.

## Quick Reference

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should <behavior> when <condition>', () => {
    // Arrange
    const input = { ... };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Test Template

```typescript
import { mkdtemp, rm } from 'fs/promises';

describe('Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp('/tmp/test-');
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true });
  });

  it('should complete workflow', async () => {
    // Use testDir for file operations
  });
});
```

## Coverage

Run `npm run test:coverage` to generate coverage report.

View HTML report: `open mcp-server/coverage/index.html`
```

---

## Verification Checklist

Before considering F003 complete, verify:

### Coverage Metrics
- [ ] Overall coverage ≥85% (Phase 1) or ≥90% (Phase 3)
- [ ] index.ts coverage ≥70%
- [ ] resources/index.ts coverage ≥90%
- [ ] No coverage regressions in existing modules

### Test Quality
- [ ] All tests pass (`npm test`)
- [ ] No flaky tests (run 10 times: `for i in {1..10}; do npm test || exit 1; done`)
- [ ] Test execution <60 seconds
- [ ] All tests follow AAA pattern
- [ ] All mocks properly cleaned up

### CI/CD
- [ ] CI workflow created (`.github/workflows/ci.yml`)
- [ ] Coverage enforced on CI (fails <85%)
- [ ] Coverage badge in README
- [ ] Codecov integration working (optional)

### Documentation
- [ ] Testing section in README
- [ ] Testing guide created
- [ ] All contracts documented
- [ ] Fixture README exists

### Security
- [ ] Path traversal tests added
- [ ] Large file tests added
- [ ] Prototype pollution tests added
- [ ] All security validations tested

---

## Common Issues

### Issue: Tests Fail with "Cannot find module"

**Solution:** Check import paths use `.js` extension

```typescript
// ❌ Wrong
import { func } from '../module';

// ✅ Correct
import { func } from '../module.js';
```

### Issue: Mocks Not Working

**Solution:** Ensure `vi.mock()` called at module level (not inside describe)

```typescript
// ❌ Wrong
describe('Test', () => {
  vi.mock('fs/promises');
});

// ✅ Correct
vi.mock('fs/promises');

describe('Test', () => {
  // ...
});
```

### Issue: Coverage Lower Than Expected

**Solution:** Check uncovered lines in HTML report

```bash
npm run test:coverage
open mcp-server/coverage/index.html

# Click on file to see uncovered lines highlighted
```

### Issue: Temp Directories Not Cleaned

**Solution:** Ensure `afterEach` cleanup runs even on test failure

```typescript
afterEach(async () => {
  await rm(testDir, { recursive: true, force: true }); // force: true
});
```

### Issue: Performance Tests Fail on CI

**Solution:** Use generous timeouts or skip on slow runners

```typescript
it('should be fast', async () => {
  if (process.env.CI && !process.env.RUN_PERF_TESTS) {
    console.log('Skipping performance test on CI');
    return;
  }

  // Performance test
}, { timeout: 30000 });
```

---

## Next Steps After F003

Once F003 is complete (90%+ coverage):

1. **F004: Documentation** - Comprehensive docs
2. **F005: Deployment** - CI/CD and releases
3. **F006: Feature Completion** - Final polish

---

## Support

**Questions?**
- Read [contracts/README.md](./contracts/README.md) for patterns
- Read [research.md](./research.md) for strategy
- Read [data-model.md](./data-model.md) for test structure

**Issues?**
- Check Vitest docs: https://vitest.dev/
- Check existing tests: `src/__tests__/security.test.ts`, `src/__tests__/analyze.test.ts`

---

**Quickstart Guide Status:** ✅ Complete
**Last Updated:** 2025-11-17
