# Implementation Plan: F003-test-coverage

**Feature Spec:** `production-readiness-specs/F003-test-coverage/spec.md`
**Created:** 2025-11-17
**Branch:** `claude/plan-f003-feature-019Hv4GBGzkWVL7mWAnttwyK`
**Status:** Planning → Implementation

---

## Executive Summary

Improve test coverage from current 78.75% to 90%+ by adding comprehensive tests for untested critical components (main server index.ts with 0% coverage, resource handlers with 0% coverage), integration tests for E2E workflows, and edge case tests for state recovery and concurrent access scenarios.

---

## Technical Context

### Current Implementation Analysis

**Coverage Status (Current):**

```
File               | % Lines | Uncovered Lines | Status
-------------------|---------|-----------------|--------
All files          | 78.75   |                 | 🟡 Below target
src/index.ts       | 0       | 1-305           | 🔴 Critical gap
src/resources      | 0       | 1-157           | 🔴 Critical gap
src/tools          | 98.49   |                 | ✅ Excellent
src/utils          | 95.67   |                 | ✅ Excellent
```

**Untested Components:**

1. **mcp-server/src/index.ts** (305 lines, 0% coverage)
   - Server initialization with metadata
   - Tool handler registration (7 tools)
   - Resource handler registration (3 resources)
   - Request routing logic
   - Error handling for transport/tools
   - Lifecycle management (startup/shutdown)
   - No tests exist for this critical entry point

2. **mcp-server/src/resources/index.ts** (157 lines, 0% coverage)
   - `getStateResource()` - reads .stackshift-state.json
   - `getProgressResource()` - calculates workflow progress
   - `getRouteResource()` - returns selected route
   - Edge cases not tested: missing files, corrupted JSON, large files
   - Security validation not tested (added in F001)

3. **Missing Integration Tests**
   - No E2E workflow tests (analyze → implement)
   - No concurrent access tests
   - No state recovery tests
   - No large codebase handling tests (10k+ files)

**Existing Test Infrastructure:**

✅ **Available** (already implemented):
- Test framework: Vitest 1.0+ with V8 coverage
- Test location: `mcp-server/src/__tests__/` pattern
- Existing test patterns: `analyze.test.ts`, `security.test.ts`, `state-manager.test.ts`
- Mocking utilities: `vi.mock()`, `vi.mocked()` from Vitest
- Coverage configuration: `mcp-server/vitest.config.ts`

✅ **Current Test Coverage**:
- Security module: 100% (67+ test cases) ✅
- State manager: High coverage ✅
- Tools: Only analyze.ts tested (13% tools coverage)
- Resources: No tests (0% coverage)
- Integration: No E2E tests

### Technology Stack

- **Language:** TypeScript 5.3.0 (strict mode)
- **Runtime:** Node.js >=18.0.0
- **Testing Framework:** Vitest 1.0+
- **Coverage Provider:** V8 (built into Vitest)
- **Mocking:** Vitest vi utilities
- **Dependencies:** No new test dependencies required

### Architecture

```
┌─────────────────────────────────────────┐
│   Main Server (index.ts)                │
│   - 0% coverage (305 lines)             │
│   - Critical entry point                │
│   - Needs: Unit + Integration tests     │
└──────────────┬──────────────────────────┘
               │
               ├──► Tools (7 handlers)
               │    ✅ 98.49% coverage
               │
               ├──► Resources (3 handlers)
               │    🔴 0% coverage (157 lines)
               │    Needs: Unit + Security tests
               │
               └──► Utils (4 modules)
                    ✅ 95.67% coverage
```

**Testing Layers Needed:**

1. **Unit Tests** (Priority 0)
   - Main server initialization and routing
   - Resource handlers with mocked file system
   - Edge cases: errors, missing files, invalid input

2. **Integration Tests** (Priority 1)
   - E2E workflow: analyze → reverse-engineer → implement
   - State persistence across tool calls
   - Resource reads during workflow

3. **Security Tests** (Priority 0)
   - Resource handlers with path traversal attempts
   - Large file handling (>10MB blocked)
   - Prototype pollution in JSON parsing

4. **Edge Case Tests** (Priority 1)
   - State recovery from corrupted files
   - Concurrent access (multiple processes)
   - Large codebase handling (10k+ files)

### Unknowns & Clarifications Needed

1. **MCP Server Mocking Strategy**: NEEDS CLARIFICATION
   - How to mock `@modelcontextprotocol/sdk` Server class?
   - How to test StdioServerTransport without actual stdio?
   - Should we use integration tests instead of unit tests for server init?

2. **Test Data Management**: NEEDS CLARIFICATION
   - Where to store test fixtures (sample state files, etc.)?
   - How to clean up test artifacts (temporary directories)?
   - Should we use real temporary directories or virtual file system?

3. **Performance Test Targets**: NEEDS CLARIFICATION
   - What is acceptable latency for resource reads?
   - Should we test with specific file counts (1k, 10k, 100k)?
   - Memory usage limits for large codebase tests?

4. **CI/CD Integration**: NEEDS CLARIFICATION
   - Should we fail CI on coverage drop below 85%?
   - Should we publish coverage reports to external service (Codecov)?
   - Frequency of coverage reporting?

5. **Coverage Thresholds**: NEEDS CLARIFICATION
   - Spec says 85% Phase 1, 90% Phase 3 - are these hard gates?
   - Should we enforce per-file thresholds or global only?
   - Acceptable exclusions (type files, test files)?

6. **Concurrent Access Testing**: NEEDS CLARIFICATION
   - How to spawn multiple processes in tests?
   - What locking mechanism is expected (file locks, atomic writes)?
   - How many concurrent processes to test (3, 10, 100)?

---

## Constitution Check

### Pre-Design Evaluation

**Alignment with Core Values:**

✅ **Security First**: Adds security tests for resource handlers
- Tests for CWE-22 (Path Traversal) in resources
- Tests for CWE-400 (Resource Exhaustion) with large files
- Tests for CWE-502 (Deserialization) with malicious JSON

✅ **Comprehensive Testing**: This is a core value mandate
- Constitution states: "Comprehensive Testing: Security-focused test coverage with 67+ test cases"
- Target coverage: 80% (constitution.md:154)
- This feature directly fulfills this core value

✅ **Zero Technical Debt**: Addresses known technical debt
- Constitution lists "Test Coverage Expansion: 30% → 80%" as High Priority (P0/P1)
- Effort estimate aligns: 19 hours estimated in constitution, similar to spec

**Compliance with Technical Standards:**

✅ **Testing Requirements** (constitution.md:152-159)
- Current: 30% coverage (67+ test cases)
- Target: 80% coverage
- Test types: Unit (70%), Integration (20%), Security (10%)
- This plan adds all three types

✅ **Code Quality** (constitution.md:145-150)
- Tests will validate TypeScript strict mode
- Tests will validate error handling in all MCP handlers
- Tests will validate input validation

✅ **Security Standards** (constitution.md:161-167)
- Tests for 100% input validation
- Tests for SecurityValidator usage in resources
- Tests for resource limits (10MB file size)

**Potential Conflicts:**

❌ **None Identified** - This feature is fully aligned with constitution

**Gate Evaluation:**

🟢 **PASS** - All constitution requirements met
- Test coverage expansion is mandated as P0/P1 priority
- Directly addresses known technical debt
- No new dependencies (uses existing Vitest)

---

## Phase 0: Research & Planning

**Status:** ✅ Complete (see `research.md`)

**Research Completed:**
1. ✅ MCP Server mocking strategy - Hybrid approach (unit + integration)
2. ✅ Test data management - Real temp dirs with UUID isolation
3. ✅ Performance test targets - <150ms/1000 reads, <5s/10k files
4. ✅ CI/CD coverage integration - Codecov with 85% threshold
5. ✅ Coverage threshold enforcement - Global 85%, per-file guidance
6. ✅ Concurrent process testing - 10 parallel processes, atomic writes

**Output:** `research.md` with all NEEDS CLARIFICATION resolved ✅

---

## Phase 1: Design Artifacts

**Status:** ✅ Complete

**Generated Artifacts:**
- ✅ `data-model.md` - Test entity model (test suites, test cases, fixtures)
- ✅ `contracts/README.md` - Testing contracts and patterns
- ✅ `quickstart.md` - Developer guide for writing tests
- ✅ `agent-context.md` - Technology patterns for AI agents

---

## Implementation Phases

### Phase 2: Critical Unit Tests (P0)

**Estimated Effort:** 8-11 hours

#### Task 2.1: Main Server Tests (3-4 hours)

**File:** Create `mcp-server/src/__tests__/index.test.ts`

**Test Suites Required:**
1. Server Initialization (5 tests)
   - Create server with correct metadata (name, version)
   - Register all 7 tool handlers
   - Register all 3 resource handlers
   - Handle stdio transport initialization
   - Error handling on startup failure

2. Request Routing (6 tests)
   - Route each of 7 tools correctly
   - Handle invalid tool names
   - Validate tool arguments
   - Handle missing arguments
   - Error responses formatted correctly
   - Tool execution errors handled

3. Error Handling (4 tests)
   - Transport errors gracefully handled
   - Tool execution errors caught and formatted
   - Resource read errors handled
   - Server shutdown on fatal errors

4. Lifecycle Management (4 tests)
   - Server startup completes successfully
   - Server shutdown cleanup
   - Concurrent requests handled
   - State persists across requests

**Total:** 19 test cases
**Target Coverage:** index.ts from 0% → 80%+

**Acceptance Criteria:**
- [ ] All 19 tests pass
- [ ] index.ts coverage ≥80%
- [ ] No real stdio transport used (mocked)
- [ ] Tests run in <10 seconds

#### Task 2.2: Resource Handler Tests (3-4 hours)

**File:** Create `mcp-server/src/resources/__tests__/index.test.ts`

**Test Suites Required:**
1. getStateResource() (8 tests)
   - Return state when file exists
   - Handle missing state file
   - Handle corrupted JSON
   - Enforce size limits (>10MB rejection)
   - Validate directory access (security)
   - Prevent path traversal
   - Handle null byte injection
   - Return correct MIME type and format

2. getProgressResource() (7 tests)
   - Calculate progress correctly (2/6 = 33%)
   - Handle greenfield vs brownfield routes
   - Show completed status (100%)
   - Handle missing state file
   - Calculate current step correctly
   - Format markdown output correctly
   - Handle empty completedSteps array

3. getRouteResource() (3 tests)
   - Return route when selected
   - Handle missing route (not selected yet)
   - Format response correctly

4. Security Validation (4 tests)
   - Prevent path traversal (../../etc/passwd)
   - Validate process.cwd() before use
   - Sanitize JSON before parsing (__proto__)
   - Enforce 10MB file size limit

**Total:** 22 test cases
**Target Coverage:** resources/index.ts from 0% → 90%+

**Acceptance Criteria:**
- [ ] All 22 tests pass
- [ ] resources/index.ts coverage ≥90%
- [ ] Security tests validate F001 fixes
- [ ] Mock file system used (no real files)

#### Task 2.3: Coverage Configuration (1 hour)

**File:** Update `mcp-server/vitest.config.ts`

**Changes Required:**
1. Set coverage thresholds (85% Phase 1)
2. Configure reporters (text, json, html, lcov)
3. Exclude test files and type definitions
4. Configure coverage provider (v8)

**Acceptance Criteria:**
- [ ] Coverage thresholds enforced (85% lines, functions, statements, 80% branches)
- [ ] Test failures on threshold violations
- [ ] HTML coverage report generated

### Phase 3: Integration & Edge Case Tests (P1)

**Estimated Effort:** 11-14 hours

#### Task 3.1: E2E Workflow Tests (5-6 hours)

**File:** Create `mcp-server/src/__tests__/integration.test.ts`

**Test Suites Required:**
1. Complete Greenfield Workflow (1 test, complex)
   - Run all 6 gears sequentially
   - Verify state updates at each step
   - Verify outputs (8 docs from reverse-engineer, etc.)
   - Verify final completion status

2. Interruption & Resume (2 tests)
   - Interrupt workflow mid-way
   - Resume from last checkpoint
   - Handle corrupted state file recovery

3. Concurrent Access (3 tests)
   - Multiple processes running analyze simultaneously
   - Only one succeeds (atomic state locking)
   - State file not corrupted

4. Large Codebase Handling (2 tests)
   - Test with 10k+ files
   - Memory usage within limits
   - Completion without errors

**Total:** 8 integration test cases
**Estimated Time:** 5-6 hours (complex setup required)

**Acceptance Criteria:**
- [ ] All 8 integration tests pass
- [ ] Tests use real temporary directories
- [ ] Cleanup after tests complete
- [ ] Tests run in <60 seconds

#### Task 3.2: State Recovery Tests (3-4 hours)

**File:** Create `mcp-server/src/utils/__tests__/state-recovery.test.ts`

**Test Suites Required:**
1. Corrupted JSON Recovery (3 tests)
   - Recover from corrupted JSON
   - Restore from backup file
   - Fail gracefully if no backup

2. Backup File Management (3 tests)
   - Maintain max 3 backups
   - Rotate old backups
   - Backup file format correct

3. Automatic Recovery (2 tests)
   - Auto-recover from .bak file
   - Prompt user if recovery impossible

**Total:** 8 test cases

**Acceptance Criteria:**
- [ ] All 8 tests pass
- [ ] State recovery logic validated
- [ ] Backup rotation tested

#### Task 3.3: Performance Tests (3-4 hours)

**File:** Create `mcp-server/src/__tests__/performance.test.ts`

**Test Suites Required:**
1. Resource Read Performance (3 tests)
   - 1000 reads <150ms total
   - Validation overhead <100ms
   - Memory usage <50MB

2. Large File Handling (2 tests)
   - 10k files scanned <5 seconds
   - Memory usage <500MB

**Total:** 5 test cases

**Acceptance Criteria:**
- [ ] All 5 tests pass
- [ ] Performance targets met
- [ ] Tests run on CI

### Phase 4: CI/CD & Documentation (P1)

**Estimated Effort:** 1-2 hours

#### Task 4.1: CI/CD Configuration (1 hour)

**File:** Create/Update `.github/workflows/ci.yml`

**Changes Required:**
1. Add coverage step to CI
2. Fail on coverage drop below 85%
3. Upload coverage to Codecov (optional)
4. Add coverage badge to README

**Acceptance Criteria:**
- [ ] CI runs tests with coverage
- [ ] CI fails on <85% coverage
- [ ] Coverage reports published

#### Task 4.2: Documentation (1 hour)

**Files to Update:**
- [ ] Update `mcp-server/README.md` with coverage badge
- [ ] Add testing guide to docs
- [ ] Update CONTRIBUTING.md with test requirements

**Acceptance Criteria:**
- [ ] Coverage badge visible in README
- [ ] Testing guide explains how to write tests
- [ ] Contributors know test requirements

---

## Risks & Mitigations

### Risk 1: MCP SDK Mocking Complexity
- **Impact:** Difficult to test server initialization without real transport
- **Probability:** Medium
- **Mitigation:**
  - Use integration tests where mocking is too complex
  - Mock at higher level (tool/resource handlers, not SDK internals)
  - Accept slightly lower coverage for SDK integration code

### Risk 2: Flaky Integration Tests
- **Impact:** CI failures due to timing issues, temp file cleanup
- **Probability:** Medium
- **Mitigation:**
  - Use proper cleanup in `afterEach` hooks
  - Add retries for file system operations
  - Isolate test directories per test case
  - Use unique temp directories (UUID-based)

### Risk 3: Performance Test Variability
- **Impact:** Tests pass locally, fail on CI due to slower machines
- **Probability:** Medium
- **Mitigation:**
  - Use generous timeouts (2x expected time)
  - Focus on relative performance (before/after)
  - Skip performance tests on slow CI runners (env var)

### Risk 4: Coverage Threshold Too Strict
- **Impact:** Legitimate code changes blocked by coverage drops
- **Probability:** Low
- **Mitigation:**
  - Set threshold at 85% (not 90%) initially
  - Allow per-commit variance (±2%)
  - Exclude truly untestable code (type defs)

### Risk 5: Test Maintenance Burden
- **Impact:** Tests break frequently as code changes
- **Probability:** Low
- **Mitigation:**
  - Write tests against behavior, not implementation
  - Use stable APIs for mocking
  - Keep tests simple and focused

---

## Dependencies

**Must be complete before starting:**
- ✅ Test framework exists (Vitest)
- ✅ Coverage provider configured (V8)
- ⏳ F001 security fixes (for security test validation)

**Blocks these features:**
- F005-deployment (cannot deploy with low coverage)
- F006-feature-completion (tests validate completeness)

**No external dependencies required**

---

## Effort Estimate

- **Phase 2 (Critical Unit Tests):** ~8-11 hours
  - Main server tests: 3-4 hours
  - Resource handler tests: 3-4 hours
  - Coverage configuration: 1 hour
  - Buffer: 1-3 hours

- **Phase 3 (Integration Tests):** ~11-14 hours
  - E2E workflow tests: 5-6 hours
  - State recovery tests: 3-4 hours
  - Performance tests: 3-4 hours

- **Phase 4 (CI/CD & Docs):** ~1-2 hours
  - CI/CD configuration: 1 hour
  - Documentation: 1 hour

**Total Estimated Effort:** 20-27 hours

**Phased Rollout:**
- Phase 1 (Week 1): 8-11 hours → 85% coverage
- Phase 2 (Week 2): 11-14 hours → 88% coverage
- Phase 3 (Week 3): Included in 11-14 → 90%+ coverage

---

## Testing Strategy

### Unit Tests (70% of effort)
- **Location:** `mcp-server/src/__tests__/*.test.ts`
- **Focus:** Main server, resource handlers, edge cases
- **Coverage Target:** 90%+ for critical modules
- **Tools:** Vitest with vi.mock()

### Integration Tests (20% of effort)
- **Location:** `mcp-server/src/__tests__/integration.test.ts`
- **Focus:** E2E workflows, concurrent access
- **Coverage Target:** Critical paths covered
- **Tools:** Real temp directories, process spawning

### Security Tests (10% of effort)
- **Location:** Embedded in unit tests
- **Focus:** Path traversal, large files, prototype pollution
- **Coverage Target:** All security validations tested
- **Tools:** Crafted malicious inputs

---

## Success Criteria

**Coverage Targets:**
- [ ] Overall: 85% (Phase 1) → 90%+ (Phase 3)
- [ ] index.ts: ≥80%
- [ ] resources/index.ts: ≥90%
- [ ] tools/: Maintain 98%+
- [ ] utils/: Maintain 95%+

**Test Metrics:**
- [ ] Total tests: 67+ → 120+ (add 53+ new tests)
- [ ] All tests pass
- [ ] No flaky tests (consistent results)
- [ ] Test execution <60 seconds

**CI/CD:**
- [ ] Coverage enforced on CI
- [ ] Coverage reports generated
- [ ] Coverage badge in README
- [ ] CI fails on <85% coverage

**Code Quality:**
- [ ] TypeScript strict mode maintained
- [ ] No linting errors
- [ ] Tests follow existing patterns

---

## Rollback Plan

If test coverage work causes issues:

1. **Immediate Rollback** (if tests block development)
   ```bash
   git revert <commit-hash>
   npm test
   ```

2. **Threshold Adjustment** (if too strict)
   - Lower threshold from 85% to 80%
   - Adjust per-file thresholds
   - Allow temporary exceptions

3. **Test Disabling** (if flaky)
   - Mark flaky tests with `test.skip()`
   - File issues for investigation
   - Re-enable when fixed

---

## Post-Design Constitution Re-Check

**Status:** ✅ Complete - Design artifacts reviewed

### Artifacts Generated

1. ✅ **research.md** - All unknowns resolved, testing strategies documented
2. ✅ **data-model.md** - Test entity model defined (62 test cases planned)
3. ✅ **contracts/README.md** - Testing contracts and patterns documented
4. ✅ **quickstart.md** - Comprehensive developer implementation guide (500+ lines)
5. ✅ **agent-context.md** - Testing patterns documented for AI agents

### Post-Design Evaluation

**Alignment with Core Values (Re-Verified):**

✅ **Comprehensive Testing** (constitution.md:19)
- This IS a core value mandate
- Design adds 53+ new test cases (67 → 120+)
- Covers unit, integration, security, and performance tests
- Directly fulfills "Security-focused test coverage" requirement

✅ **Security First** (constitution.md:15)
- Design includes security tests for all resource handlers
- Tests CWE-22 (path traversal), CWE-400 (DoS), CWE-502 (deserialization)
- Validates F001 security fixes are working correctly
- No security compromises made for convenience

✅ **Zero Technical Debt** (constitution.md:18)
- Addresses P0/P1 technical debt (constitution.md:248-251)
- No TODOs or FIXMEs introduced in design
- All clarifications resolved in research phase
- Clean, production-ready design

✅ **Atomic Operations** (constitution.md:16)
- Tests validate atomic state management
- Concurrent access tests confirm atomicity
- No changes to state management patterns (only testing them)

**Compliance with Technical Architecture (Re-Verified):**

✅ **Minimal Dependencies** (constitution.md:136-139)
- Zero new test dependencies
- Uses existing Vitest framework
- Aligns with "minimal dependency" principle
- V8 coverage built into Vitest

✅ **Testing Requirements** (constitution.md:152-159)
- Current: 30% coverage (67+ tests)
- Target: 85% Phase 1, 90% Phase 3
- Test types: Unit (70%), Integration (20%), Security (10%)
- Design includes all three types

✅ **TypeScript Strict Mode** (constitution.md:106-109)
- All tests will use strict TypeScript
- Type-safe test implementations
- No `any` types without justification

**Development Standards Compliance (Re-Verified):**

✅ **Code Quality** (constitution.md:145-150)
- Tests follow AAA pattern (Arrange-Act-Assert)
- Error handling tested in all code paths
- Clear naming conventions documented
- JSDoc patterns in contracts

✅ **Security Standards** (constitution.md:161-167)
- Security tests for 100% of validation code
- Path operations tested via SecurityValidator
- Resource limits tested (10MB enforcement)
- All CWE scenarios covered

✅ **Testing Requirements** (constitution.md:152-159)
- Design targets 85% → 90% coverage
- Unit tests: 41 planned (index.ts, resources)
- Integration tests: 8 planned (E2E workflows)
- Security tests: 13 planned (embedded in unit tests)

**Quality Metrics (Post-Design):**

✅ **Test Coverage Plan**
- index.ts: 0% → 80% (target realistic given SDK integration)
- resources: 0% → 90% (fully testable)
- Overall: 78.75% → 85% Phase 1 → 90% Phase 3

✅ **Documentation**
- quickstart.md: 500+ lines comprehensive guide
- contracts/README.md: 11 documented patterns
- data-model.md: Complete test entity model
- agent-context.md: 6 testing patterns documented

✅ **CI/CD Integration**
- Coverage enforced automatically
- GitHub Actions workflow defined
- Codecov integration planned
- Coverage badge specified

**Risks Re-Evaluated:**

✅ **All risks mitigated in design**
- MCP SDK mocking: Hybrid approach (research.md Q1)
- Test data: Real temp dirs with cleanup (research.md Q2)
- Performance: Generous thresholds for CI (research.md Q3)
- CI integration: Automated with Codecov (research.md Q4)
- Thresholds: 85% global, guidance per-file (research.md Q5)
- Concurrency: 10 processes, atomic writes (research.md Q6)

**Gate Evaluation (Post-Design):**

🟢 **PASS** - All requirements met after design phase

**Key Changes from Pre-Design:**
- ✅ All 6 "NEEDS CLARIFICATION" resolved
- ✅ Testing patterns documented and validated
- ✅ Implementation path clear and actionable
- ✅ No constitution conflicts identified
- ✅ 62 test cases detailed in data-model.md

**Constitutional Concerns:**

❌ **None** - Design fully aligns with all constitutional requirements

**Recommendation:**

✅ **APPROVED FOR IMPLEMENTATION**

This design:
- Fulfills core value mandate (Comprehensive Testing)
- Addresses known P0/P1 technical debt
- Uses existing patterns and tools (Vitest)
- Maintains code quality standards
- Includes comprehensive testing strategy
- Introduces no new technical debt
- Aligns 100% with StackShift constitution

**Proceed to Phase 2 (Implementation)** with confidence

---

## Next Steps

1. ✅ **Phase 0 Complete:** Research findings documented
2. ✅ **Phase 1 Complete:** Design artifacts generated
3. ⏳ **Ready for Phase 2:** Implementation can begin

**To execute implementation:**
```bash
# Start with Priority 0 tests (main server + resources)
# See quickstart.md for step-by-step guide

# Phase 2.1: Main server tests (3-4 hours)
# Phase 2.2: Resource handler tests (3-4 hours)
# Phase 2.3: Coverage configuration (1 hour)
```

**Branch:** `claude/plan-f003-feature-019Hv4GBGzkWVL7mWAnttwyK`

---

**Plan Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-17
