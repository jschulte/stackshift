# Contracts: F006 Automated Spec Updates

**Feature:** Automated Spec Updates via Claude Code Hooks
**Date:** 2025-11-17
**Status:** Complete

---

## Overview

This document defines the interfaces, APIs, and contracts for the automated spec update system. All contracts are designed for shell script implementation with JSON data interchange.

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Claude Code Hook System                    │
│  (.claude/settings.json - PreToolUse["Bash"] matcher)       │
└────────────────────────────┬────────────────────────────────┘
                             │ Triggers on git push
                             ↓
┌─────────────────────────────────────────────────────────────┐
│            Hook Entry Point: validate-specs.sh               │
│        (.specify/hooks/validate-specs.sh)                    │
│                                                              │
│  Input: $CLAUDE_TOOL_INPUT (JSON)                           │
│  Output: Exit code 0 (pass) or 1 (fail)                     │
└────┬────────────────────────────────────────────────────┬───┘
     │                                                     │
     │                                                     │
     ↓                                                     ↓
┌──────────────────────┐                        ┌───────────────────┐
│  Git Analysis Module │                        │  Config Loader    │
│  (git-analyzer.sh)   │                        │  (config.sh)      │
│                      │                        │                   │
│  - Extract git diff  │                        │  - Load rules     │
│  - Parse changed files│                       │  - Validate config│
│  - Get timestamps    │                        │  - Apply defaults │
└──────┬───────────────┘                        └────────┬──────────┘
       │                                                  │
       └──────────────────┬───────────────────────────────┘
                          │
                          ↓
            ┌─────────────────────────────┐
            │   Validator Module          │
            │   (validator.sh)            │
            │                             │
            │   - Map files to specs      │
            │   - Categorize changes      │
            │   - Apply validation rules  │
            │   - Generate results        │
            └──────────────┬──────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ↓                   ↓
    ┌────────────────────┐  ┌─────────────────────┐
    │  Spec Mapper       │  │  Change Categorizer │
    │  (mapper.sh)       │  │  (categorizer.sh)   │
    │                    │  │                     │
    │  - Heuristic match │  │  - Analyze diffs    │
    │  - Config lookup   │  │  - Detect exports   │
    │  - Spec discovery  │  │  - Apply rules      │
    └────────────────────┘  └─────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────┐
    │   Auto-Fix Module (optional)   │
    │   (auto-fix.sh)                │
    │                                │
    │   - Invoke Claude AI           │
    │   - Generate spec updates      │
    │   - Create commits             │
    └────────────────────────────────┘
```

---

## Core Interfaces

### 1. Hook Entry Point

**File:** `.specify/hooks/validate-specs.sh`
**Purpose:** Main entry point invoked by Claude Code hook

#### Interface

```bash
#!/usr/bin/env bash
#
# Validates that code changes have corresponding spec updates
#
# INPUTS:
#   $1 - CLAUDE_TOOL_INPUT (JSON string)
#
# ENVIRONMENT VARIABLES:
#   CI - Set to 'true' in CI environments
#   CLAUDE_HEADLESS - Set to 'true' in headless mode
#   SPEC_SYNC_MODE - Override mode: 'strict'|'lenient'|'off'
#   SKIP_SPEC_SYNC - Set to '1' to skip validation (emergency override)
#
# OUTPUTS:
#   stdout - Progress messages and results
#   stderr - Error messages
#   Exit code: 0 (validation passed), 1 (validation failed)
#
# EXAMPLE USAGE:
#   ./.specify/hooks/validate-specs.sh "$CLAUDE_TOOL_INPUT"
```

#### Input Contract

```json
{
  "command": "git push origin main",
  "description": "Push changes to remote"
}
```

#### Output Contract

**Exit Code 0 (Success):**
```
✅ Spec validation passed
All 3 changed files have up-to-date specs.
```

**Exit Code 1 (Failure):**
```
❌ Spec validation failed

📁 Changed files without spec updates:
  • src/features/auth/login.ts → specs/001-authentication/spec.md
    Last spec update: 2025-11-15 14:20:00
    Last code update: 2025-11-17 10:30:00

💡 To fix:
  1. Update specs/001-authentication/spec.md
  2. Commit the changes
  3. Push again

🤖 Or run: npm run update-specs

📚 Learn more: https://docs.stackshift.dev/spec-sync
```

#### Error Handling

| Error | Exit Code | Message |
|-------|-----------|---------|
| Invalid input | 2 | "Error: Invalid hook input JSON" |
| Git error | 3 | "Error: Git command failed" |
| Config error | 4 | "Error: Invalid configuration file" |
| Timeout | 5 | "Error: Validation timeout exceeded" |

---

### 2. Git Analyzer Module

**File:** `.specify/hooks/modules/git-analyzer.sh`
**Purpose:** Extract git context and changed files

#### Interface

```bash
#!/usr/bin/env bash
#
# Analyzes git repository and extracts changed files
#
# FUNCTIONS:
#   git_get_context() - Extract GitContext JSON
#   git_get_changed_files() - Get list of changed files with metadata
#   git_get_file_diff(file) - Get diff for specific file
#   git_get_last_commit_time(file) - Get last commit timestamp for file
#
# OUTPUTS:
#   JSON to stdout
```

#### Function: git_get_context()

**Signature:**
```bash
git_get_context() -> GitContext (JSON)
```

**Output Contract:**
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

**Error Handling:**
- Returns empty JSON `{}` on error
- Logs error to stderr

#### Function: git_get_changed_files()

**Signature:**
```bash
git_get_changed_files() -> ChangedFile[] (JSON)
```

**Output Contract:**
```json
[
  {
    "path": "src/features/auth/login.ts",
    "absolutePath": "/home/user/stackshift/src/features/auth/login.ts",
    "changeType": "modified",
    "stats": {
      "additions": 6,
      "deletions": 0
    }
  }
]
```

**Implementation:**
```bash
git_get_changed_files() {
  local base_commit=$(git merge-base HEAD origin/main)
  local files_json="[]"

  while IFS= read -r line; do
    # Parse: M\tsrc/file.ts
    local status="${line:0:1}"
    local file="${line:2}"

    local change_type
    case "$status" in
      A) change_type="added" ;;
      M) change_type="modified" ;;
      D) change_type="deleted" ;;
      R) change_type="renamed" ;;
    esac

    # Get stats
    local stats=$(git diff --numstat "$base_commit" HEAD -- "$file")
    local additions=$(echo "$stats" | awk '{print $1}')
    local deletions=$(echo "$stats" | awk '{print $2}')

    # Build JSON
    local file_json=$(jq -n \
      --arg path "$file" \
      --arg absPath "$(pwd)/$file" \
      --arg changeType "$change_type" \
      --arg additions "$additions" \
      --arg deletions "$deletions" \
      '{
        path: $path,
        absolutePath: $absPath,
        changeType: $changeType,
        stats: {
          additions: ($additions | tonumber),
          deletions: ($deletions | tonumber)
        }
      }')

    files_json=$(echo "$files_json" | jq --argjson file "$file_json" '. + [$file]')
  done < <(git diff --name-status "$base_commit" HEAD)

  echo "$files_json"
}
```

---

### 3. Config Loader Module

**File:** `.specify/hooks/modules/config.sh`
**Purpose:** Load and validate configuration

#### Interface

```bash
#!/usr/bin/env bash
#
# Loads and validates sync configuration
#
# FUNCTIONS:
#   config_load() - Load SyncConfiguration from file
#   config_get_mode() - Get current validation mode
#   config_get_rules() - Get validation rules
#   config_should_ignore(file) - Check if file should be ignored
#
# CONFIGURATION FILES (priority order):
#   1. .specify/config/sync-rules.local.json (gitignored, local overrides)
#   2. .specify/config/sync-rules.json (version controlled)
#   3. Built-in defaults
```

#### Function: config_load()

**Signature:**
```bash
config_load() -> SyncConfiguration (JSON)
```

**Output Contract:**
```json
{
  "mode": "strict",
  "autoFix": true,
  "requireApproval": true,
  "fileMappings": {},
  "ignorePatterns": ["**/*.test.ts"],
  "rules": [],
  "exemptions": {
    "branches": [],
    "users": [],
    "emergencyOverride": true
  },
  "timeout": 30000,
  "parallel": true,
  "maxParallel": 4
}
```

**Implementation:**
```bash
config_load() {
  local config_file=".specify/config/sync-rules.json"
  local local_config=".specify/config/sync-rules.local.json"
  local default_config='{
    "mode": "strict",
    "autoFix": false,
    "requireApproval": true,
    "ignorePatterns": ["**/*.test.ts", "**/*.spec.ts"],
    "rules": []
  }'

  # Start with defaults
  local config="$default_config"

  # Merge project config
  if [ -f "$config_file" ]; then
    config=$(echo "$config" | jq -s '.[0] * .[1]' - "$config_file")
  fi

  # Merge local config
  if [ -f "$local_config" ]; then
    config=$(echo "$config" | jq -s '.[0] * .[1]' - "$local_config")
  fi

  # Apply environment variable overrides
  if [ -n "$SPEC_SYNC_MODE" ]; then
    config=$(echo "$config" | jq --arg mode "$SPEC_SYNC_MODE" '.mode = $mode')
  fi

  echo "$config"
}
```

---

### 4. Validator Module

**File:** `.specify/hooks/modules/validator.sh`
**Purpose:** Core validation logic

#### Interface

```bash
#!/usr/bin/env bash
#
# Validates changed files against specs
#
# FUNCTIONS:
#   validator_run(changed_files_json, config_json) - Run full validation
#   validator_check_file(file_path, config_json) - Validate single file
#
# OUTPUTS:
#   ValidationResult[] (JSON)
```

#### Function: validator_run()

**Signature:**
```bash
validator_run(changed_files_json, config_json) -> ValidationResult[] (JSON)
```

**Input:**
```json
{
  "changedFiles": [ ... ],
  "config": { ... }
}
```

**Output Contract:**
```json
[
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
        "suggestedUpdate": "Update login function signature",
        "autoFixAvailable": true
      }
    ],
    "failureReason": "Spec is outdated",
    "requiredAction": "Update specs/001-authentication/spec.md",
    "validationTime": 45
  }
]
```

---

### 5. Spec Mapper Module

**File:** `.specify/hooks/modules/mapper.sh`
**Purpose:** Map code files to spec files

#### Interface

```bash
#!/usr/bin/env bash
#
# Maps code files to specification files
#
# FUNCTIONS:
#   mapper_find_specs(file_path, config_json) - Find related specs
#   mapper_check_explicit(file_path, config_json) - Check explicit mappings
#   mapper_heuristic_match(file_path) - Use heuristic matching
#
# OUTPUTS:
#   SpecMapping[] (JSON)
```

#### Function: mapper_find_specs()

**Signature:**
```bash
mapper_find_specs(file_path, config_json) -> SpecMapping[] (JSON)
```

**Algorithm:**
```bash
1. Check explicit mappings in config.fileMappings
2. If found, return with confidence=1.0, source="explicit"
3. Otherwise, use heuristic matching:
   a. Extract feature name from path
   b. Search for specs containing feature name
   c. Return matches with confidence=0.7-0.9, source="heuristic"
4. If no matches, return empty array
```

**Output Contract:**
```json
[
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
]
```

---

### 6. Change Categorizer Module

**File:** `.specify/hooks/modules/categorizer.sh`
**Purpose:** Categorize code changes

#### Interface

```bash
#!/usr/bin/env bash
#
# Categorizes code changes to determine spec update requirements
#
# FUNCTIONS:
#   categorizer_analyze(file_path, diff, config_json) - Categorize change
#   categorizer_detect_exports(diff) - Detect export changes
#   categorizer_detect_signatures(diff) - Detect signature changes
#
# OUTPUTS:
#   ChangeCategory (JSON)
```

#### Function: categorizer_analyze()

**Signature:**
```bash
categorizer_analyze(file_path, diff, config_json) -> ChangeCategory (JSON)
```

**Decision Tree:**
```
Input: file_path, diff
  │
  ├─ Is test file? (*.test.*, *.spec.*)
  │  └─ Yes → { type: "test_only", requiresSpecUpdate: false }
  │
  ├─ Is documentation? (*.md, not spec.md)
  │  └─ Yes → { type: "documentation", requiresSpecUpdate: false }
  │
  ├─ Has export changes? (diff contains ^[+-]\s*export)
  │  └─ Yes → { type: "api_change", requiresSpecUpdate: true }
  │
  ├─ Is new file in features/? (changeType="added", path contains "/features/")
  │  └─ Yes → { type: "feature_addition", requiresSpecUpdate: true }
  │
  ├─ Matches custom rule? (check config.rules)
  │  └─ Yes → Use rule's requiresSpecUpdate
  │
  └─ Default → { type: "internal_refactor", requiresSpecUpdate: false }
```

**Output Contract:**
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

---

### 7. Auto-Fix Module

**File:** `.specify/hooks/modules/auto-fix.sh`
**Purpose:** Generate spec updates using AI

#### Interface

```bash
#!/usr/bin/env bash
#
# Generates spec updates using Claude AI
#
# FUNCTIONS:
#   autofix_generate_update(spec_path, code_diff) - Generate spec update
#   autofix_show_diff(original, updated) - Show diff to user
#   autofix_prompt_approval() - Prompt user for approval
#   autofix_apply_update(spec_path, updated_content) - Apply update
#
# OUTPUTS:
#   SpecUpdate (JSON)
```

#### Function: autofix_generate_update()

**Signature:**
```bash
autofix_generate_update(spec_path, code_diff) -> SpecUpdate (JSON)
```

**Implementation:**
```bash
autofix_generate_update() {
  local spec_path="$1"
  local code_diff="$2"

  # Read current spec
  local current_spec=$(cat "$spec_path")

  # Build prompt
  local prompt="You are updating a GitHub Spec Kit specification.

CURRENT SPEC:
$current_spec

CODE CHANGES:
$code_diff

TASK: Update the spec to reflect the code changes. Follow these rules:
- Preserve existing structure and frontmatter
- Update only affected sections
- Maintain Spec Kit format
- Add new requirements if new features added
- Update acceptance criteria if behavior changed

OUTPUT: The complete updated spec.md content"

  # Invoke Claude in headless mode
  local updated_spec=$(claude -p "$prompt" --headless 2>/dev/null)

  # Generate diff
  local diff=$(diff -u <(echo "$current_spec") <(echo "$updated_spec"))

  # Build result JSON
  local result=$(jq -n \
    --arg specPath "$spec_path" \
    --arg original "$current_spec" \
    --arg updated "$updated_spec" \
    --arg diff "$diff" \
    '{
      specPath: $specPath,
      originalContent: $original,
      updatedContent: $updated,
      diff: $diff,
      generatedBy: "ai",
      generatedAt: (now | todate),
      approved: false
    }')

  echo "$result"
}
```

**Output Contract:**
```json
{
  "specPath": "specs/001-authentication/spec.md",
  "originalContent": "...",
  "updatedContent": "...",
  "diff": "@@ -45,6 +45,8 @@\n...",
  "changeDescription": "Added validation documentation",
  "affectedSections": ["API Reference"],
  "generatedBy": "ai",
  "generatedAt": "2025-11-17T10:35:00Z",
  "confidence": 0.92,
  "approved": false
}
```

---

## Claude Code Hook Integration

### Hook Configuration

**File:** `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.command' | grep -q '^git push'; then ./.specify/hooks/validate-specs.sh \"$CLAUDE_TOOL_INPUT\"; fi",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

### Hook Execution Flow

```
1. User runs: git push origin main
   ↓
2. Claude Code intercepts Bash tool call
   ↓
3. PreToolUse hook triggered
   ↓
4. Check if command is 'git push'
   ↓
5. If yes, execute validate-specs.sh
   ↓
6. validate-specs.sh returns exit code
   ↓
7. If exit code = 0, allow git push
8. If exit code ≠ 0, block git push and show error
```

---

## Environment Variables

### Input Variables

| Variable | Source | Purpose | Example |
|----------|--------|---------|---------|
| `CLAUDE_TOOL_INPUT` | Claude Code | Hook input (JSON) | `{"command":"git push..."}` |
| `CLAUDE_HEADLESS` | Claude Code | Headless mode flag | `"true"` |
| `CI` | CI System | CI environment flag | `"true"` |

### Configuration Variables

| Variable | Purpose | Default | Values |
|----------|---------|---------|--------|
| `SPEC_SYNC_MODE` | Override validation mode | From config | `strict`, `lenient`, `off` |
| `SPEC_SYNC_AUTO_FIX` | Enable auto-fix | From config | `true`, `false` |
| `SKIP_SPEC_SYNC` | Emergency bypass | `0` | `1` to skip |

### Output Variables

Scripts may set these for debugging:

| Variable | Purpose | Example |
|----------|---------|---------|
| `SPEC_SYNC_DEBUG` | Enable debug logging | `1` |
| `SPEC_SYNC_VERBOSE` | Verbose output | `1` |

---

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Validation passed | Allow git push |
| 1 | Validation failed | Block git push |
| 2 | Invalid input | Block git push, show error |
| 3 | Git error | Block git push, show error |
| 4 | Config error | Block git push, show error |
| 5 | Timeout | Allow git push (fail open) |

---

## Testing Contracts

### Unit Test Interface

```bash
# Test a single module
test_git_analyzer() {
  # Setup
  local test_repo=$(mktemp -d)
  cd "$test_repo"
  git init
  echo "test" > file.ts
  git add file.ts
  git commit -m "Initial commit"

  # Execute
  source ../modules/git-analyzer.sh
  local context=$(git_get_context)

  # Assert
  assert_equals "$(echo "$context" | jq -r '.currentBranch')" "main"

  # Cleanup
  rm -rf "$test_repo"
}
```

### Integration Test Interface

```bash
# Test full validation flow
test_validation_flow() {
  # Setup test repository
  setup_test_repo_with_spec

  # Make code change without updating spec
  echo "export function newFunc() {}" >> src/auth.ts
  git add src/auth.ts
  git commit -m "Add new function"

  # Execute validation
  local result=$(./.specify/hooks/validate-specs.sh "$mock_input")
  local exit_code=$?

  # Assert
  assert_equals "$exit_code" 1
  assert_contains "$result" "spec validation failed"
}
```

---

## Performance Contracts

### Latency Targets

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Config load | <50ms | 200ms |
| Git diff extraction | <100ms | 500ms |
| File mapping | <50ms per file | 200ms |
| Categorization | <20ms per file | 100ms |
| Full validation (10 files) | <1s | 3s |
| AI spec generation | <3s | 10s |

### Resource Limits

| Resource | Limit | Reason |
|----------|-------|--------|
| Memory | <100MB | Shell scripts are lightweight |
| Disk (temp files) | <10MB | Clean up after validation |
| Parallel processes | 4 | Balance speed vs CPU |
| Timeout | 30s | Don't block developers |

---

## Security Contracts

### Input Validation

All scripts must validate:
- File paths (no `..`, no absolute paths outside repo)
- JSON input (valid JSON, expected schema)
- Git refs (valid commit SHAs, branches)

### Path Safety

```bash
# Safe path validation
validate_path() {
  local path="$1"
  local repo_root=$(git rev-parse --show-toplevel)

  # Resolve to absolute path
  local abs_path=$(realpath -s "$path" 2>/dev/null)

  # Check it's within repo
  if [[ "$abs_path" != "$repo_root"* ]]; then
    echo "Error: Path outside repository" >&2
    return 1
  fi

  # Check for traversal
  if [[ "$path" == *".."* ]]; then
    echo "Error: Path traversal detected" >&2
    return 1
  fi

  return 0
}
```

### Command Injection Prevention

```bash
# Never use eval or unquoted variables in commands
# BAD:
eval "git diff $user_input"

# GOOD:
git diff "$user_input"
```

---

## Summary

This contract specification provides:

✅ **Complete interface definitions** for all modules
✅ **Clear input/output contracts** (JSON schemas)
✅ **Hook integration patterns** (Claude Code)
✅ **Environment variable contracts**
✅ **Exit code semantics**
✅ **Performance targets**
✅ **Security requirements**

All contracts are designed for:
- Shell script implementation (bash)
- JSON data interchange (jq processing)
- Cross-platform compatibility (POSIX)
- Claude Code hook integration

---

**Status:** ✅ Complete
**Last Updated:** 2025-11-17
