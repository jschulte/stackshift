# Test Fixtures

This directory contains static test data used across the test suite.

## Directory Structure

```
fixtures/
├── state/              # State file fixtures
│   ├── valid-state.json          # Valid complete state
│   ├── complete-state.json       # All gears completed
│   ├── corrupted-state.json      # Invalid JSON syntax
│   └── proto-pollution.json      # Prototype pollution test
└── .gitignore          # Ignore dynamic test files
```

## State Fixtures

### valid-state.json

A valid state file with typical structure:

```json
{
  "version": "1.0.0",
  "created": "2024-01-01T00:00:00Z",
  "currentStep": "analyze",
  "completedSteps": ["analyze"],
  "path": "brownfield"
}
```

**Used in:**
- Resource handler tests
- State validation tests
- Integration tests

### complete-state.json

State representing completed workflow (all 6 gears):

```json
{
  "version": "1.0.0",
  "currentStep": "completed",
  "completedSteps": [
    "analyze",
    "reverse-engineer",
    "create-specs",
    "gap-analysis",
    "complete-spec",
    "implement"
  ],
  "path": "greenfield"
}
```

**Used in:**
- Progress calculation tests (100% complete)
- Workflow completion tests

### corrupted-state.json

Invalid JSON for testing error handling:

```json
{"version": "1.0.0", "invalid": json}
```

**Used in:**
- Error handling tests
- State validation tests
- Recovery mechanism tests

### proto-pollution.json

Security test for prototype pollution:

```json
{
  "__proto__": { "polluted": true },
  "version": "1.0.0"
}
```

**Used in:**
- Security validation tests
- State sanitization tests
- Prototype pollution prevention tests

## Usage

### In Tests

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load fixture
const fixturePath = join(__dirname, 'fixtures/state/valid-state.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf-8'));

// Use in test
await writeFile(
  join(testDir, '.stackshift-state.json'),
  JSON.stringify(fixture)
);
```

### Creating New Fixtures

1. Add file to appropriate subdirectory
2. Document in this README
3. Reference in test comments
4. Keep fixtures minimal and focused

## Best Practices

### DO:
- ✅ Keep fixtures small and focused
- ✅ Use realistic data structures
- ✅ Document purpose and usage
- ✅ Version fixtures when schemas change

### DON'T:
- ❌ Include sensitive data
- ❌ Create large/complex fixtures
- ❌ Duplicate similar fixtures
- ❌ Use fixtures for dynamic data

## Dynamic Test Data

Dynamic test data (created during test execution) should be:
- Generated in test setup (`beforeEach`)
- Cleaned up in teardown (`afterEach`)
- Stored in isolated temp directories
- Not committed to version control

Example:
```typescript
let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));

  // Create dynamic test data
  await writeFile(
    join(testDir, '.stackshift-state.json'),
    JSON.stringify({ /* test-specific state */ })
  );
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});
```

## Maintenance

When updating fixtures:

1. **Check usage** - Find all tests using the fixture
2. **Update tests** - Ensure tests still pass
3. **Document changes** - Update this README
4. **Review impact** - Check coverage reports

## Related Documentation

- [Testing Guide](../../docs/guides/TESTING.md)
- [State Manager](../../utils/state-manager.ts)
- [Security Tests](../../utils/__tests__/security.test.ts)
