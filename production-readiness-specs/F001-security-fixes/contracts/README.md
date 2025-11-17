# Contracts: F001-security-fixes

**Feature:** Security Vulnerability Fixes
**Date:** 2025-11-17
**Status:** ✅ N/A - Internal Changes Only

---

## Overview

This feature involves **internal security improvements** only. There are **no external API contracts** that change.

---

## Why No Contracts?

**This fix modifies:**
- Internal validation logic (before file operations)
- Internal error handling
- Internal logging

**This fix does NOT modify:**
- MCP resource URIs (`stackshift://state`, `stackshift://progress`, `stackshift://route`)
- MCP resource response format (JSON structure unchanged)
- MCP tool interfaces
- External client APIs

---

## Internal Contracts (for reference)

While there are no external contracts, the internal contracts between modules are documented here for developer reference.

### Contract 1: SecurityValidator Interface

**Module:** `mcp-server/src/utils/security.ts`

**Purpose:** Provides path validation services to all modules

**Interface:**
```typescript
class SecurityValidator {
  constructor(allowedBasePaths: string[])

  validateDirectory(directory: string): string
  // Returns: Validated absolute path
  // Throws: Error if outside allowed workspace

  validateFilePath(directory: string, filename: string): string
  // Returns: Validated absolute file path
  // Throws: Error if path escapes directory
}

function createDefaultValidator(): SecurityValidator
// Returns: Validator for current working directory
```

**Contract Guarantees:**
- ✅ Returned paths are always within allowed workspace
- ✅ Throws descriptive errors for invalid paths
- ✅ Normalizes and resolves paths to absolute form
- ✅ Rejects shell metacharacters

**Breaking Change Policy:**
- Changing allowed paths: **Breaking** (requires major version bump)
- Adding new validation rules: **Non-breaking** (more restrictive is OK)
- Changing error messages: **Non-breaking** (as long as they throw)

---

### Contract 2: File Utils Interface

**Module:** `mcp-server/src/utils/file-utils.ts`

**Purpose:** Provides safe file operations with size limits and sanitization

**Interface:**
```typescript
async function readFileSafe(
  filePath: string,
  maxSize?: number
): Promise<string>
// Returns: File contents as string
// Throws: Error if file > maxSize (default 10MB)

async function readJsonSafe(filePath: string): Promise<any>
// Returns: Parsed JSON with dangerous properties removed
// Throws: Error if file too large or invalid JSON
```

**Contract Guarantees:**
- ✅ Files larger than maxSize are rejected before reading
- ✅ JSON objects have `__proto__`, `constructor`, `prototype` removed
- ✅ Throws descriptive errors for failures
- ✅ No partial reads (atomic operation)

**Breaking Change Policy:**
- Changing maxSize default: **Breaking** (could reject previously valid files)
- Adding more sanitization: **Non-breaking** (more secure is OK)
- Changing return type: **Breaking** (requires major version bump)

---

### Contract 3: Resource Handler Interface (MCP Protocol)

**Module:** `mcp-server/src/resources/index.ts`

**Purpose:** Implements MCP resource protocol for StackShift state

**Interface:**
```typescript
async function getStateResource(): Promise<ResourceResponse>
async function getProgressResource(): Promise<ResourceResponse>
async function getRouteResource(): Promise<ResourceResponse>

interface ResourceResponse {
  contents: Array<{
    uri: string;          // e.g., 'stackshift://state'
    mimeType: string;     // 'application/json' or 'text/plain'
    text: string;         // Resource content
  }>;
}
```

**Contract Guarantees (UNCHANGED by this fix):**
- ✅ URI format: `stackshift://<resource-name>`
- ✅ Response format: MCP ResourceResponse
- ✅ Error handling: Returns error object, doesn't throw
- ✅ State file location: `.stackshift-state.json` in workspace root

**What Changed (Internal Only):**
- ❌ Before: Direct `process.cwd()` usage
- ✅ After: `validator.validateDirectory(process.cwd())`
- ❌ Before: `JSON.parse(await fs.readFile())`
- ✅ After: `await readJsonSafe()`

**Client Impact:** ✅ None - All valid requests work exactly the same

---

## Backward Compatibility

### MCP Clients

**No changes required** for MCP clients

**Valid requests (before):** ✅ Still valid (after)
```typescript
// Client request
client.readResource({ uri: 'stackshift://state' })

// Before fix: Returns state (if workspace valid)
// After fix: Returns state (if workspace valid)
// Result: IDENTICAL
```

**Invalid requests (before):** ❌ Still invalid (after), but safer
```typescript
// Client running from outside workspace
// (e.g., from /tmp when workspace is /home/user/project)

// Before fix: Might return wrong state file OR crash
// After fix: Returns clear error: "Access denied - run from project root"
// Result: SAFER (better error message)
```

### TypeScript Consumers

**No changes required** for internal consumers

**Before:**
```typescript
import { getStateResource } from './resources';
const resource = await getStateResource();
// Works
```

**After:**
```typescript
import { getStateResource } from './resources';
const resource = await getStateResource();
// Still works - same interface
```

---

## Migration Guide

### For StackShift Users

**No migration needed** - Continue using MCP resources as before

**If you see new errors:**
1. Ensure you're running from project root: `cd /path/to/project`
2. Check that `.stackshift-state.json` exists in current directory
3. Verify file permissions (should be readable)

### For StackShift Developers

**When adding new resource handlers:**

**❌ Don't do this (vulnerable):**
```typescript
export async function getMyResource() {
  const directory = process.cwd();  // ❌ No validation
  const file = path.join(directory, 'myfile.json');
  const data = JSON.parse(await fs.readFile(file, 'utf-8'));  // ❌ No sanitization
  return data;
}
```

**✅ Do this (secure):**
```typescript
import { createDefaultValidator } from '../utils/security.js';
import { readJsonSafe } from '../utils/file-utils.js';

export async function getMyResource() {
  const validator = createDefaultValidator();  // ✅ Create validator
  const directory = validator.validateDirectory(process.cwd());  // ✅ Validate
  const file = path.join(directory, 'myfile.json');
  const data = await readJsonSafe(file);  // ✅ Safe read + sanitization
  return data;
}
```

---

## Testing Contracts

### Test Expectations (for CI/CD)

**All resource handlers MUST:**
1. ✅ Use `createDefaultValidator()` before any file operations
2. ✅ Use `readJsonSafe()` for JSON files
3. ✅ Use `readFileSafe()` for text files
4. ✅ Handle errors gracefully (return error object, don't crash)
5. ✅ Not leak full system paths in error messages

**Test Coverage Requirements:**
- Security validation: **100%**
- Resource handlers: **80%+**
- Error paths: **100%** (all error branches must be tested)

---

## API Stability Guarantees

| Component | Stability | Change Policy |
|-----------|-----------|---------------|
| **MCP Resource URIs** | ✅ Stable | Breaking changes only in major versions |
| **MCP Response Format** | ✅ Stable | Additive changes OK, removals are breaking |
| **SecurityValidator API** | ✅ Stable | Can add methods, cannot remove |
| **File Utils API** | ✅ Stable | Can add functions, cannot change signatures |
| **Error Messages** | ⚠️ Unstable | May change for clarity (not guaranteed) |

---

## Summary

- **External API Changes:** ✅ None
- **Internal Contract Changes:** ✅ Additive only (more secure)
- **Backward Compatibility:** ✅ 100% for valid requests
- **Migration Required:** ❌ No
- **Client Updates Required:** ❌ No

This security fix is a **drop-in improvement** with no external contract changes.

---

**Status:** ✅ Complete - No external contracts affected
**Next:** Generate quickstart guide for developers implementing the fix
