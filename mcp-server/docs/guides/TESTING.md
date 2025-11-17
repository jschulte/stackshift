# Testing Guide

This guide documents testing patterns, best practices, and conventions for the StackShift MCP Server.

## Table of Contents

- [Test Organization](#test-organization)
- [Testing Patterns](#testing-patterns)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

---

## Test Organization

### Directory Structure

```
src/
├── __tests__/              # Main server & integration tests
│   ├── index.test.ts       # MCP server initialization (22 tests)
│   ├── integration.test.ts # E2E workflows (8 tests)
│   └── fixtures/           # Test data & fixtures
│       ├── state/          # State file fixtures
│       └── .gitignore      # Ignore dynamic test files
├── tools/__tests__/        # Tool handler tests (6 gears)
│   ├── analyze.test.ts
│   ├── reverse-engineer.test.ts
│   ├── create-specs.test.ts
│   ├── gap-analysis.test.ts
│   ├── complete-spec.test.ts
│   ├── implement.test.ts
│   └── cruise-control.test.ts
├── resources/__tests__/    # Resource handler tests (16 tests)
│   └── index.test.ts
└── utils/__tests__/        # Utility tests
    ├── state-manager.test.ts    # State management (15 tests)
    ├── state-recovery.test.ts   # Recovery scenarios (11 tests)
    ├── security.test.ts         # Security validation (16 tests)
    └── file-utils.test.ts       # File operations (33 tests)
```

**Total: 338 tests**

---

## Testing Patterns

### 1. Tool Handler Tests

Tool handlers follow a consistent pattern:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { analyzeToolHandler } from '../analyze.js';

describe('analyzeToolHandler', () => {
  let testDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));

    // Mock process.cwd()
    originalCwd = process.cwd;
    process.cwd = vi.fn().mockReturnValue(testDir);
  });

  afterEach(async () => {
    // Restore original cwd
    process.cwd = originalCwd;

    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  it('should analyze project directory', async () => {
    // Arrange: Set up test project
    await writeFile(join(testDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      version: '1.0.0'
    }));

    // Act: Execute tool
    const result = await analyzeToolHandler({
      directory: testDir,
      route: 'greenfield'
    });

    // Assert: Verify results
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain('Analysis Complete');
  });
});
```

**Key Points:**
- Use isolated temp directories for each test
- Mock `process.cwd()` to control working directory
- Clean up after each test
- Follow Arrange-Act-Assert pattern

### 2. State Management Tests

State tests validate StateManager behavior:

```typescript
import { StateManager } from '../state-manager.js';

describe('StateManager', () => {
  let testDir: string;
  let stateManager: StateManager;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-state-'));
    stateManager = new StateManager(testDir);
  });

  it('should save and load state', async () => {
    // Create initial state
    await stateManager.initialize('greenfield');

    // Load and verify
    const state = await stateManager.load();
    expect(state.path).toBe('greenfield');
    expect(state.version).toBe('1.0.0');
  });

  it('should update state atomically', async () => {
    await stateManager.initialize('greenfield');

    // Update state
    const updated = await stateManager.update(state => ({
      ...state,
      currentStep: 'reverse-engineer'
    }));

    expect(updated.currentStep).toBe('reverse-engineer');
  });
});
```

**Key Points:**
- Test both happy path and error cases
- Verify state persistence across operations
- Test concurrent access scenarios
- Validate state structure and fields

### 3. Integration Tests

Integration tests verify end-to-end workflows:

```typescript
describe('Integration Tests', () => {
  it('should complete greenfield workflow', async () => {
    // Arrange: Create project structure
    await writeFile(join(testDir, 'package.json'), '{}');

    // Act: Execute workflow
    await analyzeToolHandler({ directory: testDir, route: 'greenfield' });
    await reverseEngineerToolHandler({ directory: testDir });
    await createSpecsToolHandler({ directory: testDir });

    // Assert: Verify state progression
    const stateManager = new StateManager(testDir);
    const state = await stateManager.load();
    expect(state.completedSteps).toContain('create-specs');
  });

  it('should handle concurrent access', async () => {
    const stateManager = new StateManager(testDir);
    await stateManager.initialize('greenfield');

    // Simulate concurrent reads
    const reads = await Promise.all([
      stateManager.load(),
      stateManager.load(),
      stateManager.load()
    ]);

    // All reads should succeed with same data
    expect(reads).toHaveLength(3);
    expect(reads[0].version).toBe(reads[1].version);
  });
});
```

**Key Points:**
- Test realistic workflows
- Validate concurrent operations
- Test interruption and resume scenarios
- Verify data consistency

### 4. Resource Handler Tests

Resource tests validate MCP resource responses:

```typescript
import { getStateResource, getProgressResource } from '../index.js';

describe('Resource Handlers', () => {
  it('should return state resource', async () => {
    // Arrange: Create state file
    await writeFile(
      join(testDir, '.stackshift-state.json'),
      JSON.stringify({ version: '1.0.0', path: 'greenfield' })
    );

    // Act
    const result = await getStateResource();

    // Assert
    expect(result.contents[0].uri).toBe('stackshift://state');
    expect(result.contents[0].mimeType).toBe('application/json');
    const state = JSON.parse(result.contents[0].text);
    expect(state.version).toBe('1.0.0');
  });

  it('should calculate progress correctly', async () => {
    await writeFile(
      join(testDir, '.stackshift-state.json'),
      JSON.stringify({
        version: '1.0.0',
        completedSteps: ['analyze', 'reverse-engineer'],
        currentStep: 'create-specs',
        path: 'greenfield'
      })
    );

    const result = await getProgressResource();

    expect(result.contents[0].text).toMatch(/3[0-9]%/); // ~33%
  });
});
```

---

## Coverage Requirements

### Thresholds

| Metric | Threshold | Current |
|--------|-----------|---------|
| Lines | 85% | 84.97% |
| Functions | 85% | 93.33% |
| Branches | 80% | 90.25% |
| Statements | 85% | 84.97% |

### Component Coverage

| Component | Coverage | Tests |
|-----------|----------|-------|
| Tools | 98.49% | 165 tests |
| Resources | 94.21% | 16 tests |
| Utils | 95.55% | 75 tests |
| Server (index.ts) | 0%* | 22 tests |

*index.ts shows 0% due to heavy MCP SDK mocking (expected)

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open mcp-server/coverage/index.html

# Coverage reports are automatically uploaded to Codecov on CI
```

---

## Best Practices

### 1. Test Isolation

✅ **Do:**
- Use unique temp directories for each test
- Clean up resources in `afterEach`
- Mock external dependencies
- Restore mocks after tests

❌ **Don't:**
- Share state between tests
- Use hardcoded paths
- Leave test artifacts
- Modify global state without cleanup

### 2. Descriptive Test Names

✅ **Good:**
```typescript
it('should return error when state file is corrupted', async () => {
it('should calculate 33% progress with 2/6 gears complete', async () => {
it('should handle concurrent reads without data corruption', async () => {
```

❌ **Bad:**
```typescript
it('works', async () => {
it('test state', async () => {
it('handles errors', async () => {
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should update state atomically', async () => {
  // Arrange: Set up test conditions
  const stateManager = new StateManager(testDir);
  await stateManager.initialize('greenfield');

  // Act: Execute the operation
  const updated = await stateManager.update(state => ({
    ...state,
    currentStep: 'reverse-engineer'
  }));

  // Assert: Verify expected outcomes
  expect(updated.currentStep).toBe('reverse-engineer');
});
```

### 4. Error Testing

Test both success and failure paths:

```typescript
describe('Error Handling', () => {
  it('should throw on invalid state structure', async () => {
    await writeFile(
      join(testDir, '.stackshift-state.json'),
      '{"invalid": "structure"}'
    );

    const stateManager = new StateManager(testDir);

    await expect(stateManager.load()).rejects.toThrow(/Invalid state/);
  });

  it('should handle corrupted JSON gracefully', async () => {
    await writeFile(
      join(testDir, '.stackshift-state.json'),
      '{"invalid json syntax'
    );

    const stateManager = new StateManager(testDir);

    try {
      await stateManager.load();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/JSON|parse/i);
    }
  });
});
```

---

## Common Patterns

### Creating Valid State Objects

Use helper functions for consistency:

```typescript
function createValidState(overrides = {}) {
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    currentStep: 'analyze',
    completedSteps: [],
    path: 'greenfield',
    stepDetails: {},
    metadata: {
      projectName: 'test-project',
      projectPath: '/test'
    },
    ...overrides
  };
}

// Usage
await writeFile(
  join(testDir, '.stackshift-state.json'),
  JSON.stringify(createValidState({
    currentStep: 'create-specs',
    completedSteps: ['analyze', 'reverse-engineer']
  }))
);
```

### Mocking Process.cwd()

```typescript
let originalCwd: () => string;

beforeEach(() => {
  originalCwd = process.cwd;
  process.cwd = vi.fn().mockReturnValue(testDir);
});

afterEach(() => {
  process.cwd = originalCwd;
});
```

### Testing Concurrent Operations

```typescript
it('should handle concurrent reads', async () => {
  const stateManager = new StateManager(testDir);
  await stateManager.initialize('greenfield');

  // Execute operations concurrently
  const results = await Promise.all([
    stateManager.load(),
    stateManager.load(),
    stateManager.load()
  ]);

  // Verify consistency
  results.forEach(result => {
    expect(result.version).toBe('1.0.0');
    expect(result.path).toBe('greenfield');
  });
});
```

### Testing File Operations

```typescript
it('should create state file with correct permissions', async () => {
  await stateManager.initialize('greenfield');

  // Verify file exists
  const stateFile = join(testDir, '.stackshift-state.json');
  const exists = await access(stateFile).then(() => true, () => false);
  expect(exists).toBe(true);

  // Verify content
  const content = await readFile(stateFile, 'utf-8');
  const state = JSON.parse(content);
  expect(state.version).toBe('1.0.0');
});
```

---

## CI Integration

Tests run automatically on:
- Every push to `main`, `develop`, or `claude/**` branches
- Every pull request to `main` or `develop`

### CI Workflow

1. **Install dependencies** (`npm ci`)
2. **Run TypeScript compiler** (`tsc --noEmit`)
3. **Run tests** (`npm test`)
4. **Generate coverage** (`npm run test:coverage`)
5. **Upload to Codecov** (Node 20.x only)
6. **Enforce thresholds** (fail if <85%)

### Local Pre-commit Checklist

Before committing:

```bash
# 1. Run linter
npm run lint

# 2. Run tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Build successfully
npm run build

# 5. No TypeScript errors
npx tsc --noEmit
```

---

## Troubleshooting Tests

### Tests Failing Locally

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear vitest cache
npx vitest run --clearCache

# Run single test file
npm test -- src/tools/__tests__/analyze.test.ts

# Run with verbose output
npm test -- --reporter=verbose
```

### Coverage Not Updating

```bash
# Remove coverage directory
rm -rf coverage/

# Regenerate coverage
npm run test:coverage

# Check coverage thresholds
cat vitest.config.ts | grep -A 10 "thresholds"
```

### Flaky Tests

If a test is flaky:

1. Check for race conditions in async code
2. Verify cleanup in `afterEach`
3. Ensure test isolation (no shared state)
4. Add explicit waits if needed
5. Run test 10 times: `for i in {1..10}; do npm test -- path/to/test.ts; done`

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [MCP SDK Testing](https://modelcontextprotocol.io/docs/testing)

---

**Questions?** Open an issue at [github.com/jschulte/stackshift/issues](https://github.com/jschulte/stackshift/issues)
