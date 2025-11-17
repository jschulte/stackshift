# Tasks: F001-security-fixes

**Feature:** Security Vulnerability Fixes
**Status:** Ready for Implementation
**Branch:** `claude/plan-security-fixes-01SpAKwWbaX7Pr2wm1ti1j25`
**Estimated Effort:** 7-9 hours

---

## Overview

Fix critical security vulnerabilities (CVSS 7.5 HIGH) in StackShift MCP server:
- **CWE-22**: Path Traversal in resource handlers
- **CWE-400**: Resource Exhaustion (no file size limits)
- **CWE-502**: Prototype Pollution in JSON parsing
- **Input Validation**: Missing validation in skill loader

**Security Impact**: HIGH → FIXED

---

## Phase 1: Setup & Prerequisites

**Goal**: Verify development environment and existing security infrastructure

- [ ] T001 Verify Node.js >=18.0.0 and TypeScript 5.3.0 installed
- [ ] T002 Install dependencies in mcp-server/ directory using npm install
- [ ] T003 Verify existing security utilities in mcp-server/src/utils/security.ts
- [ ] T004 Verify existing file utilities in mcp-server/src/utils/file-utils.ts
- [ ] T005 Run baseline tests to ensure current state using npm test in mcp-server/
- [ ] T006 Run baseline build to verify TypeScript compilation using npm run build in mcp-server/

**Completion Criteria**:
- ✅ All dependencies installed
- ✅ Existing tests pass
- ✅ TypeScript compiles without errors
- ✅ Security and file utilities exist and are accessible

---

## Phase 2: Implementation - Resource Handler Security (P0)

**Goal**: Add security validation to all resource handlers to prevent path traversal and enforce size limits

**Security Fix**: CWE-22 (Path Traversal), CWE-400 (DoS), CWE-502 (Prototype Pollution)

### Import Security Utilities

- [ ] T007 [FIX-P0] Add import for createDefaultValidator in mcp-server/src/resources/index.ts
- [ ] T008 [FIX-P0] Add import for readJsonSafe in mcp-server/src/resources/index.ts

### Fix getStateResource()

- [ ] T009 [FIX-P0] Add createDefaultValidator() call in getStateResource() function in mcp-server/src/resources/index.ts
- [ ] T010 [FIX-P0] Wrap process.cwd() with validator.validateDirectory() in getStateResource() in mcp-server/src/resources/index.ts
- [ ] T011 [FIX-P0] Replace fs.readFile() + JSON.parse() with readJsonSafe() in getStateResource() in mcp-server/src/resources/index.ts
- [ ] T012 [FIX-P0] Update return statement to use JSON.stringify(state) in getStateResource() in mcp-server/src/resources/index.ts

### Fix getProgressResource()

- [ ] T013 [FIX-P0] Add createDefaultValidator() call in getProgressResource() function in mcp-server/src/resources/index.ts
- [ ] T014 [FIX-P0] Wrap process.cwd() with validator.validateDirectory() in getProgressResource() in mcp-server/src/resources/index.ts
- [ ] T015 [FIX-P0] Replace fs.readFile() + JSON.parse() with readJsonSafe() in getProgressResource() in mcp-server/src/resources/index.ts

### Fix getRouteResource()

- [ ] T016 [FIX-P0] Add createDefaultValidator() call in getRouteResource() function in mcp-server/src/resources/index.ts
- [ ] T017 [FIX-P0] Wrap process.cwd() with validator.validateDirectory() in getRouteResource() in mcp-server/src/resources/index.ts
- [ ] T018 [FIX-P0] Replace fs.readFile() + JSON.parse() with readJsonSafe() in getRouteResource() in mcp-server/src/resources/index.ts

**Completion Criteria**:
- ✅ All 3 resource handlers use createDefaultValidator()
- ✅ All process.cwd() calls are validated
- ✅ All JSON reads use readJsonSafe() (10MB limit + sanitization)
- ✅ TypeScript compiles without errors

---

## Phase 3: Implementation - Skill Loader Validation (P1)

**Goal**: Add input validation to skill loader to prevent path traversal attacks

**Security Fix**: CWE-22 (Path Traversal), Input Validation

### Import Security Utilities

- [ ] T019 [FIX-P1] Add import for createDefaultValidator in mcp-server/src/utils/skill-loader.ts
- [ ] T020 [FIX-P1] Add import for readFileSafe in mcp-server/src/utils/skill-loader.ts

### Add Skill Name Validation

- [ ] T021 [FIX-P1] Add path separator validation (/, \\, ..) for skillName parameter in loadSkillFile() in mcp-server/src/utils/skill-loader.ts
- [ ] T022 [FIX-P1] Add whitelist regex validation (/^[a-zA-Z0-9_-]+$/) for skillName in loadSkillFile() in mcp-server/src/utils/skill-loader.ts

### Add Environment Variable Validation

- [ ] T023 [FIX-P1] Add validation for process.env.HOME (not null/undefined) in loadSkillFile() in mcp-server/src/utils/skill-loader.ts
- [ ] T024 [FIX-P1] Add null byte check for process.env.HOME in loadSkillFile() in mcp-server/src/utils/skill-loader.ts
- [ ] T025 [FIX-P1] Create SecurityValidator and validate HOME directory in loadSkillFile() in mcp-server/src/utils/skill-loader.ts
- [ ] T026 [FIX-P1] Update HOME path usage to use validatedHome in loadSkillFile() in mcp-server/src/utils/skill-loader.ts

### Replace File Operations

- [ ] T027 [FIX-P1] Replace fs.readFile() with readFileSafe() in file reading loop in mcp-server/src/utils/skill-loader.ts

**Completion Criteria**:
- ✅ Skill name validated against path separators
- ✅ Skill name validated with whitelist regex
- ✅ HOME environment variable validated
- ✅ All file reads use readFileSafe() (10MB limit)
- ✅ TypeScript compiles without errors

---

## Phase 4: Implementation - Type Assertion Fix (P2)

**Goal**: Improve type safety in cruise control handler

**Code Quality Fix**: Remove unsafe type assertion

- [ ] T028 [FIX-P2] Fix type assertion in cruise control handler from (args as any) to args || {} as CruiseControlArgs in mcp-server/src/index.ts line ~237

**Completion Criteria**:
- ✅ Type assertion moved to correct position
- ✅ TypeScript compiles without errors
- ✅ Type safety maintained

---

## Phase 5: Testing - Resource Security Tests

**Goal**: Verify resource handlers reject malicious inputs and enforce security boundaries

**Test Coverage**: Path traversal, file size limits, prototype pollution

### Create Test File

- [ ] T029 [TEST-P0] Create test directory mcp-server/src/resources/__tests__/
- [ ] T030 [TEST-P0] Create test file mcp-server/src/resources/__tests__/security.test.ts with imports and test structure

### getStateResource Tests

- [ ] T031 [P] [TEST-P0] Add test for reading valid state file in mcp-server/src/resources/__tests__/security.test.ts
- [ ] T032 [P] [TEST-P0] Add test for rejecting file larger than 10MB in mcp-server/src/resources/__tests__/security.test.ts
- [ ] T033 [P] [TEST-P0] Add test for stripping dangerous JSON properties (__proto__, constructor, prototype) in mcp-server/src/resources/__tests__/security.test.ts
- [ ] T034 [P] [TEST-P0] Add test for handling missing state file in mcp-server/src/resources/__tests__/security.test.ts

### getProgressResource Tests

- [ ] T035 [P] [TEST-P0] Add test for reading valid state file for progress in mcp-server/src/resources/__tests__/security.test.ts

### getRouteResource Tests

- [ ] T036 [P] [TEST-P0] Add test for reading valid state file for route in mcp-server/src/resources/__tests__/security.test.ts

**Completion Criteria**:
- ✅ 6+ resource security tests added
- ✅ Tests cover: valid reads, size limits, prototype pollution, error handling
- ✅ All tests use temp directories (cleanup in afterEach)
- ✅ All new tests pass

---

## Phase 6: Testing - Skill Loader Validation Tests

**Goal**: Verify skill loader rejects malicious inputs

**Test Coverage**: Path traversal, invalid characters, environment validation

### Create Test File

- [ ] T037 [TEST-P1] Create test file mcp-server/src/utils/__tests__/skill-loader.security.test.ts with imports and test structure

### Path Traversal Tests

- [ ] T038 [P] [TEST-P1] Add test rejecting skill name with forward slash (../) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts
- [ ] T039 [P] [TEST-P1] Add test rejecting skill name with backslash (..\) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts
- [ ] T040 [P] [TEST-P1] Add test rejecting skill name with parent reference (..) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts

### Character Validation Tests

- [ ] T041 [P] [TEST-P1] Add test rejecting skill name with special characters (;) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts
- [ ] T042 [P] [TEST-P1] Add test rejecting skill name with spaces in mcp-server/src/utils/__tests__/skill-loader.security.test.ts

### Valid Input Tests

- [ ] T043 [P] [TEST-P1] Add test accepting valid skill name with hyphens (reverse-engineer) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts
- [ ] T044 [P] [TEST-P1] Add test accepting valid skill name with underscores (create_specs) in mcp-server/src/utils/__tests__/skill-loader.security.test.ts

**Completion Criteria**:
- ✅ 7+ skill loader validation tests added
- ✅ Tests cover: path traversal, special chars, valid inputs
- ✅ All new tests pass

---

## Phase 7: Validation & Quality Assurance

**Goal**: Verify all fixes are correct and meet quality standards

### Compilation & Type Safety

- [ ] T045 Run TypeScript compiler to verify no type errors using npm run build in mcp-server/
- [ ] T046 Verify no TypeScript strict mode violations

### Test Suite Execution

- [ ] T047 Run full test suite to verify all tests pass using npm test in mcp-server/
- [ ] T048 Run test coverage report using npm run test:coverage in mcp-server/
- [ ] T049 Verify resources module coverage >80%
- [ ] T050 Verify security module coverage maintained at 100%

### Security Audit

- [ ] T051 Run npm audit to verify no high/critical vulnerabilities in mcp-server/
- [ ] T052 Verify CVSS score reduced from 7.5 to 0 (all vulnerabilities fixed)

### Manual Testing

- [ ] T053 Test resource handlers return valid state when called from valid workspace
- [ ] T054 Test resource handlers reject access from invalid paths
- [ ] T055 Test error messages don't leak full system paths

**Completion Criteria**:
- ✅ TypeScript compiles without errors
- ✅ All tests pass (existing + new 13+ security tests)
- ✅ Coverage: Resources >80%, Security 100%
- ✅ npm audit: 0 high/critical vulnerabilities
- ✅ Manual testing confirms secure behavior

---

## Phase 8: Documentation & Finalization

**Goal**: Document changes and prepare for deployment

### Code Documentation

- [ ] T056 Add JSDoc comments to modified resource handler functions in mcp-server/src/resources/index.ts
- [ ] T057 Add JSDoc comments to modified skill loader function in mcp-server/src/utils/skill-loader.ts

### Implementation Documentation

- [ ] T058 Update spec.md status from planning to implemented in production-readiness-specs/F001-security-fixes/spec.md
- [ ] T059 Document actual implementation time vs estimate in production-readiness-specs/F001-security-fixes/impl-plan.md

### Git Operations

- [ ] T060 Stage all modified files using git add
- [ ] T061 Create commit with security fix description using git commit
- [ ] T062 Push changes to branch claude/plan-security-fixes-01SpAKwWbaX7Pr2wm1ti1j25 using git push

**Completion Criteria**:
- ✅ All code documented with JSDoc
- ✅ Implementation plan updated
- ✅ Changes committed and pushed

---

## Dependencies

**Sequential Dependencies**:
1. Phase 1 (Setup) → MUST complete before all other phases
2. Phase 2 (Resource Handlers) → MUST complete before Phase 5 (Resource Tests)
3. Phase 3 (Skill Loader) → MUST complete before Phase 6 (Skill Loader Tests)
4. Phases 2, 3, 4 (All Implementation) → MUST complete before Phase 7 (Validation)
5. Phase 7 (Validation) → MUST complete before Phase 8 (Documentation)

**Parallel Opportunities**:
- Phase 2, 3, 4 (Implementation phases) → Can be done in parallel (different files)
- Phase 5, 6 (Test phases) → Can be done in parallel after implementation (different files)
- Within test phases: Individual test tasks marked [P] can run in parallel

---

## Execution Strategy

### MVP Scope (Must Complete)
All phases are P0/P1 - this is a critical security fix with no optional components.

### Recommended Order
1. **Phase 1**: Setup and verification (10 minutes)
2. **Phase 2**: Fix resource handlers - highest priority (1-2 hours)
3. **Phase 3**: Fix skill loader (1 hour)
4. **Phase 4**: Fix type assertion (15 minutes)
5. **Phase 5**: Add resource security tests (1 hour)
6. **Phase 6**: Add skill loader tests (30 minutes)
7. **Phase 7**: Full validation (30 minutes)
8. **Phase 8**: Documentation and commit (30 minutes)

**Total Estimated Time**: 5-7 hours

---

## Success Metrics

**Security Fixes**:
- ✅ All 3 resource handlers use validated paths
- ✅ No direct process.cwd() without validation
- ✅ All file reads have 10MB size limit
- ✅ All JSON parsing protected against prototype pollution
- ✅ Skill loader validates all inputs

**Testing**:
- ✅ 13+ new security tests added and passing
- ✅ Coverage: Resources >80%, Security 100%
- ✅ All existing tests still pass

**Quality**:
- ✅ TypeScript strict mode: No errors
- ✅ npm audit: 0 high/critical vulnerabilities
- ✅ CVSS: 7.5 (HIGH) → 0 (FIXED)

---

## Task Summary

**Total Tasks**: 62
- **Setup**: 6 tasks
- **Implementation (P0 Resource Handlers)**: 12 tasks
- **Implementation (P1 Skill Loader)**: 9 tasks
- **Implementation (P2 Type Assertion)**: 1 task
- **Testing (Resource Security)**: 8 tasks
- **Testing (Skill Loader Security)**: 8 tasks
- **Validation**: 11 tasks
- **Documentation**: 7 tasks

**Parallel Tasks**: 13 (test tasks marked with [P])

**Critical Path**: Setup → Resource Handlers → Resource Tests → Validation → Documentation

---

**Status**: Ready for execution with `/speckit.implement`
**Last Updated**: 2025-11-17
