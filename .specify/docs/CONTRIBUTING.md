# Contributing to Spec Sync

Developer guide for contributing to the automated specification synchronization system.

## Development Setup

### Prerequisites

- Bash 4.0+
- Git 2.x+
- jq 1.6+
- Node.js ≥18.0.0
- Claude Code (for hook testing)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd <repo>

# Install dependencies
npm install

# Make hooks executable
chmod +x .specify/hooks/validate-specs.sh
chmod +x .specify/hooks/modules/*.sh
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

### Module Structure

```
.specify/
├── config/
│   ├── sync-rules.json          # Default configuration
│   ├── sync-rules.local.json    # Local overrides (git-ignored)
│   └── prompt-templates/        # AI prompt templates
│       └── spec-update.txt
├── hooks/
│   ├── validate-specs.sh        # Main entry point
│   └── modules/
│       ├── config.sh            # Configuration loading
│       ├── git-analyzer.sh      # Git operations
│       ├── mapper.sh            # File-to-spec mapping
│       ├── categorizer.sh       # Change categorization
│       ├── validator.sh         # Validation logic
│       └── auto-fix.sh          # AI-powered spec updates
└── docs/
    ├── SPEC_SYNC_GUIDE.md       # User guide
    ├── CONTRIBUTING.md          # This file
    ├── ARCHITECTURE.md          # System design
    ├── TESTING.md               # Testing guide
    └── CONFIGURATION.md         # Advanced configuration
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

**Coding standards:**
- Use `set -euo pipefail` in bash scripts for strict mode
- Quote all variables: `"$variable"` not `$variable`
- Use `local` for function variables
- Document functions with comments
- Follow existing code style

**Example function:**

```bash
# Description of what this function does
# Args:
#   $1: parameter_name - description
#   $2: another_param - description
# Returns:
#   JSON object with result
my_function() {
  local param="$1"
  local another="$2"

  # Implementation
  echo '{"success": true}'
}
```

### 3. Test Changes

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

**Quick test:**

```bash
# Source the module
source .specify/hooks/modules/config.sh

# Test a function
config_load
```

**Integration test:**

```bash
# Make a test change
echo "// test" >> src/test.ts
git add src/test.ts
git commit -m "test: validation"

# Run hook directly
.specify/hooks/validate-specs.sh
```

### 4. Run Linters

```bash
# Check shell scripts
shellcheck .specify/hooks/**/*.sh

# Check JSON
jq . .specify/config/sync-rules.json

# Validate markdown
markdownlint .specify/docs/*.md
```

### 5. Update Documentation

If you changed behavior:
- Update relevant docs in `.specify/docs/`
- Add examples to SPEC_SYNC_GUIDE.md
- Update CONFIGURATION.md for new options

### 6. Commit Changes

Follow conventional commits:

```bash
git commit -m "feat(module): add new feature

Detailed description of the change.

Closes #123"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request with:
- Clear description of changes
- Link to related issues
- Test results

## Module Development

### Adding a New Module

1. **Create module file:**

```bash
touch .specify/hooks/modules/my-module.sh
chmod +x .specify/hooks/modules/my-module.sh
```

2. **Module template:**

```bash
#!/usr/bin/env bash

# My Module
# Brief description of what this module does

# Source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Public function (used by other modules)
mymodule_public_function() {
  local param="$1"

  # Implementation
  echo "result"
}

# Private function (internal use only)
_mymodule_private_function() {
  local param="$1"

  # Implementation
  return 0
}
```

3. **Source in main hook:**

```bash
# In .specify/hooks/validate-specs.sh
source "$SCRIPT_DIR/modules/my-module.sh"
```

4. **Add tests:**

See [TESTING.md](./TESTING.md) for test template.

### Modifying Existing Modules

**config.sh** - Configuration management
- Add new config options to default in `config_load()`
- Create getter functions: `config_get_*`
- Support env variable overrides

**git-analyzer.sh** - Git operations
- Add git command wrappers
- Ensure compatibility with Git 2.x+
- Handle edge cases (no git, empty repo, etc.)

**mapper.sh** - File-to-spec mapping
- Enhance heuristic matching
- Add new mapping strategies
- Improve confidence scoring

**categorizer.sh** - Change detection
- Add new change patterns
- Create category types
- Update evidence collection

**validator.sh** - Validation logic
- Modify validation criteria
- Add new validation types
- Improve error messages

**auto-fix.sh** - AI-powered updates
- Enhance prompt templates
- Improve diff generation
- Add approval workflows

## Configuration Schema

### Adding New Config Options

1. **Add to default config** (config.sh):

```bash
local default_config='{
  "mode": "lenient",
  "newOption": "defaultValue"
}'
```

2. **Add to schema** (sync-rules.json):

```json
{
  "newOption": "value",
  "$comment": "Description of what this does"
}
```

3. **Add getter function** (config.sh):

```bash
config_get_new_option() {
  local config=$(config_load)
  echo "$config" | jq -r '.newOption // "defaultValue"'
}
```

4. **Document** (CONFIGURATION.md):

```markdown
### newOption

**Type:** `string`
**Default:** `"defaultValue"`

Description of what this option does.

**Example:**
\`\`\`json
{
  "newOption": "customValue"
}
\`\`\`
```

### Adding New Rules

1. **Define rule structure:**

```json
{
  "rules": [
    {
      "name": "Human-readable name",
      "id": "unique_id",
      "filePattern": "glob pattern",
      "changePattern": "regex pattern (optional)",
      "requiresSpecUpdate": true,
      "severity": "error|warning|info",
      "enabled": true,
      "priority": 100,
      "customField": "optional metadata"
    }
  ]
}
```

2. **Update categorizer** (if needed):

```bash
# In categorizer_analyze()
if echo "$diff" | grep -qE "$change_pattern"; then
  # Handle new rule type
fi
```

3. **Add tests:**

```bash
# Test new rule matches correctly
test_new_rule() {
  local config='{"rules": [...]}'
  local result=$(categorizer_analyze "file.ts" "$diff" "$config")

  assertEquals "rule_matched" "$(echo "$result" | jq -r '.type')"
}
```

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

### Quick Test Checklist

- [ ] Unit tests pass for modified modules
- [ ] Integration tests pass
- [ ] Manual testing on real repository
- [ ] Cross-platform testing (Linux, macOS, Windows WSL)
- [ ] Performance tests (<2s validation time)

### Test Framework

We use `bats` (Bash Automated Testing System):

```bash
# Install bats
npm install --save-dev bats

# Run tests
npm test

# Run specific test file
bats test/modules/config.bats

# Run with verbose output
bats -t test/modules/config.bats
```

## Security

### Security Considerations

**Command Injection Prevention:**
- Always quote variables
- Use `jq` for JSON parsing (not `eval`)
- Validate all external input
- Use `grep -q` for boolean checks (not command substitution)

**Path Traversal Prevention:**
- Validate file paths before operations
- Use absolute paths where possible
- Check paths start with repository root

**Secrets Management:**
- Never log API keys or tokens
- Use environment variables for secrets
- Don't commit `.specify/config/sync-rules.local.json`

### Security Checklist

- [ ] All variables quoted
- [ ] No use of `eval`
- [ ] Input validation on external data
- [ ] File paths validated
- [ ] No secrets in logs
- [ ] HTTPS for API calls

## Performance

### Performance Guidelines

**Target:** Validation completes in <2 seconds for typical repositories

**Optimization techniques:**
1. **Cache git operations**
   - Store results in variables
   - Avoid repeated git calls

2. **Parallel processing**
   - Use background jobs for independent operations
   - Limit parallelism with `maxParallel` config

3. **Early exits**
   - Return early when validation passes
   - Skip ignored files immediately

4. **Efficient patterns**
   - Use `grep -q` for existence checks
   - Avoid expensive regex when simple string match works

### Benchmarking

```bash
# Time the hook
time .specify/hooks/validate-specs.sh

# Profile specific function
time bash -c 'source .specify/hooks/modules/validator.sh && validator_run'
```

**Target times:**
- Hook initialization: <100ms
- Per-file validation: <200ms
- Total validation (10 files): <2s

## Debugging

### Enable Debug Mode

```bash
# Verbose output
bash -x .specify/hooks/validate-specs.sh

# Debug specific module
bash -x -c 'source .specify/hooks/modules/config.sh && config_load'
```

### Common Debug Techniques

**Print variables:**
```bash
echo "DEBUG: variable=$variable" >&2
```

**Check function output:**
```bash
result=$(my_function)
echo "DEBUG: result=$result" >&2
```

**Trace execution:**
```bash
set -x  # Enable tracing
# ... code ...
set +x  # Disable tracing
```

### Logging

Use stderr for debug output:
```bash
echo "DEBUG: Starting validation" >&2
echo "INFO: Processing $file" >&2
echo "ERROR: Validation failed" >&2
```

## Release Process

### Version Numbering

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

1. [ ] All tests pass
2. [ ] Documentation updated
3. [ ] CHANGELOG.md updated
4. [ ] Version bumped in relevant files
5. [ ] Git tag created
6. [ ] Release notes written

### Creating a Release

```bash
# 1. Update version
echo "v1.2.3" > .specify/VERSION

# 2. Update CHANGELOG
code CHANGELOG.md

# 3. Commit
git add .
git commit -m "chore: release v1.2.3"

# 4. Tag
git tag -a v1.2.3 -m "Release v1.2.3"

# 5. Push
git push origin main --tags
```

## Support

### Getting Help

- Read [SPEC_SYNC_GUIDE.md](./SPEC_SYNC_GUIDE.md)
- Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- Review existing issues
- Ask in discussions

### Reporting Bugs

Include:
- Bash version: `bash --version`
- Git version: `git --version`
- jq version: `jq --version`
- OS: `uname -a`
- Reproduction steps
- Expected vs actual behavior
- Relevant logs

### Feature Requests

Provide:
- Use case description
- Proposed solution
- Alternative approaches
- Impact assessment

## Code of Conduct

Be respectful, inclusive, and collaborative.

## License

See LICENSE file for details.
