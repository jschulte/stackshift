# Agent Context: F003-test-coverage

**Purpose:** Document testing technologies and patterns for AI agent context
**Date:** 2025-11-17
**Status:** ✅ Complete

---

## Technology Stack Used

### Core Technologies
- **TypeScript:** 5.3.0 (strict mode)
- **Node.js:** >=18.0.0
- **Testing Framework:** Vitest 1.0+
- **Coverage Provider:** V8 (built into Vitest)
- **Mocking:** Vitest `vi` utilities

### Testing Libraries (Existing)
- **Built-in:** No external test dependencies
- **Framework:** Vitest (already configured)
- **Coverage:** V8 provider (built-in)
- **Assertions:** Vitest expect API

---

## Patterns & Practices Added

### Unit Test Pattern (AAA)

**Pattern Name:** Arrange-Act-Assert with Mock Isolation

**When to use:**
- Testing individual functions/modules
- Testing with external dependencies (fs, network)
- Testing error conditions

**Implementation:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should <behavior> when <condition>', async () => {
    // Arrange: Setup test data and mocks
    const mockData = { version: '1.0.0' };
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      JSON.stringify(mockData)
    );

    // Act: Execute function under test
    const result = await functionUnderTest();

    // Assert: Verify expected outcome
    expect(result).toEqual(expectedValue);
  });
});
```

**Key Points:**
- Mock external dependencies at module level (`vi.mock()`)
- Clear mocks before each test (`beforeEach`)
- Follow AAA pattern (clear structure)
- One primary assertion per test

---

### Integration Test Pattern

**Pattern Name:** Real Temp Directory with UUID Isolation

**When to use:**
- Testing E2E workflows
- Testing file system interactions
- Testing concurrent access

**Implementation:**
```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Integration Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create unique temp directory per test
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));
  });

  afterEach(async () => {
    // Always cleanup
    await rm(testDir, { recursive: true, force: true });
  });

  it('should complete workflow', async () => {
    // Use testDir for real file operations
    const result = await runWorkflow(testDir);
    expect(result).toBeDefined();
  });
});
```

**Key Points:**
- Use real file system (not virtual)
- Create unique directory per test (prevents conflicts)
- Always cleanup in `afterEach`
- Use `{ force: true }` for robust cleanup

---

### Security Test Pattern

**Pattern Name:** Malicious Input Testing

**When to use:**
- Testing validation logic
- Testing security boundaries
- Testing path operations

**Implementation:**
```typescript
describe('Security Validation', () => {
  it('should prevent path traversal', async () => {
    const maliciousPath = '../../etc/passwd';

    await expect(
      functionUnderTest(maliciousPath)
    ).rejects.toThrow('Directory access denied');
  });

  it('should enforce file size limits', async () => {
    const largeFile = 'x'.repeat(11 * 1024 * 1024); // 11MB

    await expect(
      functionUnderTest(largeFile)
    ).rejects.toThrow('File too large');
  });

  it('should prevent prototype pollution', async () => {
    const maliciousJSON = {
      __proto__: { polluted: true },
      version: '1.0.0'
    };

    const result = await functionUnderTest(maliciousJSON);

    // Verify prototype not polluted
    expect(Object.prototype).not.toHaveProperty('polluted');
  });
});
```

**Key Points:**
- Test with realistic attack vectors
- Test all CWE scenarios (path traversal, DoS, etc.)
- Verify error messages don't leak sensitive info
- Confirm security validations trigger

---

### Performance Test Pattern

**Pattern Name:** Iteration-Based Threshold Testing

**When to use:**
- Testing resource operations
- Detecting performance regressions
- Validating latency requirements

**Implementation:**
```typescript
describe('Performance Tests', () => {
  it('should complete within performance threshold', async () => {
    const iterations = 1000;
    const maxTime = 150; // milliseconds

    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      await functionUnderTest();
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(maxTime);
  });

  it('should use limited memory', async () => {
    const before = process.memoryUsage().heapUsed;

    await functionUnderTest();

    const after = process.memoryUsage().heapUsed;
    const delta = after - before;

    expect(delta).toBeLessThan(500 * 1024 * 1024); // <500MB
  });
});
```

**Key Points:**
- Test multiple iterations (not single run)
- Use generous thresholds (account for CI variability)
- Document threshold rationale
- Consider skipping on slow runners

---

### Mock Management Pattern

**Pattern Name:** Setup-Execute-Cleanup Lifecycle

**When to use:**
- All tests using mocks
- Tests with external dependencies
- Tests requiring isolation

**Implementation:**
```typescript
import { vi } from 'vitest';
import * as fs from 'fs/promises';

// Step 1: Declare mock at module level
vi.mock('fs/promises');

describe('Module', () => {
  // Step 2: Clear before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Step 3: Reset after each test
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should work', () => {
    // Step 4: Configure mock for this test
    vi.mocked(fs.readFile).mockResolvedValueOnce('data');

    // Test implementation
  });
});
```

**Key Points:**
- Declare mocks at module level (before describe)
- Clear call history before each test
- Reset configurations after each test
- Never share mock state between tests

---

### Fixture Loading Pattern

**Pattern Name:** Centralized Fixture Management

**When to use:**
- Reusing test data across tests
- Testing with complex data structures
- Version-controlling test inputs

**Implementation:**
```typescript
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadFixture(name: string): Promise<string> {
  const fixturePath = join(__dirname, 'fixtures', name);
  return await readFile(fixturePath, 'utf-8');
}

it('should parse valid state', async () => {
  const validState = await loadFixture('state/valid-state.json');

  const result = await parseState(validState);

  expect(result.version).toBe('1.0.0');
});
```

**Fixture Structure:**
```
src/__tests__/fixtures/
├── state/
│   ├── valid-state.json
│   ├── corrupted-state.json
│   └── complete-state.json
├── projects/
│   ├── small/ (10 files)
│   └── medium/ (100 files)
└── README.md
```

**Key Points:**
- Store fixtures in `fixtures/` subdirectory
- Organize by category (state/, projects/, etc.)
- Load dynamically (not hardcoded)
- Small fixtures committed to git
- Large fixtures gitignored and generated on demand

---

## Testing Patterns Added

### Coverage Configuration Pattern

**Pattern Name:** Threshold-Enforced Coverage Reporting

**When to use:**
- All projects requiring test coverage
- CI/CD pipelines
- Preventing coverage regressions

**Implementation:**
```typescript
// vitest.config.ts
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

**Key Points:**
- Set global thresholds (85% Phase 1, 90% Phase 3)
- Exclude test files from coverage
- Use multiple reporters (text for CLI, lcov for CI)
- Enforce on every run (fail on drop)

---

### CI Integration Pattern

**Pattern Name:** Automated Coverage Enforcement

**When to use:**
- GitHub Actions workflows
- Pull request validation
- Pre-merge checks

**Implementation:**
```yaml
# .github/workflows/ci.yml
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
```

**Key Points:**
- Run coverage on every PR and push
- Fail build if below threshold
- Upload to coverage service (Codecov)
- Add coverage badge to README

---

## Anti-Patterns to Avoid

### ❌ Shared Test State

**Don't:**
```typescript
let sharedState: any;

beforeAll(() => {
  sharedState = setupExpensiveState();
});

it('test 1', () => {
  sharedState.value = 'modified';  // ❌ Modifies shared state
});

it('test 2', () => {
  expect(sharedState.value).toBe('original');  // ❌ Fails due to test 1
});
```

**Do:**
```typescript
beforeEach(() => {
  const state = setupState();  // ✅ Fresh state per test
});

it('test 1', () => {
  state.value = 'modified';  // ✅ Isolated
});

it('test 2', () => {
  expect(state.value).toBe('original');  // ✅ Works
});
```

### ❌ Testing Implementation Details

**Don't:**
```typescript
it('should call internal method', () => {
  const spy = vi.spyOn(obj, '_privateMethod');  // ❌ Testing internals

  obj.publicMethod();

  expect(spy).toHaveBeenCalled();  // ❌ Brittle
});
```

**Do:**
```typescript
it('should produce correct output', () => {
  const result = obj.publicMethod();  // ✅ Testing behavior

  expect(result).toBe(expectedValue);  // ✅ Stable
});
```

### ❌ Floating Promises

**Don't:**
```typescript
it('should work', () => {
  asyncFunction();  // ❌ Promise not awaited

  expect(something).toBe(true);  // ❌ Runs before promise resolves
});
```

**Do:**
```typescript
it('should work', async () => {
  await asyncFunction();  // ✅ Awaited

  expect(something).toBe(true);  // ✅ Runs after promise
});
```

### ❌ Multiple Behaviors Per Test

**Don't:**
```typescript
it('should do everything', async () => {
  // Test 5 different behaviors
  expect(await func1()).toBe(1);
  expect(await func2()).toBe(2);
  expect(await func3()).toBe(3);
  expect(await func4()).toBe(4);
  expect(await func5()).toBe(5);  // ❌ Too much in one test
});
```

**Do:**
```typescript
it('should do behavior 1', async () => {
  expect(await func1()).toBe(1);  // ✅ Focused
});

it('should do behavior 2', async () => {
  expect(await func2()).toBe(2);  // ✅ Focused
});
```

### ❌ Mocking Everything

**Don't:**
```typescript
vi.mock('../utils/helper.js');  // ❌ Mocking internal module
vi.mock('../types.js');  // ❌ Mocking types
vi.mock('../constants.js');  // ❌ Mocking constants

it('should work', () => {
  // Test with everything mocked - not testing real integration
});
```

**Do:**
```typescript
vi.mock('fs/promises');  // ✅ Mock external dependencies only

it('should work', () => {
  // Test with real internal modules - test real integration
});
```

---

## Coverage Metrics

### Target Coverage by Phase

| Phase   | Lines | Functions | Branches | Statements |
|---------|-------|-----------|----------|------------|
| Current | 78.75%| ~70%      | ~65%     | ~75%       |
| Phase 1 | 85%   | 85%       | 80%      | 85%        |
| Phase 2 | 88%   | 88%       | 83%      | 88%        |
| Phase 3 | 90%+  | 90%+      | 85%+     | 90%+       |

### Per-Module Targets

| Module                 | Current | Target  | Priority |
|------------------------|---------|---------|----------|
| src/index.ts           | 0%      | 80%     | P0       |
| src/resources/         | 0%      | 90%     | P0       |
| src/tools/             | 98.49%  | 98%+    | P2       |
| src/utils/security     | 100%    | 100%    | P2       |
| src/utils/state        | ~90%    | 95%     | P1       |
| src/utils/file-utils   | ~85%    | 90%     | P1       |
| src/utils/skill        | ~70%    | 85%     | P1       |

---

## Agent Learning Points

### For Future Features

**When writing unit tests:**
1. ✅ Follow AAA pattern (Arrange-Act-Assert)
2. ✅ Mock external dependencies (fs, network)
3. ✅ Clear mocks before each test
4. ✅ Test both success and error paths

**When writing integration tests:**
1. ✅ Use real temp directories (UUID-based)
2. ✅ Always cleanup in `afterEach`
3. ✅ Test complete workflows
4. ✅ Test concurrent access scenarios

**When configuring coverage:**
1. ✅ Set global thresholds (85%+)
2. ✅ Exclude test files and types
3. ✅ Generate multiple report formats
4. ✅ Enforce thresholds on CI

**When testing security:**
1. ✅ Test with malicious inputs
2. ✅ Test all CWE scenarios
3. ✅ Verify error messages don't leak info
4. ✅ Confirm validations trigger correctly

---

## Dependencies

**No new test dependencies added** ✅

This feature uses only existing test infrastructure:
- Vitest (already configured)
- V8 coverage provider (built into Vitest)
- Node.js test utilities (mkdtemp, rm, etc.)

**Why no new dependencies:**
- Aligns with constitution (minimal dependencies)
- Vitest is comprehensive (testing + coverage + mocking)
- Reduces maintenance burden
- Faster installs

---

## Configuration

### Vitest Configuration

**File:** `mcp-server/vitest.config.ts`

```typescript
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

### NPM Scripts

**File:** `mcp-server/package.json`

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

---

## Performance Characteristics

**Test Execution:**
- Unit tests: <1 second per test
- Integration tests: <10 seconds per test
- Total suite: <60 seconds (target)

**Coverage Generation:**
- Overhead: ~2-5 seconds
- HTML report: ~1-2 seconds
- LCOV format: ~500ms

**CI Build Time:**
- Tests + coverage: ~60-90 seconds
- Total CI run: ~2-3 minutes

---

## References

**Internal:**
- `mcp-server/src/__tests__/security.test.ts` - Security test examples
- `mcp-server/src/__tests__/analyze.test.ts` - Unit test examples
- `production-readiness-specs/F003-test-coverage/contracts/README.md` - Test contracts
- `production-readiness-specs/F003-test-coverage/quickstart.md` - Developer guide

**External:**
- [Vitest Documentation](https://vitest.dev/)
- [V8 Coverage](https://v8.dev/blog/javascript-code-coverage)
- [AAA Pattern](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status:** ✅ Complete - Agent context documented
**Note:** Agent scripts (update-agent-context.sh) not found. This file serves as testing reference for future AI agents working on StackShift test coverage.
