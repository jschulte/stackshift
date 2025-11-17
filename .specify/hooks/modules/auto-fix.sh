#!/usr/bin/env bash

# Auto-fix module
# Automatically generates spec updates using Claude AI when code changes are detected

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/git-analyzer.sh"

# Generate spec update using Claude AI
autofix_generate_update() {
  local file="$1"
  local spec_path="$2"
  local diff="$3"
  local config="$4"

  # Load prompt template
  local prompt_template_file=".specify/config/prompt-templates/spec-update.txt"
  local prompt_template=""

  if [ -f "$prompt_template_file" ]; then
    prompt_template=$(cat "$prompt_template_file")
  else
    # Default prompt template
    prompt_template="You are a technical specification writer. Update the following specification to reflect the code changes below.

File changed: {{FILE_PATH}}
Specification: {{SPEC_PATH}}

Code changes:
\`\`\`diff
{{DIFF}}
\`\`\`

Current specification content:
\`\`\`markdown
{{CURRENT_SPEC}}
\`\`\`

Generate an updated specification that:
1. Reflects the new code changes
2. Maintains the existing structure and format
3. Updates relevant sections (User Stories, API Reference, Data Model, etc.)
4. Preserves all existing content that is still relevant
5. Follows GitHub Spec Kit format

Output ONLY the updated specification content, no explanations or metadata."
  fi

  # Read current spec content (if exists)
  local current_spec=""
  if [ -f "$spec_path" ]; then
    current_spec=$(cat "$spec_path")
  else
    current_spec="# Specification

This specification needs to be created to document the following code changes."
  fi

  # Replace template variables
  local prompt="$prompt_template"
  prompt="${prompt//\{\{FILE_PATH\}\}/$file}"
  prompt="${prompt//\{\{SPEC_PATH\}\}/$spec_path}"
  prompt="${prompt//\{\{DIFF\}\}/$diff}"
  prompt="${prompt//\{\{CURRENT_SPEC\}\}/$current_spec}"

  # Call Claude API (headless mode)
  # Note: This requires ANTHROPIC_API_KEY environment variable
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo '{"error": "ANTHROPIC_API_KEY not set. Cannot generate spec updates.", "success": false}' >&2
    return 1
  fi

  # Prepare API request
  local model="claude-sonnet-4-5-20250929"
  local max_tokens=4000

  # Create request payload
  local request_payload=$(jq -n \
    --arg model "$model" \
    --arg prompt "$prompt" \
    --argjson max_tokens "$max_tokens" \
    '{
      model: $model,
      max_tokens: $max_tokens,
      messages: [
        {
          role: "user",
          content: $prompt
        }
      ]
    }')

  # Make API call
  local response=$(curl -s -X POST https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "$request_payload")

  # Extract generated content
  local generated_spec=$(echo "$response" | jq -r '.content[0].text // ""')

  if [ -z "$generated_spec" ] || [ "$generated_spec" = "null" ]; then
    local error_msg=$(echo "$response" | jq -r '.error.message // "Unknown error"')
    echo "{\"error\": \"Failed to generate spec: $error_msg\", \"success\": false}" >&2
    return 1
  fi

  # Return generated spec
  echo "$generated_spec"
}

# Show diff between current and proposed spec
autofix_show_diff() {
  local spec_path="$1"
  local proposed_content="$2"

  # Create temp file for proposed content
  local temp_file=$(mktemp)
  echo "$proposed_content" > "$temp_file"

  # Show diff
  if [ -f "$spec_path" ]; then
    # Use git diff for colored output
    diff -u "$spec_path" "$temp_file" | tail -n +3 || true
  else
    echo "=== New file: $spec_path ==="
    echo "$proposed_content"
  fi

  # Clean up
  rm -f "$temp_file"
}

# Prompt user for approval
autofix_prompt_approval() {
  local spec_path="$1"
  local action="${2:-update}"

  echo ""
  echo "Do you want to $action this specification?"
  echo "  File: $spec_path"
  echo ""
  read -p "Apply changes? [y/N] " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    return 0  # Approved
  else
    return 1  # Rejected
  fi
}

# Apply spec update to file
autofix_apply_update() {
  local spec_path="$1"
  local content="$2"

  # Create directory if needed
  local spec_dir=$(dirname "$spec_path")
  if [ ! -d "$spec_dir" ]; then
    mkdir -p "$spec_dir"
  fi

  # Write content to file
  echo "$content" > "$spec_path"

  # Add to git staging area
  git add "$spec_path" 2>/dev/null || true

  echo "✅ Updated: $spec_path"
}

# Run auto-fix for a single file
autofix_file() {
  local file="$1"
  local spec_path="$2"
  local config="$3"
  local interactive="${4:-true}"

  echo ""
  echo "🤖 Generating spec update for: $file"
  echo "   Target spec: $spec_path"
  echo ""

  # Get file diff
  local diff=$(git_get_file_diff "$file")

  # Generate update
  local generated_spec=$(autofix_generate_update "$file" "$spec_path" "$diff" "$config")

  # Check for errors
  if echo "$generated_spec" | grep -q "\"error\""; then
    echo "❌ Failed to generate spec update"
    echo "$generated_spec" | jq -r '.error // "Unknown error"' >&2
    return 1
  fi

  # Show diff
  echo "📝 Proposed changes:"
  echo ""
  autofix_show_diff "$spec_path" "$generated_spec"
  echo ""

  # Get approval (if interactive)
  if [ "$interactive" = "true" ]; then
    if autofix_prompt_approval "$spec_path"; then
      autofix_apply_update "$spec_path" "$generated_spec"
      return 0
    else
      echo "⏭️  Skipped: $spec_path"
      return 1
    fi
  else
    # Headless mode - auto-apply
    autofix_apply_update "$spec_path" "$generated_spec"
    return 0
  fi
}

# Run auto-fix for all failed validations
autofix_run() {
  local validation_results="$1"
  local config="$2"
  local interactive="${3:-true}"

  local fixed_count=0
  local failed_count=0
  local skipped_count=0

  # Check if auto-fix is enabled
  local auto_fix_enabled=$(echo "$config" | jq -r '.autoFix // false')
  if [ "$auto_fix_enabled" != "true" ]; then
    echo "ℹ️  Auto-fix is disabled in configuration"
    return 1
  fi

  # Get failed validations
  local failures=$(echo "$validation_results" | jq -c '.[] | select(.status == "fail")')

  if [ -z "$failures" ]; then
    echo "✅ No failures to fix"
    return 0
  fi

  echo ""
  echo "🔧 Starting auto-fix for failed validations..."
  echo ""

  # Process each failure
  while IFS= read -r failure; do
    local file=$(echo "$failure" | jq -r '.filePath')
    local spec_results=$(echo "$failure" | jq -c '.specResults[]?')

    # Process each outdated spec
    while IFS= read -r spec_result; do
      [ -z "$spec_result" ] && continue

      local spec_path=$(echo "$spec_result" | jq -r '.specPath')
      local spec_status=$(echo "$spec_result" | jq -r '.status')

      if [ "$spec_status" = "outdated" ] || [ "$spec_status" = "missing" ]; then
        if autofix_file "$file" "$spec_path" "$config" "$interactive"; then
          ((fixed_count++))
        else
          ((failed_count++))
        fi
      else
        ((skipped_count++))
      fi
    done <<< "$spec_results"
  done <<< "$failures"

  echo ""
  echo "✨ Auto-fix complete:"
  echo "   Fixed: $fixed_count"
  echo "   Failed: $failed_count"
  echo "   Skipped: $skipped_count"
  echo ""

  # Return success if at least one fix was applied
  [ "$fixed_count" -gt 0 ] && return 0 || return 1
}
