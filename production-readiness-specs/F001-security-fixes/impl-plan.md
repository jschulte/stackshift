# Implementation Plan: F001-security-fixes

**Feature Spec:** `production-readiness-specs/F001-security-fixes/spec.md`
**Created:** 2025-11-17
**Branch:** `claude/plan-security-fixes-01SpAKwWbaX7Pr2wm1ti1j25`
**Status:** Planning → Implementation

---

## Executive Summary

Fix critical security vulnerabilities (CVSS 7.5 HIGH) in StackShift MCP server resource handlers that bypass security validation, enabling potential path traversal, DoS, and prototype pollution attacks.

---

## Technical Context

### Current Implementation Analysis

**Vulnerable Files Identified:**

1. **mcp-server/src/resources/index.ts** (Lines 23, 62, 124)
   - Direct `process.cwd()` usage without validation
   - Uses `fs.readFile` instead of `readFileSafe` (no size limits)
   - Uses `JSON.parse` instead of `readJsonSafe` (no prototype protection)
   - Functions affected: `getStateResource()`, `getProgressResource()`, `getRouteResource()`

2. **mcp-server/src/utils/skill-loader.ts** (Line 14, 18)
   - No validation on `skillName` parameter (path traversal risk)
   - No validation on `process.env.HOME` (injection risk)

**Existing Security Infrastructure:**

✅ **Available Tools** (already implemented):
- `SecurityValidator` class in `mcp-server/src/utils/security.ts`
- `createDefaultValidator()` function (validates against cwd)
- `validateDirectory()` method (CWE-22 prevention)
- `readFileSafe()` in `mcp-server/src/utils/file-utils.ts` (10MB limit)
- `readJsonSafe()` in `mcp-server/src/utils/file-utils.ts` (prototype pollution prevention)

✅ **Test Coverage** (existing):
- Security module: 100% coverage
- File utils: Partial coverage
- Resources: No security tests

### Technology Stack

- **Language:** TypeScript 5.3.0 (strict mode)
- **Runtime:** Node.js >=18.0.0
- **Testing:** Vitest 1.0+
- **Dependencies:** No new dependencies required

### Architecture

```
┌─────────────────────────────────────────┐
│   MCP Resources (Vulnerable)            │
│   - getStateResource()                  │
│   - getProgressResource()               │
│   - getRouteResource()                  │
└──────────────┬──────────────────────────┘
               │ Currently bypasses
               ▼
┌─────────────────────────────────────────┐
│   Security Layer (Exists, Unused)       │
│   - SecurityValidator                   │
│   - createDefaultValidator()            │
└──────────────┬──────────────────────────┘
               │ Should use
               ▼
┌─────────────────────────────────────────┐
│   File Utilities (Exists, Unused)       │
│   - readFileSafe() (10MB limit)         │
│   - readJsonSafe() (prototype protection)│
└─────────────────────────────────────────┘
```

### Unknowns & Clarifications Needed

1. **Performance Impact**: NEEDS CLARIFICATION
   - What is acceptable latency increase for validation?
   - Should we benchmark before/after?

2. **Backward Compatibility**: NEEDS CLARIFICATION
   - Are there existing MCP clients that might break?
   - Should we version the resource API?

3. **Error Handling Strategy**: NEEDS CLARIFICATION
   - How verbose should error messages be (avoid info leakage)?
   - Should we log security violations?

4. **Testing Strategy**: NEEDS CLARIFICATION
   - Integration test approach for MCP resources?
   - Test data location and cleanup?

5. **Monitoring**: NEEDS CLARIFICATION
   - Should we add telemetry for blocked access attempts?
   - Alerting strategy for production deployments?

---

## Constitution Check

### Pre-Design Evaluation

**Alignment with Core Values:**

✅ **Security First**: This fix directly addresses the #1 core value
- Fixes CWE-22 (Path Traversal)
- Fixes CWE-400 (Resource Exhaustion)
- Fixes CWE-502 (Deserialization)

✅ **Zero Technical Debt**: Removes security debt before production
- Aligns with "Zero TODO/FIXME markers in production"
- P0 priority fix

✅ **Comprehensive Testing**: Expands security test coverage
- From current 30% overall to higher coverage
- Security modules already at 100%

**Compliance with Technical Standards:**

✅ **Code Quality** (constitution.md:146-150)
- TypeScript strict mode maintained
- Error handling in all MCP handlers (already exists)
- Input validation (THIS IS WHAT WE'RE FIXING)

✅ **Security Standards** (constitution.md:162-167)
- Input Validation: Will achieve 100%
- Path Operations: Will use SecurityValidator
- Resource Limits: Will use readFileSafe (10MB limit)

✅ **Testing Requirements** (constitution.md:153-159)
- Current: 30% coverage
- Target: 80% coverage
- This fix adds security tests for resources

**Potential Conflicts:**

❌ **None Identified** - This fix is fully aligned with constitution

**Gate Evaluation:**

🟢 **PASS** - All constitution requirements met
- Security fix is mandated by core values
- Implementation uses existing patterns
- No new dependencies (aligns with minimal dependency policy)

---

## Phase 0: Research & Planning

**Status:** ✅ Complete (see `research.md`)

---

## Phase 1: Design Artifacts

**Status:** ✅ Complete

**Generated Artifacts:**
- `data-model.md` - Entity model for security validation
- `contracts/` - Not applicable (internal API changes only)
- `quickstart.md` - Developer guide for security fixes

---

## Implementation Phases

### Phase 2: Implementation (P0 - Critical Path)

**Estimated Effort:** 4-6 hours

#### Task 2.1: Fix Resource Handlers (2 hours)

**File:** `mcp-server/src/resources/index.ts`

**Changes Required:**
1. Import security and file utilities
2. Update `getStateResource()` (lines 22-55)
3. Update `getProgressResource()` (lines 60-117)
4. Update `getRouteResource()` (lines 122-157)

**Implementation Pattern:**
```typescript
import { createDefaultValidator } from '../utils/security.js';
import { readJsonSafe } from '../utils/file-utils.js';

export async function getStateResource() {
  const validator = createDefaultValidator();
  const directory = validator.validateDirectory(process.cwd());
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const stateData = await readJsonSafe(stateFile);
    // ... rest of logic
  } catch (error) {
    // Proper error handling
  }
}
```

**Acceptance Criteria:**
- [ ] All three resource functions use validated directories
- [ ] All JSON reads use `readJsonSafe()`
- [ ] No direct `process.cwd()` without validation
- [ ] Error messages don't leak path information

#### Task 2.2: Fix Skill Loader (1 hour)

**File:** `mcp-server/src/utils/skill-loader.ts`

**Changes Required:**
1. Add input validation for `skillName` parameter (line 14)
2. Validate `process.env.HOME` before use (line 18)

**Implementation Pattern:**
```typescript
export async function loadSkillFile(skillName: string): Promise<string | null> {
  // Validate skill name
  if (skillName.includes('/') || skillName.includes('\\') || skillName.includes('..')) {
    throw new Error(`Invalid skill name: cannot contain path separators`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(skillName)) {
    throw new Error(`Invalid skill name: must be alphanumeric with hyphens/underscores only`);
  }

  // Validate HOME
  const homePath = process.env.HOME;
  if (!homePath || homePath.includes('\0')) {
    throw new Error('Invalid HOME environment variable');
  }

  const validator = createDefaultValidator();
  const validatedHome = validator.validateDirectory(homePath);
  // ... rest of logic
}
```

**Acceptance Criteria:**
- [ ] `skillName` validated against path separators
- [ ] `skillName` validated against whitelist regex
- [ ] `HOME` environment variable validated
- [ ] All paths use validated directories

#### Task 2.3: Fix Type Assertion (30 minutes)

**File:** `mcp-server/src/index.ts` (line 237)

**Changes Required:**
1. Replace unsafe `(args as any)` with proper type assertion

**Before:**
```typescript
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler((args as any) || {});
```

**After:**
```typescript
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler(args || {} as CruiseControlArgs);
```

**Acceptance Criteria:**
- [ ] Type assertion moved to the right of the `||` operator
- [ ] TypeScript compiler accepts the change
- [ ] No loss of type safety

### Phase 3: Testing (P0)

**Estimated Effort:** 2 hours

#### Task 3.1: Security Tests for Resources (1 hour)

**File:** Create `mcp-server/src/resources/__tests__/security.test.ts`

**Test Cases Required:**
- [ ] Path traversal attempt in state file
- [ ] Large file handling (>10MB)
- [ ] Malformed JSON with `__proto__`
- [ ] Invalid directory paths
- [ ] Null byte injection attempts

#### Task 3.2: Validation Tests for Skill Loader (30 minutes)

**File:** Create `mcp-server/src/utils/__tests__/skill-loader.security.test.ts`

**Test Cases Required:**
- [ ] Skill name with path separators (`../`, `..\\`)
- [ ] Skill name with special characters
- [ ] Invalid HOME environment variable
- [ ] Null byte in skill name

#### Task 3.3: Integration Tests (30 minutes)

**Test Cases Required:**
- [ ] Full resource read workflow with validation
- [ ] Error messages don't leak sensitive paths
- [ ] Performance acceptable (<100ms overhead)

### Phase 4: Documentation & Validation (P1)

**Estimated Effort:** 1 hour

#### Task 4.1: Update Documentation (30 minutes)

**Files to Update:**
- [ ] Add security notes to `mcp-server/README.md`
- [ ] Update JSDoc comments on modified functions
- [ ] Document validation errors in troubleshooting guide

#### Task 4.2: Audit Verification (30 minutes)

**Validation Steps:**
- [ ] Run `npm audit` - verify 0 high/critical vulnerabilities
- [ ] Run test suite - verify all tests pass
- [ ] Run TypeScript compiler - verify no errors
- [ ] Check test coverage - verify security modules at 100%

---

## Risks & Mitigations

### Risk 1: Performance Degradation
- **Impact:** Resource reads become slower due to validation overhead
- **Probability:** Low
- **Mitigation:**
  - Validation is lightweight (path checks only)
  - Benchmark before/after in tests
  - Acceptable overhead: <100ms per resource read

### Risk 2: Breaking Changes for MCP Clients
- **Impact:** Existing clients might fail with new validation errors
- **Probability:** Low
- **Mitigation:**
  - Only affects malformed/malicious requests
  - Valid requests continue to work
  - Error messages guide users to fix issues

### Risk 3: Path Validation Too Restrictive
- **Impact:** Legitimate use cases blocked
- **Probability:** Low
- **Mitigation:**
  - Uses same validator as MCP tools (already battle-tested)
  - Test mode allows /tmp for testing
  - Clear error messages for debugging

### Risk 4: Test Environment Detection Bypass
- **Impact:** Test mode could be enabled in production
- **Probability:** Very Low
- **Mitigation:**
  - Requires explicit env vars (NODE_ENV=test, VITEST=true)
  - Document importance of NOT setting these in production
  - Consider adding runtime check to fail loudly

---

## Dependencies

**Must be complete before starting:**
- ✅ Security utilities exist (`mcp-server/src/utils/security.ts`)
- ✅ File utilities exist (`mcp-server/src/utils/file-utils.ts`)

**Blocks these features:**
- F005-deployment (cannot deploy with security vulnerabilities)

**No external dependencies required**

---

## Effort Estimate

- **Phase 2 (Implementation):** ~4-6 hours
  - Resource handlers: 2 hours
  - Skill loader: 1 hour
  - Type assertion: 0.5 hours
  - Buffer: 0.5-2.5 hours

- **Phase 3 (Testing):** ~2 hours
  - Resource security tests: 1 hour
  - Skill loader tests: 0.5 hours
  - Integration tests: 0.5 hours

- **Phase 4 (Documentation):** ~1 hour
  - Documentation: 0.5 hours
  - Audit verification: 0.5 hours

**Total Estimated Effort:** 7-9 hours

---

## Testing Strategy

### Unit Tests (70% of effort)
- **Location:** `mcp-server/src/resources/__tests__/security.test.ts`
- **Focus:** Each resource handler with malicious inputs
- **Coverage Target:** 100% of new validation code

### Integration Tests (20% of effort)
- **Location:** `mcp-server/src/__tests__/resources.integration.test.ts`
- **Focus:** Full MCP resource read workflow
- **Validation:** No path leakage in error messages

### Security Tests (10% of effort)
- **Location:** Embedded in unit tests
- **Focus:** CWE-22, CWE-400, CWE-502 scenarios
- **Tools:** Vitest with crafted malicious inputs

---

## Success Criteria

**Code Quality:**
- [ ] All file operations use validated paths
- [ ] No direct `process.cwd()` without validation
- [ ] All file reads use `readFileSafe()` (10MB limit)
- [ ] All JSON parsing uses `readJsonSafe()` (prototype protection)
- [ ] TypeScript strict mode passes
- [ ] No linting errors

**Security:**
- [ ] Path traversal tests pass
- [ ] Large file handling tests pass
- [ ] Prototype pollution tests pass
- [ ] Input validation tests pass
- [ ] `npm audit` shows 0 high/critical vulnerabilities

**Testing:**
- [ ] All new tests pass (15+ new test cases)
- [ ] Existing tests still pass
- [ ] Coverage: Resources module >80%
- [ ] Coverage: Security module 100%

**Documentation:**
- [ ] JSDoc comments updated
- [ ] README security notes added
- [ ] Troubleshooting guide updated

**Performance:**
- [ ] Resource read latency <100ms overhead
- [ ] No memory leaks detected

---

## Rollback Plan

If security fixes cause unexpected issues:

1. **Immediate Rollback** (if production is affected)
   ```bash
   git revert <commit-hash>
   npm run build
   npm test
   ```

2. **Feature Flag Approach** (if gradual rollout needed)
   - Add env var `STACKSHIFT_SECURITY_STRICT=false`
   - Gradually enable per resource handler
   - Monitor for issues

3. **Hotfix Process**
   - Create hotfix branch from main
   - Apply minimal fix
   - Fast-track testing and deployment

---

## Post-Design Constitution Re-Check

**Status:** ✅ Complete - Design artifacts reviewed

### Artifacts Generated

1. ✅ **research.md** - All unknowns resolved, best practices documented
2. ✅ **data-model.md** - Security validation model defined
3. ✅ **contracts/README.md** - Internal contracts documented (no external changes)
4. ✅ **quickstart.md** - Developer implementation guide created
5. ✅ **agent-context.md** - Technology patterns documented

### Post-Design Evaluation

**Alignment with Core Values (Re-Verified):**

✅ **Security First** (constitution.md:15)
- Design adds comprehensive validation at all entry points
- Follows defense-in-depth principle (multiple layers)
- No security compromises made for convenience

✅ **Atomic Operations** (constitution.md:16)
- File operations remain atomic (read-validate-return)
- No changes to state management patterns
- Error handling preserves atomicity

✅ **Zero Technical Debt** (constitution.md:18)
- No TODOs or FIXMEs introduced in design
- All clarifications resolved in research phase
- Clean, production-ready design

✅ **Comprehensive Testing** (constitution.md:19)
- Test coverage plan: 12+ new security tests
- Targets >80% coverage for resources
- Maintains 100% coverage for security module

**Compliance with Technical Architecture (Re-Verified):**

✅ **Minimal Dependencies** (constitution.md:136-139)
- Zero new external dependencies
- Uses only existing security and file utilities
- Aligns with "1 production dependency" principle

✅ **Modular Design** (constitution.md:43)
- Changes isolated to affected modules
- SecurityValidator reused (DRY principle)
- Clear separation: validation → reading → parsing

✅ **TypeScript Strict Mode** (constitution.md:106-109)
- All changes maintain strict type checking
- Improved type assertion in cruise control
- No `any` types without justification

**Development Standards Compliance (Re-Verified):**

✅ **Code Quality** (constitution.md:146-150)
- Error handling in all code paths (try-catch)
- Validation before all file operations
- JSDoc comments on public APIs (per quickstart)

✅ **Security Standards** (constitution.md:162-167)
- Input validation: 100% (this is the fix)
- Path operations: All via SecurityValidator
- Resource limits: 10MB enforced
- No `npm audit` vulnerabilities introduced

✅ **Testing Requirements** (constitution.md:153-159)
- Unit tests: 10+ (resources + skill loader)
- Integration tests: 2+ (full workflow)
- Security tests: 12+ (malicious inputs)
- Coverage target: 80% resources, 100% security

**Quality Metrics (Post-Design):**

✅ **Code Quality**
- TypeScript strict mode: Maintained
- No new linting errors
- Clear code patterns documented

✅ **Test Coverage**
- Resources: 0% → 80%+ (planned)
- Security utils: 100% (maintained)
- Skill loader: Partial → 100% (planned)

✅ **Documentation**
- quickstart.md: 400+ lines comprehensive guide
- data-model.md: Complete validation model
- agent-context.md: Patterns for future work

**Risks Re-Evaluated:**

✅ **All risks mitigated in design**
- Performance: <100ms overhead acceptable (research.md)
- Compatibility: Backward compatible (contracts/README.md)
- Validation: Uses proven SecurityValidator
- Test detection: Documented in research.md

**Gate Evaluation (Post-Design):**

🟢 **PASS** - All requirements met after design phase

**Key Changes from Pre-Design:**
- ✅ All "NEEDS CLARIFICATION" resolved
- ✅ Design patterns documented and validated
- ✅ Implementation path clear and actionable
- ✅ No constitution conflicts identified

**Constitutional Concerns:**

❌ **None** - Design fully aligns with all constitutional requirements

**Recommendation:**

✅ **APPROVED FOR IMPLEMENTATION**

This design:
- Fixes critical security vulnerabilities (P0 priority)
- Uses existing patterns and utilities
- Maintains code quality standards
- Includes comprehensive testing plan
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
# Use SpecKit implementation workflow
/speckit.tasks    # Generate detailed task checklist
/speckit.implement # Execute implementation
```

**Branch:** `claude/plan-security-fixes-01SpAKwWbaX7Pr2wm1ti1j25`

---

**Plan Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-17
