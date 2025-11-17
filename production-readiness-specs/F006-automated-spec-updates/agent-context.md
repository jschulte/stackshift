# Agent Context: F006 Automated Spec Updates

**Purpose:** Technology patterns and context for AI agents working on spec synchronization
**Target:** AI assistants (Claude, Copilot, etc.) implementing or extending this feature
**Date:** 2025-11-17

---

## Technology Stack

### Core Technologies

- **Shell Scripting:** Bash 4.0+ (POSIX-compliant)
- **JSON Processing:** jq 1.6+
- **Git:** 2.x+
- **Claude Code:** Latest version with hook support
- **Husky:** 8.x for git hook management
- **Node.js:** ≥18.0.0 (for npm scripts)

### Key Patterns

1. **JSON as Data Interchange:**
   - All structured data passed as JSON
   - Use jq for parsing and manipulation
   - Validate JSON schema before processing

2. **Modular Shell Architecture:**
   - Each module is a separate `.sh` file
   - Modules export functions, not state
   - Source modules with relative paths

3. **Exit Code Semantics:**
   - 0 = Success (allow git push)
   - 1 = Validation failure (block git push)
   - 2-5 = Errors (block git push, show error)

---

## Code Patterns

### Pattern 1: Safe Path Handling

```bash
# ALWAYS validate paths before use
validate_path() {
  local path="$1"

  # Check for path traversal
  if [[ "$path" == *".."* ]]; then
    echo "Error: Path traversal detected" >&2
    return 1
  fi

  # Ensure within repo
  local repo_root=$(git rev-parse --show-toplevel)
  local abs_path=$(realpath -s "$path" 2>/dev/null)

  if [[ "$abs_path" != "$repo_root"* ]]; then
    echo "Error: Path outside repository" >&2
    return 1
  fi

  return 0
}
```

### Pattern 2: JSON Building with jq

```bash
# Build JSON incrementally
build_validation_result() {
  local file="$1"
  local status="$2"

  # Start with base object
  local result=$(jq -n \
    --arg filePath "$file" \
    --arg status "$status" \
    '{
      filePath: $filePath,
      status: $status
    }')

  # Add optional fields
  if [ -n "$failure_reason" ]; then
    result=$(echo "$result" | jq \
      --arg reason "$failure_reason" \
      '. + {failureReason: $reason}')
  fi

  echo "$result"
}
```

### Pattern 3: Error Handling with Set Options

```bash
#!/usr/bin/env bash

# Enable strict mode
set -euo pipefail

# IFS for safer loops
IFS=$'\n\t'

# Trap errors
trap 'echo "Error on line $LINENO" >&2' ERR

# Your code here
```

### Pattern 4: Parallel Processing

```bash
# Process files in parallel (up to 4 concurrent)
process_files_parallel() {
  local files=("$@")

  export -f process_single_file

  printf '%s\n' "${files[@]}" | \
    xargs -P 4 -I {} bash -c 'process_single_file "{}"'
}

process_single_file() {
  local file="$1"
  # Processing logic...
}
```

### Pattern 5: Configuration Merging

```bash
# Merge configs with precedence: local > project > defaults
merge_configs() {
  local default_config="$1"
  local project_config="$2"
  local local_config="$3"

  local result="$default_config"

  if [ -f "$project_config" ]; then
    result=$(jq -s '.[0] * .[1]' <(echo "$result") "$project_config")
  fi

  if [ -f "$local_config" ]; then
    result=$(jq -s '.[0] * .[1]' <(echo "$result") "$local_config")
  fi

  echo "$result"
}
```

---

## Common Operations

### Operation: Extract Changed Files from Git

```bash
get_changed_files() {
  local base_commit=$(git merge-base HEAD origin/main)

  git diff --name-status "$base_commit" HEAD | \
    while IFS=$'\t' read -r status file; do
      echo "$file"
    done
}
```

### Operation: Check if File Matches Pattern

```bash
# Simplified glob matching (use more robust library in production)
matches_pattern() {
  local file="$1"
  local pattern="$2"

  # Convert glob to regex (simplified)
  # **/*.ts → .*\.ts$
  # src/**/*.js → src/.*\.js$

  pattern="${pattern//\*\*/.*}"
  pattern="${pattern//\*/[^/]*}"

  [[ "$file" =~ ^${pattern}$ ]]
}
```

### Operation: Get Last Commit Timestamp

```bash
get_last_commit_time() {
  local file="$1"

  # ISO 8601 format
  git log -1 --format="%aI" -- "$file" 2>/dev/null || echo "1970-01-01T00:00:00Z"
}
```

### Operation: Detect Export Changes in Diff

```bash
has_export_changes() {
  local diff="$1"

  # Look for added or removed export statements
  echo "$diff" | grep -qE '^[+-]\s*export\s+(function|class|interface|type|const)'
}
```

### Operation: Build Spec Mapping

```bash
map_file_to_specs() {
  local file="$1"

  # Extract feature name from path
  # e.g., src/features/auth/login.ts → auth
  if [[ "$file" =~ /features/([^/]+)/ ]]; then
    local feature="${BASH_REMATCH[1]}"

    # Find matching specs
    find specs production-readiness-specs \
      -type f \
      -name "*${feature}*" \
      -name "spec.md"
  fi
}
```

---

## Integration Points

### Claude Code Hook

**Trigger Point:** PreToolUse hook on Bash commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.command' | grep -q '^git push'; then ./.specify/hooks/validate-specs.sh \"$CLAUDE_TOOL_INPUT\"; fi"
          }
        ]
      }
    ]
  }
}
```

**Input Format:**
```json
{
  "command": "git push origin main",
  "description": "Push changes to remote"
}
```

**Expected Output:**
- Exit code 0 → Allow push
- Exit code 1 → Block push
- stderr → Error messages for user

### Git Integration

**Key Git Commands:**

```bash
# Get repository root
git rev-parse --show-toplevel

# Get current branch
git branch --show-current

# Get remote tracking branch
git rev-parse --abbrev-ref --symbolic-full-name @{u}

# Get merge base
git merge-base HEAD origin/main

# Get changed files
git diff --name-status BASE HEAD

# Get file diff
git diff BASE HEAD -- path/to/file

# Get last commit time for file
git log -1 --format="%aI" -- path/to/file
```

### Configuration Files

**Loading Order:**
1. Built-in defaults (hardcoded)
2. `.specify/config/sync-rules.json` (version controlled)
3. `.specify/config/sync-rules.local.json` (gitignored)
4. Environment variables (highest priority)

---

## Testing Patterns

### Pattern: Unit Test with bats

```bash
#!/usr/bin/env bats

setup() {
  # Create temp directory
  TEST_DIR=$(mktemp -d)
  cd "$TEST_DIR"
  git init
}

teardown() {
  # Cleanup
  rm -rf "$TEST_DIR"
}

@test "config loads with defaults" {
  source ../modules/config.sh

  config=$(config_load)
  mode=$(echo "$config" | jq -r '.mode')

  [ "$mode" = "lenient" ]
}

@test "git analyzer gets changed files" {
  # Setup
  echo "test" > file.ts
  git add file.ts
  git commit -m "Add file"

  # Execute
  source ../modules/git-analyzer.sh
  files=$(git_get_changed_files)

  # Assert
  count=$(echo "$files" | jq 'length')
  [ "$count" -gt 0 ]
}
```

### Pattern: Integration Test

```bash
@test "validation fails when spec outdated" {
  # Setup repository
  mkdir -p specs/001-test
  echo "# Spec" > specs/001-test/spec.md
  git add specs/001-test/spec.md
  git commit -m "Add spec"

  mkdir -p src/features/test
  echo "// Code" > src/features/test/file.ts
  git add src/features/test/file.ts
  git commit -m "Add code"

  # Update code without updating spec
  sleep 1  # Ensure different timestamp
  echo "// Updated" >> src/features/test/file.ts
  git add src/features/test/file.ts
  git commit -m "Update code"

  # Run validation
  run ./.specify/hooks/validate-specs.sh '{"command":"git push origin main"}'

  # Assert
  [ "$status" -eq 1 ]
  [[ "$output" =~ "validation failed" ]]
}
```

---

## Performance Optimization

### Caching Strategy

```bash
# Cache expensive operations
CACHE_DIR="/tmp/spec-sync-cache"
mkdir -p "$CACHE_DIR"

get_or_cache() {
  local key="$1"
  local compute_fn="$2"
  local cache_file="$CACHE_DIR/$key"

  if [ -f "$cache_file" ]; then
    cat "$cache_file"
  else
    local result=$($compute_fn)
    echo "$result" > "$cache_file"
    echo "$result"
  fi
}

# Usage
git_context=$(get_or_cache "git_context_$(git rev-parse HEAD)" "git_get_context")
```

### Early Exit Optimization

```bash
# Exit early if only test files changed
check_if_only_tests() {
  local changed_files=$(git_get_changed_files)
  local non_test_count=$(echo "$changed_files" | \
    jq '[.[] | select(.path | test("\\.test\\.|\\.spec\\.") | not)] | length')

  if [ "$non_test_count" -eq 0 ]; then
    echo "Only test files changed, skipping validation"
    exit 0
  fi
}
```

---

## Error Handling

### User-Friendly Error Messages

```bash
show_error() {
  local error_type="$1"
  local details="$2"

  case "$error_type" in
    "outdated_spec")
      cat <<EOF
❌ Spec validation failed

📁 The following specs are outdated:
$details

💡 To fix:
  1. Update the spec files listed above
  2. Commit the changes
  3. Push again

🤖 Or run: npm run update-specs

🚨 Or bypass (not recommended): SKIP_SPEC_SYNC=1 git push
EOF
      ;;

    "config_error")
      cat <<EOF
⚠️  Configuration error

🔧 Problem with .specify/config/sync-rules.json:
$details

💡 To fix:
  1. Check JSON syntax
  2. Validate against schema
  3. Or remove file to use defaults
EOF
      ;;

    "git_error")
      cat <<EOF
💥 Git error

❌ Git command failed:
$details

💡 Possible causes:
  - Not in a git repository
  - Corrupted git state
  - Missing remote branch
EOF
      ;;
  esac
}
```

---

## Security Considerations

### Input Validation

```bash
# ALWAYS validate external input
validate_input() {
  local input="$1"

  # Check if valid JSON
  if ! echo "$input" | jq empty 2>/dev/null; then
    echo "Error: Invalid JSON input" >&2
    return 1
  fi

  # Validate structure
  if ! echo "$input" | jq -e '.command' >/dev/null; then
    echo "Error: Missing 'command' field" >&2
    return 1
  fi

  return 0
}
```

### Command Injection Prevention

```bash
# NEVER use eval
# NEVER use unquoted variables in commands

# BAD:
eval "git diff $user_input"
git diff $user_input

# GOOD:
git diff "$user_input"

# BEST: Validate first
if validate_path "$user_input"; then
  git diff "$user_input"
fi
```

### Path Traversal Prevention

```bash
# Check all paths
safe_path() {
  local path="$1"

  # No parent directory references
  if [[ "$path" == *".."* ]]; then
    return 1
  fi

  # Must be relative
  if [[ "$path" == /* ]]; then
    return 1
  fi

  # Resolve and check
  local abs_path=$(realpath -s "$path")
  local repo_root=$(git rev-parse --show-toplevel)

  [[ "$abs_path" == "$repo_root"* ]]
}
```

---

## AI Agent Guidelines

When implementing or extending this feature:

1. **Follow Existing Patterns:**
   - Use established JSON structures
   - Maintain module organization
   - Follow error handling conventions

2. **Prioritize Safety:**
   - Validate all inputs
   - Check file paths
   - Handle errors gracefully

3. **Optimize for Performance:**
   - Cache expensive operations
   - Use parallel processing when safe
   - Exit early when possible

4. **Maintain Compatibility:**
   - Keep cross-platform (Linux, macOS, Windows WSL)
   - Use POSIX-compliant bash
   - Test on all platforms

5. **Document Changes:**
   - Update relevant .md files
   - Add inline comments
   - Update configuration schema

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scripting Language | Bash | Ubiquitous, fast, no dependencies |
| JSON Processing | jq | Standard tool, powerful, well-supported |
| Git Hook Management | Husky | Cross-platform, npm integration |
| Hook Integration | Claude Code PreToolUse | Block operations before execution |
| Configuration Format | JSON | Easy to parse, validate, version control |
| Testing Framework | bats | Bash-native, simple syntax |
| Parallel Processing | xargs -P | Built-in, reliable, no dependencies |
| Error Handling | set -euo pipefail | Strict mode, early error detection |

---

## Extension Points

Areas where future developers can extend:

1. **Custom Categorizers:**
   - Add language-specific change detection
   - Implement AST-based analysis
   - Support more file types

2. **Advanced Mapping:**
   - AI-powered spec discovery
   - Import analysis for dependencies
   - Project-specific heuristics

3. **Auto-Fix Enhancements:**
   - Better prompt engineering
   - Multi-spec updates in one pass
   - Validation of generated specs

4. **Integration:**
   - GitHub Actions integration
   - Slack notifications
   - Metrics dashboard

---

**Context Status:** Complete
**Last Updated:** 2025-11-17
