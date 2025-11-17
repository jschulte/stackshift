# Data Model: F006 Automated Spec Updates

**Feature:** Automated Spec Updates via Claude Code Hooks
**Date:** 2025-11-17
**Status:** Complete

---

## Overview

This document defines the data structures, entities, validation rules, and relationships for the automated spec update system. All entities are designed for file-based storage (JSON/YAML) and shell script processing.

---

## Core Entities

### 1. ValidationContext

Represents the complete context for a spec validation run.

```typescript
interface ValidationContext {
  // Execution metadata
  timestamp: string;              // ISO 8601 timestamp
  mode: 'interactive' | 'headless' | 'ci';
  sessionId: string;              // Unique ID for this validation run

  // Git context
  git: GitContext;

  // Changed files
  changedFiles: ChangedFile[];

  // Validation results
  results: ValidationResult[];

  // Configuration
  config: SyncConfiguration;
}
```

**Example:**
```json
{
  "timestamp": "2025-11-17T10:30:00Z",
  "mode": "interactive",
  "sessionId": "val_abc123",
  "git": { ... },
  "changedFiles": [ ... ],
  "results": [ ... ],
  "config": { ... }
}
```

**Storage:** Temporary file `/tmp/spec-sync-${sessionId}.json` (deleted after validation)

---

### 2. GitContext

Git repository state and comparison information.

```typescript
interface GitContext {
  // Repository info
  repoRoot: string;               // Absolute path to repo root
  currentBranch: string;          // e.g., "feature/auth"
  remoteBranch: string;           // e.g., "origin/main"

  // Commit range
  baseCommit: string;             // SHA of base commit
  headCommit: string;             // SHA of head commit
  commitCount: number;            // Number of commits in range

  // Comparison
  diffSummary: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
}
```

**Example:**
```json
{
  "repoRoot": "/home/user/stackshift",
  "currentBranch": "feature/auth",
  "remoteBranch": "origin/main",
  "baseCommit": "a1b2c3d",
  "headCommit": "e4f5g6h",
  "commitCount": 3,
  "diffSummary": {
    "filesChanged": 5,
    "insertions": 120,
    "deletions": 30
  }
}
```

**Derivation:**
```bash
# Extract git context
REPO_ROOT=$(git rev-parse --show-toplevel)
CURRENT_BRANCH=$(git branch --show-current)
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
BASE_COMMIT=$(git merge-base HEAD origin/main)
HEAD_COMMIT=$(git rev-parse HEAD)
```

---

### 3. ChangedFile

Represents a single file that changed in the commit range.

```typescript
interface ChangedFile {
  // File identification
  path: string;                   // Relative to repo root
  absolutePath: string;           // Absolute filesystem path

  // Change metadata
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;               // For renamed files

  // Diff analysis
  diff: string;                   // Full diff for this file
  stats: {
    additions: number;
    deletions: number;
  };

  // Change categorization
  category: ChangeCategory;

  // Spec mapping
  relatedSpecs: SpecMapping[];
}
```

**Example:**
```json
{
  "path": "src/features/auth/login.ts",
  "absolutePath": "/home/user/stackshift/src/features/auth/login.ts",
  "changeType": "modified",
  "diff": "@@ -10,6 +10,12 @@\n export function login(user, pass) {\n+  // New validation logic\n+  if (!user || !pass) {\n+    throw new Error('Invalid credentials');\n+  }\n   return authenticate(user, pass);\n }",
  "stats": {
    "additions": 6,
    "deletions": 0
  },
  "category": {
    "type": "api_change",
    "requiresSpecUpdate": true,
    "confidence": "high"
  },
  "relatedSpecs": [
    {
      "specPath": "specs/001-authentication/spec.md",
      "mappingSource": "heuristic",
      "confidence": 0.95
    }
  ]
}
```

**Validation Rules:**
- `path` must be relative and not contain `..`
- `changeType` must be one of the four allowed values
- If `changeType === 'renamed'`, `oldPath` must be present
- `relatedSpecs` can be empty array (no spec found)

---

### 4. ChangeCategory

Classification of code changes to determine spec update requirements.

```typescript
interface ChangeCategory {
  // Primary classification
  type: 'api_change' | 'feature_addition' | 'internal_refactor' |
        'test_only' | 'config_change' | 'documentation' | 'unknown';

  // Spec update requirement
  requiresSpecUpdate: boolean;

  // Confidence level
  confidence: 'high' | 'medium' | 'low';

  // Supporting evidence
  evidence: {
    exportChanges: boolean;         // Exported symbols changed
    signatureChanges: boolean;      // Function signatures changed
    newFiles: boolean;              // New files added
    testFilesOnly: boolean;         // Only test files changed
    commentsOnly: boolean;          // Only comments changed
  };

  // Matched rule (if any)
  matchedRule?: string;             // Rule name from config
}
```

**Example:**
```json
{
  "type": "api_change",
  "requiresSpecUpdate": true,
  "confidence": "high",
  "evidence": {
    "exportChanges": true,
    "signatureChanges": true,
    "newFiles": false,
    "testFilesOnly": false,
    "commentsOnly": false
  },
  "matchedRule": "API changes require spec updates"
}
```

**Categorization Logic:**
```javascript
function categorizeChange(file, diff) {
  // Test files only
  if (file.path.includes('.test.') || file.path.includes('.spec.')) {
    return { type: 'test_only', requiresSpecUpdate: false, confidence: 'high' };
  }

  // Documentation only
  if (file.path.endsWith('.md') && !file.path.includes('spec.md')) {
    return { type: 'documentation', requiresSpecUpdate: false, confidence: 'high' };
  }

  // Check for export changes
  const exportRegex = /^[+-]\s*export\s+(function|class|interface|type|const)/m;
  if (exportRegex.test(diff)) {
    return { type: 'api_change', requiresSpecUpdate: true, confidence: 'high' };
  }

  // Check for new files in features/
  if (file.changeType === 'added' && file.path.includes('/features/')) {
    return { type: 'feature_addition', requiresSpecUpdate: true, confidence: 'high' };
  }

  // Default to internal refactor
  return { type: 'internal_refactor', requiresSpecUpdate: false, confidence: 'medium' };
}
```

---

### 5. SpecMapping

Maps a code file to one or more specification files.

```typescript
interface SpecMapping {
  // Spec file identification
  specPath: string;               // Relative to repo root
  absoluteSpecPath: string;       // Absolute filesystem path

  // Mapping metadata
  mappingSource: 'explicit' | 'heuristic' | 'ai_suggested';
  confidence: number;             // 0.0 to 1.0

  // Spec metadata (from spec file)
  specId?: string;                // e.g., "F001"
  specTitle?: string;             // e.g., "Authentication"

  // Validation status
  specLastModified: string;       // ISO 8601 timestamp
  codeLastModified: string;       // ISO 8601 timestamp
  isOutdated: boolean;            // true if code newer than spec
}
```

**Example:**
```json
{
  "specPath": "specs/001-authentication/spec.md",
  "absoluteSpecPath": "/home/user/stackshift/specs/001-authentication/spec.md",
  "mappingSource": "explicit",
  "confidence": 1.0,
  "specId": "001",
  "specTitle": "User Authentication",
  "specLastModified": "2025-11-15T14:20:00Z",
  "codeLastModified": "2025-11-17T10:30:00Z",
  "isOutdated": true
}
```

**Mapping Sources:**

1. **Explicit** (confidence: 1.0)
   - Defined in `.specify/config/file-to-spec-map.json`
   - Manual developer annotation

2. **Heuristic** (confidence: 0.7-0.9)
   - Directory name matching
   - Import analysis
   - File naming convention

3. **AI Suggested** (confidence: 0.5-0.8)
   - Generated by Claude based on code analysis
   - Requires manual verification

**Validation Rules:**
- `specPath` must exist as a file
- `confidence` must be between 0.0 and 1.0
- If `mappingSource === 'explicit'`, `confidence` should be 1.0

---

### 6. ValidationResult

Result of validating one code file against its related specs.

```typescript
interface ValidationResult {
  // File being validated
  filePath: string;

  // Overall status
  status: 'pass' | 'fail' | 'warning' | 'skipped';

  // Spec-specific results
  specResults: SpecValidationResult[];

  // Failure details (if status === 'fail')
  failureReason?: string;
  requiredAction?: string;

  // Metrics
  validationTime: number;         // milliseconds
}
```

**Example:**
```json
{
  "filePath": "src/features/auth/login.ts",
  "status": "fail",
  "specResults": [
    {
      "specPath": "specs/001-authentication/spec.md",
      "status": "outdated",
      "lastSpecUpdate": "2025-11-15T14:20:00Z",
      "lastCodeUpdate": "2025-11-17T10:30:00Z",
      "affectedSections": ["User Stories", "API Reference"],
      "suggestedUpdate": "Update login function signature in API Reference"
    }
  ],
  "failureReason": "Spec is outdated (code modified after spec)",
  "requiredAction": "Update specs/001-authentication/spec.md",
  "validationTime": 45
}
```

---

### 7. SpecValidationResult

Validation result for a single spec file.

```typescript
interface SpecValidationResult {
  // Spec identification
  specPath: string;

  // Validation outcome
  status: 'up_to_date' | 'outdated' | 'missing' | 'invalid';

  // Timestamp comparison
  lastSpecUpdate: string;         // ISO 8601
  lastCodeUpdate: string;         // ISO 8601

  // Impact analysis
  affectedSections: string[];     // Which spec sections need updates

  // Suggested fix
  suggestedUpdate?: string;       // Human-readable suggestion
  autoFixAvailable: boolean;      // Can AI auto-generate fix?
}
```

**Status Definitions:**

- **up_to_date**: Spec was modified after the code (no update needed)
- **outdated**: Code was modified after the spec (update required)
- **missing**: Spec file doesn't exist
- **invalid**: Spec file exists but is malformed

**Example:**
```json
{
  "specPath": "specs/001-authentication/spec.md",
  "status": "outdated",
  "lastSpecUpdate": "2025-11-15T14:20:00Z",
  "lastCodeUpdate": "2025-11-17T10:30:00Z",
  "affectedSections": [
    "## User Stories",
    "## API Reference"
  ],
  "suggestedUpdate": "Update the login function to document new validation parameter",
  "autoFixAvailable": true
}
```

---

### 8. SyncConfiguration

Configuration for spec synchronization rules and behavior.

```typescript
interface SyncConfiguration {
  // Global settings
  mode: 'strict' | 'lenient' | 'off';
  autoFix: boolean;               // Attempt automatic spec updates
  requireApproval: boolean;       // Require user approval for auto-fixes

  // File mapping
  fileMappings: Record<string, string[]>;  // Pattern -> spec paths
  ignorePatterns: string[];                 // Glob patterns to ignore

  // Validation rules
  rules: ValidationRule[];

  // Exemptions
  exemptions: {
    branches: string[];           // Branches exempt from validation
    users: string[];              // Git users exempt from validation
    emergencyOverride: boolean;   // Allow SKIP_SPEC_SYNC=1 env var
  };

  // Performance
  timeout: number;                // Max validation time (ms)
  parallel: boolean;              // Process files in parallel
  maxParallel: number;            // Max concurrent validations

  // AI settings
  ai: {
    enabled: boolean;
    model: string;                // e.g., "claude-sonnet-4-5"
    maxTokens: number;
    temperature: number;
  };
}
```

**Example:**
```json
{
  "mode": "strict",
  "autoFix": true,
  "requireApproval": true,
  "fileMappings": {
    "src/features/auth/**/*.ts": ["specs/001-authentication/spec.md"],
    "src/utils/security.ts": ["specs/001-authentication/spec.md", "specs/005-security/spec.md"]
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/__tests__/**"
  ],
  "rules": [ ... ],
  "exemptions": {
    "branches": ["main", "production"],
    "users": ["ci-bot@example.com"],
    "emergencyOverride": true
  },
  "timeout": 30000,
  "parallel": true,
  "maxParallel": 4,
  "ai": {
    "enabled": true,
    "model": "claude-sonnet-4-5",
    "maxTokens": 4096,
    "temperature": 0.0
  }
}
```

**Storage:** `.specify/config/sync-rules.json` (version controlled)

**Validation Rules:**
- `mode` must be 'strict', 'lenient', or 'off'
- `timeout` must be positive integer ≤ 60000 (1 minute)
- `maxParallel` must be between 1 and 16
- All file patterns must be valid glob syntax

---

### 9. ValidationRule

Individual rule for determining when spec updates are required.

```typescript
interface ValidationRule {
  // Rule identification
  name: string;                   // Human-readable name
  id: string;                     // Unique identifier

  // Match conditions
  filePattern: string;            // Glob pattern (e.g., "src/**/*.ts")
  changePattern?: string;         // Regex to match in diff
  changeType?: 'added' | 'modified' | 'deleted';

  // Requirements
  requiresSpecUpdate: boolean;
  specSections?: string[];        // Required spec sections

  // Rule metadata
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  priority: number;               // Higher = evaluated first
}
```

**Example:**
```json
{
  "name": "API changes require spec updates",
  "id": "api_exports",
  "filePattern": "src/**/*.ts",
  "changePattern": "^[+-]\\s*export\\s+(function|class|interface|type)",
  "requiresSpecUpdate": true,
  "specSections": ["API Reference", "User Stories"],
  "severity": "error",
  "enabled": true,
  "priority": 100
}
```

**Rule Evaluation Order:**
1. Sort rules by priority (descending)
2. For each rule:
   - Check if file matches `filePattern`
   - If `changeType` specified, check if it matches
   - If `changePattern` specified, test against diff
   - If all conditions match, apply rule
3. First matching rule wins (short-circuit)

---

### 10. SpecUpdate

Generated update to be applied to a specification file.

```typescript
interface SpecUpdate {
  // Target spec
  specPath: string;

  // Update content
  originalContent: string;        // Current spec content
  updatedContent: string;         // Proposed new content
  diff: string;                   // Unified diff

  // Update metadata
  changeDescription: string;      // Summary of changes
  affectedSections: string[];     // Spec sections modified

  // Generation metadata
  generatedBy: 'ai' | 'manual';
  generatedAt: string;            // ISO 8601
  confidence: number;             // 0.0 to 1.0 (AI confidence)

  // Approval tracking
  approved: boolean;
  reviewedBy?: string;            // Git user
  reviewedAt?: string;            // ISO 8601
}
```

**Example:**
```json
{
  "specPath": "specs/001-authentication/spec.md",
  "originalContent": "...",
  "updatedContent": "...",
  "diff": "@@ -45,6 +45,8 @@\n ## API Reference\n \n ### login(username, password)\n+\n+Validates credentials before authentication.\n+\n Authenticates a user...",
  "changeDescription": "Added validation documentation for login function",
  "affectedSections": ["API Reference"],
  "generatedBy": "ai",
  "generatedAt": "2025-11-17T10:35:00Z",
  "confidence": 0.92,
  "approved": false
}
```

**Workflow:**
1. Detect outdated spec
2. Generate `SpecUpdate` using AI
3. Show diff to user
4. Prompt for approval
5. If approved:
   - Set `approved = true`
   - Set `reviewedBy` and `reviewedAt`
   - Apply update to file
   - Create git commit

---

## Entity Relationships

```
ValidationContext
├─── git: GitContext
├─── changedFiles: ChangedFile[]
│    ├─── category: ChangeCategory
│    └─── relatedSpecs: SpecMapping[]
├─── results: ValidationResult[]
│    └─── specResults: SpecValidationResult[]
└─── config: SyncConfiguration
     └─── rules: ValidationRule[]

SpecUpdate
└─── specPath → SpecMapping.specPath
```

---

## File Persistence

### Temporary Files (Deleted After Validation)

| File | Content | Purpose |
|------|---------|---------|
| `/tmp/spec-sync-${sessionId}.json` | ValidationContext | Full validation state |
| `/tmp/spec-sync-${commitSha}.diff` | Git diff output | Cached diff for reuse |
| `/tmp/spec-sync-index.json` | Spec file paths | Spec file index cache |

### Permanent Files (Version Controlled)

| File | Content | Purpose |
|------|---------|---------|
| `.specify/config/sync-rules.json` | SyncConfiguration | Project configuration |
| `.specify/config/file-to-spec-map.json` | File mappings | Explicit spec mappings |
| `.specify/hooks/validate-specs.sh` | Shell script | Hook entry point |

### Generated Files (May Be Committed)

| File | Content | Purpose |
|------|---------|---------|
| `.specify/hooks/last-validation.json` | ValidationContext | Last validation result (for debugging) |

---

## Validation Rules

### File Path Validation

All file paths must:
- Be relative to repository root (no leading `/`)
- Not contain `..` (path traversal prevention)
- Use forward slashes `/` (even on Windows)
- Not exceed 4096 characters

### Git Object Validation

- Commit SHAs must be 40 hex characters (or 7+ for short SHAs)
- Branch names must match git ref format
- Timestamps must be valid ISO 8601

### Configuration Validation

- All glob patterns must compile (test with minimatch)
- All regex patterns must compile (test with RegExp constructor)
- Timeouts must be positive integers ≤ 60000ms
- Confidence values must be 0.0 ≤ x ≤ 1.0

---

## Data Flow

```
1. Git Push Initiated
   ↓
2. Hook Triggered
   ↓
3. Build ValidationContext
   ├─ Extract GitContext
   ├─ Load SyncConfiguration
   └─ Get changed files (git diff)
   ↓
4. For Each ChangedFile:
   ├─ Categorize changes
   ├─ Find related specs (SpecMapping)
   └─ Check if spec outdated
   ↓
5. Generate ValidationResult
   ↓
6. If Failures && AutoFix:
   ├─ Generate SpecUpdate (AI)
   ├─ Show diff
   ├─ Prompt for approval
   └─ Apply if approved
   ↓
7. Exit with status code
   ├─ 0 = Pass (continue push)
   └─ 1 = Fail (block push)
```

---

## State Transitions

### ValidationResult Status

```
[Initial] → [Analyzing]
          ↓
      [Analyzed]
          ↓
    ┌─────┴─────┐
    ↓           ↓
[Pass]      [Fail]
    ↓           ↓
[Complete]  [AutoFixing]
                ↓
           [Approval Needed]
                ↓
            ┌───┴───┐
            ↓       ↓
        [Applied] [Rejected]
            ↓       ↓
        [Complete] [Fail]
```

### SpecUpdate Lifecycle

```
[Generated] → [Showing Diff] → [Awaiting Approval]
                                     ↓
                                ┌────┴────┐
                                ↓         ↓
                            [Approved] [Rejected]
                                ↓         ↓
                            [Applied]  [Discarded]
```

---

## JSON Schemas

### SyncConfiguration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["mode", "rules"],
  "properties": {
    "mode": {
      "type": "string",
      "enum": ["strict", "lenient", "off"]
    },
    "autoFix": {
      "type": "boolean",
      "default": false
    },
    "rules": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ValidationRule"
      }
    }
  },
  "definitions": {
    "ValidationRule": {
      "type": "object",
      "required": ["name", "id", "filePattern", "requiresSpecUpdate"],
      "properties": {
        "name": { "type": "string" },
        "id": { "type": "string" },
        "filePattern": { "type": "string" },
        "changePattern": { "type": "string" },
        "requiresSpecUpdate": { "type": "boolean" },
        "severity": {
          "type": "string",
          "enum": ["error", "warning", "info"]
        }
      }
    }
  }
}
```

---

## Summary

This data model provides:

✅ **Complete entity definitions** for all system components
✅ **Clear relationships** between entities
✅ **Validation rules** for data integrity
✅ **File storage patterns** for persistence
✅ **State transition models** for workflows
✅ **JSON schemas** for configuration validation

All entities are designed for:
- Shell script processing (simple JSON structure)
- File-based storage (no database required)
- Git integration (version controlled configuration)
- Cross-platform compatibility (POSIX paths)

---

**Status:** ✅ Complete
**Last Updated:** 2025-11-17
