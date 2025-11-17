# Agent Context: F001-security-fixes

**Purpose:** Document technologies and patterns for AI agent context
**Date:** 2025-11-17
**Status:** ✅ Complete

---

## Technology Stack Used

### Core Technologies
- **TypeScript:** 5.3.0 (strict mode)
- **Node.js:** >=18.0.0
- **Testing:** Vitest 1.0+
- **Protocol:** MCP (Model Context Protocol) 1.0

### Security Libraries (Existing)
- **Built-in:** No external security dependencies
- **Custom:** `SecurityValidator` class (in-house)
- **Utilities:** `readFileSafe()`, `readJsonSafe()` (in-house)

---

## Patterns & Practices Added

### Security Validation Pattern

**Pattern Name:** Defense-in-Depth Path Validation

**When to use:**
- Before any file system operation
- When accepting user input (paths, filenames, parameters)
- When using environment variables

**Implementation:**
```typescript
import { createDefaultValidator } from '../utils/security.js';

const validator = createDefaultValidator();
const directory = validator.validateDirectory(process.cwd());
// Now safe to use directory for file operations
```

**Key Points:**
- Always create validator before file operations
- Validate paths BEFORE constructing file paths
- Use `readJsonSafe()` for JSON files (includes sanitization)
- Use `readFileSafe()` for text files (includes size limits)

---

### Safe JSON Reading Pattern

**Pattern Name:** Size-Limited Prototype-Safe JSON Parsing

**When to use:**
- Reading any JSON file from disk
- Especially for user-controlled JSON files

**Implementation:**
```typescript
import { readJsonSafe } from '../utils/file-utils.js';

const data = await readJsonSafe(filePath);
// data is parsed, sanitized (no __proto__, constructor, prototype)
// file size was checked (max 10MB)
```

**Key Points:**
- Never use raw `JSON.parse(await fs.readFile())`
- Always use `readJsonSafe()` wrapper
- Wrapper handles: size limits, parsing, sanitization
- Throws descriptive errors

---

### Input Validation Pattern

**Pattern Name:** Whitelist-Based Input Validation

**When to use:**
- Validating user-provided strings (skill names, etc.)
- Before constructing file paths from user input
- When accepting parameters that influence file operations

**Implementation:**
```typescript
// Step 1: Reject dangerous characters
if (skillName.includes('/') || skillName.includes('\\')) {
  throw new Error('Invalid input: path separators not allowed');
}

// Step 2: Enforce whitelist
if (!/^[a-zA-Z0-9_-]+$/.test(skillName)) {
  throw new Error('Invalid input: alphanumeric only');
}

// Step 3: Validate environment variables
if (!process.env.HOME || process.env.HOME.includes('\0')) {
  throw new Error('Invalid environment variable');
}
```

**Key Points:**
- Whitelist approach (allow only known-good) vs blacklist (block known-bad)
- Check for path separators: `/`, `\`, `..`
- Check for shell metacharacters
- Validate environment variables before use

---

## Testing Patterns Added

### Security Test Pattern

**Pattern Name:** Temp Directory Isolation Testing

**When to use:**
- Testing file operations
- Testing validation logic
- Testing resource handlers

**Implementation:**
```typescript
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));
  process.cwd = () => testDir;  // Mock cwd
});

afterEach(async () => {
  process.cwd = originalCwd;  // Restore
  await rm(testDir, { recursive: true, force: true });
});

test('reads valid file', async () => {
  await writeFile(join(testDir, 'test.json'), '{"key": "value"}');
  const result = await myFunction();
  expect(result).toBeDefined();
});
```

**Key Points:**
- Create unique temp directory per test
- Mock `process.cwd()` to return test directory
- Always cleanup in `afterEach`
- Use `mkdtemp()` for unique names (prevents conflicts)

---

## Anti-Patterns to Avoid

### ❌ Direct File Operations

**Don't:**
```typescript
const directory = process.cwd();  // ❌ No validation
const file = path.join(directory, filename);  // ❌ Direct path construction
const data = JSON.parse(await fs.readFile(file, 'utf-8'));  // ❌ Unsafe parsing
```

**Do:**
```typescript
const validator = createDefaultValidator();  // ✅ Create validator
const directory = validator.validateDirectory(process.cwd());  // ✅ Validate
const file = path.join(directory, filename);
const data = await readJsonSafe(file);  // ✅ Safe read + parse
```

### ❌ Type Assertions on User Input

**Don't:**
```typescript
const args = userInput as any;  // ❌ Bypasses type checking
const args = userInput as MyType;  // ❌ Runtime could be anything
```

**Do:**
```typescript
const args = validateArgs(userInput);  // ✅ Runtime validation
const args = userInput || {} as MyType;  // ✅ Safe default + assertion
```

### ❌ Trusting Environment Variables

**Don't:**
```typescript
const home = process.env.HOME;  // ❌ Could be undefined or malicious
const path = home + '/config';  // ❌ Unsafe concatenation
```

**Do:**
```typescript
const home = process.env.HOME;
if (!home || home.includes('\0')) {  // ✅ Validate
  throw new Error('Invalid HOME');
}
const validator = createDefaultValidator();
const validatedHome = validator.validateDirectory(home);  // ✅ Validate
const path = join(validatedHome, 'config');  // ✅ Safe construction
```

---

## CWE Mitigations Applied

### CWE-22: Path Traversal

**Mitigation:**
- `SecurityValidator.validateDirectory()` checks all paths
- Rejects `..` in relative paths
- Rejects absolute paths outside workspace
- Normalizes and resolves paths before checking

**Code Pattern:**
```typescript
const validator = createDefaultValidator();
const safe = validator.validateDirectory(untrusted);
```

### CWE-400: Resource Exhaustion (DoS)

**Mitigation:**
- `readFileSafe()` enforces 10MB file size limit
- Check file size before reading (stat first)
- Limit directory traversal depth (already in `findFiles`)
- Limit file count (already in `findFiles`)

**Code Pattern:**
```typescript
const content = await readFileSafe(filePath);  // Max 10MB
```

### CWE-502: Deserialization of Untrusted Data

**Mitigation:**
- `readJsonSafe()` removes dangerous properties
- Deletes `__proto__`, `constructor`, `prototype` after parsing
- Use `JSON.parse()` only (never `eval` or `Function`)

**Code Pattern:**
```typescript
const obj = await readJsonSafe(filePath);
// obj.__proto__ is undefined (safe)
```

---

## Agent Learning Points

### For Future Features

**When implementing file operations:**
1. ✅ Always use `createDefaultValidator()` first
2. ✅ Validate all paths before use
3. ✅ Use `readFileSafe()` or `readJsonSafe()` (never raw fs)
4. ✅ Test with malicious inputs (path traversal, large files, etc.)

**When accepting user input:**
1. ✅ Validate format (whitelist regex)
2. ✅ Reject path separators and special chars
3. ✅ Validate environment variables
4. ✅ Test with injection attempts

**When writing tests:**
1. ✅ Use temp directories for isolation
2. ✅ Always cleanup in `afterEach`
3. ✅ Test both success and error paths
4. ✅ Test security boundaries (malicious inputs)

---

## Dependencies

**No new dependencies added** ✅

This fix uses only existing infrastructure:
- `SecurityValidator` (already in codebase)
- `readFileSafe()` (already in codebase)
- `readJsonSafe()` (already in codebase)

**Why no new dependencies:**
- Aligns with constitution (minimal dependencies)
- Reduces attack surface
- Simplifies maintenance
- Faster installs

---

## Configuration

**No new configuration required** ✅

Security validation is always enabled. There is no opt-out:
- Validation runs in both production and test modes
- Test mode allows `/tmp` directory (for testing only)
- Detected via `NODE_ENV=test` or `VITEST=true`

**Important:** Never set test env vars in production!

---

## Performance Characteristics

**Validation Overhead:**
- Path validation: ~1-5ms per call
- File stat check: ~10-20ms per call
- JSON sanitization: ~1-2ms per object

**Total overhead per resource read:** ~20-40ms

**Acceptable because:**
- Resource reads are infrequent (1-2 per minute)
- Not in hot path (unlike tool execution)
- Security benefit outweighs minimal cost

---

## References

**Internal:**
- `mcp-server/src/utils/security.ts` - Validator implementation
- `mcp-server/src/utils/file-utils.ts` - Safe file operations
- `mcp-server/src/utils/__tests__/security.test.ts` - Security test examples

**External:**
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22](https://cwe.mitre.org/data/definitions/22.html)
- [CWE-400](https://cwe.mitre.org/data/definitions/400.html)
- [CWE-502](https://cwe.mitre.org/data/definitions/502.html)

---

**Status:** ✅ Complete - Agent context documented
**Note:** Agent-specific context files not found. This file serves as technology reference for future AI agents working on StackShift security features.
