# F002: Error Handling and Edge Case Improvements

## Overview

Improve error handling throughout StackShift to provide better user experience, clearer recovery guidance, and robust handling of edge cases.

## Problem Statement

Current error handling issues:
1. Generic error messages without recovery steps
2. Silent error swallowing in some code paths
3. No state file backup/recovery mechanism
4. Missing progress feedback for long operations
5. No handling of corrupted state files
6. Poor error messages in plugin skills

### Impact

- Users get stuck when errors occur
- No clear recovery path from failures
- Lost work when state file corrupts
- Poor user experience during long operations
- Difficult to debug issues

## Requirements

### Error Message Requirements

1. **All errors MUST include:**
   - Clear description of what went wrong
   - Which gear/operation was in progress
   - Specific recovery steps
   - Links to documentation when relevant

2. **Error format standard:**
```typescript
class StackShiftError extends Error {
  constructor(
    message: string,
    public readonly context: {
      gear: string;
      operation: string;
      suggestions: string[];
    }
  ) {
    super(message);
    this.name = 'StackShiftError';
  }
}
```

### State Recovery Requirements

1. **Automatic state backups**
   - Create .bak file before each write
   - Maintain last 3 backups with timestamps
   - Atomic write operations

2. **Corruption detection and recovery**
   - Validate JSON structure on load
   - Detect incomplete writes
   - Provide recovery instructions
   - Auto-recover from backup when possible

3. **State file missing handling**
   - Clear message about missing state
   - Instructions to initialize or restore
   - Check for backup files

### Progress Tracking Requirements

1. **Long operations (>5 minutes)**
   - Update user every 2-3 minutes
   - Show concrete progress metrics
   - Estimate time remaining
   - Allow pause/resume

2. **Progress format:**
```markdown
## Progress Update
- Current Phase: Analyzing backend APIs
- Files Processed: 45/120
- Time Elapsed: 8 minutes
- Estimated Remaining: 12 minutes
- To pause: Type 'pause' or press Ctrl+C
```

### Implementation Details

#### Enhancement 1: State Manager Improvements

**File:** `mcp-server/src/utils/state-manager.ts`

```typescript
class StateManager {
  private readonly maxBackups = 3;

  async createBackup(): Promise<void> {
    if (await fileExists(this.stateFile)) {
      const timestamp = Date.now();
      const backupPath = `${this.stateFile}.bak.${timestamp}`;
      await fs.copyFile(this.stateFile, backupPath);

      // Clean old backups
      await this.cleanOldBackups();
    }
  }

  async load(): Promise<State> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');

      if (data.length > 10 * 1024 * 1024) {
        throw new StackShiftError(
          'State file too large (>10MB)',
          {
            gear: 'State Management',
            operation: 'Loading state file',
            suggestions: [
              'Check if state file has been corrupted',
              'Delete and restart: rm .stackshift-state.json',
              'Contact support if issue persists'
            ]
          }
        );
      }

      const parsed = JSON.parse(data);
      const validation = this.validateState(parsed);

      if (!validation.valid) {
        await this.handleCorruptedState(validation.errors);
      }

      return parsed;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new StackShiftError(
          'State file not found',
          {
            gear: 'State Management',
            operation: 'Loading state file',
            suggestions: [
              'Run stackshift_analyze to initialize',
              'Check for backup: ls -la .stackshift-state.json.bak*',
              'Verify you are in the correct directory'
            ]
          }
        );
      }
      throw error;
    }
  }

  private async handleCorruptedState(errors: string[]): Promise<void> {
    // Backup corrupted file
    const corruptPath = `${this.stateFile}.corrupted.${Date.now()}`;
    await fs.copyFile(this.stateFile, corruptPath);

    // Try to recover from backup
    const backups = await this.findBackups();
    if (backups.length > 0) {
      const latestBackup = backups[0];
      await fs.copyFile(latestBackup, this.stateFile);

      console.log(`Recovered from backup: ${latestBackup}`);
      return;
    }

    throw new StackShiftError(
      `State file corrupted: ${errors.join(', ')}`,
      {
        gear: 'State Management',
        operation: 'Validating state structure',
        suggestions: [
          `Corrupted file saved to: ${corruptPath}`,
          'Start fresh: rm .stackshift-state.json && run analyze',
          'Manually fix JSON and retry',
          'Check .stackshift-state.json.bak* for backups'
        ]
      }
    );
  }
}
```

#### Enhancement 2: Plugin Skills Error Handling

**Add to each SKILL.md file:**

```markdown
## Error Handling

### Common Issues and Recovery

#### Issue: Prerequisites Missing
**Error:** "Previous step not completed - analysis-report.md not found"
**Recovery Steps:**
1. Check current state: `cat .stackshift-state.json | grep currentStep`
2. Run previous gear: `/stackshift analyze`
3. Verify output exists: `ls -la analysis-report.md`

#### Issue: Operation Timeout
**Error:** "Operation taking longer than expected (>30 minutes)"
**Recovery Steps:**
1. Check if still processing (look for activity)
2. Save partial progress: Current work is auto-saved
3. Resume: Re-run the same gear to continue

#### Issue: State File Corrupted
**Error:** "State file is invalid or corrupted"
**Recovery Steps:**
1. Check for backup: `ls -la .stackshift-state.json.bak*`
2. Restore latest backup: `cp .stackshift-state.json.bak .stackshift-state.json`
3. Or start fresh: `rm .stackshift-state.json`

### Progress Tracking

For operations >5 minutes, I will provide updates:
- Every 2-3 minutes with current progress
- Concrete metrics (files processed, time remaining)
- Option to pause by typing 'pause'
```

#### Enhancement 3: Progress Tracking Implementation

**File:** `mcp-server/src/tools/reverse-engineer.ts`

```typescript
class ProgressTracker {
  private startTime: number;
  private lastUpdate: number;
  private itemsProcessed: number = 0;
  private totalItems: number;

  constructor(totalItems: number) {
    this.totalItems = totalItems;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
  }

  shouldUpdate(): boolean {
    const elapsed = Date.now() - this.lastUpdate;
    return elapsed > 2 * 60 * 1000; // 2 minutes
  }

  update(processed: number): string | null {
    this.itemsProcessed = processed;

    if (!this.shouldUpdate()) {
      return null;
    }

    this.lastUpdate = Date.now();

    const elapsed = Math.round((Date.now() - this.startTime) / 1000 / 60);
    const rate = this.itemsProcessed / elapsed;
    const remaining = Math.round((this.totalItems - this.itemsProcessed) / rate);

    return `
## Progress Update
- Current Phase: Analyzing codebase structure
- Files Processed: ${this.itemsProcessed}/${this.totalItems}
- Time Elapsed: ${elapsed} minutes
- Estimated Remaining: ${remaining} minutes
- To pause: Save current state and re-run later
    `.trim();
  }
}
```

#### Enhancement 4: Web Bootstrap Error Handling

**File:** `web/WEB_BOOTSTRAP.md`

```markdown
## Error Handling

### Download Failures
```bash
# With retry logic
max_retries=3
retry_count=0

while [ $retry_count -lt $max_retries ]; do
  if curl -fL https://github.com/jschulte/stackshift/archive/refs/tags/v1.0.0.tar.gz -o stackshift.tar.gz; then
    echo "✅ Download successful"
    break
  else
    retry_count=$((retry_count + 1))
    echo "⚠️ Download failed (attempt $retry_count/$max_retries)"

    if [ $retry_count -eq $max_retries ]; then
      echo "❌ Download failed after $max_retries attempts"
      echo "Possible causes:"
      echo "  - Network connectivity issues"
      echo "  - GitHub rate limiting (wait 1 hour)"
      echo "  - Invalid version tag"
      exit 1
    fi

    echo "Retrying in 10 seconds..."
    sleep 10
  fi
done
```

### Session Interruption Recovery
```bash
# Check for interrupted session
if [[ -f .stackshift-state.json ]]; then
  echo "🔄 Previous session detected!"

  # Show progress
  current_step=$(cat .stackshift-state.json | grep -o '"currentStep":"[^"]*"' | cut -d'"' -f4)
  completed=$(cat .stackshift-state.json | grep -o '"completedSteps":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l)

  echo "Current Step: $current_step"
  echo "Completed Steps: $completed/6"
  echo ""
  echo "Options:"
  echo "1. Continue from current step"
  echo "2. Start over (delete state)"
  echo ""
  read -p "Choice (1/2): " choice

  if [[ "$choice" == "2" ]]; then
    rm .stackshift-state.json
    echo "Starting fresh..."
  else
    echo "Resuming from $current_step..."
  fi
fi
```
```

### Testing Requirements

1. **Error Path Testing**
   - Test each error condition
   - Verify recovery steps work
   - Test backup/restore functionality
   - Test progress tracking

2. **Edge Case Testing**
   - Corrupted state files
   - Missing prerequisites
   - Large codebases
   - Interrupted operations

## Success Criteria

1. All errors include recovery steps
2. State backups created automatically
3. Progress updates for operations >5 minutes
4. Corrupted state files can be recovered
5. Web bootstrap handles all failure modes
6. Users can recover from any error state

## Dependencies

- No new external dependencies
- Uses existing file system operations
- Built on current error classes

## Non-Goals

- Not implementing full telemetry/monitoring
- Not adding external error tracking services
- Not changing core functionality

## Timeline

- **Estimated Effort:** 8-10 hours
- **Priority:** P1 - High priority
- **Testing:** 3 additional hours

## Rollback Plan

Error handling improvements are additive:
1. Can be rolled back without breaking functionality
2. Feature flag for enhanced error messages
3. Gradual rollout per component

## References

- Error Handling Best Practices: https://www.toptal.com/nodejs/node-js-error-handling
- State Machine Recovery: https://martinfowler.com/articles/patterns-of-distributed-systems/state-watch.html