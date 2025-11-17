# Testing Guide

Comprehensive testing guide for the Spec Sync system.

## Overview

The Spec Sync system uses a multi-layered testing approach:
- **Unit tests:** Test individual functions in isolation (70% coverage target)
- **Integration tests:** Test module interactions (20% coverage target)
- **E2E tests:** Test full workflows including actual git operations (10% coverage target)

## Test Framework

We use [bats](https://github.com/bats-core/bats-core) (Bash Automated Testing System) for all tests.

### Installation

```bash
# Via npm (recommended)
npm install --save-dev bats

# Or via package manager
brew install bats-core        # macOS
apt-get install bats          # Ubuntu/Debian
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
bats test/modules/config.bats

# Run with verbose output
bats -t test/modules/config.bats

# Run specific test
bats -f "test_config_load" test/modules/config.bats

# Generate TAP output
bats --tap test/modules/config.bats
```

## Test Structure

```
test/
├── modules/              # Unit tests
│   ├── config.bats
│   ├── git-analyzer.bats
│   ├── mapper.bats
│   ├── categorizer.bats
│   ├── validator.bats
│   └── auto-fix.bats
├── integration/          # Integration tests
│   ├── validation.bats
│   ├── modes.bats
│   └── auto-fix.bats
├── e2e/                  # End-to-end tests
│   ├── push.bats
│   └── auto-fix.bats
├── fixtures/             # Test data
│   ├── configs/
│   ├── diffs/
│   └── specs/
└── helpers/              # Test utilities
    └── test-helper.bash
```

## Writing Unit Tests

### Unit Test Template

```bash
#!/usr/bin/env bats

# Load module under test
load '../helpers/test-helper'

setup() {
  # Runs before each test
  setup_test_repo
}

teardown() {
  # Runs after each test
  cleanup_test_repo
}

@test "function_name: should do something" {
  # Arrange
  local input="value"

  # Act
  result=$(function_name "$input")

  # Assert
  assertEquals "expected" "$(echo "$result" | jq -r '.field')"
}
```

### Example: Testing config.sh

File: `test/modules/config.bats`

```bash
#!/usr/bin/env bats

load '../helpers/test-helper'

# Source module
setup() {
  source .specify/hooks/modules/config.sh
}

@test "config_load: should load default config" {
  result=$(config_load)

  # Check required fields
  assertEquals "lenient" "$(echo "$result" | jq -r '.mode')"
  assertEquals "false" "$(echo "$result" | jq -r '.autoFix')"
}

@test "config_load: should merge project config" {
  # Create project config
  echo '{"mode": "strict"}' > .specify/config/sync-rules.json

  result=$(config_load)

  assertEquals "strict" "$(echo "$result" | jq -r '.mode')"

  # Cleanup
  rm .specify/config/sync-rules.json
}

@test "config_load: should override with environment variables" {
  export SPEC_SYNC_MODE=off

  result=$(config_load)

  assertEquals "off" "$(echo "$result" | jq -r '.mode')"

  unset SPEC_SYNC_MODE
}

@test "config_should_ignore: should match ignore patterns" {
  # Test file matches ignore pattern
  run config_should_ignore "src/test.spec.ts"

  assertEquals 0 $status  # Should return 0 (true)
}

@test "config_should_ignore: should not match non-ignored files" {
  run config_should_ignore "src/index.ts"

  assertEquals 1 $status  # Should return 1 (false)
}

@test "config_matches_pattern: should match glob patterns" {
  # Test glob pattern matching
  run config_matches_pattern "src/features/auth.ts" "src/**/*.ts"

  assertEquals 0 $status
}

@test "config_matches_pattern: should handle brace expansion" {
  run config_matches_pattern "src/index.ts" "src/**/*.{ts,js}"

  assertEquals 0 $status
}

@test "config_is_branch_exempted: should return true for exempted branches" {
  # Create config with exemptions
  local config='{"exemptions": {"branches": ["main", "release/*"]}}'

  # Mock git branch
  git checkout -b main

  run config_is_branch_exempted

  assertEquals 0 $status

  git checkout -
}

@test "config_is_user_exempted: should return true for exempted users" {
  # Set up git user
  git config user.email "bot@example.com"

  # Create config
  echo '{"exemptions": {"users": ["bot@example.com"]}}' > .specify/config/sync-rules.json

  run config_is_user_exempted

  assertEquals 0 $status

  rm .specify/config/sync-rules.json
}
```

### Assertions

```bash
# Equality
assertEquals "expected" "$actual"

# Status code
assertEquals 0 $status  # Success
assertEquals 1 $status  # Failure

# String contains
assertContains "substring" "$string"

# File exists
assertFileExists "/path/to/file"

# JSON field
assertEquals "value" "$(echo "$json" | jq -r '.field')"

# Array length
assertEquals 3 "$(echo "$json" | jq 'length')"
```

## Integration Tests

### Integration Test Template

Integration tests validate multiple modules working together.

```bash
#!/usr/bin/env bats

load '../helpers/test-helper'

setup() {
  setup_test_repo
  setup_test_specs
}

teardown() {
  cleanup_test_repo
}

@test "validation: should detect outdated spec" {
  # Create code file
  echo "export const foo = 'bar';" > src/index.ts
  git add src/index.ts
  git commit -m "feat: add foo"

  # Create spec (older timestamp)
  sleep 1
  mkdir -p production-readiness-specs/F001
  echo "# Spec" > production-readiness-specs/F001/spec.md
  git add production-readiness-specs/F001/spec.md
  git commit -m "docs: add spec" --date="1 day ago"

  # Update code (make it newer than spec)
  echo "export const bar = 'baz';" >> src/index.ts
  git add src/index.ts
  git commit -m "feat: add bar"

  # Run validation
  source .specify/hooks/modules/config.sh
  source .specify/hooks/modules/validator.sh

  result=$(validator_run)

  # Should fail (spec is outdated)
  assertEquals "fail" "$(echo "$result" | jq -r '.[0].status')"
}

@test "validation: should pass for up-to-date spec" {
  # Create spec first
  mkdir -p production-readiness-specs/F001
  echo "# Spec" > production-readiness-specs/F001/spec.md
  git add production-readiness-specs/F001/spec.md
  git commit -m "docs: add spec"

  # Create code file (same commit, so timestamps are equal)
  echo "export const foo = 'bar';" > src/index.ts
  git add src/index.ts
  git commit --amend --no-edit

  # Run validation
  result=$(validator_run)

  # Should pass
  assertEquals "pass" "$(echo "$result" | jq -r '.[0].status')"
}
```

### Example: Mode Testing

File: `test/integration/modes.bats`

```bash
#!/usr/bin/env bats

load '../helpers/test-helper'

setup() {
  setup_test_repo
}

teardown() {
  cleanup_test_repo
}

@test "strict mode: should block push when spec outdated" {
  # Set strict mode
  echo '{"mode": "strict"}' > .specify/config/sync-rules.json

  # Create outdated spec scenario
  create_outdated_spec_scenario

  # Run hook
  run .specify/hooks/validate-specs.sh

  # Should exit with failure
  assertEquals 1 $status
  assertContains "outdated" "$output"
}

@test "lenient mode: should warn but allow push" {
  # Set lenient mode
  echo '{"mode": "lenient"}' > .specify/config/sync-rules.json

  # Create outdated spec scenario
  create_outdated_spec_scenario

  # Run hook
  run .specify/hooks/validate-specs.sh

  # Should exit with success (but show warnings)
  assertEquals 0 $status
  assertContains "warning" "$output"
}

@test "off mode: should skip validation" {
  # Set off mode
  echo '{"mode": "off"}' > .specify/config/sync-rules.json

  # Run hook
  run .specify/hooks/validate-specs.sh

  # Should exit immediately
  assertEquals 0 $status
  assertContains "disabled" "$output"
}
```

## E2E Tests

### E2E Test Template

E2E tests run full workflows including actual git operations.

```bash
#!/usr/bin/env bats

load '../helpers/test-helper'

setup() {
  setup_full_environment
}

teardown() {
  cleanup_full_environment
}

@test "e2e: git push with outdated spec should be blocked" {
  # Configure strict mode
  echo '{"mode": "strict"}' > .specify/config/sync-rules.json

  # Make code change
  echo "export const feature = true;" > src/feature.ts
  git add src/feature.ts
  git commit -m "feat: add feature"

  # Try to push (should be blocked by hook)
  run git push origin main 2>&1

  # Verify hook blocked the push
  assertEquals 1 $status
  assertContains "outdated" "$output"

  # Verify nothing was pushed
  assertNoPushOccurred
}

@test "e2e: git push with up-to-date specs should succeed" {
  # Create spec and code together
  mkdir -p production-readiness-specs/F001
  echo "# Feature Spec" > production-readiness-specs/F001/spec.md
  echo "export const feature = true;" > src/feature.ts

  git add .
  git commit -m "feat: add feature with spec"

  # Push should succeed
  run git push origin main

  assertEquals 0 $status
}
```

## Test Helpers

### Test Helper Functions

File: `test/helpers/test-helper.bash`

```bash
#!/usr/bin/env bash

# Set up test repository
setup_test_repo() {
  TEST_REPO=$(mktemp -d)
  cd "$TEST_REPO"

  git init
  git config user.email "test@example.com"
  git config user.name "Test User"

  # Copy hook files
  mkdir -p .specify/hooks/modules
  cp -r "$BATS_TEST_DIRNAME/../../.specify/hooks/"* .specify/hooks/
}

# Clean up test repository
cleanup_test_repo() {
  if [ -n "$TEST_REPO" ] && [ -d "$TEST_REPO" ]; then
    cd /
    rm -rf "$TEST_REPO"
  fi
}

# Create outdated spec scenario
create_outdated_spec_scenario() {
  # Create spec
  mkdir -p production-readiness-specs/F001
  echo "# Old Spec" > production-readiness-specs/F001/spec.md
  git add production-readiness-specs/F001/spec.md
  git commit -m "docs: add spec" --date="2 days ago"

  # Create newer code
  echo "export const newFeature = true;" > src/index.ts
  git add src/index.ts
  git commit -m "feat: add new feature"
}

# Assert helpers
assertEquals() {
  local expected="$1"
  local actual="$2"

  if [ "$expected" != "$actual" ]; then
    echo "Expected: $expected"
    echo "Actual: $actual"
    return 1
  fi
}

assertContains() {
  local substring="$1"
  local string="$2"

  if [[ ! "$string" =~ $substring ]]; then
    echo "Expected string to contain: $substring"
    echo "Actual string: $string"
    return 1
  fi
}

assertFileExists() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "Expected file to exist: $file"
    return 1
  fi
}

# Mock Claude API for testing auto-fix
mock_claude_api() {
  export ANTHROPIC_API_KEY="test-key"

  # Create mock API response
  mkdir -p /tmp/mock-api
  cat > /tmp/mock-api/response.json <<EOF
{
  "content": [
    {
      "text": "# Updated Spec\n\nThis is an auto-generated spec update."
    }
  ]
}
EOF

  # Alias curl to return mock response
  alias curl="cat /tmp/mock-api/response.json"
}
```

## Fixtures

### Test Fixtures

Store test data in `test/fixtures/`:

```
test/fixtures/
├── configs/
│   ├── strict.json
│   ├── lenient.json
│   └── with-rules.json
├── diffs/
│   ├── api-change.diff
│   ├── test-only.diff
│   └── feature-addition.diff
└── specs/
    ├── sample-spec.md
    └── outdated-spec.md
```

### Using Fixtures

```bash
@test "categorizer: should detect API changes" {
  # Load fixture
  local diff=$(cat test/fixtures/diffs/api-change.diff)

  # Run categorizer
  result=$(categorizer_analyze "src/index.ts" "$diff")

  # Verify
  assertEquals "api_change" "$(echo "$result" | jq -r '.type')"
}
```

## Mocking

### Mocking Git Commands

```bash
# Mock git status
git() {
  if [ "$1" = "status" ]; then
    echo "On branch main"
    echo "nothing to commit"
  else
    command git "$@"
  fi
}

# Mock git diff
git_diff_mock() {
  cat <<EOF
+export const newFunction = () => {
+  return true;
+};
EOF
}
```

### Mocking API Calls

```bash
# Mock Claude API
curl() {
  if [[ "$@" =~ "api.anthropic.com" ]]; then
    echo '{"content": [{"text": "# Mock Spec"}]}'
  else
    command curl "$@"
  fi
}
```

## Coverage

### Measuring Coverage

```bash
# Run tests with coverage (requires kcov)
kcov --exclude-pattern=test coverage bats test/

# View coverage report
open coverage/index.html
```

### Coverage Targets

- **Unit tests:** ≥80% line coverage
- **Integration tests:** ≥70% line coverage
- **E2E tests:** ≥50% line coverage
- **Overall:** ≥70% line coverage

## Continuous Integration

### CI Configuration

Example `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage.xml
```

## Performance Testing

### Benchmarking

```bash
@test "performance: validation should complete in <2s" {
  # Create scenario with 10 files
  for i in {1..10}; do
    echo "export const f$i = true;" > "src/file$i.ts"
    git add "src/file$i.ts"
  done
  git commit -m "feat: add files"

  # Time the validation
  start=$(date +%s%3N)
  validator_run
  end=$(date +%s%3N)

  duration=$((end - start))

  # Should complete in <2000ms
  [ $duration -lt 2000 ]
}
```

## Debugging Tests

### Debug Output

```bash
# Enable debug output in tests
export BATS_DEBUG=1

# Run with verbose output
bats -t test/modules/config.bats

# Print variables
@test "debug: show variable" {
  local var="value"
  echo "DEBUG: var=$var" >&3  # Print to test output
}
```

### Interactive Debugging

```bash
# Run test and drop into shell on failure
bats --verbose test/modules/config.bats

# Or add breakpoint in test
@test "debug: interactive" {
  # ... test code ...
  bash -i  # Drop into interactive shell
  # ... continue test ...
}
```

## Best Practices

### Test Organization

1. **One test per behavior**
   - Test one thing at a time
   - Clear test names describing behavior

2. **Arrange-Act-Assert pattern**
   - Set up test data (Arrange)
   - Execute function (Act)
   - Verify results (Assert)

3. **Independent tests**
   - Tests don't depend on each other
   - Can run in any order
   - Use setup/teardown for isolation

4. **Meaningful assertions**
   - Check specific values, not just "not empty"
   - Verify both positive and negative cases
   - Test edge cases

### Test Naming

```bash
# Good: Describes behavior
@test "config_load: should override with environment variables"

# Bad: Generic
@test "config test 1"

# Good: Specific scenario
@test "validator: should fail when spec missing"

# Bad: Vague
@test "validator works"
```

### Test Data

```bash
# Good: Minimal, relevant data
local config='{"mode": "strict"}'

# Bad: Large, complex data
local config=$(cat huge-config.json)

# Good: Use fixtures for complex data
local diff=$(cat test/fixtures/diffs/api-change.diff)
```

## Troubleshooting

### Common Issues

**Tests fail with "command not found":**
- Ensure bats is installed: `npm install -g bats`
- Check PATH includes bats

**Tests can't find modules:**
- Verify file paths in `source` statements
- Use `$BATS_TEST_DIRNAME` for relative paths

**Git operations fail:**
- Ensure test repo is initialized
- Set git user.email and user.name
- Check file permissions

**Cleanup doesn't run:**
- Use trap for cleanup: `trap cleanup EXIT`
- Don't exit from tests prematurely

### Debug Checklist

- [ ] Source modules correctly
- [ ] Set up test environment (git repo, files)
- [ ] Clean up after tests
- [ ] Use correct assertion functions
- [ ] Check file paths are correct
- [ ] Verify permissions on test files

## Resources

- [bats Documentation](https://bats-core.readthedocs.io/)
- [Bash Testing Best Practices](https://github.com/bats-core/bats-core/wiki/Best-practices)
- [Test-Driven Development with Bash](https://github.com/sstephenson/bats/wiki/Test-driven-development-with-Bash)
