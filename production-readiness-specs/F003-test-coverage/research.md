# Research: F003-test-coverage

**Date:** 2025-11-17
**Status:** ✅ Complete
**Purpose:** Resolve all NEEDS CLARIFICATION items from implementation plan

---

## Research Questions

This document resolves the 6 unknowns identified in the Technical Context section of `impl-plan.md`.

---

## Question 1: MCP Server Mocking Strategy

**Question:** How to mock `@modelcontextprotocol/sdk` Server class? How to test StdioServerTransport without actual stdio?

### Decision

**Use hybrid approach: Unit tests for handlers, Integration tests for server lifecycle**

### Rationale

1. **MCP SDK architecture analysis**
   - `Server` class is from external dependency (@modelcontextprotocol/sdk)
   - `StdioServerTransport` requires actual stdio streams
   - Testing these directly requires complex mocking of third-party internals

2. **Practical testing strategy**
   - **Unit test**: Tool handlers and resource handlers in isolation
   - **Integration test**: Server initialization with mock transport
   - **Skip**: Stdio transport testing (covered by SDK's own tests)

3. **Industry best practice**
   - Don't mock what you don't own (third-party SDKs)
   - Test at API boundaries (handler functions)
   - Use integration tests for glue code

### Implementation Approach

**Unit Tests** (for handlers):
```typescript
// Test tool handlers directly without Server instance
import { analyzeToolHandler } from '../tools/analyze.js';

describe('Tool Handlers', () => {
  it('should execute analyze tool', async () => {
    const result = await analyzeToolHandler({ directory: '/test' });
    expect(result).toContain('Analysis Complete');
  });
});
```

**Integration Tests** (for server initialization):
```typescript
// Test server setup with minimal mocking
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

describe('Server Integration', () => {
  it('should initialize server with correct metadata', () => {
    const server = new Server({
      name: 'stackshift-mcp',
      version: '1.0.0'
    });

    expect(server.name).toBe('stackshift-mcp');
  });
});
```

**Skip** (transport testing):
- StdioServerTransport is tested by MCP SDK maintainers
- Our code uses it, doesn't modify it
- Trust the SDK's own test suite

### Coverage Impact

- Expected coverage of index.ts: **70-80%** (not 100%)
- Uncovered lines: Stdio transport setup (~20-30 lines)
- **Acceptable**: These lines are trivial SDK usage

### Alternatives Considered

1. **Full mocking with vi.mock('@modelcontextprotocol/sdk')**
   - ❌ Rejected: Brittle, tests implementation not behavior
   - Breaks when SDK internals change
   - Doesn't validate actual integration

2. **No tests for server initialization**
   - ❌ Rejected: Leaves critical entry point untested
   - Server metadata errors wouldn't be caught

3. **Use real stdio in tests**
   - ❌ Rejected: Requires spawning processes, complex setup
   - Slow test execution
   - Flaky on CI

---

## Question 2: Test Data Management

**Question:** Where to store test fixtures? How to clean up test artifacts? Real directories or virtual file system?

### Decision

**Use real temporary directories with UUID-based isolation and automatic cleanup**

### Rationale

1. **Test fixture location**
   - Store in `mcp-server/src/__tests__/fixtures/`
   - Sample state files, corrupted JSON, large files
   - Version controlled for reproducibility

2. **Runtime test data**
   - Use Node.js `os.tmpdir()` for actual test execution
   - Each test gets unique directory: `/tmp/stackshift-test-{uuid}/`
   - Prevents test interference

3. **Cleanup strategy**
   - Use Vitest's `afterEach` hook
   - Delete temp directories after each test
   - Fail test if cleanup fails (detect leaks)

4. **Why real file system (not virtual)**
   - SecurityValidator uses real file system APIs (fs.stat, fs.realpath)
   - Virtual file systems (memfs) don't support these fully
   - Need to test actual path traversal prevention
   - StateManager uses atomic file operations (fs.rename) - must be real

### Implementation Pattern

```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

describe('Resource Handlers', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create unique temp directory
    const tmpBase = join(tmpdir(), 'stackshift-test-');
    testDir = await mkdtemp(tmpBase);
  });

  afterEach(async () => {
    // Clean up
    await rm(testDir, { recursive: true, force: true });
  });

  it('should read state file', async () => {
    // Test uses testDir
    const stateFile = join(testDir, '.stackshift-state.json');
    // ...
  });
});
```

### Fixture Structure

```
mcp-server/src/__tests__/fixtures/
├── state/
│   ├── valid-state.json
│   ├── corrupted-state.json
│   ├── large-state.json (11MB)
│   └── proto-pollution.json (__proto__)
├── projects/
│   ├── small/ (10 files)
│   ├── medium/ (100 files)
│   └── large/ (1000 files) - gitignored
└── README.md (explains fixtures)
```

### Alternatives Considered

1. **Virtual file system (memfs)**
   - ❌ Rejected: Doesn't support fs.realpath, fs.stat fully
   - SecurityValidator tests would fail
   - Atomic rename not guaranteed

2. **Single shared temp directory**
   - ❌ Rejected: Tests interfere with each other
   - Parallel test execution broken
   - Cleanup race conditions

3. **No cleanup (leave artifacts)**
   - ❌ Rejected: Fills /tmp over time
   - CI environments have limited disk space
   - Debugging contamination

---

## Question 3: Performance Test Targets

**Question:** What is acceptable latency for resource reads? File count targets? Memory limits?

### Decision

**Resource reads <150ms per 1000 reads, large codebases <5s scan for 10k files, memory <500MB**

### Rationale

1. **Resource read performance**
   - MCP resources read for status checks (infrequent)
   - Not in critical path (unlike tool execution)
   - Current: ~50-100ms per 1000 reads (estimated)
   - **Target: <150ms per 1000 reads** (0.15ms per read)
   - **Acceptable overhead: <50% increase** from validation

2. **File scanning performance**
   - Analyze tool scans codebase
   - Constitution states: "File scanning: <5 seconds for 10K files" (constitution.md:209)
   - **Use same target: <5s for 10k files**

3. **Memory usage**
   - Constitution states: "Memory usage: <500MB typical" (constitution.md:210)
   - **Target: <500MB for large codebase (10k files)**
   - Peak memory during analysis, not sustained

4. **Benchmarking approach**
   - Don't benchmark pre-implementation (unnecessary)
   - Set threshold targets based on constitution
   - Fail tests if exceeded (regression detection)

### Performance Test Targets

```typescript
describe('Performance Tests', () => {
  it('should read resources quickly', async () => {
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
      await getStateResource();
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(150); // <150ms for 1000 reads
  });

  it('should handle 10k files efficiently', async () => {
    const largeProject = createTestProject(10000);

    const start = Date.now();
    await analyzeToolHandler({ directory: largeProject });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(5000); // <5s
  });

  it('should use limited memory', async () => {
    const before = process.memoryUsage().heapUsed;

    await analyzeToolHandler({ directory: largeProject });

    const after = process.memoryUsage().heapUsed;
    const delta = after - before;

    expect(delta).toBeLessThan(500 * 1024 * 1024); // <500MB
  });
});
```

### CI Considerations

- Performance tests may be slower on CI
- Use `test.skipIf()` for slow runners
- Environment variable: `SKIP_PERF_TESTS=true`

### Alternatives Considered

1. **Strict 100% baseline enforcement**
   - ❌ Rejected: Too brittle, fails on slow CI
   - Variability across machines

2. **No performance tests**
   - ❌ Rejected: Can't detect regressions
   - Large codebase handling important

3. **External benchmarking tool**
   - ❌ Rejected: Adds complexity
   - Vitest built-in timing sufficient

---

## Question 4: CI/CD Integration

**Question:** Fail CI on coverage drop below 85%? Publish to Codecov? Frequency of coverage reporting?

### Decision

**Enforce 85% threshold on CI, publish coverage reports, generate on every push/PR**

### Rationale

1. **Coverage threshold enforcement**
   - Constitution requires 80% coverage (constitution.md:154)
   - Spec targets 85% Phase 1, 90% Phase 3
   - **Enforce 85% on CI** (matches Phase 1 target)
   - Hard failure prevents coverage regressions

2. **Coverage reporting service**
   - **Use Codecov** (free for open source)
   - Alternatives: Coveralls, Code Climate
   - Codecov chosen: GitHub integration, diff coverage, trend tracking

3. **Reporting frequency**
   - Every push to main: Generate and upload
   - Every pull request: Generate and comment
   - Coverage badge in README (updated automatically)

4. **Spec requirements**
   - Spec includes CI configuration (spec.md:475-494)
   - Upload to Codecov: `uses: codecov/codecov-action@v3`
   - Fail CI if error: `fail_ci_if_error: true`

### CI Configuration

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

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
```

### Coverage Badge

**README.md:**
```markdown
[![codecov](https://codecov.io/gh/jschulte/stackshift/branch/main/graph/badge.svg)](https://codecov.io/gh/jschulte/stackshift)
```

### Alternatives Considered

1. **No CI enforcement**
   - ❌ Rejected: Coverage will degrade over time
   - No accountability

2. **Different threshold per branch**
   - ❌ Rejected: Complexity not justified
   - 85% is reasonable for all branches

3. **Manual coverage checks**
   - ❌ Rejected: Human error, forgotten
   - Automated is reliable

---

## Question 5: Coverage Thresholds

**Question:** Are 85%/90% hard gates? Per-file or global? Acceptable exclusions?

### Decision

**Global 85% threshold (hard gate), per-file guidance (not enforced), exclude tests and types**

### Rationale

1. **Threshold progression**
   - Spec defines: 85% Phase 1, 88% Phase 2, 90% Phase 3
   - **Enforce 85% globally** as minimum (hard gate)
   - **Target 90%** as goal (not enforced initially)
   - Per-commit variance: ±2% acceptable

2. **Per-file vs global**
   - **Global threshold** (enforced): All files combined ≥85%
   - **Per-file guidance** (not enforced): Critical modules ≥90%
   - index.ts ≥80%, resources ≥90% (spec.md:36-40) - goals, not gates

3. **Exclusions**
   - Test files: `**/*.test.ts`, `**/*.spec.ts`
   - Type definitions: `src/types/**`
   - Build artifacts: `dist/**`
   - Rationale: These don't need coverage (tests test, types compile-check)

4. **Vitest configuration**
   - Set in `vitest.config.ts`
   - Enforced by Vitest, not shell script
   - Cleaner, more reliable

### Vitest Configuration

**File:** `mcp-server/vitest.config.ts`

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
        branches: 80,  // Branches harder to cover
        statements: 85
      }
    }
  }
});
```

### Per-File Targets (Guidance)

| File/Module           | Target | Rationale                          |
|-----------------------|--------|-------------------------------------|
| src/index.ts          | 80%    | Stdio transport hard to test       |
| src/resources/**      | 90%    | Critical, all paths testable       |
| src/tools/**          | 80%    | Already excellent (98.49%)         |
| src/utils/security.ts | 100%   | Already achieved ✅                |
| src/utils/state-manager.ts | 90% | Critical for data integrity    |

**Note:** These are guidance, not enforced gates. Global 85% is enforced.

### Alternatives Considered

1. **Per-file thresholds enforced**
   - ❌ Rejected: Too strict, blocks legitimate code
   - Some files harder to test (I/O, SDK integration)

2. **90% global threshold immediately**
   - ❌ Rejected: Too aggressive for Phase 1
   - Incremental rollout better (85% → 90%)

3. **No exclusions (test files included)**
   - ❌ Rejected: Tests shouldn't be tested
   - Inflates coverage artificially

---

## Question 6: Concurrent Access Testing

**Question:** How to spawn multiple processes in tests? Expected locking mechanism? How many concurrent processes?

### Decision

**Spawn 3-10 concurrent processes using Node child_process, expect atomic file operations to prevent corruption**

### Rationale

1. **Concurrency mechanism**
   - StackShift uses **atomic file operations** (not file locks)
   - StateManager uses `fs.rename()` which is atomic on POSIX
   - Multiple processes writing state → only last write wins
   - No explicit locking (file locks are complex, error-prone)

2. **Process count for testing**
   - **3 processes**: Minimum to detect race conditions
   - **10 processes**: Stress test for production scenarios
   - **Not 100+**: Diminishing returns, slow tests

3. **Testing approach**
   - Spawn multiple Node processes executing same tool
   - Each process tries to update state
   - Verify state file not corrupted (valid JSON)
   - Verify state consistency (no partial writes)

4. **Constitution requirements**
   - Constitution states: "Concurrent access: Safe (tested with 10 parallel)" (constitution.md:215)
   - **Use 10 parallel processes** for stress test

### Implementation Pattern

```typescript
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

describe('Concurrent Access Tests', () => {
  it('should handle 10 concurrent processes safely', async () => {
    const testDir = await mkdtemp('/tmp/stackshift-');

    // Spawn 10 processes running analyze tool
    const processes = [];
    for (let i = 0; i < 10; i++) {
      const p = spawn('node', [
        'dist/index.js',
        '--tool', 'stackshift_analyze',
        '--directory', testDir
      ]);
      processes.push(p);
    }

    // Wait for all to complete
    await Promise.all(processes.map(waitForExit));

    // Verify state file is valid (not corrupted)
    const stateFile = join(testDir, '.stackshift-state.json');
    const state = JSON.parse(await readFile(stateFile, 'utf-8'));

    // State should be valid JSON (atomic writes prevented corruption)
    expect(state).toHaveProperty('version');
    expect(state.version).toBe('1.0.0');
  });

  it('should prevent race conditions in state updates', async () => {
    // Spawn 3 processes writing different states
    const processes = [
      spawnStateWrite({ step: 'analyze' }),
      spawnStateWrite({ step: 'reverse-engineer' }),
      spawnStateWrite({ step: 'create-specs' })
    ];

    await Promise.all(processes.map(waitForExit));

    // State should be one of the three (not corrupted mix)
    const state = await readState(testDir);
    expect(['analyze', 'reverse-engineer', 'create-specs'])
      .toContain(state.currentStep);
  });
});

function waitForExit(process: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    process.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}
```

### Expected Behavior

- **Atomic writes**: Only complete writes, no partial corruption
- **Last write wins**: State reflects last process to complete
- **No deadlocks**: No locking, can't deadlock
- **No data loss**: State always valid JSON

### Alternatives Considered

1. **File locking (flock)**
   - ❌ Rejected: Complex, platform-specific
   - Doesn't work on network file systems
   - StateManager already uses atomic rename

2. **100+ concurrent processes**
   - ❌ Rejected: Slow, unnecessary
   - 10 processes sufficient to detect issues

3. **Thread-based concurrency (worker_threads)**
   - ❌ Rejected: StackShift is multi-process (MCP servers)
   - Test real-world scenario (multiple MCP clients)

---

## Research Summary

### All Questions Resolved ✅

| Question | Decision | Impact |
|----------|----------|--------|
| 1. MCP Mocking | Hybrid: Unit + Integration tests | 70-80% index.ts coverage |
| 2. Test Data | Real temp dirs + UUID isolation | Reliable, isolated tests |
| 3. Performance | <150ms/1000 reads, <5s/10k files | Constitution-aligned |
| 4. CI/CD | Codecov, 85% threshold enforced | Automated quality gates |
| 5. Coverage | 85% global, guidance per-file | Pragmatic, achievable |
| 6. Concurrency | 10 parallel processes, atomic writes | Stress tested |

### Key Patterns Established

1. **Testing Philosophy**
   - Test behavior, not implementation
   - Don't mock what you don't own
   - Use real file system for security tests

2. **Coverage Strategy**
   - Global threshold enforced (85%)
   - Per-file guidance (not gates)
   - Incremental improvement (85% → 90%)

3. **Performance Targets**
   - Based on constitution requirements
   - Generous tolerances for CI variability
   - Skippable on slow runners

4. **CI Integration**
   - Automated coverage reporting
   - Hard gates prevent regressions
   - Visual feedback (badges, trends)

### Technical Decisions Finalized

- **Test framework**: Vitest (existing) ✅
- **Coverage provider**: V8 (built-in) ✅
- **Mocking strategy**: Vitest vi.mock() ✅
- **File system**: Real temp directories ✅
- **Fixture location**: `src/__tests__/fixtures/` ✅
- **CI platform**: GitHub Actions ✅
- **Coverage service**: Codecov ✅
- **Concurrency**: Child process spawning ✅

### Risk Mitigations Identified

1. **MCP SDK mocking complexity** → Hybrid approach
2. **Flaky tests** → UUID isolation, proper cleanup
3. **CI variability** → Generous timeouts, skip flags
4. **Coverage too strict** → ±2% variance, 85% not 90%

---

## Next Steps

**Research Complete** - Ready for Phase 1: Design Artifacts

1. ✅ All unknowns resolved
2. ✅ Technical patterns decided
3. ✅ Implementation approach clear
4. ⏳ Next: Generate data-model.md
5. ⏳ Next: Generate quickstart.md

**No blockers remaining** - Proceed to design phase

---

**Research Status:** ✅ Complete
**Last Updated:** 2025-11-17
