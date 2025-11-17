#!/usr/bin/env bash

# Configuration loader for spec synchronization
# Loads and merges configuration from multiple sources with precedence

# Load configuration with defaults and overrides
config_load() {
  local config_file=".specify/config/sync-rules.json"
  local local_config=".specify/config/sync-rules.local.json"

  # Default configuration
  local default_config='{
    "mode": "lenient",
    "autoFix": false,
    "requireApproval": true,
    "ignorePatterns": ["**/*.test.ts", "**/*.spec.ts"],
    "rules": [],
    "timeout": 30000,
    "parallel": true,
    "maxParallel": 4
  }'

  # Start with defaults
  local config="$default_config"

  # Merge project config if exists
  if [ -f "$config_file" ]; then
    config=$(jq -s '.[0] * .[1]' <(echo "$default_config") "$config_file" 2>/dev/null || echo "$default_config")
  fi

  # Merge local config if exists
  if [ -f "$local_config" ]; then
    config=$(jq -s '.[0] * .[1]' <(echo "$config") "$local_config" 2>/dev/null || echo "$config")
  fi

  # Apply environment variable overrides
  if [ -n "$SPEC_SYNC_MODE" ]; then
    config=$(echo "$config" | jq --arg mode "$SPEC_SYNC_MODE" '.mode = $mode')
  fi

  if [ -n "$SPEC_SYNC_AUTO_FIX" ]; then
    local auto_fix="false"
    [[ "$SPEC_SYNC_AUTO_FIX" == "true" || "$SPEC_SYNC_AUTO_FIX" == "1" ]] && auto_fix="true"
    config=$(echo "$config" | jq --argjson autoFix "$auto_fix" '.autoFix = $autoFix')
  fi

  echo "$config"
}

# Get current validation mode (strict, lenient, off)
config_get_mode() {
  local config=$(config_load)
  echo "$config" | jq -r '.mode // "lenient"'
}

# Check if a file should be ignored based on ignore patterns
config_should_ignore() {
  local file="$1"
  local config=$(config_load)
  local patterns=$(echo "$config" | jq -r '.ignorePatterns[]?' 2>/dev/null)

  if [ -z "$patterns" ]; then
    return 1  # Should not ignore (no patterns)
  fi

  while IFS= read -r pattern; do
    # Simple glob matching (simplified - production would use more robust matching)
    # Convert ** to .* and * to [^/]*
    local regex_pattern="${pattern//\*\*/.*}"
    regex_pattern="${regex_pattern//\*/[^/]*}"
    regex_pattern="^${regex_pattern}$"

    if [[ "$file" =~ $regex_pattern ]]; then
      return 0  # Should ignore
    fi
  done <<< "$patterns"

  return 1  # Should not ignore
}

# Get all validation rules from configuration
config_get_rules() {
  local config=$(config_load)
  echo "$config" | jq -c '.rules[]?' 2>/dev/null
}

# Check if a file matches a rule's file pattern
config_matches_pattern() {
  local file="$1"
  local pattern="$2"

  # Convert glob pattern to regex
  # Handle {ts,js} syntax
  pattern="${pattern//\{/\(}"
  pattern="${pattern//\}/\)}"
  pattern="${pattern//,/\|}"
  # Handle ** and *
  pattern="${pattern//\*\*/.*}"
  pattern="${pattern//\*/[^/]*}"
  pattern="^${pattern}$"

  [[ "$file" =~ $pattern ]]
}

# Evaluate a rule against a file and its changes
# Returns JSON: {"matches": true/false, "requiresSpecUpdate": true/false, "severity": "error/warning"}
config_evaluate_rule() {
  local rule="$1"
  local file="$2"
  local diff="$3"

  # Extract rule properties
  local file_pattern=$(echo "$rule" | jq -r '.filePattern // ""')
  local change_pattern=$(echo "$rule" | jq -r '.changePattern // ""')
  local requires_spec=$(echo "$rule" | jq -r '.requiresSpecUpdate // false')
  local severity=$(echo "$rule" | jq -r '.severity // "warning"')

  # Check if file matches the file pattern
  if [ -n "$file_pattern" ] && ! config_matches_pattern "$file" "$file_pattern"; then
    echo '{"matches": false, "requiresSpecUpdate": false, "severity": "none"}'
    return 0
  fi

  # Check if changes match the change pattern (if specified)
  if [ -n "$change_pattern" ] && [ "$change_pattern" != "null" ]; then
    if ! echo "$diff" | grep -qE "$change_pattern"; then
      echo '{"matches": false, "requiresSpecUpdate": false, "severity": "none"}'
      return 0
    fi
  fi

  # Rule matches - return its requirements
  echo "{\"matches\": true, \"requiresSpecUpdate\": $requires_spec, \"severity\": \"$severity\"}"
}

# Check if current branch is exempted from validation
config_is_branch_exempted() {
  local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  local config=$(config_load)

  # Get exempted branches (support both exemptions.branches and exemptBranches)
  local exempted=$(echo "$config" | jq -r '.exemptions.branches[]?, .exemptBranches[]?' 2>/dev/null)

  if [ -z "$exempted" ]; then
    return 1  # No exemptions
  fi

  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    if [[ "$branch" == $pattern ]]; then
      return 0  # Branch is exempted
    fi
  done <<< "$exempted"

  return 1  # Not exempted
}

# Check if current user is exempted from validation
config_is_user_exempted() {
  local user=$(git config user.email 2>/dev/null || echo "")
  local config=$(config_load)

  # Get exempted users (support both exemptions.users and exemptUsers)
  local exempted=$(echo "$config" | jq -r '.exemptions.users[]?, .exemptUsers[]?' 2>/dev/null)

  if [ -z "$exempted" ]; then
    return 1  # No exemptions
  fi

  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    if [[ "$user" == $pattern ]]; then
      return 0  # User is exempted
    fi
  done <<< "$exempted"

  return 1  # Not exempted
}
