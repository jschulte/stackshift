# Spec Sync User Guide

Automated specification synchronization for spec-driven development.

## Overview

The Spec Sync system automatically validates that your code changes have corresponding specification updates before allowing git pushes. This ensures your documentation stays synchronized with your code.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs Husky for git hook management.

### 2. Configure Validation Mode

Edit `.specify/config/sync-rules.json`:

```json
{
  "mode": "strict",    // or "lenient" or "off"
  "autoFix": false,    // Enable AI-powered auto-updates
  "requireApproval": true
}
```

**Modes:**
- `strict`: Blocks pushes when specs are outdated
- `lenient`: Warns but allows pushes
- `off`: Disables validation entirely

### 3. Push Code

The validation hook runs automatically:

```bash
git add src/features/auth.ts
git commit -m "feat: add authentication"
git push
```

## Features

### Automatic Validation

The hook automatically:
- Detects code changes in commits being pushed
- Maps changed files to their related specifications
- Compares timestamps to check if specs are up-to-date
- Blocks or warns about outdated specs

### Smart Change Detection

The system understands different types of changes:

**Requires spec updates:**
- API changes (new exports, interfaces, types)
- Feature additions (files in `/features/`)
- CLI command changes
- Database schema migrations
- Configuration changes

**Doesn't require spec updates:**
- Test-only changes
- Documentation updates
- Internal refactoring
- Comment-only changes

### Emergency Bypass

For urgent pushes, bypass validation:

```bash
SKIP_SPEC_SYNC=1 git push
```

**Warning:** Use sparingly! Update specs as soon as possible.

## Configuration

### Validation Rules

Define custom rules in `.specify/config/sync-rules.json`:

```json
{
  "rules": [
    {
      "name": "API changes require spec updates",
      "id": "api_exports",
      "filePattern": "src/**/*.{ts,js}",
      "changePattern": "^[+-]\\s*export\\s+",
      "requiresSpecUpdate": true,
      "severity": "error",
      "enabled": true,
      "priority": 100
    }
  ]
}
```

**Rule properties:**
- `filePattern`: Glob pattern matching files (e.g., `src/**/*.ts`)
- `changePattern`: Regex matching code changes (optional)
- `requiresSpecUpdate`: Whether spec update is required
- `severity`: `error`, `warning`, or `info`
- `priority`: Higher priority rules match first

### Ignore Patterns

Exclude files from validation:

```json
{
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/dist/**"
  ]
}
```

### File Mappings

Explicitly map code files to specs:

```json
{
  "fileMappings": {
    "src/cli/index.ts": [
      "production-readiness-specs/F001-cli/spec.md"
    ],
    "src/features/auth/**": [
      "production-readiness-specs/F002-auth/spec.md"
    ]
  }
}
```

### Exemptions

Exempt branches or users from validation:

```json
{
  "exemptions": {
    "branches": ["main", "release/*"],
    "users": ["bot@example.com"]
  }
}
```

### Local Overrides

Create `.specify/config/sync-rules.local.json` for user-specific settings:

```json
{
  "mode": "lenient"
}
```

This file is git-ignored and won't affect other developers.

### Environment Variables

Override settings via environment variables:

```bash
# Override mode
export SPEC_SYNC_MODE=lenient

# Enable/disable auto-fix
export SPEC_SYNC_AUTO_FIX=true

# Skip validation (emergency only)
export SKIP_SPEC_SYNC=1
```

## Auto-Fix (Optional)

Enable AI-powered automatic spec updates:

```json
{
  "autoFix": true,
  "requireApproval": true
}
```

**Requirements:**
- Set `ANTHROPIC_API_KEY` environment variable
- Claude API access

**How it works:**
1. Hook detects outdated specs
2. Generates updated specifications using AI
3. Shows diff and prompts for approval (if `requireApproval: true`)
4. Applies approved changes
5. Re-validates to confirm

**Headless mode (CI/CD):**
```json
{
  "autoFix": true,
  "requireApproval": false
}
```

In CI environments (detected via `$CI` variable), auto-fix runs without approval prompts.

## Troubleshooting

### Hook not running

**Check Claude Code settings:**

`.claude/settings.json` should have:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.command' 2>/dev/null | grep -q '^git push'; then ./.specify/hooks/validate-specs.sh \"$CLAUDE_TOOL_INPUT\"; fi"
          }
        ]
      }
    ]
  }
}
```

**Verify hook is executable:**

```bash
chmod +x .specify/hooks/validate-specs.sh
```

### Specs not found

**Check heuristic mapping:**

The system maps files to specs using:
1. Explicit mappings in `fileMappings`
2. Heuristic matching (feature name extraction)

Example: `src/features/auth/login.ts` → searches for "auth" in spec names

**Add explicit mapping:**

```json
{
  "fileMappings": {
    "src/features/auth/**": [
      "production-readiness-specs/F002-auth/spec.md"
    ]
  }
}
```

### False positives

**Adjust rules:**

If validation incorrectly flags changes, adjust rules:

```json
{
  "rules": [
    {
      "name": "Internal refactors don't need specs",
      "filePattern": "src/**/internal/**",
      "requiresSpecUpdate": false
    }
  ]
}
```

**Use ignore patterns:**

```json
{
  "ignorePatterns": [
    "src/utils/helpers.ts"
  ]
}
```

### Performance issues

**Target:** Validation should complete in <2 seconds

**If slow:**
1. Check if many files are being validated
2. Reduce parallel processing:
   ```json
   {
     "parallel": true,
     "maxParallel": 2
   }
   ```
3. Add more ignore patterns to skip unnecessary files

### Auto-fix not working

**Check API key:**

```bash
echo $ANTHROPIC_API_KEY
```

**Check permissions:**

Ensure hook can write to spec files:

```bash
ls -la production-readiness-specs/
```

**Check logs:**

Auto-fix errors are printed to stderr. Review output carefully.

## Best Practices

### 1. Write specs before code

**Recommended workflow:**
1. Write specification first
2. Implement code
3. Push (validation passes automatically)

### 2. Use descriptive commit messages

Link commits to specs:

```bash
git commit -m "feat(F001): implement CLI command parser

Implements User Story 1 from F001-cli/spec.md"
```

### 3. Review auto-generated specs

When using auto-fix:
- Always review AI-generated content
- Verify accuracy and completeness
- Edit as needed before committing

### 4. Configure per-project

Tailor rules to your project:
- Add project-specific patterns
- Set appropriate severity levels
- Define custom file mappings

### 5. Use lenient mode initially

When introducing spec sync to an existing project:
1. Start with `mode: "lenient"` to get warnings
2. Fix outdated specs gradually
3. Switch to `mode: "strict"` when ready

## Examples

### Example 1: Adding a new feature

```bash
# 1. Write spec
code production-readiness-specs/F003-reporting/spec.md

# 2. Implement feature
code src/features/reporting/index.ts

# 3. Commit both together
git add production-readiness-specs/F003-reporting/spec.md
git add src/features/reporting/index.ts
git commit -m "feat(F003): add reporting feature"

# 4. Push (validation passes)
git push
```

### Example 2: Updating existing code

```bash
# 1. Modify code
code src/api/users.ts

# 2. Update spec
code production-readiness-specs/F001-api/spec.md

# 3. Commit both
git add src/api/users.ts production-readiness-specs/F001-api/spec.md
git commit -m "feat(F001): add user roles to API"

# 4. Push
git push
```

### Example 3: Using auto-fix

```bash
# 1. Enable auto-fix
echo '{"autoFix": true}' > .specify/config/sync-rules.local.json

# 2. Make code change (forget spec)
code src/features/auth.ts
git add src/features/auth.ts
git commit -m "feat: add password reset"

# 3. Try to push
git push

# Hook runs:
# - Detects outdated spec
# - Generates update using AI
# - Shows diff
# - Prompts: "Apply changes? [y/N]"
# - You type: y
# - Updates spec
# - Re-validates (passes)

# 4. Commit spec update
git add production-readiness-specs/F002-auth/spec.md
git commit -m "docs: update auth spec for password reset"

# 5. Push again
git push  # Success!
```

### Example 4: Emergency bypass

```bash
# Production is down, need urgent fix
code src/services/database.ts
git add src/services/database.ts
git commit -m "fix: critical database connection bug"

# Bypass validation for urgent push
SKIP_SPEC_SYNC=1 git push

# Later: Update spec
code production-readiness-specs/F004-database/spec.md
git add production-readiness-specs/F004-database/spec.md
git commit -m "docs: update database spec for connection fix"
git push
```

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](.specify/docs/TROUBLESHOOTING.md)
- Review [ARCHITECTURE.md](.specify/docs/ARCHITECTURE.md) for internals
- See [CONFIGURATION.md](.specify/docs/CONFIGURATION.md) for advanced options

## Next Steps

- Read [CONTRIBUTING.md](.specify/docs/CONTRIBUTING.md) for development
- Review [TESTING.md](.specify/docs/TESTING.md) for testing guide
- Check [GitHub Spec Kit docs](https://github.com/github/spec-kit) for spec format
