# Spec Sync Architecture

Technical architecture and design decisions for the automated specification synchronization system.

## System Overview

The Spec Sync system is a pre-push validation hook that ensures code changes have corresponding specification updates before allowing git pushes.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Action                           │
│                      git push origin                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Claude Code Hook System                     │
│             PreToolUse → Bash Matcher                        │
└────────────────────┬────────────────────────────────────────┘
                     │ $CLAUDE_TOOL_INPUT (JSON)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              .specify/hooks/validate-specs.sh                │
│                  Main Entry Point                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Check emergency bypass (SKIP_SPEC_SYNC)          │   │
│  │ 2. Parse input and detect git push command          │   │
│  │ 3. Load configuration                                │   │
│  │ 4. Check mode (strict/lenient/off)                   │   │
│  │ 5. Check exemptions (branch/user)                    │   │
│  │ 6. Run validation                                    │   │
│  │ 7. Handle failures (show errors, run auto-fix)      │   │
│  │ 8. Exit with status code (0=pass, 1=fail)           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬────────────┬───────────┐
         ▼                       ▼            ▼           ▼
    ┌─────────┐          ┌──────────────┐ ┌──────┐  ┌──────────┐
    │ Config  │          │ Git Analyzer │ │Mapper│  │Validator │
    │ Module  │          │    Module    │ │Module│  │  Module  │
    └─────────┘          └──────────────┘ └──────┘  └──────────┘
         │                       │            │           │
         │                       │            │           │
         ▼                       ▼            ▼           ▼
    ┌─────────────────────────────────────────────────────────┐
    │            Categorizer Module                            │
    │  (Determines if spec update is required)                 │
    └─────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                          ┌──────────────┐
                          │  Auto-Fix    │
                          │   Module     │
                          │  (Optional)  │
                          └──────────────┘
```

## Core Modules

### 1. validate-specs.sh (Main Entry Point)

**Responsibility:** Orchestrate the validation flow

**Key functions:**
- `main()`: Entry point, coordinates all steps

**Workflow:**
1. Emergency bypass check
2. Input parsing and git push detection
3. Configuration loading
4. Mode and exemption checks
5. Validation execution
6. Result formatting and display
7. Auto-fix invocation (if enabled)
8. Exit with appropriate status code

**Exit codes:**
- `0`: Validation passed or lenient mode
- `1`: Validation failed in strict mode

### 2. config.sh (Configuration Module)

**Responsibility:** Configuration loading and merging

**Key functions:**
- `config_load()`: Load and merge configurations
- `config_get_mode()`: Get current mode (strict/lenient/off)
- `config_should_ignore()`: Check if file should be ignored
- `config_get_rules()`: Get validation rules
- `config_matches_pattern()`: Match file against glob pattern
- `config_evaluate_rule()`: Evaluate rule against file/changes
- `config_is_branch_exempted()`: Check branch exemptions
- `config_is_user_exempted()`: Check user exemptions

**Configuration precedence:**
1. Default config (hardcoded in module)
2. Project config (`.specify/config/sync-rules.json`)
3. Local config (`.specify/config/sync-rules.local.json`)
4. Environment variables (`SPEC_SYNC_*`)

**Data flow:**
```
defaults.json
    ↓ (merge)
sync-rules.json
    ↓ (merge)
sync-rules.local.json
    ↓ (override)
environment variables
    ↓
final config object
```

### 3. git-analyzer.sh (Git Module)

**Responsibility:** Git repository analysis

**Key functions:**
- `git_get_context()`: Extract repository metadata
- `git_get_changed_files()`: List files changed in current commits
- `git_get_file_diff()`: Get diff for specific file
- `git_get_last_commit_time()`: Get timestamp of last commit touching file
- `git_has_changes()`: Check if there are any changes to validate

**Returns:** JSON objects with git metadata

**Example output:**
```json
{
  "repository": "stackshift",
  "branch": "feature/auth",
  "commits": ["abc123", "def456"],
  "changedFiles": [
    {
      "path": "src/features/auth.ts",
      "changeType": "modified",
      "additions": 42,
      "deletions": 10
    }
  ]
}
```

### 4. mapper.sh (File-to-Spec Mapper)

**Responsibility:** Map code files to their related specifications

**Key functions:**
- `mapper_find_specs()`: Find all related specs for a file
- `mapper_check_explicit()`: Check explicit mappings in config
- `mapper_heuristic_match()`: Use heuristics to find specs

**Mapping strategies:**

1. **Explicit mapping** (Priority 1)
   - Check `fileMappings` in config
   - Exact matches or glob patterns
   - Example: `src/cli/**.ts` → `specs/F001-cli/spec.md`

2. **Heuristic matching** (Priority 2)
   - Extract feature name from file path
   - Search specs for matching names
   - Confidence scoring based on similarity

**Heuristic patterns:**
```
src/features/auth/login.ts
    ↓ extract "auth"
    ↓ search specs
production-readiness-specs/F002-auth/spec.md (match!)
```

**Returns:** Array of spec paths with confidence scores

### 5. categorizer.sh (Change Categorizer)

**Responsibility:** Categorize code changes to determine if spec updates are required

**Key functions:**
- `categorizer_analyze()`: Analyze a file's changes and return category

**Change categories:**
- `test_only`: Test files only → no spec update needed
- `documentation`: Markdown files → no spec update needed
- `api_change`: Export changes → spec update required
- `feature_addition`: New feature files → spec update required
- `feature_modification`: Modified feature → spec update required
- `comments_only`: Only comments changed → no spec update needed
- `rule_matched`: Custom rule matched → follow rule config
- `internal_refactor`: Internal changes → no spec update needed (default)

**Detection logic:**
```bash
# Test files
*.test.ts, *.spec.ts, __tests__/

# API changes
grep '^[+-]\s*export\s+(function|class|interface|type)'

# Feature files
/features/**

# Comments only
grep -v '^[+-]\s*//' (filter out comment changes)
```

**Returns:** JSON with category and evidence

### 6. validator.sh (Validation Module)

**Responsibility:** Core validation logic

**Key functions:**
- `validator_check_file()`: Validate single file
- `validator_run()`: Validate all changed files

**Validation algorithm:**

For each changed file:
1. Get file diff
2. Categorize change
3. If no spec update required → PASS
4. Find related specs (via mapper)
5. If no specs found → WARNING
6. Compare timestamps:
   - code_time = last commit touching code file
   - spec_time = last commit touching spec file
   - if code_time > spec_time → FAIL (spec outdated)
   - else → PASS
7. Return result

**Returns:** Array of validation results

### 7. auto-fix.sh (Auto-Fix Module)

**Responsibility:** AI-powered automatic spec updates

**Key functions:**
- `autofix_generate_update()`: Generate spec update using Claude AI
- `autofix_show_diff()`: Display proposed changes
- `autofix_prompt_approval()`: Interactive approval
- `autofix_apply_update()`: Write spec file
- `autofix_file()`: Run auto-fix for single file
- `autofix_run()`: Run auto-fix for all failures

**AI integration:**
- Uses Anthropic Claude API
- Model: `claude-sonnet-4-5-20250929`
- Prompt template: `.specify/config/prompt-templates/spec-update.txt`
- Context: file diff + current spec content

**Workflow:**
1. Detect validation failure
2. Load prompt template
3. Inject file diff and current spec
4. Call Claude API
5. Parse generated spec
6. Show diff to user
7. Prompt for approval (if interactive)
8. Apply changes
9. Re-validate

**Modes:**
- **Interactive:** Requires user approval (default)
- **Headless:** Auto-applies in CI environments

## Data Models

### Configuration Object

```typescript
interface Config {
  mode: "strict" | "lenient" | "off";
  autoFix: boolean;
  requireApproval: boolean;
  fileMappings: Record<string, string[]>;
  ignorePatterns: string[];
  rules: Rule[];
  exemptions: {
    branches: string[];
    users: string[];
    emergencyOverride: boolean;
  };
  timeout: number;
  parallel: boolean;
  maxParallel: number;
}
```

### Rule Object

```typescript
interface Rule {
  name: string;
  id: string;
  filePattern: string;  // Glob pattern
  changePattern?: string;  // Regex pattern
  requiresSpecUpdate: boolean;
  specSections?: string[];
  severity: "error" | "warning" | "info";
  enabled: boolean;
  priority: number;
}
```

### Validation Result

```typescript
interface ValidationResult {
  filePath: string;
  status: "pass" | "fail" | "warning";
  reason?: string;
  failureReason?: string;
  requiredAction?: string;
  specResults?: SpecResult[];
  validationTime: number;
}

interface SpecResult {
  specPath: string;
  status: "up_to_date" | "outdated" | "missing";
  lastSpecUpdate: string;  // ISO 8601 timestamp
  lastCodeUpdate: string;  // ISO 8601 timestamp
  suggestedUpdate?: string;
  autoFixAvailable?: boolean;
}
```

## Design Decisions

### 1. Bash Implementation

**Decision:** Implement in Bash 4.0+

**Rationale:**
- Native integration with git hooks
- No runtime dependencies (bash is always available)
- Fast startup time
- Direct shell command execution

**Trade-offs:**
- More verbose than high-level languages
- Requires careful quoting and error handling
- Limited data structure support (use jq for JSON)

### 2. Claude Code Hook Integration

**Decision:** Use Claude Code PreToolUse hooks with Bash matcher

**Rationale:**
- Intercepts git commands before execution
- Access to full command context
- Can block operations before they complete
- Seamless integration with developer workflow

**Alternative considered:**
- Git pre-push hooks (traditional)
- Rejected because: less flexible, harder to bypass, no Claude Code integration

### 3. Timestamp-Based Validation

**Decision:** Compare git commit timestamps

**Rationale:**
- Simple and reliable
- Works offline
- Fast comparison
- Git already tracks timestamps

**Alternative considered:**
- Content-based diffing
- Rejected because: slower, more complex, false positives

### 4. Heuristic File Mapping

**Decision:** Feature name extraction + fuzzy matching

**Rationale:**
- Works without explicit configuration
- Reduces setup overhead
- Good default behavior

**Trade-off:**
- May have false positives (user can override with explicit mappings)

### 5. Modular Architecture

**Decision:** Split into separate module files

**Rationale:**
- Easier to test individual components
- Clear separation of concerns
- Can source modules independently
- Enables parallel development

### 6. JSON for Data Exchange

**Decision:** Use JSON for all inter-module communication

**Rationale:**
- Standardized format
- Easy parsing with jq
- Supports nested structures
- Language-agnostic (future compatibility)

**Trade-off:**
- Requires jq dependency
- Slightly more overhead than plain text

## Performance Considerations

### Target Performance

- **Hook initialization:** <100ms
- **Per-file validation:** <200ms
- **Total validation (10 files):** <2s

### Optimizations

1. **Early exits**
   - Check mode=off immediately
   - Return early on ignored files
   - Skip validation if no changes

2. **Caching**
   - Cache config load result
   - Store git context in variables
   - Reuse file diffs

3. **Parallel processing**
   - Validate multiple files concurrently
   - Limit parallelism with `maxParallel`

4. **Efficient patterns**
   - Use `grep -q` for existence checks
   - Avoid expensive regex when possible
   - Minimize git command invocations

## Security

### Security Principles

1. **Input validation**
   - Validate all external input
   - Check file paths for traversal
   - Sanitize regex patterns

2. **No command injection**
   - Quote all variables
   - Use jq for JSON parsing
   - Avoid eval or uncontrolled execution

3. **Secrets management**
   - API keys via environment variables only
   - Never log sensitive data
   - Don't commit local config files

4. **Sandboxing**
   - Hook runs in repository context
   - No network access (except auto-fix API)
   - Read-only operations (except auto-fix writes)

## Error Handling

### Error Strategy

1. **Fail fast**
   - Use `set -e` for automatic exit on errors
   - Return non-zero for failures

2. **Graceful degradation**
   - Continue if optional features fail
   - Warn but don't block for non-critical issues

3. **Clear error messages**
   - Human-readable descriptions
   - Actionable fix instructions
   - Context about what failed

### Error Recovery

- Emergency bypass: `SKIP_SPEC_SYNC=1`
- Mode switching: `SPEC_SYNC_MODE=lenient`
- Local overrides: `.specify/config/sync-rules.local.json`

## Testing Strategy

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

### Test Levels

1. **Unit tests** (70%)
   - Test individual modules in isolation
   - Mock dependencies
   - Fast execution

2. **Integration tests** (20%)
   - Test module interactions
   - Real git repositories
   - End-to-end workflows

3. **E2E tests** (10%)
   - Test actual git push scenarios
   - Full hook execution
   - Cross-platform validation

## Future Enhancements

### Planned Features

1. **MCP Server Integration**
   - Expose validation as MCP server
   - Support VS Code + Copilot
   - Real-time validation

2. **Performance Optimizations**
   - Incremental validation (only new commits)
   - Parallel file processing
   - Result caching

3. **Enhanced AI Integration**
   - Multi-model support (GPT, Gemini)
   - Spec generation from scratch
   - Automated acceptance criteria

4. **Better Reporting**
   - HTML validation reports
   - Metrics and analytics
   - Dashboard integration

5. **IDE Integration**
   - VS Code extension
   - Real-time validation feedback
   - Inline spec suggestions

## Maintenance

### Backwards Compatibility

- Maintain config schema compatibility
- Support old and new format (with warnings)
- Provide migration guides for breaking changes

### Versioning

Follow semantic versioning:
- MAJOR: Breaking config changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Deprecation Process

1. Announce deprecation (1 minor version ahead)
2. Warn in logs when deprecated feature used
3. Remove in next major version

## References

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide/Practices)
- [jq Manual](https://stedolan.github.io/jq/manual/)
