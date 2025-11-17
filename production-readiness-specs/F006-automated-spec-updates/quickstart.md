# Quickstart: Implementing F006 Automated Spec Updates

**Target Audience:** Developers implementing the automated spec update feature
**Prerequisites:** Familiarity with bash scripting, git hooks, and Claude Code hooks
**Estimated Time:** 4-6 hours for basic implementation

---

## Overview

This guide walks you through implementing the automated spec update system step by step. By the end, you'll have a working Claude Code hook that validates spec-code synchronization before git pushes.

---

## Phase 1: Setup and Scaffolding (30 minutes)

### Step 1: Create Directory Structure

```bash
# Create hook directories
mkdir -p .specify/hooks/modules
mkdir -p .specify/config

# Create templates directory
mkdir -p .specify/templates
```

### Step 2: Install Dependencies

```bash
# Add husky for git hooks
npm install --save-dev husky

# Initialize husky
npx husky install

# Make sure jq is installed (for JSON processing)
# On macOS:
brew install jq

# On Ubuntu/Debian:
sudo apt-get install jq

# On Windows (WSL):
sudo apt-get install jq
```

### Step 3: Create Configuration File

Create `.specify/config/sync-rules.json`:

```json
{
  "mode": "strict",
  "autoFix": false,
  "requireApproval": true,
  "fileMappings": {},
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js",
    "**/node_modules/**",
    "**/__tests__/**",
    "**/.git/**"
  ],
  "rules": [
    {
      "name": "API changes require spec updates",
      "id": "api_exports",
      "filePattern": "src/**/*.{ts,js}",
      "changePattern": "^[+-]\\s*export\\s+(function|class|interface|type|const)",
      "requiresSpecUpdate": true,
      "specSections": ["API Reference", "User Stories"],
      "severity": "error",
      "enabled": true,
      "priority": 100
    },
    {
      "name": "Feature additions require spec updates",
      "id": "feature_additions",
      "filePattern": "src/features/**/*",
      "changeType": "added",
      "requiresSpecUpdate": true,
      "specSections": ["User Stories", "Functional Requirements"],
      "severity": "error",
      "enabled": true,
      "priority": 90
    },
    {
      "name": "Internal refactoring allowed",
      "id": "internal_refactor",
      "filePattern": "src/**/internal/**",
      "requiresSpecUpdate": false,
      "severity": "info",
      "enabled": true,
      "priority": 50
    }
  ],
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

### Step 4: Update Claude Code Hook Configuration

Add to `.claude/settings.json`:

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

---

## Phase 2: Implement Core Modules (2-3 hours)

### Module 1: Config Loader

Create `.specify/hooks/modules/config.sh`:

```bash
#!/usr/bin/env bash

# Load configuration with defaults and overrides
config_load() {
  local config_file=".specify/config/sync-rules.json"
  local local_config=".specify/config/sync-rules.local.json"

  # Default configuration
  local default_config='{
    "mode": "lenient",
    "autoFix": false,
    "requireApproval": true,
    "ignorePatterns": ["**/*.test.ts"],
    "rules": [],
    "timeout": 30000
  }'

  # Start with defaults
  local config="$default_config"

  # Merge project config if exists
  if [ -f "$config_file" ]; then
    config=$(jq -s '.[0] * .[1]' <(echo "$default_config") "$config_file")
  fi

  # Merge local config if exists
  if [ -f "$local_config" ]; then
    config=$(jq -s '.[0] * .[1]' <(echo "$config") "$local_config")
  fi

  # Apply environment variable overrides
  if [ -n "$SPEC_SYNC_MODE" ]; then
    config=$(echo "$config" | jq --arg mode "$SPEC_SYNC_MODE" '.mode = $mode')
  fi

  echo "$config"
}

# Get current mode (strict, lenient, off)
config_get_mode() {
  local config=$(config_load)
  echo "$config" | jq -r '.mode'
}

# Check if file should be ignored
config_should_ignore() {
  local file="$1"
  local config=$(config_load)
  local patterns=$(echo "$config" | jq -r '.ignorePatterns[]')

  while IFS= read -r pattern; do
    # Use minimatch-style glob matching (simplified)
    if [[ "$file" == $pattern ]]; then
      return 0  # Should ignore
    fi
  done <<< "$patterns"

  return 1  # Should not ignore
}
```

### Module 2: Git Analyzer

Create `.specify/hooks/modules/git-analyzer.sh`:

```bash
#!/usr/bin/env bash

# Get git context information
git_get_context() {
  local repo_root=$(git rev-parse --show-toplevel 2>/dev/null)
  local current_branch=$(git branch --show-current 2>/dev/null)
  local remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "origin/main")
  local base_commit=$(git merge-base HEAD "$remote_branch" 2>/dev/null || echo "HEAD")
  local head_commit=$(git rev-parse HEAD 2>/dev/null)

  jq -n \
    --arg repoRoot "$repo_root" \
    --arg currentBranch "$current_branch" \
    --arg remoteBranch "$remote_branch" \
    --arg baseCommit "$base_commit" \
    --arg headCommit "$head_commit" \
    '{
      repoRoot: $repoRoot,
      currentBranch: $currentBranch,
      remoteBranch: $remoteBranch,
      baseCommit: $baseCommit,
      headCommit: $headCommit
    }'
}

# Get list of changed files with metadata
git_get_changed_files() {
  local context=$(git_get_context)
  local base_commit=$(echo "$context" | jq -r '.baseCommit')
  local files_json="[]"

  while IFS=$'\t' read -r status file; do
    # Determine change type
    local change_type
    case "${status:0:1}" in
      A) change_type="added" ;;
      M) change_type="modified" ;;
      D) change_type="deleted" ;;
      R) change_type="renamed" ;;
      *) change_type="unknown" ;;
    esac

    # Get stats if file exists
    local additions=0
    local deletions=0
    if [ "$change_type" != "deleted" ] && [ -f "$file" ]; then
      local stats=$(git diff --numstat "$base_commit" HEAD -- "$file" | head -1)
      additions=$(echo "$stats" | awk '{print $1}' | grep -E '^[0-9]+$' || echo "0")
      deletions=$(echo "$stats" | awk '{print $2}' | grep -E '^[0-9]+$' || echo "0")
    fi

    # Build file JSON
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

# Get diff for specific file
git_get_file_diff() {
  local file="$1"
  local context=$(git_get_context)
  local base_commit=$(echo "$context" | jq -r '.baseCommit')

  git diff "$base_commit" HEAD -- "$file" 2>/dev/null
}

# Get last commit time for file
git_get_last_commit_time() {
  local file="$1"
  git log -1 --format="%aI" -- "$file" 2>/dev/null
}
```

### Module 3: Spec Mapper

Create `.specify/hooks/modules/mapper.sh`:

```bash
#!/usr/bin/env bash

# Find specs related to a code file
mapper_find_specs() {
  local file="$1"
  local config="$2"
  local specs_json="[]"

  # 1. Check explicit mappings
  local explicit_specs=$(mapper_check_explicit "$file" "$config")
  if [ "$explicit_specs" != "[]" ]; then
    specs_json="$explicit_specs"
    return 0
  fi

  # 2. Use heuristic matching
  local heuristic_specs=$(mapper_heuristic_match "$file")
  specs_json="$heuristic_specs"

  echo "$specs_json"
}

# Check explicit file-to-spec mappings in config
mapper_check_explicit() {
  local file="$1"
  local config="$2"
  local mappings=$(echo "$config" | jq -r '.fileMappings // {}')
  local specs_json="[]"

  # Check each mapping pattern
  while IFS= read -r pattern; do
    if [[ "$file" == $pattern ]]; then
      local spec_paths=$(echo "$mappings" | jq -r --arg p "$pattern" '.[$p][]')
      while IFS= read -r spec_path; do
        if [ -f "$spec_path" ]; then
          local spec_json=$(jq -n \
            --arg specPath "$spec_path" \
            --arg absPath "$(pwd)/$spec_path" \
            --arg source "explicit" \
            '{
              specPath: $specPath,
              absoluteSpecPath: $absPath,
              mappingSource: $source,
              confidence: 1.0
            }')
          specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
        fi
      done <<< "$spec_paths"
    fi
  done <<< "$(echo "$mappings" | jq -r 'keys[]')"

  echo "$specs_json"
}

# Heuristic matching: extract feature name and find matching specs
mapper_heuristic_match() {
  local file="$1"
  local specs_json="[]"

  # Extract potential feature names from path
  # e.g., src/features/auth/login.ts → "auth"
  if [[ "$file" =~ /features/([^/]+)/ ]]; then
    local feature_name="${BASH_REMATCH[1]}"

    # Search for specs containing this feature name
    while IFS= read -r spec_file; do
      if [ -f "$spec_file" ]; then
        local spec_json=$(jq -n \
          --arg specPath "$spec_file" \
          --arg absPath "$(pwd)/$spec_file" \
          --arg source "heuristic" \
          '{
            specPath: $specPath,
            absoluteSpecPath: $absPath,
            mappingSource: $source,
            confidence: 0.8
          }')
        specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
      fi
    done < <(find specs production-readiness-specs -name "*$feature_name*" -name "spec.md" 2>/dev/null)
  fi

  # Fallback: check all specs if no feature-based match
  if [ "$specs_json" = "[]" ]; then
    while IFS= read -r spec_file; do
      if [ -f "$spec_file" ]; then
        local spec_json=$(jq -n \
          --arg specPath "$spec_file" \
          --arg absPath "$(pwd)/$spec_file" \
          --arg source "heuristic" \
          '{
            specPath: $specPath,
            absoluteSpecPath: $absPath,
            mappingSource: $source,
            confidence: 0.5
          }')
        specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
      fi
    done < <(find specs production-readiness-specs -name "spec.md" 2>/dev/null | head -5)
  fi

  echo "$specs_json"
}
```

### Module 4: Change Categorizer

Create `.specify/hooks/modules/categorizer.sh`:

```bash
#!/usr/bin/env bash

# Categorize code changes
categorizer_analyze() {
  local file="$1"
  local diff="$2"

  # Check if test file
  if [[ "$file" =~ \.(test|spec)\.(ts|js)$ ]]; then
    jq -n '{
      type: "test_only",
      requiresSpecUpdate: false,
      confidence: "high"
    }'
    return
  fi

  # Check if documentation
  if [[ "$file" =~ \.md$ ]] && [[ ! "$file" =~ spec\.md$ ]]; then
    jq -n '{
      type: "documentation",
      requiresSpecUpdate: false,
      confidence: "high"
    }'
    return
  fi

  # Check for export changes
  if echo "$diff" | grep -qE '^[+-]\s*export\s+(function|class|interface|type|const)'; then
    jq -n '{
      type: "api_change",
      requiresSpecUpdate: true,
      confidence: "high",
      evidence: {
        exportChanges: true
      }
    }'
    return
  fi

  # Check for new file in features/
  if [[ "$file" =~ /features/ ]]; then
    jq -n '{
      type: "feature_addition",
      requiresSpecUpdate: true,
      confidence: "medium",
      evidence: {
        newFiles: true
      }
    }'
    return
  fi

  # Default: internal refactor
  jq -n '{
    type: "internal_refactor",
    requiresSpecUpdate: false,
    confidence: "medium"
  }'
}
```

### Module 5: Validator

Create `.specify/hooks/modules/validator.sh`:

```bash
#!/usr/bin/env bash

source "$(dirname "$0")/mapper.sh"
source "$(dirname "$0")/categorizer.sh"
source "$(dirname "$0")/git-analyzer.sh"

# Validate a single file
validator_check_file() {
  local file="$1"
  local config="$2"

  # Get file diff
  local diff=$(git_get_file_diff "$file")

  # Categorize the change
  local category=$(categorizer_analyze "$file" "$diff")
  local requires_update=$(echo "$category" | jq -r '.requiresSpecUpdate')

  # If no update required, mark as pass
  if [ "$requires_update" = "false" ]; then
    jq -n \
      --arg filePath "$file" \
      '{
        filePath: $filePath,
        status: "pass"
      }'
    return
  fi

  # Find related specs
  local specs=$(mapper_find_specs "$file" "$config")

  # Check if specs are outdated
  local code_time=$(git_get_last_commit_time "$file")
  local spec_results="[]"
  local has_outdated=false

  while IFS= read -r spec; do
    local spec_path=$(echo "$spec" | jq -r '.specPath')
    local spec_time=$(git_get_last_commit_time "$spec_path")

    # Compare timestamps
    if [ "$code_time" \> "$spec_time" ]; then
      has_outdated=true
      local spec_result=$(jq -n \
        --arg specPath "$spec_path" \
        --arg lastSpecUpdate "$spec_time" \
        --arg lastCodeUpdate "$code_time" \
        '{
          specPath: $specPath,
          status: "outdated",
          lastSpecUpdate: $lastSpecUpdate,
          lastCodeUpdate: $lastCodeUpdate
        }')
      spec_results=$(echo "$spec_results" | jq --argjson r "$spec_result" '. + [$r]')
    fi
  done < <(echo "$specs" | jq -c '.[]')

  # Generate result
  if [ "$has_outdated" = true ]; then
    jq -n \
      --arg filePath "$file" \
      --argjson specResults "$spec_results" \
      '{
        filePath: $filePath,
        status: "fail",
        specResults: $specResults,
        failureReason: "Spec is outdated (code modified after spec)"
      }'
  else
    jq -n \
      --arg filePath "$file" \
      '{
        filePath: $filePath,
        status: "pass"
      }'
  fi
}

# Run validation on all changed files
validator_run() {
  local config="$1"
  local changed_files=$(git_get_changed_files)
  local results="[]"

  while IFS= read -r file_json; do
    local file=$(echo "$file_json" | jq -r '.path')

    # Skip ignored files
    if config_should_ignore "$file"; then
      continue
    fi

    # Validate file
    local result=$(validator_check_file "$file" "$config")
    results=$(echo "$results" | jq --argjson r "$result" '. + [$r]')
  done < <(echo "$changed_files" | jq -c '.[]')

  echo "$results"
}
```

---

## Phase 3: Main Hook Script (1 hour)

Create `.specify/hooks/validate-specs.sh`:

```bash
#!/usr/bin/env bash
set -e

# Load modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/modules/config.sh"
source "$SCRIPT_DIR/modules/validator.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Main validation function
main() {
  # Check for emergency bypass
  if [ "${SKIP_SPEC_SYNC:-0}" = "1" ]; then
    echo -e "${YELLOW}⚠️  Spec sync validation skipped (SKIP_SPEC_SYNC=1)${NC}"
    exit 0
  fi

  # Parse input
  local input="$1"
  local command=$(echo "$input" | jq -r '.command' 2>/dev/null || echo "")

  # Only validate git push commands
  if [[ ! "$command" =~ ^git\ push ]]; then
    exit 0
  fi

  echo "🔍 Validating spec synchronization..."

  # Load configuration
  local config=$(config_load)
  local mode=$(echo "$config" | jq -r '.mode')

  # Check if validation is disabled
  if [ "$mode" = "off" ]; then
    echo -e "${YELLOW}ℹ️  Spec sync validation is disabled${NC}"
    exit 0
  fi

  # Run validation
  local results=$(validator_run "$config")

  # Check for failures
  local failures=$(echo "$results" | jq '[.[] | select(.status == "fail")] | length')

  if [ "$failures" -gt 0 ]; then
    echo -e "${RED}❌ Spec validation failed${NC}"
    echo ""
    echo "📁 Changed files without spec updates:"

    # Show each failure
    while IFS= read -r result; do
      local file=$(echo "$result" | jq -r '.filePath')
      echo -e "  ${RED}•${NC} $file"

      # Show spec details
      local spec_results=$(echo "$result" | jq -r '.specResults[]')
      while IFS= read -r spec_result; do
        local spec_path=$(echo "$spec_result" | jq -r '.specPath')
        local spec_time=$(echo "$spec_result" | jq -r '.lastSpecUpdate')
        local code_time=$(echo "$spec_result" | jq -r '.lastCodeUpdate')
        echo "    → $spec_path"
        echo "      Last spec update: $spec_time"
        echo "      Last code update: $code_time"
      done < <(echo "$result" | jq -c '.specResults[]')
    done < <(echo "$results" | jq -c '.[] | select(.status == "fail")')

    echo ""
    echo -e "${YELLOW}💡 To fix:${NC}"
    echo "  1. Update the spec files listed above"
    echo "  2. Commit the spec changes"
    echo "  3. Push again"
    echo ""
    echo -e "${YELLOW}🚨 Or bypass this check (not recommended):${NC}"
    echo "  SKIP_SPEC_SYNC=1 git push"

    # Exit based on mode
    if [ "$mode" = "strict" ]; then
      exit 1
    else
      echo -e "${YELLOW}⚠️  Allowing push in lenient mode${NC}"
      exit 0
    fi
  else
    echo -e "${GREEN}✅ Spec validation passed${NC}"
    local total=$(echo "$results" | jq 'length')
    echo "All $total changed files have up-to-date specs."
    exit 0
  fi
}

# Run main function
main "$@"
```

Make it executable:

```bash
chmod +x .specify/hooks/validate-specs.sh
```

---

## Phase 4: Testing (1 hour)

### Manual Testing

1. **Test validation passes:**
```bash
# Create a test branch
git checkout -b test/spec-sync

# Make a change to a spec
echo "# Test change" >> specs/some-spec/spec.md
git add specs/some-spec/spec.md
git commit -m "Update spec"

# Make corresponding code change
echo "// Updated code" >> src/features/some-feature/file.ts
git add src/features/some-feature/file.ts
git commit -m "Update code"

# Try to push (should succeed)
git push origin test/spec-sync
```

2. **Test validation fails:**
```bash
# Make code change without updating spec
echo "// New change" >> src/features/some-feature/file.ts
git add src/features/some-feature/file.ts
git commit -m "Update code without spec"

# Try to push (should fail)
git push origin test/spec-sync
```

3. **Test bypass:**
```bash
# Bypass validation
SKIP_SPEC_SYNC=1 git push origin test/spec-sync
```

### Automated Testing

Create `test/spec-sync.bats`:

```bash
#!/usr/bin/env bats

@test "config loads successfully" {
  source .specify/hooks/modules/config.sh
  config=$(config_load)
  mode=$(echo "$config" | jq -r '.mode')
  [ -n "$mode" ]
}

@test "git analyzer extracts context" {
  source .specify/hooks/modules/git-analyzer.sh
  context=$(git_get_context)
  repo_root=$(echo "$context" | jq -r '.repoRoot')
  [ -n "$repo_root" ]
}

@test "validator detects outdated specs" {
  # Setup test scenario
  # ...implementation...
}
```

Run tests:

```bash
npm install --save-dev bats
npx bats test/spec-sync.bats
```

---

## Phase 5: Documentation and Rollout (30 minutes)

### Update Project README

Add to your project's README.md:

```markdown
## Spec Synchronization

This project uses automated spec validation to ensure code and specifications stay in sync.

### How it works

Before every `git push`, a hook validates that:
- Code changes have corresponding spec updates
- Spec files are newer than the code files they document

### If validation fails

Update the spec files mentioned in the error message, then push again.

### Emergency bypass

If you need to bypass validation (not recommended):

```bash
SKIP_SPEC_SYNC=1 git push
```

### Configuration

Edit `.specify/config/sync-rules.json` to customize validation rules.
```

### Team Onboarding

Create `.specify/docs/SPEC_SYNC_GUIDE.md`:

```markdown
# Spec Synchronization Guide

## Quick Start

1. Make code changes
2. Update related specs
3. Commit both changes
4. Push normally

## Troubleshooting

**Error: "Spec is outdated"**
- Update the spec file mentioned in the error
- Commit the spec change
- Push again

**Need to push urgently?**
- Use: `SKIP_SPEC_SYNC=1 git push`
- Create a follow-up task to update specs

## Configuration

See `.specify/config/sync-rules.json` for validation rules.
```

---

## Common Pitfalls and Solutions

### Issue 1: Hook doesn't trigger

**Cause:** Claude Code settings not configured
**Solution:** Verify `.claude/settings.json` has the PreToolUse hook

### Issue 2: jq command not found

**Cause:** jq not installed
**Solution:** Install jq via package manager

### Issue 3: False positives

**Cause:** Overly strict rules
**Solution:** Adjust rules in `.specify/config/sync-rules.json` or use lenient mode

### Issue 4: Performance too slow

**Cause:** Too many files being validated
**Solution:** Add more patterns to `ignorePatterns` in config

---

## Next Steps

After basic implementation:

1. **Add Auto-Fix:** Implement AI-powered spec update generation
2. **Improve Mapping:** Add more heuristics for file-to-spec mapping
3. **Add Tests:** Expand test coverage
4. **Monitor Usage:** Track validation pass/fail rates
5. **Iterate:** Gather feedback and improve rules

---

## Support

For questions or issues:
- Check `.specify/docs/SPEC_SYNC_GUIDE.md`
- Review configuration in `.specify/config/sync-rules.json`
- Create an issue in the project repository

---

**Implementation Status:** Ready to implement
**Last Updated:** 2025-11-17
