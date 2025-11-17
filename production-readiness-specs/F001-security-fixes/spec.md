# F001: Security Vulnerability Fixes

## Overview

Critical security vulnerabilities have been identified in the StackShift MCP server's resource handlers that bypass all security validation, potentially allowing unauthorized file access. These must be fixed before production deployment.

## Problem Statement

The resources layer (`src/resources/index.ts`) contains multiple security vulnerabilities:

1. **CWE-22 (Path Traversal)**: Resources bypass security validation by using `process.cwd()` directly
2. **CWE-400 (Resource Exhaustion)**: No size limits on file reads could cause DoS
3. **CWE-502 (Deserialization)**: Unsafe JSON parsing without prototype pollution protection
4. **Missing input validation**: skill-loader.ts doesn't validate skillName parameter

### Current Impact

- **CVSS Score: 7.5 (HIGH)** for path traversal vulnerability
- Resources can potentially read arbitrary files if working directory is compromised
- DoS possible through large state files
- Prototype pollution possible through malicious JSON

## Requirements

### Security Requirements

1. **All file operations MUST use security validation**
   - Apply createDefaultValidator() to all directory/file access
   - Validate all paths before file operations
   - Use consistent validation across tools and resources

2. **File reads MUST have size limits**
   - Use readFileSafe() for all file reads (10MB limit)
   - Implement proper error handling for size violations
   - Log warnings when limits are approached

3. **JSON parsing MUST be safe**
   - Use readJsonSafe() or implement sanitization
   - Strip dangerous properties (__proto__, constructor, prototype)
   - Validate JSON structure before use

4. **Input parameters MUST be validated**
   - Validate skillName doesn't contain path separators
   - Validate environment variables before use
   - Whitelist allowed characters in parameters

### Implementation Details

#### Fix 1: Resource Handler Security (Priority: P0)

**File:** `mcp-server/src/resources/index.ts`

```typescript
import { createDefaultValidator } from '../utils/security.js';
import { readFileSafe, readJsonSafe } from '../utils/file-utils.js';

export async function getStateResource() {
  const validator = createDefaultValidator();
  const directory = validator.validateDirectory(process.cwd());
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const state = await readJsonSafe(stateFile);
    // ... rest of logic
  } catch (error) {
    // Proper error handling
  }
}

export async function getProgressResource() {
  const validator = createDefaultValidator();
  const directory = validator.validateDirectory(process.cwd());
  const stateFile = path.join(directory, '.stackshift-state.json');

  const stateData = await readJsonSafe(stateFile);
  // ... rest of logic
}

export async function getRouteResource() {
  const validator = createDefaultValidator();
  const directory = validator.validateDirectory(process.cwd());
  const stateFile = path.join(directory, '.stackshift-state.json');

  const state = await readJsonSafe(stateFile);
  // ... rest of logic
}
```

#### Fix 2: Skill Loader Validation (Priority: P1)

**File:** `mcp-server/src/utils/skill-loader.ts`

```typescript
export async function loadSkillFile(skillName: string): Promise<string | null> {
  // Validate skill name
  if (skillName.includes('/') || skillName.includes('\\') || skillName.includes('..')) {
    throw new Error(`Invalid skill name: cannot contain path separators`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(skillName)) {
    throw new Error(`Invalid skill name: must be alphanumeric with hyphens/underscores only`);
  }

  // Validate HOME environment variable
  const homePath = process.env.HOME;
  if (!homePath || homePath.includes('\0')) {
    throw new Error('Invalid HOME environment variable');
  }

  const validator = createDefaultValidator();
  const validatedHome = validator.validateDirectory(homePath);

  // ... rest of logic
}
```

#### Fix 3: Remove Type Assertion (Priority: P2)

**File:** `mcp-server/src/index.ts` (line 237)

```typescript
// Before:
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler((args as any) || {});

// After:
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler(args || {} as CruiseControlArgs);
```

### Testing Requirements

1. **Security Tests**
   - Add tests for resource handlers with malicious inputs
   - Test path traversal attempts
   - Test large file handling
   - Test malformed JSON handling

2. **Validation Tests**
   - Test skill name validation
   - Test environment variable validation
   - Test all security boundaries

## Success Criteria

1. All file operations use validated paths
2. No direct use of process.cwd() without validation
3. All file reads have size limits
4. JSON parsing is protected against prototype pollution
5. All tests pass including new security tests
6. npm audit shows no high or critical vulnerabilities

## Dependencies

- Existing security.ts utilities
- Existing file-utils.ts utilities
- No new external dependencies

## Non-Goals

- Not changing the MCP protocol interface
- Not adding new features
- Not refactoring unrelated code

## Timeline

- **Estimated Effort:** 4-6 hours
- **Priority:** P0 - Must fix before production
- **Testing:** 2 additional hours

## Rollback Plan

If security fixes cause unexpected issues:
1. Revert commits
2. Add feature flag for enhanced security
3. Gradually enable per resource
4. Monitor for issues

## References

- CWE-22: https://cwe.mitre.org/data/definitions/22.html
- CWE-400: https://cwe.mitre.org/data/definitions/400.html
- CWE-502: https://cwe.mitre.org/data/definitions/502.html
- OWASP Path Traversal: https://owasp.org/www-community/attacks/Path_Traversal