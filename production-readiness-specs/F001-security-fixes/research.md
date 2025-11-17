# Research: F001-security-fixes

**Date:** 2025-11-17
**Status:** ✅ Complete
**Purpose:** Resolve all NEEDS CLARIFICATION items from implementation plan

---

## Research Questions

This document resolves the 5 unknowns identified in the Technical Context section of `impl-plan.md`.

---

## Question 1: Performance Impact

**Question:** What is acceptable latency increase for validation? Should we benchmark before/after?

### Decision

**Accept <100ms overhead for resource operations**

### Rationale

1. **Resource operations are infrequent**
   - MCP resources are read by clients for status checks
   - Not in critical hot path (unlike tool execution)
   - Typical usage: 1-2 reads per minute

2. **Validation overhead is minimal**
   - Path validation: ~1-5ms (simple string operations)
   - File stat check: ~10-20ms (already done by readFile)
   - JSON parsing: Same complexity, just safer
   - **Estimated total overhead: 20-40ms**

3. **Existing tools already use this validation**
   - All 7 MCP tools use `createDefaultValidator()`
   - No performance complaints from users
   - Same validation pattern, proven acceptable

### Benchmark Approach

**Pre-Implementation Baseline:**
```typescript
// Test: Time 1000 resource reads
// Expected: ~50-100ms total (0.05-0.1ms per read)
```

**Post-Implementation Target:**
```typescript
// Test: Time 1000 resource reads with validation
// Acceptable: <150ms total (0.15ms per read)
// Threshold: Reject if >200ms (0.2ms per read)
```

**Testing Strategy:**
- Add performance test in `mcp-server/src/resources/__tests__/performance.test.ts`
- Run on CI to catch regressions
- No need for pre-implementation benchmark (risk is low)

### Alternatives Considered

1. **No validation (current state)**
   - ❌ Rejected: Security vulnerabilities unacceptable

2. **Cache validated paths**
   - ❌ Rejected: Over-engineering for minimal gain
   - process.cwd() is static in 99% of cases

3. **Lazy validation (validate on error)**
   - ❌ Rejected: Defeats purpose of security validation

---

## Question 2: Backward Compatibility

**Question:** Are there existing MCP clients that might break? Should we version the resource API?

### Decision

**No versioning needed - changes are backward compatible for valid requests**

### Rationale

1. **Validation only affects malicious/malformed requests**
   - Valid requests: `process.cwd()` is always valid workspace
   - Malicious requests: Should fail (desired behavior)
   - No legitimate use case for accessing outside workspace

2. **Error messages guide users**
   - Clear error: "Directory access denied: ... is outside allowed workspace"
   - Users can fix their setup (e.g., run from correct directory)

3. **MCP protocol unchanged**
   - Resource URIs: Same (`stackshift://state`, etc.)
   - Response format: Same (JSON or text)
   - Only internal implementation changes

4. **Existing tools already use this pattern**
   - Tools like `stackshift_analyze` have used validation since v1.0.1
   - No breaking changes reported
   - Resources should match tool behavior

### Migration Path (if needed)

**If clients break (unlikely):**
1. Document required working directory in error message
2. Add troubleshooting guide: "Ensure you run from project root"
3. No code changes needed

### Alternatives Considered

1. **Version the resource API**
   - ❌ Rejected: Adds complexity for no benefit
   - Would require dual implementation paths

2. **Add `STACKSHIFT_SECURITY_STRICT` env var**
   - ❌ Rejected: Security should always be on
   - Allowing bypass defeats the purpose

3. **Gradual rollout with feature flag**
   - ❌ Rejected: Fixes should be immediate for security
   - Not applicable to MCP server deployment model

---

## Question 3: Error Handling Strategy

**Question:** How verbose should error messages be? Should we log security violations?

### Decision

**Use clear error messages without leaking sensitive paths; log violations to stderr**

### Rationale

1. **Balance security and usability**
   - Users need to understand what went wrong
   - But don't reveal full system paths to potential attackers
   - MCP clients run locally, so path leakage risk is lower

2. **Error message pattern:**
   ```typescript
   // ✅ Good: Clear but safe
   throw new Error(
     `Directory access denied: requested path is outside allowed workspace. ` +
     `Ensure you run StackShift from your project root.`
   );

   // ❌ Bad: Leaks full paths
   throw new Error(
     `Directory access denied: "/etc/passwd" is outside allowed workspace "/home/user/project"`
   );
   ```

3. **Logging strategy:**
   - Log to stderr (not returned to client)
   - Include timestamp, attempted path, allowed paths
   - Helps debugging without exposing to potential attackers

### Implementation Pattern

```typescript
export async function getStateResource() {
  const validator = createDefaultValidator();

  try {
    const directory = validator.validateDirectory(process.cwd());
    // ... rest of logic
  } catch (error) {
    // Log full details to stderr for debugging
    console.error(`[SECURITY] Resource access denied:`, {
      timestamp: new Date().toISOString(),
      attempted: process.cwd(),
      allowed: validator.allowedBasePaths,
      error: error.message,
    });

    // Return safe error to client
    return {
      contents: [{
        uri: 'stackshift://state',
        mimeType: 'application/json',
        text: JSON.stringify({
          error: 'Access denied',
          message: 'Resource access is restricted to project workspace. Ensure you run from project root.',
        }, null, 2),
      }],
    };
  }
}
```

### Alternatives Considered

1. **Silent failures (return empty)**
   - ❌ Rejected: Poor user experience
   - Users wouldn't know why resources are unavailable

2. **Full path disclosure**
   - ❌ Rejected: Information leakage
   - Even though local, better to be safe

3. **No logging**
   - ❌ Rejected: Debugging would be difficult
   - Operators need visibility into security events

---

## Question 4: Testing Strategy

**Question:** Integration test approach for MCP resources? Test data location and cleanup?

### Decision

**Use Vitest with temporary test directories; clean up in afterEach; mock fs operations for unit tests**

### Rationale

1. **Existing test patterns in codebase**
   - Security tests already use temp directories
   - Pattern: Create in `/tmp`, clean up in `afterEach`
   - File utils tests already demonstrate this approach

2. **Two-tier testing approach:**
   - **Unit tests:** Mock fs operations, test logic in isolation
   - **Integration tests:** Real temp files, test full workflow

3. **Test data strategy:**
   ```typescript
   // Pattern from existing security tests
   import { tmpdir } from 'os';
   import { mkdtemp, rm } from 'fs/promises';
   import { join } from 'path';

   let testDir: string;

   beforeEach(async () => {
     testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));
   });

   afterEach(async () => {
     await rm(testDir, { recursive: true, force: true });
   });
   ```

### Test Structure

**Unit Tests** (`mcp-server/src/resources/__tests__/security.test.ts`):
```typescript
describe('getStateResource security', () => {
  test('rejects path traversal in working directory', async () => {
    // Mock process.cwd() to return malicious path
    const originalCwd = process.cwd;
    process.cwd = () => '/etc/../../../etc/passwd';

    await expect(getStateResource()).rejects.toThrow('Directory access denied');

    process.cwd = originalCwd;
  });

  test('enforces file size limits', async () => {
    // Mock readJsonSafe to throw size error
    // Verify error handling
  });

  test('prevents prototype pollution', async () => {
    // Mock readJsonSafe with malicious JSON
    // Verify __proto__ is stripped
  });
});
```

**Integration Tests** (`mcp-server/src/resources/__tests__/integration.test.ts`):
```typescript
describe('Resource handlers end-to-end', () => {
  test('full workflow with validation', async () => {
    // Create temp directory
    // Write valid .stackshift-state.json
    // Change to temp directory
    // Call resource handler
    // Verify response
    // Cleanup
  });
});
```

### Test Coverage Targets

- Resources module: 80%+ (currently ~0%)
- New security tests: 100%
- Integration tests: Critical paths only

### Alternatives Considered

1. **Docker containers for isolation**
   - ❌ Rejected: Overkill for unit tests
   - Slower CI/CD pipeline

2. **In-memory file system (memfs)**
   - ❌ Rejected: Doesn't test real fs operations
   - Would miss edge cases

3. **No integration tests**
   - ❌ Rejected: Need to test full MCP flow
   - Unit tests alone might miss integration issues

---

## Question 5: Monitoring

**Question:** Should we add telemetry for blocked access attempts? Alerting strategy?

### Decision

**Log to stderr for local debugging; defer production telemetry to F005-deployment**

### Rationale

1. **Current deployment model is local**
   - MCP server runs locally on developer machines
   - No central telemetry infrastructure (yet)
   - Logging to stderr is sufficient for now

2. **Security events should be visible**
   - Operators need to see blocked attempts
   - stderr logs can be captured by MCP clients
   - Structured logging for easy parsing

3. **Future-proofing for production**
   - F005-deployment will add production monitoring
   - Leave hooks for telemetry integration
   - Don't over-engineer now

### Logging Implementation

```typescript
// Structured logging helper
function logSecurityEvent(event: {
  type: 'path_traversal' | 'size_limit' | 'invalid_json';
  resource: string;
  details: any;
}) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    severity: 'WARNING',
    category: 'security',
    ...event,
  }));
}

// Usage in resource handlers
try {
  const directory = validator.validateDirectory(process.cwd());
} catch (error) {
  logSecurityEvent({
    type: 'path_traversal',
    resource: 'stackshift://state',
    details: { attempted: process.cwd() },
  });
  throw error;
}
```

### Metrics to Track (Future - F005)

When production telemetry is available:
- Count of blocked access attempts
- Types of security violations
- Resource read latency (p50, p95, p99)
- Error rates by resource type

### Alternatives Considered

1. **Send to external monitoring (Sentry, DataDog)**
   - ❌ Rejected: No infrastructure exists yet
   - Wait for F005-deployment

2. **No logging**
   - ❌ Rejected: Need visibility for debugging
   - Security events should be auditable

3. **File-based audit log**
   - ❌ Rejected: Complexity not justified
   - stderr is sufficient for local development

---

## Best Practices Research

### Security Best Practices

**Source:** OWASP Top 10, CWE Database

1. **Defense in Depth**
   - ✅ Validate at multiple layers (validator + size limits + JSON sanitization)
   - ✅ Fail securely (deny by default)

2. **Principle of Least Privilege**
   - ✅ Only allow access to workspace directory
   - ✅ Test mode allows /tmp but only when explicitly enabled

3. **Clear Error Messages**
   - ✅ Guide users to fix issues
   - ❌ Don't leak sensitive paths

### JSON Security Best Practices

**Source:** OWASP JSON Security Cheat Sheet

1. **Prototype Pollution Prevention**
   - ✅ Delete `__proto__`, `constructor`, `prototype` after parsing
   - ✅ Use `JSON.parse()` (not `eval` or `Function`)

2. **Size Limits**
   - ✅ Enforce 10MB limit (prevents DoS)
   - ✅ Check before reading (stat first)

3. **Schema Validation**
   - ⏳ Deferred: Not needed for internal state file
   - State file format is controlled by StackShift

### Path Validation Best Practices

**Source:** CWE-22 Mitigation Guide

1. **Normalization**
   - ✅ Use `path.normalize()` before validation
   - ✅ Resolve to absolute path

2. **Allowlist Approach**
   - ✅ Define allowed base paths
   - ✅ Reject anything outside

3. **Check for Path Traversal Sequences**
   - ✅ Reject `..` in relative paths
   - ✅ Reject absolute paths outside workspace

---

## Technology Integration Patterns

### Integration with Existing Security Module

**Pattern:** Reuse `createDefaultValidator()` consistently

```typescript
// ✅ Consistent pattern across codebase
import { createDefaultValidator } from '../utils/security.js';

const validator = createDefaultValidator();
const directory = validator.validateDirectory(process.cwd());
```

**Benefits:**
- Same validation logic as MCP tools
- Already tested (100% coverage)
- Single source of truth

### Integration with Existing File Utils

**Pattern:** Always use `readJsonSafe()` for JSON files

```typescript
// ✅ Safe JSON reading
import { readJsonSafe } from '../utils/file-utils.js';

const state = await readJsonSafe(stateFile);
// __proto__, constructor, prototype already deleted
// Size already validated (10MB limit)
```

**Benefits:**
- Single responsibility (file-utils handles file operations)
- Consistent error handling
- All safety checks in one place

---

## Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Performance** | Accept <100ms overhead | Resource reads are infrequent, validation is cheap |
| **Compatibility** | No versioning needed | Valid requests work, only malicious ones fail |
| **Error Handling** | Clear messages, log to stderr | Balance usability and security |
| **Testing** | Vitest with temp dirs | Matches existing patterns, proven approach |
| **Monitoring** | stderr logging now, defer telemetry | No infrastructure yet, F005 will add it |

---

## Open Questions (Deferred)

**None** - All clarifications resolved

---

## References

1. **OWASP Top 10:** https://owasp.org/www-project-top-ten/
2. **CWE-22 (Path Traversal):** https://cwe.mitre.org/data/definitions/22.html
3. **CWE-400 (Resource Exhaustion):** https://cwe.mitre.org/data/definitions/400.html
4. **CWE-502 (Deserialization):** https://cwe.mitre.org/data/definitions/502.html
5. **OWASP JSON Security:** https://cheatsheetseries.owasp.org/cheatsheets/JSON_Security_Cheat_Sheet.html
6. **StackShift Constitution:** `.specify/memory/constitution.md`
7. **Existing Security Tests:** `mcp-server/src/utils/__tests__/security.test.ts`

---

**Status:** ✅ All unknowns resolved - Ready for Phase 1 (Design)
