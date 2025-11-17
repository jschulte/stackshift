# Tasks: F003-test-coverage

**Feature:** Test Coverage Improvements (78.75% → 90%+)

---

## Inputs

**Design Documents:**
- ✅ `impl-plan.md` - Implementation plan with phased approach
- ✅ `spec.md` - Coverage goals and test requirements
- ✅ `data-model.md` - Test suites and coverage targets
- ✅ `research.md` - Testing strategy decisions
- ✅ `quickstart.md` - Developer implementation guide
- ✅ `contracts/README.md` - Testing patterns and conventions

**Prerequisites:**
- Vitest 1.0+ already configured ✅
- V8 coverage provider available ✅
- Existing test patterns to follow ✅

**Test Approach:** TDD (tests written first, verified to fail before implementation)

---

## Implementation Strategy

### MVP Scope
**US1 Only**: Main Server Tests achieving 80% index.ts coverage
- **Delivers:** Critical entry point tested, server initialization validated
- **Timeline:** 3-4 hours
- **Value:** Catches server startup/routing errors early

### Full Feature Scope
- **US1** (P0): Main Server Tests → 80% index.ts coverage
- **US2** (P0): Resource Handler Tests → 90% resources coverage
- **US3** (P1): Integration Tests → E2E workflows validated
- **US4** (P1): CI/CD Configuration → Coverage enforced on CI

### Incremental Delivery
1. **Sprint 1** (US1): Main server tests → 80% coverage deliverable
2. **Sprint 2** (US2): Resource tests → 85% overall coverage milestone
3. **Sprint 3** (US3): Integration tests → 88% overall coverage
4. **Sprint 4** (US4): CI/CD polish → 90%+ coverage with automation

---

## Phase 1: Setup

**Goal:** Prepare test infrastructure and fixtures for test implementation

**Tasks:**
- [ ] T001 Create test fixtures directory structure in mcp-server/src/__tests__/fixtures/
- [ ] T002 Create state fixtures: valid-state.json, corrupted-state.json, complete-state.json, proto-pollution.json in fixtures/state/
- [ ] T003 Create .gitignore for large test fixtures in fixtures/
- [ ] T004 Verify Vitest configuration exists in mcp-server/vitest.config.ts
- [ ] T005 Review existing test patterns in mcp-server/src/__tests__/security.test.ts and analyze.test.ts

**Checkpoint:** ✅ Fixtures directory created, example state files ready, test patterns reviewed

---

## Phase 2: Foundational

**Goal:** Configure coverage thresholds and reporting (blocks all user stories)

**Tasks:**
- [ ] T006 Update vitest.config.ts with coverage thresholds (85% lines/functions/statements, 80% branches)
- [ ] T007 Configure coverage reporters (text, json, html, lcov) in vitest.config.ts
- [ ] T008 Add coverage exclusions (test files, types, dist) to vitest.config.ts
- [ ] T009 Add test:coverage script to mcp-server/package.json
- [ ] T010 Run baseline coverage report and verify current 78.75% coverage in mcp-server/

**Checkpoint:** ✅ Coverage configuration enforces 85% threshold, baseline metrics confirmed

**Parallel Execution:** All tasks T006-T010 can run in parallel (different config sections)

---

## Phase 3: US1 - Main Server Tests (P0)

**User Story:** As a developer, I want the main server entry point (index.ts) tested so that server initialization, tool registration, and request routing are validated.

**Goal:** Achieve 80% coverage of mcp-server/src/index.ts (currently 0%)

**Success Criteria:**
- [ ] index.ts coverage ≥80% (lines, functions, statements)
- [ ] All 19 test cases pass
- [ ] Server initialization tests run in <5 seconds
- [ ] Tests can run independently (no cross-test dependencies)

**Independent Test:** `npm test -- index.test.ts` passes with 80%+ coverage

### Tasks

**Test File Setup:**
- [ ] T011 [US1] Create mcp-server/src/__tests__/index.test.ts with basic structure (imports, vi.mock setup)

**Server Initialization Suite (5 tests):**
- [ ] T012 [P] [US1] Write test: "should create server with correct metadata" in index.test.ts
- [ ] T013 [P] [US1] Write test: "should register all 7 tool handlers" in index.test.ts
- [ ] T014 [P] [US1] Write test: "should register all 3 resource handlers" in index.test.ts
- [ ] T015 [P] [US1] Write test: "should handle stdio transport initialization" in index.test.ts
- [ ] T016 [P] [US1] Write test: "should handle startup failure errors" in index.test.ts

**Request Routing Suite (6 tests):**
- [ ] T017 [P] [US1] Write test: "should route stackshift_analyze correctly" in index.test.ts
- [ ] T018 [P] [US1] Write test: "should route all 7 tools correctly" (parameterized test) in index.test.ts
- [ ] T019 [P] [US1] Write test: "should handle invalid tool names" in index.test.ts
- [ ] T020 [P] [US1] Write test: "should validate tool arguments" in index.test.ts
- [ ] T021 [P] [US1] Write test: "should handle missing arguments" in index.test.ts
- [ ] T022 [P] [US1] Write test: "should format error responses correctly" in index.test.ts

**Error Handling Suite (4 tests):**
- [ ] T023 [P] [US1] Write test: "should handle transport errors gracefully" in index.test.ts
- [ ] T024 [P] [US1] Write test: "should handle tool execution errors" in index.test.ts
- [ ] T025 [P] [US1] Write test: "should handle resource read errors" in index.test.ts
- [ ] T026 [P] [US1] Write test: "should shutdown on fatal errors" in index.test.ts

**Lifecycle Management Suite (4 tests):**
- [ ] T027 [P] [US1] Write test: "should complete startup successfully" in index.test.ts
- [ ] T028 [P] [US1] Write test: "should shutdown with cleanup" in index.test.ts
- [ ] T029 [P] [US1] Write test: "should handle concurrent requests" in index.test.ts
- [ ] T030 [P] [US1] Write test: "should persist state across requests" in index.test.ts

**Verification:**
- [ ] T031 [US1] Run tests and verify all 19 tests fail (TDD - no implementation yet) in mcp-server/
- [ ] T032 [US1] Implement server initialization logic (if needed - may already exist) in mcp-server/src/index.ts
- [ ] T033 [US1] Run tests and verify all 19 tests pass in mcp-server/
- [ ] T034 [US1] Run coverage report and verify index.ts ≥80% coverage in mcp-server/

**Checkpoint:** ✅ 19 main server tests passing, index.ts at 80%+ coverage, tests run independently

**Parallel Execution:**
- Tests T012-T030 can be written in parallel (different test suites within same file)
- Organize by suite: T012-T016 (init), T017-T022 (routing), T023-T026 (errors), T027-T030 (lifecycle)

---

## Phase 4: US2 - Resource Handler Tests (P0)

**User Story:** As a developer, I want resource handlers tested so that state/progress/route resources are validated including security checks.

**Goal:** Achieve 90% coverage of mcp-server/src/resources/index.ts (currently 0%)

**Success Criteria:**
- [ ] resources/index.ts coverage ≥90% (lines, functions, statements)
- [ ] All 22 test cases pass (18 functional + 4 security)
- [ ] Security tests validate F001 fixes
- [ ] Tests use mocked file system (no real files)

**Independent Test:** `npm test -- resources` passes with 90%+ coverage

### Tasks

**Test File Setup:**
- [ ] T035 [US2] Create mcp-server/src/resources/__tests__/index.test.ts with vi.mock('fs/promises')

**getStateResource Suite (8 tests):**
- [ ] T036 [P] [US2] Write test: "should return state when file exists" in resources/__tests__/index.test.ts
- [ ] T037 [P] [US2] Write test: "should handle missing state file" in resources/__tests__/index.test.ts
- [ ] T038 [P] [US2] Write test: "should handle corrupted JSON" in resources/__tests__/index.test.ts
- [ ] T039 [P] [US2] Write test: "should enforce size limits (>10MB)" in resources/__tests__/index.test.ts
- [ ] T040 [P] [US2] Write test: "should validate directory access" in resources/__tests__/index.test.ts
- [ ] T041 [P] [US2] Write test: "should prevent path traversal" in resources/__tests__/index.test.ts
- [ ] T042 [P] [US2] Write test: "should handle null byte injection" in resources/__tests__/index.test.ts
- [ ] T043 [P] [US2] Write test: "should return correct MIME type and format" in resources/__tests__/index.test.ts

**getProgressResource Suite (7 tests):**
- [ ] T044 [P] [US2] Write test: "should calculate progress correctly (2/6 = 33%)" in resources/__tests__/index.test.ts
- [ ] T045 [P] [US2] Write test: "should handle greenfield vs brownfield routes" in resources/__tests__/index.test.ts
- [ ] T046 [P] [US2] Write test: "should show completed status (100%)" in resources/__tests__/index.test.ts
- [ ] T047 [P] [US2] Write test: "should handle missing state file" in resources/__tests__/index.test.ts
- [ ] T048 [P] [US2] Write test: "should calculate current step correctly" in resources/__tests__/index.test.ts
- [ ] T049 [P] [US2] Write test: "should format markdown output correctly" in resources/__tests__/index.test.ts
- [ ] T050 [P] [US2] Write test: "should handle empty completedSteps array" in resources/__tests__/index.test.ts

**getRouteResource Suite (3 tests):**
- [ ] T051 [P] [US2] Write test: "should return route when selected" in resources/__tests__/index.test.ts
- [ ] T052 [P] [US2] Write test: "should handle missing route (not selected yet)" in resources/__tests__/index.test.ts
- [ ] T053 [P] [US2] Write test: "should format response correctly" in resources/__tests__/index.test.ts

**Security Validation Suite (4 tests):**
- [ ] T054 [P] [US2] Write test: "should prevent path traversal (../../etc/passwd)" in resources/__tests__/index.test.ts
- [ ] T055 [P] [US2] Write test: "should validate process.cwd() before use" in resources/__tests__/index.test.ts
- [ ] T056 [P] [US2] Write test: "should sanitize JSON before parsing (__proto__)" in resources/__tests__/index.test.ts
- [ ] T057 [P] [US2] Write test: "should enforce 10MB file size limit" in resources/__tests__/index.test.ts

**Verification:**
- [ ] T058 [US2] Run tests and verify all 22 tests fail (TDD) in mcp-server/
- [ ] T059 [US2] Implement resource handler logic (if needed - may already exist) in mcp-server/src/resources/index.ts
- [ ] T060 [US2] Run tests and verify all 22 tests pass in mcp-server/
- [ ] T061 [US2] Run coverage report and verify resources/index.ts ≥90% coverage in mcp-server/
- [ ] T062 [US2] Run overall coverage and verify ≥85% overall coverage (Phase 1 target) in mcp-server/

**Checkpoint:** ✅ 22 resource handler tests passing, resources at 90%+ coverage, overall coverage ≥85%

**Parallel Execution:**
- Tests T036-T057 can be written in parallel (different test suites)
- Organize by suite: T036-T043 (state), T044-T050 (progress), T051-T053 (route), T054-T057 (security)

---

## Phase 5: US3 - Integration & Edge Case Tests (P1)

**User Story:** As a developer, I want integration tests for E2E workflows, concurrent access, and state recovery so that production scenarios are validated.

**Goal:** Add 16 integration test cases covering E2E workflows, concurrency, and edge cases

**Success Criteria:**
- [ ] All 16 integration tests pass
- [ ] E2E workflow test completes in <30 seconds
- [ ] Concurrent access tests validate atomic state management
- [ ] State recovery tests confirm backup mechanisms work

**Independent Test:** `npm test -- integration` and `npm test -- state-recovery` pass

### Tasks

**E2E Integration Tests (8 tests):**
- [ ] T063 [US3] Create mcp-server/src/__tests__/integration.test.ts with temp directory setup
- [ ] T064 [P] [US3] Write test: "should complete greenfield workflow (all 6 gears)" in integration.test.ts
- [ ] T065 [P] [US3] Write test: "should handle interruption and resume" in integration.test.ts
- [ ] T066 [P] [US3] Write test: "should handle corrupted state file recovery" in integration.test.ts
- [ ] T067 [P] [US3] Write test: "should handle concurrent access (3 processes)" in integration.test.ts
- [ ] T068 [P] [US3] Write test: "should handle concurrent access (10 processes)" in integration.test.ts
- [ ] T069 [P] [US3] Write test: "should prevent state corruption with parallel writes" in integration.test.ts
- [ ] T070 [P] [US3] Write test: "should handle large codebase (10k+ files)" in integration.test.ts
- [ ] T071 [P] [US3] Write test: "should complete within memory limits (<500MB)" in integration.test.ts

**State Recovery Tests (8 tests):**
- [ ] T072 [US3] Create mcp-server/src/utils/__tests__/state-recovery.test.ts
- [ ] T073 [P] [US3] Write test: "should recover from corrupted JSON" in state-recovery.test.ts
- [ ] T074 [P] [US3] Write test: "should restore from backup file" in state-recovery.test.ts
- [ ] T075 [P] [US3] Write test: "should fail gracefully if no backup" in state-recovery.test.ts
- [ ] T076 [P] [US3] Write test: "should maintain max 3 backups" in state-recovery.test.ts
- [ ] T077 [P] [US3] Write test: "should rotate old backups" in state-recovery.test.ts
- [ ] T078 [P] [US3] Write test: "should use correct backup file format" in state-recovery.test.ts
- [ ] T079 [P] [US3] Write test: "should auto-recover from .bak file" in state-recovery.test.ts
- [ ] T080 [P] [US3] Write test: "should prompt user if recovery impossible" in state-recovery.test.ts

**Verification:**
- [ ] T081 [US3] Build mcp-server (required for concurrent access tests) in mcp-server/
- [ ] T082 [US3] Run integration tests and verify all 8 integration tests pass in mcp-server/
- [ ] T083 [US3] Run state recovery tests and verify all 8 tests pass in mcp-server/
- [ ] T084 [US3] Run full coverage and verify ≥88% overall coverage (Phase 2 target) in mcp-server/

**Checkpoint:** ✅ 16 integration tests passing, E2E workflows validated, overall coverage ≥88%

**Parallel Execution:**
- Integration tests T064-T071 can be written in parallel (independent scenarios)
- State recovery tests T073-T080 can be written in parallel (independent scenarios)
- Both test files can be developed simultaneously

---

## Phase 6: US4 - CI/CD Configuration & Documentation (P1)

**User Story:** As a developer, I want coverage enforced on CI and documented so that test quality is maintained over time.

**Goal:** Automate coverage enforcement and document testing practices

**Success Criteria:**
- [ ] CI fails if coverage drops below 85%
- [ ] Coverage reports uploaded to Codecov
- [ ] Coverage badge visible in README
- [ ] Testing guide documents patterns

**Independent Test:** GitHub Actions workflow validates on PR

### Tasks

**CI Configuration:**
- [ ] T085 [P] [US4] Create .github/workflows/ci.yml with Node.js setup
- [ ] T086 [US4] Add test:coverage step to CI workflow in .github/workflows/ci.yml
- [ ] T087 [US4] Add coverage threshold check (fail if <85%) to CI workflow in .github/workflows/ci.yml
- [ ] T088 [US4] Add Codecov upload step to CI workflow in .github/workflows/ci.yml
- [ ] T089 [US4] Configure Codecov token in GitHub repository secrets

**Documentation:**
- [ ] T090 [P] [US4] Add Testing section to mcp-server/README.md with coverage badge
- [ ] T091 [P] [US4] Create docs/guides/TESTING.md with test patterns and examples
- [ ] T092 [P] [US4] Update CONTRIBUTING.md with test requirements in root directory

**Performance Tests (Optional - if time permits):**
- [ ] T093 [P] [US4] Create mcp-server/src/__tests__/performance.test.ts
- [ ] T094 [P] [US4] Write test: "should read 1000 resources in <150ms" in performance.test.ts
- [ ] T095 [P] [US4] Write test: "should scan 10k files in <5s" in performance.test.ts
- [ ] T096 [P] [US4] Write test: "should use <500MB memory for large codebase" in performance.test.ts

**Verification:**
- [ ] T097 [US4] Push to branch and verify CI runs successfully with coverage check
- [ ] T098 [US4] Create test PR and verify coverage comment appears
- [ ] T099 [US4] Verify coverage badge displays in README on GitHub
- [ ] T100 [US4] Run full test suite and verify ≥90% overall coverage (Phase 3 target) in mcp-server/

**Checkpoint:** ✅ CI enforces coverage, documentation complete, ≥90% overall coverage achieved

**Parallel Execution:**
- CI tasks T085-T089 sequential (depend on workflow file)
- Documentation tasks T090-T092 can run in parallel (different files)
- Performance tests T094-T096 can be written in parallel (independent tests)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal:** Final quality checks and production readiness

**Tasks:**
- [ ] T101 Run full test suite 10 times to detect flaky tests in mcp-server/
- [ ] T102 Verify test execution time <60 seconds in mcp-server/
- [ ] T103 Review HTML coverage report for any missed critical paths in mcp-server/coverage/
- [ ] T104 Add test fixture README documenting each fixture in mcp-server/src/__tests__/fixtures/
- [ ] T105 Update constitution.md with new coverage metrics (90%+ achieved) in .specify/memory/
- [ ] T106 Create fixtures/projects/large/ generator script (for 10k file tests) in mcp-server/src/__tests__/

**Checkpoint:** ✅ All tests reliable, coverage ≥90%, documentation complete

**Parallel Execution:** All tasks T101-T106 can run in parallel (independent verification steps)

---

## Dependencies

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
    ├──► US1: Main Server Tests (Phase 3) ────┐
    ├──► US2: Resource Tests (Phase 4) ────────┤
    ├──► US3: Integration Tests (Phase 5) ─────┤──► US4: CI/CD (Phase 6) ──► Polish (Phase 7)
    └──────────────────────────────────────────┘
```

**Critical Path:** Setup → Foundational → US1 → US2 → US3 → US4 → Polish

**Parallel Opportunities:**
- **After Foundational**: US1, US2, and US3 can be developed in parallel (independent test files)
- **Within US1**: All test suites can be written in parallel (different describe blocks)
- **Within US2**: All test suites can be written in parallel (different describe blocks)
- **Within US3**: Integration and state recovery tests can be written in parallel
- **Within US4**: CI config and documentation can proceed in parallel

**Blocking Dependencies:**
- US4 (CI/CD) should wait for US1+US2 completion (85% coverage needed for CI threshold)
- Polish should wait for all user stories (final verification)

### Test Independence

Each user story's tests can run independently:

```bash
# US1 only
npm test -- index.test.ts

# US2 only
npm test -- resources

# US3 only
npm test -- integration.test.ts state-recovery.test.ts

# All tests
npm test
```

---

## Validation

### Format Compliance
- ✅ All tasks follow checkbox format: `- [ ] [ID] [P?] [Story?] Description with path`
- ✅ Task IDs sequential: T001-T106
- ✅ [P] markers on parallelizable tasks
- ✅ [US1-US4] labels on user story tasks
- ✅ File paths specified for all implementation tasks

### Completeness Checks
- ✅ **US1** (19 test cases): T011-T034 (24 tasks including verification)
- ✅ **US2** (22 test cases): T035-T062 (28 tasks including verification)
- ✅ **US3** (16 test cases): T063-T084 (22 tasks including verification)
- ✅ **US4** (CI/CD + docs): T085-T100 (16 tasks including optional perf tests)
- ✅ **Polish**: T101-T106 (6 tasks)
- ✅ Total: 106 tasks for 90%+ coverage

### Independent Testing
- ✅ US1: `npm test -- index.test.ts` validates independently
- ✅ US2: `npm test -- resources` validates independently
- ✅ US3: `npm test -- integration` and `npm test -- state-recovery` validate independently
- ✅ US4: CI workflow validates on push

### Coverage Progression
- ✅ Baseline: 78.75% overall
- ✅ After US1: ~82% overall (index.ts 80%)
- ✅ After US2: 85%+ overall (resources 90%) - **Phase 1 Target**
- ✅ After US3: 88%+ overall - **Phase 2 Target**
- ✅ After US4: 90%+ overall - **Phase 3 Target**

---

## Summary

**Total Tasks:** 106
- Setup: 5 tasks (fixtures, infrastructure)
- Foundational: 5 tasks (coverage config)
- US1 (Main Server): 24 tasks (19 tests + setup + verification)
- US2 (Resources): 28 tasks (22 tests + setup + verification)
- US3 (Integration): 22 tasks (16 tests + verification)
- US4 (CI/CD): 16 tasks (CI + docs + optional perf tests)
- Polish: 6 tasks (final verification)

**Coverage Progression:**
- Current: 78.75% overall
- MVP (US1): ~82% overall
- Phase 1 (US1+US2): 85%+ overall ✅
- Phase 2 (US1+US2+US3): 88%+ overall ✅
- Phase 3 (All): 90%+ overall ✅

**Parallel Opportunities:**
- After Foundational: US1, US2, US3 can proceed in parallel
- Within each US: Test suites written in parallel (different describe blocks)
- CI configuration and documentation in parallel
- Total sequential time: ~15-20 hours
- With parallelization: ~8-12 hours (50% reduction)

**Implementation Time:**
- MVP (US1 only): 3-4 hours
- Full Feature (All US): 20-27 hours
- With parallelization: 12-16 hours

**Independent Testing:** Each user story validates independently via `npm test -- <pattern>`

**Next Steps:**
1. Start with Phase 1 (Setup) - 30 minutes
2. Configure Foundational (Coverage) - 1 hour
3. Implement US1 (Main Server Tests) - 3-4 hours → MVP Complete
4. Continue with US2, US3, US4 as capacity allows

---

**Tasks Status:** ✅ Ready for Execution
**Last Updated:** 2025-11-17
