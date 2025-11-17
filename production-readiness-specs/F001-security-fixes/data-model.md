# Data Model: F001-security-fixes

**Feature:** Security Validation for MCP Resources
**Date:** 2025-11-17
**Status:** ✅ Complete

---

## Overview

This document defines the conceptual model for security validation in StackShift MCP resources. While this feature doesn't involve database entities, it introduces validation entities and state transitions that are critical to understand for implementation.

---

## Core Entities

### 1. SecurityValidator

**Purpose:** Validates paths and prevents security vulnerabilities

**Properties:**
- `allowedBasePaths: string[]` - List of permitted base directories
  - Default: `[process.cwd()]`
  - Test mode: `[process.cwd(), tmpdir()]`

**Methods:**
- `validateDirectory(directory: string): string`
  - **Input:** User-provided directory path
  - **Output:** Validated absolute path
  - **Throws:** Error if outside allowed workspace

- `validateFilePath(directory: string, filename: string): string`
  - **Input:** Base directory + relative filename
  - **Output:** Validated absolute file path
  - **Throws:** Error if path escapes directory

**Validation Rules:**
1. Reject paths with shell metacharacters: `;`, `&`, `|`, `` ` ``, `$`, `(`, `)`, `{`, `}`, `[`, `]`, `<`, `>`, `\\`, `!`
2. Normalize path using `path.normalize()`
3. Resolve to absolute path using `path.resolve()`
4. Check if within any allowed base path
5. Reject if relative path starts with `..` (parent directory)
6. Reject if result is absolute path outside workspace

**State Transitions:**
```
Input Path
    ↓
[Normalize] → Normalized Path
    ↓
[Resolve] → Absolute Path
    ↓
[Check Allowed] → ✅ Valid Path OR ❌ SecurityError
```

---

### 2. Resource Handler State

**Purpose:** Represents the state of an MCP resource operation

**States:**
- `Initializing` - Resource handler called
- `Validating` - Directory/path validation in progress
- `Reading` - File system read operation
- `Parsing` - JSON parsing (if applicable)
- `Success` - Resource returned successfully
- `Error` - Validation or read failed

**State Machine:**
```
Initializing
    ↓
Validating (createDefaultValidator, validateDirectory)
    ↓
    ├─→ [Invalid Path] → Error (Security violation)
    │
    └─→ [Valid Path] → Reading (readJsonSafe or readFileSafe)
              ↓
              ├─→ [File Not Found] → Error (Not initialized)
              │
              ├─→ [File Too Large] → Error (Size limit)
              │
              ├─→ [Invalid JSON] → Error (Parse error)
              │
              └─→ [Success] → Parsing (sanitize JSON)
                      ↓
                      └─→ Success (Return resource)
```

**Transitions:**
1. `Initializing → Validating`: Always (automatic)
2. `Validating → Error`: If path outside workspace
3. `Validating → Reading`: If path validated
4. `Reading → Error`: If file not found, too large, or unreadable
5. `Reading → Parsing`: If file read successfully
6. `Parsing → Error`: If JSON malformed
7. `Parsing → Success`: If JSON valid and sanitized

---

### 3. Validation Error

**Purpose:** Represents a security validation failure

**Properties:**
- `type: ValidationErrorType` - Category of error
- `message: string` - User-facing error message (safe)
- `details: any` - Internal details (logged to stderr)
- `timestamp: Date` - When error occurred

**Error Types (Enum):**
```typescript
enum ValidationErrorType {
  PATH_TRAVERSAL = 'path_traversal',       // CWE-22
  FILE_TOO_LARGE = 'file_too_large',       // CWE-400
  INVALID_JSON = 'invalid_json',           // CWE-502
  INVALID_INPUT = 'invalid_input',         // Generic validation
  FILE_NOT_FOUND = 'file_not_found',       // Expected error
  PERMISSION_DENIED = 'permission_denied', // File system error
}
```

**Validation Rules:**
- Error messages MUST NOT leak full system paths
- Error details MAY be logged to stderr for debugging
- Errors MUST include actionable guidance for users

**Example Error Objects:**
```typescript
// Path traversal error
{
  type: ValidationErrorType.PATH_TRAVERSAL,
  message: 'Directory access denied: requested path is outside allowed workspace. Ensure you run StackShift from your project root.',
  details: {
    attempted: '/etc/passwd',
    allowed: ['/home/user/project'],
  },
  timestamp: new Date('2025-11-17T10:30:00Z'),
}

// File too large error
{
  type: ValidationErrorType.FILE_TOO_LARGE,
  message: 'State file exceeds maximum size (10MB)',
  details: {
    filePath: '.stackshift-state.json',
    size: 15728640,
    maxSize: 10485760,
  },
  timestamp: new Date('2025-11-17T10:31:00Z'),
}

// Prototype pollution attempt
{
  type: ValidationErrorType.INVALID_JSON,
  message: 'State file contains invalid JSON structure',
  details: {
    filePath: '.stackshift-state.json',
    dangerousProperties: ['__proto__', 'constructor'],
  },
  timestamp: new Date('2025-11-17T10:32:00Z'),
}
```

---

### 4. Skill Name Validation

**Purpose:** Validates skill names to prevent path traversal in skill loader

**Properties:**
- `skillName: string` - User-provided skill name

**Validation Rules:**
1. MUST NOT contain path separators (`/`, `\`)
2. MUST NOT contain parent directory references (`..`)
3. MUST match regex: `/^[a-zA-Z0-9_-]+$/`
4. Examples:
   - ✅ Valid: `analyze`, `reverse-engineer`, `create-specs`
   - ❌ Invalid: `../etc/passwd`, `analyze/../../secret`, `hack;rm -rf`

**State Transitions:**
```
Input Skill Name
    ↓
[Check Path Separators] → ✅ No separators OR ❌ Error
    ↓
[Check Parent Refs] → ✅ No .. OR ❌ Error
    ↓
[Check Whitelist Regex] → ✅ Valid chars OR ❌ Error
    ↓
[Validate HOME env] → ✅ Valid OR ❌ Error
    ↓
[Construct Path] → Validated Skill Path
```

---

### 5. Environment Variable Validation

**Purpose:** Validates environment variables before use

**Properties:**
- `name: string` - Environment variable name (e.g., `HOME`)
- `value: string | undefined` - Environment variable value

**Validation Rules:**
1. MUST NOT be undefined or null
2. MUST NOT contain null byte (`\0`)
3. MUST be valid directory path (for `HOME`)
4. Examples:
   - ✅ Valid: `/home/user`, `/Users/alice`
   - ❌ Invalid: `undefined`, `/home/user\0/malicious`

---

## Relationships

### SecurityValidator ↔ Resource Handlers

```
SecurityValidator (1) ←→ (N) Resource Handlers
```

- **Cardinality:** One validator instance per resource handler call
- **Lifecycle:** Created in handler function, used once, discarded
- **Relationship:** Each resource handler creates its own validator via `createDefaultValidator()`

### Resource Handler → File Operations

```
Resource Handler (1) → (1) File Read Operation
File Read Operation (1) → (0..1) JSON Parse Operation
```

- **Cardinality:** One file read per handler call
- **Lifecycle:** Sequential - validate → read → parse → return
- **Relationship:** Handler orchestrates file operations

### Validation Error → Logging

```
Validation Error (1) → (1) Log Entry
```

- **Cardinality:** One log entry per error
- **Lifecycle:** Error thrown → logged → returned to client
- **Relationship:** All errors are logged before returning

---

## Data Flow

### Resource Read Flow (Success Path)

```
MCP Client Request
    ↓
getStateResource() / getProgressResource() / getRouteResource()
    ↓
createDefaultValidator()
    ↓
validator.validateDirectory(process.cwd())
    ↓
    [If valid] → Validated Directory Path
    ↓
path.join(directory, '.stackshift-state.json')
    ↓
readJsonSafe(stateFile)
    ↓
    [Check file size] → ✅ <10MB
    ↓
    [Read file] → Raw JSON string
    ↓
    [Parse JSON] → Parsed object
    ↓
    [Remove dangerous properties] → Sanitized object
    ↓
    [Process data] → Resource content
    ↓
Return to MCP Client
```

### Resource Read Flow (Error Path)

```
MCP Client Request
    ↓
getStateResource() / getProgressResource() / getRouteResource()
    ↓
createDefaultValidator()
    ↓
validator.validateDirectory(process.cwd())
    ↓
    [If invalid] → Throw SecurityError
    ↓
catch (error)
    ↓
logSecurityEvent(error) → stderr
    ↓
Return error response to MCP Client
    ↓
MCP Client sees: "Access denied - run from project root"
```

### Skill Load Flow (with validation)

```
loadSkillFile(skillName)
    ↓
[Validate skill name format]
    ↓
    [Check separators] → ✅ No / or \
    ↓
    [Check whitelist] → ✅ Matches /^[a-zA-Z0-9_-]+$/
    ↓
[Validate HOME environment]
    ↓
    [Check defined] → ✅ Not null/undefined
    ↓
    [Check null byte] → ✅ No \0
    ↓
createDefaultValidator()
    ↓
validator.validateDirectory(homePath)
    ↓
    [If valid] → Construct skill file path
    ↓
Try each possible location
    ↓
Return skill content OR null
```

---

## Validation Matrix

### Path Validation Examples

| Input Path | Process.cwd() | Result | Reason |
|------------|---------------|--------|--------|
| `.` | `/home/user/project` | ✅ Valid | Within workspace |
| `..` | `/home/user/project` | ❌ Error | Parent directory escape |
| `/etc/passwd` | `/home/user/project` | ❌ Error | Absolute path outside workspace |
| `foo/bar` | `/home/user/project` | ✅ Valid | Relative path within workspace |
| `foo;ls` | `/home/user/project` | ❌ Error | Shell metacharacter |
| `/tmp/test` | `/tmp/test` (test mode) | ✅ Valid | Within allowed test path |

### Skill Name Validation Examples

| Skill Name | Result | Reason |
|------------|--------|--------|
| `analyze` | ✅ Valid | Alphanumeric |
| `reverse-engineer` | ✅ Valid | Alphanumeric with hyphen |
| `create_specs` | ✅ Valid | Alphanumeric with underscore |
| `../etc/passwd` | ❌ Error | Contains path separator |
| `analyze/../../hack` | ❌ Error | Contains path separator |
| `hack;rm -rf` | ❌ Error | Contains special characters |
| `skill name` | ❌ Error | Contains space |

### File Size Validation Examples

| File Size | Max Size | Result | Reason |
|-----------|----------|--------|--------|
| 1 KB | 10 MB | ✅ Valid | Under limit |
| 5 MB | 10 MB | ✅ Valid | Under limit |
| 10 MB | 10 MB | ✅ Valid | At limit |
| 15 MB | 10 MB | ❌ Error | Exceeds limit |
| 100 MB | 10 MB | ❌ Error | Exceeds limit |

### JSON Validation Examples

| JSON Content | Result | Reason |
|--------------|--------|--------|
| `{"path": "greenfield"}` | ✅ Valid | Normal object |
| `{"__proto__": {"admin": true}}` | ⚠️ Sanitized | Dangerous property removed |
| `{"constructor": {...}}` | ⚠️ Sanitized | Dangerous property removed |
| `{"prototype": {...}}` | ⚠️ Sanitized | Dangerous property removed |
| `{invalid json}` | ❌ Error | Malformed JSON |

---

## Security Properties

### Invariants (MUST always be true)

1. **Path Containment:** All validated paths MUST be within allowed base paths
2. **Size Limits:** All file reads MUST respect 10MB limit
3. **Prototype Safety:** All parsed JSON MUST have dangerous properties removed
4. **Input Sanitization:** All user inputs MUST be validated before use
5. **Error Safety:** All error messages MUST NOT leak full system paths

### Security Boundaries

```
┌──────────────────────────────────────────┐
│  MCP Client (Untrusted)                  │
└──────────────┬───────────────────────────┘
               │ MCP Protocol
               ▼
┌──────────────────────────────────────────┐
│  Security Validation Layer (NEW)         │
│  - Path validation                       │
│  - Size limits                           │
│  - Input sanitization                    │
└──────────────┬───────────────────────────┘
               │ Validated inputs only
               ▼
┌──────────────────────────────────────────┐
│  File System Operations (Trusted)        │
│  - Read files                            │
│  - Parse JSON                            │
└──────────────────────────────────────────┘
```

**Key Insight:** Security validation acts as a gate between untrusted MCP client input and trusted file system operations.

---

## Constraints

### Functional Constraints
1. Resource handlers MUST use `createDefaultValidator()`
2. All file reads MUST use `readFileSafe()` or `readJsonSafe()`
3. Skill loader MUST validate skill name before constructing paths
4. Environment variables MUST be validated before use

### Non-Functional Constraints
1. Validation overhead MUST be <100ms
2. Error messages MUST be user-friendly
3. Logging MUST be structured (JSON format)
4. Test coverage MUST be 100% for validation code

### Security Constraints (from CWE Prevention)
1. **CWE-22 Prevention:** No path traversal beyond workspace
2. **CWE-400 Prevention:** File size limits enforced
3. **CWE-502 Prevention:** Prototype pollution mitigated
4. **CWE-78 Prevention:** No shell command execution (already achieved)

---

## Usage Examples

### Example 1: Secure Resource Handler

```typescript
import { createDefaultValidator } from '../utils/security.js';
import { readJsonSafe } from '../utils/file-utils.js';
import * as path from 'path';

export async function getStateResource() {
  // Step 1: Create validator
  const validator = createDefaultValidator();

  try {
    // Step 2: Validate directory
    const directory = validator.validateDirectory(process.cwd());

    // Step 3: Construct safe file path
    const stateFile = path.join(directory, '.stackshift-state.json');

    // Step 4: Read with size limit and sanitization
    const state = await readJsonSafe(stateFile);

    // Step 5: Return resource
    return {
      contents: [{
        uri: 'stackshift://state',
        mimeType: 'application/json',
        text: JSON.stringify(state, null, 2),
      }],
    };
  } catch (error) {
    // Step 6: Log error securely
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      severity: 'WARNING',
      category: 'security',
      type: 'resource_access_denied',
      resource: 'stackshift://state',
      error: error.message,
    }));

    // Step 7: Return safe error to client
    return {
      contents: [{
        uri: 'stackshift://state',
        mimeType: 'application/json',
        text: JSON.stringify({
          error: 'Access denied',
          message: 'Resource access restricted to project workspace.',
        }, null, 2),
      }],
    };
  }
}
```

### Example 2: Secure Skill Loader

```typescript
import { createDefaultValidator } from './security.js';

export async function loadSkillFile(skillName: string): Promise<string | null> {
  // Step 1: Validate skill name format
  if (skillName.includes('/') || skillName.includes('\\') || skillName.includes('..')) {
    throw new Error(`Invalid skill name: cannot contain path separators`);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(skillName)) {
    throw new Error(`Invalid skill name: must be alphanumeric with hyphens/underscores only`);
  }

  // Step 2: Validate HOME environment
  const homePath = process.env.HOME;
  if (!homePath || homePath.includes('\0')) {
    throw new Error('Invalid HOME environment variable');
  }

  // Step 3: Validate directory
  const validator = createDefaultValidator();
  const validatedHome = validator.validateDirectory(homePath);

  // Step 4: Construct and read file
  const skillPath = path.join(
    validatedHome,
    '.claude/plugins/marketplaces/jschulte/stackshift/skills',
    skillName,
    'SKILL.md'
  );

  // Step 5: Safe file read
  const content = await readFileSafe(skillPath);
  return content;
}
```

---

## Testing Data Model

### Test Fixtures

**Valid State File:**
```json
{
  "path": "brownfield",
  "currentStep": "analyze",
  "completedSteps": [],
  "stepDetails": {}
}
```

**Malicious State File (Prototype Pollution):**
```json
{
  "path": "greenfield",
  "__proto__": {
    "admin": true,
    "compromised": true
  }
}
```

**Large State File:**
```json
{
  "path": "greenfield",
  "data": "A".repeat(15 * 1024 * 1024)
}
```

### Test Scenarios

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Normal read | Valid workspace, valid state file | ✅ State resource |
| Path traversal | `process.cwd() = '/../etc'` | ❌ Access denied |
| File too large | State file 15MB | ❌ Size limit error |
| Prototype pollution | `__proto__` in JSON | ⚠️ Property removed |
| Invalid skill name | `../etc/passwd` | ❌ Invalid skill name |
| Null byte in HOME | `HOME=/home/user\0/hack` | ❌ Invalid HOME |

---

## Migration Notes

### Before (Vulnerable)

```typescript
// Direct process.cwd() usage
const directory = process.cwd();
const stateFile = path.join(directory, '.stackshift-state.json');
const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
```

### After (Secure)

```typescript
// Validated paths and safe operations
const validator = createDefaultValidator();
const directory = validator.validateDirectory(process.cwd());
const stateFile = path.join(directory, '.stackshift-state.json');
const state = await readJsonSafe(stateFile);
```

**Changes:**
1. Added `SecurityValidator` instance creation
2. Wrapped `process.cwd()` in `validateDirectory()`
3. Replaced `JSON.parse(fs.readFile())` with `readJsonSafe()`

---

**Status:** ✅ Complete - Data model defined
**Next:** Generate contracts (if applicable) and quickstart guide
