# Data Model: F003-test-coverage

**Date:** 2025-11-17
**Purpose:** Define test entity model, test suites, fixtures, and coverage targets

---

## Overview

This document defines the data model for the F003 test coverage feature. Unlike traditional features with database entities, this feature's "data model" consists of test suites, test cases, test fixtures, and coverage metrics.

---

## Entity Model

### 1. Test Suite

A collection of related test cases testing a specific module or functionality.

**Attributes:**
- `name`: string - Test suite name (e.g., "Server Initialization")
- `file`: string - Test file path (e.g., "src/__tests__/index.test.ts")
- `module`: string - Module under test (e.g., "src/index.ts")
- `testCases`: TestCase[] - Collection of test cases
- `setup`: Hook[] - beforeEach, beforeAll hooks
- `teardown`: Hook[] - afterEach, afterAll hooks
- `timeout`: number - Suite-level timeout (milliseconds)
- `priority`: 'P0' | 'P1' | 'P2' - Implementation priority

**Example:**
```typescript
{
  name: "Server Initialization",
  file: "src/__tests__/index.test.ts",
  module: "src/index.ts",
  testCases: [
    { name: "should create server with correct metadata", ... },
    { name: "should register all 7 tool handlers", ... }
  ],
  setup: [
    { type: "beforeEach", action: "vi.clearAllMocks()" }
  ],
  teardown: [],
  timeout: 5000,
  priority: "P0"
}
```

### 2. Test Case

An individual test validating specific behavior.

**Attributes:**
- `name`: string - Test description (e.g., "should handle missing state file")
- `suite`: string - Parent suite name
- `type`: 'unit' | 'integration' | 'security' | 'performance' - Test classification
- `priority`: 'P0' | 'P1' | 'P2' - Implementation priority
- `assertions`: Assertion[] - Expected outcomes
- `mocks`: Mock[] - Mocked dependencies
- `fixtures`: string[] - Required test data files
- `timeout`: number - Test-specific timeout
- `skip`: boolean - Whether to skip (for flaky tests)

**Example:**
```typescript
{
  name: "should handle missing state file",
  suite: "getStateResource",
  type: "unit",
  priority: "P0",
  assertions: [
    { type: "toContain", value: "not initialized" }
  ],
  mocks: [
    {
      module: "fs/promises",
      function: "readFile",
      implementation: "throw new Error('ENOENT')"
    }
  ],
  fixtures: [],
  timeout: 1000,
  skip: false
}
```

### 3. Test Fixture

Static test data used by multiple test cases.

**Attributes:**
- `name`: string - Fixture name (e.g., "valid-state")
- `file`: string - Fixture file path (e.g., "fixtures/state/valid-state.json")
- `type`: 'json' | 'directory' | 'binary' - Data type
- `size`: number - File size in bytes
- `description`: string - Purpose and contents
- `usedBy`: string[] - Test cases using this fixture

**Example:**
```typescript
{
  name: "valid-state",
  file: "src/__tests__/fixtures/state/valid-state.json",
  type: "json",
  size: 245,
  description: "Valid .stackshift-state.json with analyze step completed",
  usedBy: [
    "getStateResource: should return state when file exists",
    "getProgressResource: should calculate progress correctly"
  ]
}
```

### 4. Coverage Target

Expected coverage metrics for a module or file.

**Attributes:**
- `module`: string - Module path (e.g., "src/index.ts")
- `currentCoverage`: CoverageMetrics - Current coverage
- `targetCoverage`: CoverageMetrics - Target coverage
- `priority`: 'P0' | 'P1' | 'P2' - Implementation priority
- `blockers`: string[] - Dependencies or issues

**CoverageMetrics Structure:**
```typescript
{
  lines: number,      // % of lines covered
  functions: number,  // % of functions covered
  branches: number,   // % of branches covered
  statements: number  // % of statements covered
}
```

**Example:**
```typescript
{
  module: "src/resources/index.ts",
  currentCoverage: {
    lines: 0,
    functions: 0,
    branches: 0,
    statements: 0
  },
  targetCoverage: {
    lines: 90,
    functions: 90,
    branches: 85,
    statements: 90
  },
  priority: "P0",
  blockers: []
}
```

### 5. Mock Definition

Configuration for mocking external dependencies.

**Attributes:**
- `module`: string - Module to mock (e.g., "fs/promises")
- `function`: string - Function to mock (e.g., "readFile")
- `implementation`: string | function - Mock implementation
- `returnValue`: any - Value to return (for simple mocks)
- `throws`: Error - Error to throw (for error cases)

**Example:**
```typescript
{
  module: "fs/promises",
  function: "readFile",
  implementation: null,
  returnValue: JSON.stringify({ version: "1.0.0" }),
  throws: null
}
```

---

## Test Suite Catalog

### Priority 0: Critical Unit Tests

#### Suite 1: Main Server Tests
- **File:** `mcp-server/src/__tests__/index.test.ts`
- **Module:** `src/index.ts`
- **Test Cases:** 19
- **Coverage Target:** 80% (lines)

**Sub-Suites:**
1. Server Initialization (5 tests)
2. Request Routing (6 tests)
3. Error Handling (4 tests)
4. Lifecycle Management (4 tests)

#### Suite 2: Resource Handler Tests
- **File:** `mcp-server/src/resources/__tests__/index.test.ts`
- **Module:** `src/resources/index.ts`
- **Test Cases:** 22
- **Coverage Target:** 90% (lines)

**Sub-Suites:**
1. getStateResource() (8 tests)
2. getProgressResource() (7 tests)
3. getRouteResource() (3 tests)
4. Security Validation (4 tests)

### Priority 1: Integration Tests

#### Suite 3: E2E Workflow Tests
- **File:** `mcp-server/src/__tests__/integration.test.ts`
- **Module:** Multiple (full workflow)
- **Test Cases:** 8
- **Coverage Target:** Critical paths

**Sub-Suites:**
1. Complete Greenfield Workflow (1 complex test)
2. Interruption & Resume (2 tests)
3. Concurrent Access (3 tests)
4. Large Codebase Handling (2 tests)

#### Suite 4: State Recovery Tests
- **File:** `mcp-server/src/utils/__tests__/state-recovery.test.ts`
- **Module:** `src/utils/state-manager.ts`
- **Test Cases:** 8
- **Coverage Target:** 95% (state recovery logic)

**Sub-Suites:**
1. Corrupted JSON Recovery (3 tests)
2. Backup File Management (3 tests)
3. Automatic Recovery (2 tests)

### Priority 2: Performance Tests

#### Suite 5: Performance Tests
- **File:** `mcp-server/src/__tests__/performance.test.ts`
- **Module:** Multiple (performance-critical paths)
- **Test Cases:** 5
- **Coverage Target:** N/A (performance validation)

**Sub-Suites:**
1. Resource Read Performance (3 tests)
2. Large File Handling (2 tests)

---

## Test Fixture Catalog

### State Fixtures
**Location:** `mcp-server/src/__tests__/fixtures/state/`

1. **valid-state.json** (245 bytes)
   ```json
   {
     "version": "1.0.0",
     "created": "2024-01-01T00:00:00Z",
     "currentStep": "analyze",
     "completedSteps": ["analyze"],
     "path": "brownfield"
   }
   ```

2. **corrupted-state.json** (invalid JSON)
   ```
   {"version": "1.0.0", "invalid": json}
   ```

3. **large-state.json** (11MB - exceeds 10MB limit)
   - Generated file filled with 'x' characters
   - Tests file size limit enforcement

4. **proto-pollution.json** (malicious JSON)
   ```json
   {
     "__proto__": { "polluted": true },
     "version": "1.0.0"
   }
   ```

5. **complete-state.json** (all steps done)
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
     ]
   }
   ```

### Project Fixtures
**Location:** `mcp-server/src/__tests__/fixtures/projects/`

1. **small/** (10 files)
   - Minimal test project
   - Quick tests

2. **medium/** (100 files)
   - Realistic test project
   - Standard tests

3. **large/** (1000 files) - **.gitignore** (generated on demand)
   - Stress test project
   - Performance tests only

---

## Coverage Metrics Model

### Global Coverage Targets

| Metric      | Current | Phase 1 | Phase 2 | Phase 3 |
|-------------|---------|---------|---------|---------|
| Lines       | 78.75%  | 85%     | 88%     | 90%+    |
| Functions   | ~70%    | 85%     | 88%     | 90%+    |
| Branches    | ~65%    | 80%     | 83%     | 85%+    |
| Statements  | ~75%    | 85%     | 88%     | 90%+    |

### Per-Module Coverage Targets

| Module                | Current | Target  | Priority |
|-----------------------|---------|---------|----------|
| src/index.ts          | 0%      | 80%     | P0       |
| src/resources/        | 0%      | 90%     | P0       |
| src/tools/            | 98.49%  | 98%+    | P2       |
| src/utils/security    | 100%    | 100%    | P2       |
| src/utils/state       | ~90%    | 95%     | P1       |
| src/utils/file-utils  | ~85%    | 90%     | P1       |
| src/utils/skill       | ~70%    | 85%     | P1       |

---

## Mock Catalog

### File System Mocks

```typescript
// Mock: fs/promises.readFile
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  mkdtemp: vi.fn(),
  rm: vi.fn()
}));

// Usage in tests:
vi.mocked(fs.readFile).mockResolvedValueOnce(
  JSON.stringify({ version: "1.0.0" })
);
```

### MCP SDK Mocks

```typescript
// Mock: @modelcontextprotocol/sdk/server
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    close: vi.fn()
  }))
}));
```

### Process Mocks

```typescript
// Mock: process.cwd()
const originalCwd = process.cwd;

beforeEach(() => {
  process.cwd = vi.fn().mockReturnValue('/test/workspace');
});

afterEach(() => {
  process.cwd = originalCwd;
});
```

---

## Test Data Flow

```
┌──────────────────────┐
│  Test Suite          │
│  (index.test.ts)     │
└──────────┬───────────┘
           │
           ├──► beforeEach: Setup mocks
           │    - Mock fs/promises
           │    - Create temp directory
           │
           ├──► Test Case 1
           │    ├──► Load fixture (valid-state.json)
           │    ├──► Execute function under test
           │    └──► Assert expected behavior
           │
           ├──► Test Case 2
           │    ├──► Mock error (ENOENT)
           │    ├──► Execute function under test
           │    └──► Assert error handling
           │
           └──► afterEach: Cleanup
                - Clear mocks
                - Delete temp directory
```

---

## Validation Rules

### Test Case Validation

1. **Naming Convention**
   - Format: `should [behavior] when [condition]`
   - Example: `should return state when file exists`

2. **Assertion Count**
   - Minimum: 1 assertion per test
   - Maximum: 5 assertions (keep focused)

3. **Timeout Limits**
   - Unit tests: <1 second
   - Integration tests: <10 seconds
   - Performance tests: <60 seconds

4. **Mock Usage**
   - External dependencies: Always mocked (fs, network)
   - Internal modules: Avoid mocking (test real integration)

### Coverage Validation

1. **Threshold Enforcement**
   - Global: ≥85% (Phase 1)
   - Critical modules: ≥90% (resources, state)
   - Security modules: 100% (maintain existing)

2. **Exclusions**
   - Test files: `**/*.test.ts`
   - Type definitions: `src/types/**`
   - Build artifacts: `dist/**`

---

## State Transitions

### Test Execution States

```
pending → running → passed ✅
                 └─► failed ❌
                 └─► skipped ⏭️
```

### Coverage Progress States

```
0% (Critical Gap) → 85% (Phase 1 Target) → 88% (Phase 2 Target) → 90%+ (Phase 3 Complete)
```

---

## Relationships

### Test Suite → Test Case (1:N)
- One test suite contains many test cases
- Test cases inherit suite setup/teardown

### Test Case → Fixture (N:M)
- Test cases can use multiple fixtures
- Fixtures can be reused across test cases

### Test Case → Mock (N:M)
- Test cases can use multiple mocks
- Mocks can be reused with different configurations

### Module → Coverage Target (1:1)
- Each module has one coverage target
- Target includes current and goal metrics

---

## Success Metrics

### Quantitative Metrics

1. **Test Count**
   - Current: 67+ tests
   - Phase 1: 120+ tests (add 53+)
   - Phase 3: 150+ tests (add 83+)

2. **Coverage**
   - Current: 78.75% lines
   - Phase 1: 85% lines
   - Phase 3: 90%+ lines

3. **Execution Time**
   - Current: <30 seconds
   - Target: <60 seconds (with 2x tests)

### Qualitative Metrics

1. **Test Reliability**
   - Zero flaky tests
   - Consistent results across runs

2. **Test Maintainability**
   - Clear naming conventions
   - Reusable fixtures
   - Minimal mocking

3. **Coverage Quality**
   - All critical paths tested
   - Security scenarios validated
   - Edge cases covered

---

## Data Model Summary

**Entities Defined:**
1. ✅ Test Suite (collection of tests)
2. ✅ Test Case (individual test)
3. ✅ Test Fixture (test data)
4. ✅ Coverage Target (metrics and goals)
5. ✅ Mock Definition (dependency mocking)

**Catalogs Created:**
1. ✅ Test Suite Catalog (5 major suites)
2. ✅ Test Fixture Catalog (8 fixtures)
3. ✅ Coverage Metrics Model (global and per-module)
4. ✅ Mock Catalog (common mocks)

**Total Test Cases Planned:** 62 (19 + 22 + 8 + 8 + 5)

---

**Data Model Status:** ✅ Complete
**Last Updated:** 2025-11-17
