# F003: Test Coverage Improvements

## Overview

Improve test coverage from current 78.75% to 90%+ by adding tests for untested critical components, particularly the main server and resource handlers.

## Problem Statement

Critical gaps in test coverage:
1. **Main server (index.ts)**: 0% coverage - 305 lines untested
2. **Resource handlers**: 0% coverage - 157 lines untested
3. **Missing integration tests**: No E2E workflow testing
4. **Missing edge cases**: State recovery, concurrent access not tested

### Current Coverage

```
File               | % Lines | Uncovered Lines
-------------------|---------|------------------
All files          | 78.75   |
src/index.ts       | 0       | 1-305
src/resources      | 0       | 1-157
src/tools          | 98.49   | (excellent)
src/utils          | 95.67   | (excellent)
```

## Requirements

### Coverage Goals

1. **Overall Coverage Target: 90%**
   - Phase 1: 85% (add critical tests)
   - Phase 2: 88% (add integration tests)
   - Phase 3: 90%+ (comprehensive coverage)

2. **Per-Module Targets:**
   - index.ts: Minimum 80% coverage
   - resources/: Minimum 90% coverage
   - tools/: Maintain 98%+
   - utils/: Maintain 95%+

### Testing Requirements

#### Priority 0: Main Server Tests

**File:** `mcp-server/src/__tests__/index.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Mock the transport
vi.mock('@modelcontextprotocol/sdk/server/stdio.js');

describe('MCP Server', () => {
  describe('Server Initialization', () => {
    it('should create server with correct metadata', async () => {
      // Test server creation
      const server = new Server({
        name: 'stackshift-mcp',
        version: '1.0.0'
      });

      expect(server).toBeDefined();
      expect(server.name).toBe('stackshift-mcp');
    });

    it('should register all tool handlers', async () => {
      // Test that all 7 tools are registered
      const tools = [
        'stackshift_analyze',
        'stackshift_reverse_engineer',
        'stackshift_create_specs',
        'stackshift_gap_analysis',
        'stackshift_complete_spec',
        'stackshift_implement',
        'stackshift_cruise_control'
      ];

      // Verify each tool is available
      for (const tool of tools) {
        // Test tool registration
      }
    });

    it('should register all resource handlers', async () => {
      // Test resource registration
      const resources = [
        'stackshift://state',
        'stackshift://progress',
        'stackshift://route'
      ];

      // Verify each resource is available
    });
  });

  describe('Request Routing', () => {
    it('should route tool requests correctly', async () => {
      // Test each tool routing
    });

    it('should handle invalid tool names', async () => {
      // Test error handling for unknown tools
    });

    it('should validate tool arguments', async () => {
      // Test argument validation
    });
  });

  describe('Error Handling', () => {
    it('should handle transport errors gracefully', async () => {
      // Test transport failure scenarios
    });

    it('should handle tool execution errors', async () => {
      // Test when tool handler throws
    });

    it('should format error responses correctly', async () => {
      // Test error response format
    });
  });

  describe('Lifecycle Management', () => {
    it('should handle server startup', async () => {
      // Test server initialization
    });

    it('should handle server shutdown', async () => {
      // Test cleanup on shutdown
    });

    it('should handle concurrent requests', async () => {
      // Test parallel tool execution
    });
  });
});
```

#### Priority 0: Resource Handler Tests

**File:** `mcp-server/src/resources/__tests__/index.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStateResource, getProgressResource, getRouteResource } from '../index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

vi.mock('fs/promises');

describe('Resource Handlers', () => {
  describe('getStateResource', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return state when file exists', async () => {
      const mockState = {
        version: '1.0.0',
        created: '2024-01-01',
        currentStep: 'analyze',
        completedSteps: []
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getStateResource();

      expect(result).toEqual({
        uri: 'stackshift://state',
        name: 'StackShift State',
        mimeType: 'application/json',
        text: JSON.stringify(mockState, null, 2)
      });
    });

    it('should handle missing state file', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(
        new Error('ENOENT: no such file')
      );

      const result = await getStateResource();

      expect(result.text).toContain('not initialized');
    });

    it('should handle corrupted JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        'invalid json{'
      );

      await expect(getStateResource()).rejects.toThrow();
    });

    it('should enforce size limits', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024); // 11MB
      vi.mocked(fs.readFile).mockResolvedValueOnce(largeData);

      await expect(getStateResource()).rejects.toThrow();
    });

    it('should validate directory access', async () => {
      // Test security validation
      const originalCwd = process.cwd;
      process.cwd = () => '/etc/passwd/../';

      await expect(getStateResource()).rejects.toThrow();

      process.cwd = originalCwd;
    });
  });

  describe('getProgressResource', () => {
    it('should calculate progress correctly', async () => {
      const mockState = {
        completedSteps: ['analyze', 'reverse-engineer'],
        currentStep: 'create-specs',
        stepDetails: {
          'analyze': { completed: true },
          'reverse-engineer': { completed: true }
        }
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getProgressResource();

      expect(result.mimeType).toBe('text/markdown');
      expect(result.text).toContain('33%'); // 2/6 steps
      expect(result.text).toContain('Current: create-specs');
    });

    it('should handle greenfield vs brownfield routes', async () => {
      const mockState = {
        completedSteps: ['analyze'],
        path: 'greenfield',
        stepDetails: {}
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getProgressResource();

      expect(result.text).toContain('greenfield');
      expect(result.text).toContain('16%'); // 1/6 steps
    });

    it('should show completed status', async () => {
      const mockState = {
        completedSteps: [
          'analyze',
          'reverse-engineer',
          'create-specs',
          'gap-analysis',
          'complete-spec',
          'implement'
        ],
        currentStep: 'completed'
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getProgressResource();

      expect(result.text).toContain('100%');
      expect(result.text).toContain('All gears completed');
    });
  });

  describe('getRouteResource', () => {
    it('should return route information', async () => {
      const mockState = {
        path: 'brownfield'
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getRouteResource();

      expect(result.name).toBe('Selected Route');
      expect(result.text).toContain('brownfield');
    });

    it('should handle missing route', async () => {
      const mockState = {};

      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify(mockState)
      );

      const result = await getRouteResource();

      expect(result.text).toBe('Route not yet selected');
    });
  });

  describe('Security Validation', () => {
    it('should prevent path traversal attacks', async () => {
      // Test ../../../etc/passwd style attacks
    });

    it('should validate process.cwd()', async () => {
      // Test that cwd is validated before use
    });

    it('should sanitize JSON before parsing', async () => {
      // Test prototype pollution prevention
    });
  });
});
```

#### Priority 1: Integration Tests

**File:** `mcp-server/src/__tests__/integration.test.ts`

```typescript
describe('E2E Workflow Tests', () => {
  describe('Complete Greenfield Workflow', () => {
    it('should complete all 6 gears sequentially', async () => {
      // 1. Run analyze
      const analyzeResult = await runTool('stackshift_analyze', {
        directory: testProjectDir
      });
      expect(analyzeResult).toContain('Analysis Complete');

      // 2. Run reverse-engineer
      const reverseResult = await runTool('stackshift_reverse_engineer', {
        directory: testProjectDir
      });
      expect(reverseResult).toContain('8 comprehensive documents');

      // 3. Run create-specs
      // ... continue through all 6 gears
    });

    it('should handle interruption and resume', async () => {
      // Start workflow
      await runTool('stackshift_analyze', { directory: testDir });

      // Simulate interruption
      await corruptStateFile();

      // Attempt resume
      const result = await runTool('stackshift_reverse_engineer', {
        directory: testDir
      });

      // Should recover or provide clear error
      expect(result).toContain('recovery');
    });
  });

  describe('Concurrent Access', () => {
    it('should handle multiple processes safely', async () => {
      // Spawn multiple processes
      const processes = await Promise.all([
        spawnProcess('analyze'),
        spawnProcess('analyze'),
        spawnProcess('analyze')
      ]);

      // Only one should succeed
      const successful = processes.filter(p => p.success);
      expect(successful.length).toBe(1);
    });
  });

  describe('Large Codebase Handling', () => {
    it('should handle 10k+ files', async () => {
      // Create large test project
      await createLargeTestProject(10000);

      const result = await runTool('stackshift_analyze', {
        directory: largeProjectDir
      });

      expect(result).toContain('completeness');
      expect(result).not.toContain('error');
    });
  });
});
```

#### Priority 2: State Recovery Tests

**File:** `mcp-server/src/utils/__tests__/state-recovery.test.ts`

```typescript
describe('State Recovery Scenarios', () => {
  it('should recover from corrupted JSON', async () => {
    // Write corrupted state
    await fs.writeFile(stateFile, '{"invalid": json}');

    const manager = new StateManager(testDir);

    // Should either recover or provide clear error
    const result = await manager.load().catch(e => e);
    expect(result).toBeDefined();
  });

  it('should maintain backup files', async () => {
    const manager = new StateManager(testDir);

    // Make multiple saves
    for (let i = 0; i < 5; i++) {
      await manager.save({ version: i });
    }

    // Should have max 3 backups
    const backups = await findBackupFiles();
    expect(backups.length).toBeLessThanOrEqual(3);
  });

  it('should recover from backup automatically', async () => {
    // Create valid backup
    const validState = { version: '1.0.0', currentStep: 'analyze' };
    await fs.writeFile(`${stateFile}.bak`, JSON.stringify(validState));

    // Corrupt main file
    await fs.writeFile(stateFile, 'corrupted');

    const manager = new StateManager(testDir);
    const state = await manager.load();

    expect(state.version).toBe('1.0.0');
  });
});
```

### Coverage Configuration

**File:** `mcp-server/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      }
    }
  }
});
```

### CI/CD Configuration

**File:** `.github/workflows/ci.yml`

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage thresholds
  run: |
    coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$coverage < 85" | bc -l) )); then
      echo "Coverage $coverage% is below 85% threshold"
      exit 1
    fi

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

## Success Criteria

1. Overall test coverage ≥ 85% (Phase 1)
2. Main server (index.ts) coverage ≥ 80%
3. Resource handlers coverage ≥ 90%
4. All critical paths tested
5. CI enforces coverage thresholds
6. Coverage badge in README

## Dependencies

- Existing test infrastructure (Vitest)
- No new test frameworks needed

## Non-Goals

- Not achieving 100% coverage (diminishing returns)
- Not testing third-party library internals
- Not testing type definitions

## Timeline

### Phase 1: Critical Tests (Week 1)
- **Effort:** 8-11 hours
- Main server tests: 25-30 tests
- Resource handler tests: 20-25 tests
- **Target:** 85% overall coverage

### Phase 2: Integration Tests (Week 2)
- **Effort:** 11-14 hours
- E2E workflow tests
- Concurrent access tests
- State recovery tests
- **Target:** 88% overall coverage

### Phase 3: Comprehensive Coverage (Week 3)
- **Effort:** 8-10 hours
- Edge cases
- Performance tests
- Additional scenarios
- **Target:** 90%+ overall coverage

## References

- Vitest Documentation: https://vitest.dev/
- Test Coverage Best Practices: https://martinfowler.com/bliki/TestCoverage.html
- Integration Testing: https://martinfowler.com/bliki/IntegrationTest.html