# Test Contracts: F003-test-coverage

**Date:** 2025-11-17
**Purpose:** Document internal testing contracts, patterns, and interfaces

---

## Overview

While F003 doesn't involve external API contracts, this document defines the **testing contracts** - the consistent patterns, interfaces, and conventions that all tests must follow to ensure maintainability and reliability.

---

## Testing Contracts

### Contract 1: Test File Naming

**Pattern:** `<module-name>.test.ts`

**Rules:**
- Test files must use `.test.ts` extension (not `.spec.ts`)
- Test file name matches module under test
- Located in `__tests__/` subdirectory of module

**Examples:**
```
src/index.ts           → src/__tests__/index.test.ts
src/resources/index.ts → src/resources/__tests__/index.test.ts
src/utils/security.ts  → src/utils/__tests__/security.test.ts
```

**Rationale:**
- Consistent with existing project convention
- Easy to locate tests for a given module
- Vitest auto-discovery works correctly

---

### Contract 2: Test Case Naming

**Pattern:** `should <behavior> [when <condition>]`

**Format:**
```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should <expected behavior> when <specific condition>', () => {
      // Test implementation
    });
  });
});
```

**Examples:**
- ✅ `should return state when file exists`
- ✅ `should handle missing state file`
- ✅ `should throw error when path is outside workspace`
- ❌ `test state reading` (too vague)
- ❌ `getStateResource works` (not descriptive)

**Rationale:**
- Clear expectation of behavior
- Readable test output
- Self-documenting tests

---

### Contract 3: Test Structure (AAA Pattern)

**Pattern:** Arrange → Act → Assert

**Structure:**
```typescript
it('should <behavior>', () => {
  // Arrange: Setup test data and mocks
  const testData = { ... };
  vi.mocked(fs.readFile).mockResolvedValueOnce(testData);

  // Act: Execute function under test
  const result = await functionUnderTest();

  // Assert: Verify expected outcome
  expect(result).toBe(expectedValue);
});
```

**Rules:**
- Setup precedes execution
- One primary action per test
- Assertions follow action
- Comments optional for complex tests

**Rationale:**
- Clear test structure
- Easy to understand intent
- Maintainable over time

---

### Contract 4: Mock Management

**Pattern:** Setup in `beforeEach`, clear in `afterEach`

**Structure:**
```typescript
import { vi } from 'vitest';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should ...', () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('data');
    // Test implementation
  });
});
```

**Rules:**
- Declare mocks at module level (`vi.mock()`)
- Clear mocks before each test (`vi.clearAllMocks()`)
- Reset mocks after each test (`vi.resetAllMocks()`)
- Never leave mocks configured between tests

**Rationale:**
- Test isolation (no cross-test contamination)
- Predictable mock behavior
- Prevents flaky tests

---

### Contract 5: Temp Directory Management

**Pattern:** Create unique temp dir per test, clean up after

**Structure:**
```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Module', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should ...', async () => {
    // Use testDir for file operations
  });
});
```

**Rules:**
- Use `mkdtemp()` for unique directories (prevents conflicts)
- Prefix with `stackshift-test-` (identification)
- Always clean up in `afterEach` (prevent disk fill)
- Use `{ force: true }` for robust cleanup

**Rationale:**
- Test isolation (no shared directories)
- Parallel test execution safe
- No disk space leaks

---

### Contract 6: Fixture Usage

**Pattern:** Load fixtures from `src/__tests__/fixtures/`

**Structure:**
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
  // Test implementation
});
```

**Rules:**
- Fixtures stored in `fixtures/` subdirectory
- Organized by category (state/, projects/, etc.)
- Loaded dynamically (not hardcoded in tests)
- Small fixtures committed to git (<1MB)
- Large fixtures generated on demand (gitignored)

**Rationale:**
- Reusable test data
- Version-controlled fixtures
- Easy to update across tests

---

### Contract 7: Assertion Patterns

**Pattern:** One primary assertion per test, supporting assertions allowed

**Structure:**
```typescript
it('should return correct state structure', async () => {
  const result = await getStateResource();

  // Primary assertion (main test purpose)
  expect(result.uri).toBe('stackshift://state');

  // Supporting assertions (validate complete behavior)
  expect(result.mimeType).toBe('application/json');
  expect(result.text).toContain('"version"');
});
```

**Rules:**
- Primary assertion clearly indicates test purpose
- Supporting assertions validate related behavior
- Max 5 assertions per test (keep focused)
- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Avoid generic matchers (`toBeTruthy`, `toBeDefined`)

**Common Matchers:**
- `toBe(value)` - Strict equality (===)
- `toEqual(value)` - Deep equality (objects, arrays)
- `toContain(value)` - String/array contains
- `toThrow(error)` - Function throws
- `toHaveProperty(key)` - Object has property

**Rationale:**
- Clear test intent
- Precise failure messages
- Maintainable tests

---

### Contract 8: Error Testing

**Pattern:** Test both success and error paths

**Structure:**
```typescript
describe('getStateResource', () => {
  it('should return state when file exists', async () => {
    // Success path
    vi.mocked(fs.readFile).mockResolvedValueOnce('{"version":"1.0.0"}');
    const result = await getStateResource();
    expect(result.text).toContain('1.0.0');
  });

  it('should handle missing file gracefully', async () => {
    // Error path
    vi.mocked(fs.readFile).mockRejectedValueOnce(
      new Error('ENOENT: no such file')
    );
    const result = await getStateResource();
    expect(result.text).toContain('not initialized');
  });

  it('should throw on invalid JSON', async () => {
    // Error path (exception expected)
    vi.mocked(fs.readFile).mockResolvedValueOnce('invalid json{');
    await expect(getStateResource()).rejects.toThrow();
  });
});
```

**Rules:**
- Test success path first (happy path)
- Test each error condition separately
- Use `mockRejectedValueOnce` for async errors
- Use `rejects.toThrow()` for expected exceptions
- Test error message content (not just that it throws)

**Rationale:**
- Validates error handling
- Prevents unhandled errors in production
- Documents expected failures

---

### Contract 9: Async Test Handling

**Pattern:** Always use `async/await`, never callbacks

**Structure:**
```typescript
it('should handle async operations', async () => {
  // ✅ Correct: async/await
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

it('should handle async operations', (done) => {
  // ❌ Incorrect: callback (deprecated)
  asyncFunction().then(result => {
    expect(result).toBe(expected);
    done();
  });
});
```

**Rules:**
- Mark test functions as `async` if they await
- Always `await` promises (don't let them float)
- Use `rejects` matcher for async exceptions
- Set timeout if operation is slow (`{ timeout: 10000 }`)

**Rationale:**
- Consistent async handling
- Clearer error messages
- Modern JavaScript patterns

---

### Contract 10: Performance Test Structure

**Pattern:** Measure time, assert within threshold

**Structure:**
```typescript
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
```

**Rules:**
- Measure multiple iterations (not single run)
- Use generous thresholds (account for CI variability)
- Document threshold rationale in comment
- Consider skipping on slow runners (`test.skipIf()`)

**Rationale:**
- Detect performance regressions
- Realistic performance validation
- CI-compatible thresholds

---

### Contract 11: Security Test Patterns

**Pattern:** Test with malicious inputs

**Structure:**
```typescript
describe('Security Validation', () => {
  it('should prevent path traversal', async () => {
    const maliciousInput = '../../etc/passwd';

    await expect(
      functionUnderTest(maliciousInput)
    ).rejects.toThrow('Directory access denied');
  });

  it('should enforce file size limits', async () => {
    const largeFile = 'x'.repeat(11 * 1024 * 1024); // 11MB

    await expect(
      functionUnderTest(largeFile)
    ).rejects.toThrow('File too large');
  });

  it('should prevent prototype pollution', async () => {
    const maliciousJSON = '{"__proto__": {"polluted": true}}';

    const result = await functionUnderTest(maliciousJSON);

    expect(Object.prototype).not.toHaveProperty('polluted');
  });
});
```

**Rules:**
- Test all CWE scenarios (path traversal, injection, etc.)
- Use realistic attack vectors
- Verify security validations trigger
- Check error messages don't leak sensitive info

**Rationale:**
- Validates security fixes (F001)
- Prevents regressions
- Documents security requirements

---

## Test File Template

**Location:** `mcp-server/src/__tests__/<module>.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { functionUnderTest } from '../module.js';
import * as fs from 'fs/promises';

// Mock external dependencies
vi.mock('fs/promises');

describe('ModuleName', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('functionName', () => {
    it('should <expected behavior> when <condition>', async () => {
      // Arrange
      const testData = { ... };
      vi.mocked(fs.readFile).mockResolvedValueOnce(testData);

      // Act
      const result = await functionUnderTest();

      // Assert
      expect(result).toBe(expectedValue);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockRejectedValueOnce(
        new Error('ENOENT')
      );

      // Act & Assert
      await expect(functionUnderTest()).rejects.toThrow('ENOENT');
    });
  });
});
```

---

## Coverage Contract

**Vitest Configuration:**

```typescript
// mcp-server/vitest.config.ts
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

**Rules:**
- Global thresholds enforced (85% lines/functions/statements, 80% branches)
- Test files excluded from coverage
- HTML report generated for local review
- LCOV format for CI integration

---

## CI Contract

**GitHub Actions Workflow:**

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
```

**Rules:**
- Coverage runs on every PR and push
- Fails if below 85% threshold
- Coverage reports uploaded to Codecov
- Badge displayed in README

---

## Contract Violations

**Common Violations and Fixes:**

| Violation | Fix |
|-----------|-----|
| Test name not descriptive | Rename to `should <behavior> when <condition>` |
| Multiple behaviors in one test | Split into separate tests |
| Mocks not cleared | Add `beforeEach(() => vi.clearAllMocks())` |
| Temp directory not cleaned | Add `afterEach(() => rm(testDir))` |
| No error path tested | Add test case for error condition |
| Test depends on previous test | Isolate setup in each test |
| Hardcoded paths in tests | Use `__dirname` or temp directories |
| Floating promises | Add `await` before promises |

---

## Contract Enforcement

**Automated Checks:**
1. ✅ **Vitest**: Test execution and coverage
2. ✅ **TypeScript**: Type checking in tests
3. ⏳ **ESLint**: Linting rules (F002 - future)

**Manual Reviews:**
1. Code review checklist
2. Test naming conventions
3. Mock usage patterns
4. Fixture organization

---

## Success Criteria

**Contract Compliance:**
- [ ] All test files follow naming convention
- [ ] All test cases use AAA pattern
- [ ] All mocks properly managed (setup/teardown)
- [ ] All temp directories cleaned up
- [ ] All fixtures organized and documented
- [ ] Coverage thresholds enforced on CI

**Quality Metrics:**
- [ ] Zero flaky tests (consistent results)
- [ ] <60 second test execution time
- [ ] ≥85% coverage maintained
- [ ] All security scenarios tested

---

## References

**Internal:**
- [data-model.md](../data-model.md) - Test entity model
- [research.md](../research.md) - Testing strategy research
- [quickstart.md](../quickstart.md) - Developer implementation guide

**External:**
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [AAA Pattern](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)

---

**Contracts Status:** ✅ Complete
**Last Updated:** 2025-11-17
