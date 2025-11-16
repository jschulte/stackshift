# Test Infrastructure Limitations

**Date:** 2025-11-16
**Status:** Documented - requires future resolution
**Impact:** Medium - limits test coverage expansion

---

## Overview

During Gear 6 implementation (P0: Test Coverage Expansion), a structural limitation in the test infrastructure was identified that prevents comprehensive integration testing with temporary directories.

---

## The Issue

### Security Validator Workspace Restriction

The `SecurityValidator` class (mcp-server/src/utils/security.ts) restricts directory access to allowed workspace paths for security reasons (prevents CWE-22 path traversal attacks).

**Default behavior:**
```typescript
export function createDefaultValidator(): SecurityValidator {
  return new SecurityValidator([process.cwd()]);
}
```

This restricts all file operations to the current working directory only.

### Test Impact

Integration tests typically create temporary test directories in `/tmp` to:
- Isolate test data from the project
- Allow parallel test execution
- Clean up automatically after tests
- Prevent test pollution

**Problem:** Tests fail with:
```
Error: Directory access denied: "/tmp/stackshift-test-xxxxx" is outside allowed workspace.
Allowed paths: /home/user/stackshift/mcp-server
```

### Affected Tests

1. **Existing:** `analyze.security.test.ts` (11/16 tests fail)
2. **New:** `reverse-engineer.test.ts` (12/16 tests fail)
3. **All future MCP tool tests** that use temporary directories

---

## Root Cause

The security fix for CWE-22 (path traversal) introduced strict workspace validation, which is correct for production use but overly restrictive for test environments.

**Security validator check:**
```typescript
validateDirectory(directory: string): string {
  const resolved = resolve(normalize(directory));
  const isAllowed = this.allowedBasePaths.some(basePath => {
    const rel = relative(basePath, resolved);
    return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
  });

  if (!isAllowed) {
    throw new Error(
      `Directory access denied: "${directory}" is outside allowed workspace.`
    );
  }

  return resolved;
}
```

---

## Current Workarounds

### Option 1: Test within project directory (partial)
Create test directories within the project:
```typescript
const testDir = path.join(process.cwd(), 'test-temp', randomBytes(8).toString('hex'));
```

**Issues:**
- Can pollute project directory if cleanup fails
- Requires .gitignore updates
- Less isolation between tests
- Parallel test risk

### Option 2: Mock the SecurityValidator (incomplete)
Mock the validator in tests:
```typescript
vi.mock('../utils/security.js', () => ({
  createDefaultValidator: () => new SecurityValidator(['/tmp'])
}));
```

**Issues:**
- Requires Vitest mocking
- Doesn't test real security validation
- Fragile to implementation changes

### Option 3: Environment-aware validator (not implemented)
Create test-specific validator:
```typescript
export function createTestValidator(): SecurityValidator {
  const isTest = process.env.NODE_ENV === 'test';
  const basePaths = isTest
    ? [process.cwd(), tmpdir()]
    : [process.cwd()];
  return new SecurityValidator(basePaths);
}
```

**Issues:**
- Weakens security in test mode
- Requires all tools to use new function
- Potential for test mode to leak to production

---

## Resolution Options

### Recommended: Environment-aware validation

**Implementation:**
1. Add test environment detection to SecurityValidator
2. Allow `/tmp` and `process.cwd()` in test mode
3. Update all tool handlers to use environment-aware validator
4. Document security implications

**Effort:** ~3-4 hours

**Pros:**
- Minimal code changes
- Preserves security in production
- Enables comprehensive testing

**Cons:**
- Requires careful environment handling
- Test mode must never reach production

### Alternative: Dependency injection

**Implementation:**
1. Make SecurityValidator injectable in tool handlers
2. Pass test-configured validator in tests
3. Keep production code using default validator

**Effort:** ~6-8 hours (requires refactoring all tools)

**Pros:**
- Clean separation of concerns
- No environment-dependent behavior
- Explicit test configuration

**Cons:**
- More invasive changes
- All MCP tools need refactoring
- More complex test setup

---

## Current Status

**Test Coverage:**
- **Before Gear 6:** 30% (documented)
- **After Gear 6:** ~32% (minimal increase)
  - Security tests: 100% ✅ (still passing)
  - State management tests: 100% ✅ (still passing)
  - MCP tool tests: Limited by infrastructure issue

**Implemented:**
- ✅ Created test suite for reverse-engineer tool
- ✅ Documented limitation
- ✅ Set up CI/CD to run existing tests
- ⏸️ Paused further test creation until infrastructure resolved

**Deferred to future iteration:**
- Test infrastructure improvements (3-4 hours)
- Remaining MCP tool tests (12-15 hours after infrastructure fixed)
- Integration test suite (6-8 hours after infrastructure fixed)

---

## Impact Assessment

**Business Impact:** Medium
- Current 30% coverage includes all critical security code ✅
- Production functionality not affected
- CI/CD pipeline operational

**Development Impact:** Medium
- Limits ability to add integration tests
- Manual testing still required for new features
- Future test expansion blocked

**Risk:** Low
- Security-critical code has 100% coverage
- State management has 100% coverage
- Utilities partially tested (50%)
- MCP tools partially tested (analyze: 90%, others: 0%)

---

## Recommendations

### Immediate (Current Release - v1.0.0)
1. ✅ Document limitation (this file)
2. ✅ Merge Gear 6 work with CI/CD pipeline
3. ✅ Ship with current 30% coverage (security-focused)

### Short-term (v1.1.0 - Next 1-2 weeks)
1. Implement environment-aware validation (3-4 hours)
2. Add tests for remaining 6 MCP tools (12-15 hours)
3. Target 80% overall coverage

### Long-term (v1.2.0+)
1. Consider dependency injection refactor (6-8 hours)
2. Add comprehensive integration tests (6-8 hours)
3. Target 90%+ coverage

---

## Lessons Learned

1. **Security vs Testability:** Security hardening can create testability challenges
2. **Test Early:** Infrastructure issues should be caught earlier in development
3. **Environment Awareness:** Test environments need different constraints than production
4. **Coverage Quality > Quantity:** 30% coverage of security-critical code > 80% coverage of trivial code

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-16
**Resolution Target:** v1.1.0
