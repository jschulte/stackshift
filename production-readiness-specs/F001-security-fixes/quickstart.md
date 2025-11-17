# Quickstart Guide: F001-security-fixes

**Target Audience:** Developers implementing the security fixes
**Estimated Time:** 2-3 hours for implementation + testing
**Difficulty:** Intermediate

---

## Overview

This guide walks you through implementing critical security fixes for the StackShift MCP server. You'll fix path traversal, resource exhaustion, and prototype pollution vulnerabilities in resource handlers.

**What you'll fix:**
- ✅ 3 resource handlers (state, progress, route)
- ✅ 1 skill loader (input validation)
- ✅ 1 type assertion (code quality)
- ✅ Add comprehensive security tests

**Estimated effort:** 4-6 hours total

---

## Prerequisites

### Required Knowledge
- ✅ TypeScript basics
- ✅ Node.js file system operations
- ✅ Basic security concepts (path traversal, etc.)
- ✅ Vitest testing framework

### Tools Needed
- ✅ Node.js >= 18.0.0
- ✅ npm
- ✅ Code editor (VS Code recommended)
- ✅ Git

### Before You Start
```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/jschulte/stackshift.git
cd stackshift

# 2. Install dependencies
npm install

# 3. Run existing tests to ensure baseline
cd mcp-server
npm test

# 4. Check current security test coverage
npm run test:coverage
# Look for: src/utils/security.test.ts (should be 100%)
# Look for: src/resources/*.test.ts (should be 0% - we'll fix this)
```

---

## Step-by-Step Implementation

### Phase 1: Fix Resource Handlers (2 hours)

#### Step 1.1: Open the vulnerable file

```bash
# Open in your editor
code mcp-server/src/resources/index.ts
```

**Current state (vulnerable):**
- Lines 23, 62, 124: Direct `process.cwd()` usage
- Lines 27, 65, 127: Unsafe file reads
- Lines 66, 128: Unsafe JSON parsing

#### Step 1.2: Add imports at the top

**Find this (around line 7):**
```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
```

**Add after it:**
```typescript
import { createDefaultValidator } from '../utils/security.js';
import { readJsonSafe } from '../utils/file-utils.js';
```

**Why?**
- `createDefaultValidator()`: Creates a path validator for current workspace
- `readJsonSafe()`: Reads JSON with size limits (10MB) and sanitization

#### Step 1.3: Fix `getStateResource()` function

**Find this (lines 22-55):**
```typescript
export async function getStateResource() {
  const directory = process.cwd();
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const state = await fs.readFile(stateFile, 'utf-8');
    return {
      contents: [
        {
          uri: 'stackshift://state',
          mimeType: 'application/json',
          text: state,
        },
      ],
    };
  } catch (error) {
    // ... error handling
  }
}
```

**Replace with:**
```typescript
export async function getStateResource() {
  // Create security validator
  const validator = createDefaultValidator();

  try {
    // Validate directory before using it
    const directory = validator.validateDirectory(process.cwd());
    const stateFile = path.join(directory, '.stackshift-state.json');

    // Use safe JSON read (with size limit and sanitization)
    const state = await readJsonSafe(stateFile);

    return {
      contents: [
        {
          uri: 'stackshift://state',
          mimeType: 'application/json',
          text: JSON.stringify(state, null, 2),  // state is now an object, stringify it
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: 'stackshift://state',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              error: 'No state file found',
              message: 'Run stackshift_analyze to initialize',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
```

**Key changes:**
1. ✅ Added `createDefaultValidator()` before file operations
2. ✅ Wrapped `process.cwd()` in `validator.validateDirectory()`
3. ✅ Replaced `fs.readFile()` with `readJsonSafe()`
4. ✅ Added `JSON.stringify()` since `state` is now an object (parsed)

#### Step 1.4: Fix `getProgressResource()` function

**Find this (lines 60-117):**
```typescript
export async function getProgressResource() {
  const directory = process.cwd();
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const stateData = await fs.readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateData);
    // ... rest of logic
  }
}
```

**Replace with:**
```typescript
export async function getProgressResource() {
  // Create security validator
  const validator = createDefaultValidator();

  try {
    // Validate directory before using it
    const directory = validator.validateDirectory(process.cwd());
    const stateFile = path.join(directory, '.stackshift-state.json');

    // Use safe JSON read (replaces readFile + JSON.parse)
    const state = await readJsonSafe(stateFile);

    // ... rest of logic (unchanged)
    const progress = GEARS.map(gear => {
      // ... existing logic
    });
    // ... return statement (unchanged)
  } catch (error) {
    // ... existing error handling (unchanged)
  }
}
```

**Key changes:**
1. ✅ Added validator
2. ✅ Wrapped `process.cwd()` in validation
3. ✅ Replaced `fs.readFile()` + `JSON.parse()` with `readJsonSafe()`
4. ✅ Rest of the function logic remains the same

#### Step 1.5: Fix `getRouteResource()` function

**Apply the same pattern to `getRouteResource()`** (lines 122-157)

```typescript
export async function getRouteResource() {
  // Create security validator
  const validator = createDefaultValidator();

  try {
    // Validate directory before using it
    const directory = validator.validateDirectory(process.cwd());
    const stateFile = path.join(directory, '.stackshift-state.json');

    // Use safe JSON read
    const state = await readJsonSafe(stateFile);

    // ... rest of logic (unchanged)
  } catch (error) {
    // ... existing error handling (unchanged)
  }
}
```

#### Step 1.6: Verify compilation

```bash
# Compile TypeScript to catch any errors
cd mcp-server
npm run build

# If successful, you'll see:
# ✓ Built successfully
```

**Common errors:**
- ❌ "Cannot find module '../utils/security.js'" → Check import path
- ❌ "Argument of type 'unknown' is not assignable" → Make sure you're using `readJsonSafe()` correctly

---

### Phase 2: Fix Skill Loader (1 hour)

#### Step 2.1: Open skill-loader.ts

```bash
code mcp-server/src/utils/skill-loader.ts
```

#### Step 2.2: Add validation to `loadSkillFile()` function

**Find this (lines 14-30):**
```typescript
export async function loadSkillFile(skillName: string): Promise<string | null> {
  const possiblePaths = [
    // If StackShift is installed locally
    path.join(
      process.env.HOME || '~',
      '.claude/plugins/marketplaces/jschulte/stackshift/skills',
      skillName,
      'SKILL.md'
    ),
    // ... more paths
  ];
}
```

**Replace with:**
```typescript
import { createDefaultValidator } from './security.js';  // Add at top of file
import { readFileSafe } from './file-utils.js';  // Add at top of file

export async function loadSkillFile(skillName: string): Promise<string | null> {
  // ===== VALIDATION SECTION (NEW) =====

  // Validate skill name: no path separators
  if (skillName.includes('/') || skillName.includes('\\') || skillName.includes('..')) {
    throw new Error(`Invalid skill name: cannot contain path separators`);
  }

  // Validate skill name: whitelist regex
  if (!/^[a-zA-Z0-9_-]+$/.test(skillName)) {
    throw new Error(`Invalid skill name: must be alphanumeric with hyphens/underscores only`);
  }

  // Validate HOME environment variable
  const homePath = process.env.HOME;
  if (!homePath || homePath.includes('\0')) {
    throw new Error('Invalid HOME environment variable');
  }

  // Create validator for HOME directory
  const validator = createDefaultValidator();
  const validatedHome = validator.validateDirectory(homePath);

  // ===== END VALIDATION SECTION =====

  const possiblePaths = [
    // If StackShift is installed locally (use validated HOME)
    path.join(
      validatedHome,  // ✅ Changed from process.env.HOME
      '.claude/plugins/marketplaces/jschulte/stackshift/skills',
      skillName,  // ✅ Already validated above
      'SKILL.md'
    ),

    // If running from StackShift repo
    path.join(__dirname, '../../plugin/skills', skillName, 'SKILL.md'),
    path.join(process.cwd(), '.stackshift/plugin/skills', skillName, 'SKILL.md'),

    // If in project directory after web bootstrap
    path.join(process.cwd(), 'plugin/skills', skillName, 'SKILL.md'),
  ];

  for (const filePath of possiblePaths) {
    try {
      const content = await readFileSafe(filePath);  // ✅ Use readFileSafe (10MB limit)
      if (content && content.length > 100) {
        console.error(`✅ Loaded SKILL.md from: ${filePath}`);
        return content;
      }
    } catch (error) {
      // File doesn't exist at this path, try next
      continue;
    }
  }

  console.error(`⚠️  Could not find SKILL.md for ${skillName}, using fallback`);
  return null;
}
```

**Key changes:**
1. ✅ Validate `skillName` parameter (no path separators, whitelist regex)
2. ✅ Validate `HOME` environment variable (not null, no null byte)
3. ✅ Use `validator.validateDirectory()` on HOME
4. ✅ Use `readFileSafe()` instead of `fs.readFile()`

#### Step 2.3: Verify compilation

```bash
npm run build
# Should compile without errors
```

---

### Phase 3: Fix Type Assertion (30 minutes)

#### Step 3.1: Open index.ts

```bash
code mcp-server/src/index.ts
```

#### Step 3.2: Find the cruise control handler (line ~237)

**Find this:**
```typescript
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler((args as any) || {});
```

**Replace with:**
```typescript
case 'stackshift_cruise_control':
  return await cruiseControlToolHandler(args || {} as CruiseControlArgs);
```

**Why?**
- Moves type assertion to the right side of `||`
- TypeScript can still validate that `args` matches expected type
- More type-safe than `(args as any)`

#### Step 3.3: Verify compilation

```bash
npm run build
# Should compile without errors
```

---

### Phase 4: Add Security Tests (2 hours)

#### Step 4.1: Create resource security tests

```bash
# Create test directory if it doesn't exist
mkdir -p mcp-server/src/resources/__tests__

# Create test file
code mcp-server/src/resources/__tests__/security.test.ts
```

**Add this content:**
```typescript
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStateResource, getProgressResource, getRouteResource } from '../index.js';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Resource Security Tests', () => {
  let testDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    // Create temp directory for testing
    testDir = await mkdtemp(join(tmpdir(), 'stackshift-test-'));

    // Mock process.cwd() to return test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;
  });

  afterEach(async () => {
    // Restore process.cwd()
    process.cwd = originalCwd;

    // Cleanup test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('getStateResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'brownfield',
          currentStep: 'analyze',
          completedSteps: [],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getStateResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('stackshift://state');
      expect(result.contents[0].mimeType).toBe('application/json');

      const state = JSON.parse(result.contents[0].text);
      expect(state.path).toBe('brownfield');
    });

    test('rejects file larger than 10MB', async () => {
      // Create large file (11MB)
      const stateFile = join(testDir, '.stackshift-state.json');
      const largeData = 'A'.repeat(11 * 1024 * 1024);
      await writeFile(stateFile, `{"data": "${largeData}"}`);

      // Should handle error gracefully
      const result = await getStateResource();

      // Should return error response (not throw)
      expect(result.contents[0].text).toContain('error');
    });

    test('strips dangerous JSON properties', async () => {
      // Create state file with prototype pollution attempt
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'greenfield',
          __proto__: { admin: true },
          constructor: { malicious: true },
          prototype: { hacked: true },
        })
      );

      // Call resource handler
      const result = await getStateResource();

      // Verify dangerous properties are removed
      const state = JSON.parse(result.contents[0].text);
      expect(state.__proto__).toBeUndefined();
      expect(state.constructor).toBeUndefined();
      expect(state.prototype).toBeUndefined();
    });

    test('returns error when state file not found', async () => {
      // Don't create state file

      // Call resource handler
      const result = await getStateResource();

      // Should return error response
      const response = JSON.parse(result.contents[0].text);
      expect(response.error).toBe('No state file found');
    });
  });

  describe('getProgressResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'brownfield',
          currentStep: 'analyze',
          completedSteps: ['analyze'],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getProgressResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toContain('StackShift Progress');
      expect(result.contents[0].text).toContain('Complete');
    });
  });

  describe('getRouteResource', () => {
    test('reads valid state file', async () => {
      // Create valid state file
      const stateFile = join(testDir, '.stackshift-state.json');
      await writeFile(
        stateFile,
        JSON.stringify({
          path: 'greenfield',
          currentStep: 'analyze',
          completedSteps: [],
          stepDetails: {},
        })
      );

      // Call resource handler
      const result = await getRouteResource();

      // Verify response
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toContain('Greenfield');
    });
  });
});
```

#### Step 4.2: Create skill loader security tests

```bash
code mcp-server/src/utils/__tests__/skill-loader.security.test.ts
```

**Add this content:**
```typescript
import { describe, test, expect } from 'vitest';
import { loadSkillFile } from '../skill-loader.js';

describe('Skill Loader Security Tests', () => {
  test('rejects skill name with forward slash', async () => {
    await expect(loadSkillFile('../etc/passwd')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with backslash', async () => {
    await expect(loadSkillFile('..\\windows\\system32')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with parent directory reference', async () => {
    await expect(loadSkillFile('..')).rejects.toThrow(
      'Invalid skill name: cannot contain path separators'
    );
  });

  test('rejects skill name with special characters', async () => {
    await expect(loadSkillFile('hack;rm -rf')).rejects.toThrow(
      'Invalid skill name: must be alphanumeric with hyphens/underscores only'
    );
  });

  test('rejects skill name with spaces', async () => {
    await expect(loadSkillFile('skill name')).rejects.toThrow(
      'Invalid skill name: must be alphanumeric with hyphens/underscores only'
    );
  });

  test('accepts valid skill name with hyphens', async () => {
    // This will return null (skill not found) but should not throw validation error
    const result = await loadSkillFile('reverse-engineer');
    // Either returns content or null, but doesn't throw
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  test('accepts valid skill name with underscores', async () => {
    const result = await loadSkillFile('create_specs');
    expect(typeof result === 'string' || result === null).toBe(true);
  });
});
```

#### Step 4.3: Run tests

```bash
# Run all tests
npm test

# Run only security tests
npm test security

# Check coverage
npm run test:coverage
```

**Expected results:**
- ✅ All tests pass
- ✅ Resources security tests: 5+ tests passing
- ✅ Skill loader security tests: 7+ tests passing
- ✅ Coverage: Resources module >80%

---

### Phase 5: Validation (30 minutes)

#### Step 5.1: Run full test suite

```bash
cd mcp-server
npm test
```

**Expected:** All tests pass (existing + new)

#### Step 5.2: Check type safety

```bash
npm run build
```

**Expected:** No TypeScript errors

#### Step 5.3: Run security audit

```bash
npm audit
```

**Expected:** 0 high or critical vulnerabilities

#### Step 5.4: Manual testing

```bash
# Start MCP server (if you have a test client)
npm run dev

# Or just verify it builds and runs
node dist/index.js
```

---

## Verification Checklist

Before considering the fix complete, verify:

**Code Changes:**
- [ ] ✅ All 3 resource handlers use `createDefaultValidator()`
- [ ] ✅ All file reads use `readJsonSafe()` or `readFileSafe()`
- [ ] ✅ Skill loader validates `skillName` parameter
- [ ] ✅ Skill loader validates `HOME` environment variable
- [ ] ✅ Type assertion fixed in cruise control handler
- [ ] ✅ No direct `process.cwd()` without validation

**Testing:**
- [ ] ✅ Added 5+ security tests for resources
- [ ] ✅ Added 7+ validation tests for skill loader
- [ ] ✅ All new tests pass
- [ ] ✅ All existing tests still pass
- [ ] ✅ Coverage: Resources >80%
- [ ] ✅ Coverage: Security module 100%

**Quality:**
- [ ] ✅ TypeScript compiles without errors
- [ ] ✅ No linting errors (if ESLint configured)
- [ ] ✅ `npm audit` shows 0 high/critical vulnerabilities

---

## Troubleshooting

### Problem: "Cannot find module '../utils/security.js'"

**Solution:**
Check your import path. In resources/index.ts, it should be:
```typescript
import { createDefaultValidator } from '../utils/security.js';
```

### Problem: "Type 'Promise<any>' is not assignable to type 'Promise<string>'"

**Solution:**
`readJsonSafe()` returns `any` (parsed JSON object). Make sure you're using `JSON.stringify()` when returning the resource:
```typescript
text: JSON.stringify(state, null, 2),  // ✅ Correct
// NOT:
text: state,  // ❌ Wrong - state is an object, not a string
```

### Problem: Tests fail with "ENOENT: no such file or directory"

**Solution:**
Make sure you're creating the state file in `testDir`:
```typescript
const stateFile = join(testDir, '.stackshift-state.json');
await writeFile(stateFile, JSON.stringify({...}));
```

### Problem: "File too large" error in production

**Solution:**
This is expected behavior if state file exceeds 10MB. Check why the state file is so large - it shouldn't be. Possible causes:
- Large `stepDetails` objects
- Corrupted state file
- Malicious file injection

**Fix:** Delete `.stackshift-state.json` and re-run `stackshift_analyze`

---

## Next Steps

After completing this implementation:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "fix(security): prevent path traversal and resource exhaustion in MCP resources

   - Add validation to all resource handlers
   - Use readJsonSafe for prototype pollution prevention
   - Validate skill loader inputs
   - Add comprehensive security tests

   Fixes: CWE-22, CWE-400, CWE-502
   CVSS: 7.5 (HIGH) → 0 (FIXED)"
   ```

2. **Push to feature branch**
   ```bash
   git push -u origin claude/plan-security-fixes-01SpAKwWbaX7Pr2wm1ti1j25
   ```

3. **Run CI/CD** (if configured)
   - Verify all tests pass in CI
   - Check coverage reports

4. **Create PR** (if needed)
   - Use spec-kit workflow: `/speckit.implement`
   - Include test results
   - Link to this spec: `production-readiness-specs/F001-security-fixes/spec.md`

---

## Success Criteria

You've successfully completed the fix when:

✅ **Security:**
- All file operations use validated paths
- No direct `process.cwd()` without validation
- All JSON reads use `readJsonSafe()`
- All file reads have size limits

✅ **Testing:**
- 12+ new security tests passing
- Existing tests still pass
- Coverage >80% for resources

✅ **Quality:**
- TypeScript compiles without errors
- `npm audit` shows 0 vulnerabilities
- Code follows existing patterns

---

## Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Fix resource handlers | 2 hours |
| 2 | Fix skill loader | 1 hour |
| 3 | Fix type assertion | 30 min |
| 4 | Add security tests | 2 hours |
| 5 | Validation & documentation | 30 min |
| **Total** | | **6 hours** |

---

## Resources

**Documentation:**
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22](https://cwe.mitre.org/data/definitions/22.html)
- [CWE-400](https://cwe.mitre.org/data/definitions/400.html)
- [CWE-502](https://cwe.mitre.org/data/definitions/502.html)

**Internal Docs:**
- `mcp-server/src/utils/security.ts` - Security validation implementation
- `mcp-server/src/utils/__tests__/security.test.ts` - Security test examples
- `.specify/memory/constitution.md` - StackShift development standards

**Get Help:**
- Review existing security tests for patterns
- Check `data-model.md` in this directory for validation rules
- Refer to `research.md` for design decisions

---

**Status:** ✅ Ready to use
**Last Updated:** 2025-11-17
