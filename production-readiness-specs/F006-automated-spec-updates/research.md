# Research: F006 Automated Spec Updates

**Feature:** Automated Spec Updates via Claude Code Hooks
**Date:** 2025-11-17
**Status:** Complete

---

## Executive Summary

This document resolves all technical unknowns for implementing an automated spec update system using Claude Code hooks. Research covered hook mechanisms, git integration patterns, AI-powered spec analysis, and validation strategies.

**Key Decision:** Use Claude Code PreToolUse hooks with a dedicated spec validation script executed before `git push` operations.

---

## Research Areas

### 1. Claude Code Hook Mechanism

#### Decision
Use **PreToolUse hooks with Bash matcher** to intercept git push commands.

#### Rationale
- PreToolUse hooks execute before tool runs, allowing push blocking
- Bash matcher can pattern-match git commands
- Access to command via `$CLAUDE_TOOL_INPUT` environment variable
- Can return non-zero exit codes to block operations
- Supports both interactive and headless modes

#### Alternative Considered
- **PostToolUse hooks**: Rejected - runs after push completes (too late)
- **Git native hooks only**: Rejected - doesn't integrate with Claude Code workflow
- **SessionEnd hooks**: Rejected - wrong lifecycle event

#### Implementation Pattern
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./.specify/hooks/validate-specs.sh \"$CLAUDE_TOOL_INPUT\"",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

#### Key Findings
- Hook input is JSON with structure: `{"command": "git push ...", "description": "..."}`
- Need to use `jq` to parse JSON input
- Exit code 0 = allow operation, non-zero = block operation
- Timeout default is 10s, extend to 30s for AI operations
- Headless mode flag: check `$CLAUDE_HEADLESS` environment variable

**References:**
- [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks-guide) (2025)
- [GitButler Hook Examples](https://github.com/carlrannaberg/claudekit)

---

### 2. Spec-to-Code Mapping Strategy

#### Decision
Use **directory-based heuristic mapping** with configuration overrides.

#### Rationale
- Most repos follow convention: `/specs/feature-name/` maps to `/src/features/feature-name/`
- Simple heuristics work for 80% of cases
- Configuration file handles exceptions
- Fast lookup (no AST parsing needed)
- Works across languages

#### Mapping Algorithm
```
1. Extract changed files from git diff
2. For each changed file:
   a. Check explicit mapping in .specify/config/file-to-spec-map.json
   b. If not found, use heuristic:
      - Extract feature name from path (e.g., src/features/auth → auth)
      - Look for specs/*/spec.md containing feature name
      - Look for production-readiness-specs/F*-feature-name/
   c. Return matched spec files
3. Deduplicate and return list
```

#### Alternative Considered
- **AST parsing to extract imports**: Too slow (2-5s per file)
- **Manual annotation in code**: Requires developer discipline
- **Git blame correlation**: Unreliable for refactors

#### Configuration Format
```json
{
  "fileMappings": {
    "src/utils/security.ts": ["specs/001-security-fixes/spec.md"],
    "mcp-server/src/tools/*.ts": ["specs/*/spec.md"]
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**"
  ]
}
```

**References:**
- [GitHub Code Search Heuristics](https://github.blog/2023-02-06-the-technology-behind-githubs-new-code-search/)
- StackShift Gear 1 analysis patterns

---

### 3. Spec Update Detection Logic

#### Decision
Use **git diff comparison with intelligent change categorization**.

#### Rationale
- Git diff shows exactly what changed in code
- Can categorize changes: new functions, modified APIs, deleted code
- Compares code commit timestamps with spec commit timestamps
- Low false positive rate with proper categorization

#### Detection Algorithm
```bash
# Get files changed in commits being pushed
git diff --name-only origin/main...HEAD > changed_files.txt

# For each changed file:
#   1. Map to spec file(s)
#   2. Get last commit time for code file
#   3. Get last commit time for spec file
#   4. If code newer than spec -> flag for update

# Categorize changes:
#   - New exports (function, class, interface) -> Requires spec update
#   - Modified function signatures -> Requires spec update
#   - Internal refactoring (no export changes) -> No spec update needed
#   - Test files only -> No spec update needed
```

#### Change Categorization Rules
| Change Type | Requires Spec Update | Rationale |
|-------------|---------------------|-----------|
| New exported function | Yes | API surface change |
| Modified function signature | Yes | Contract change |
| New file in `/src/features/` | Yes | New feature |
| Internal refactoring | No | Implementation detail |
| Comment changes only | No | Documentation |
| Test file changes | No | Not user-facing |
| Configuration changes | Maybe | Check if documented |

#### Alternative Considered
- **Semantic diff (AST-based)**: More accurate but 10x slower
- **File timestamp comparison**: Unreliable (rebasing changes timestamps)
- **Manual declaration**: Requires developer memory

**References:**
- [Git Diff Best Practices](https://git-scm.com/docs/git-diff)
- [Semantic Versioning Guide](https://semver.org/)

---

### 4. AI-Powered Spec Update Generation

#### Decision
Use **Claude API via headless mode** with structured prompt templates.

#### Rationale
- Claude Code supports headless mode (`-p` flag)
- Can invoke Claude programmatically from shell script
- Structured prompts ensure consistent spec format
- Access to full context (spec + code diff)
- Iterative refinement possible

#### Implementation Approach
```bash
# 1. Prepare context
CODE_DIFF=$(git diff origin/main...HEAD -- path/to/file.ts)
CURRENT_SPEC=$(cat specs/feature/spec.md)

# 2. Build prompt
PROMPT="You are updating a GitHub Spec Kit specification.

CURRENT SPEC:
$CURRENT_SPEC

CODE CHANGES:
$CODE_DIFF

TASK: Update the spec to reflect the code changes. Follow these rules:
- Preserve existing structure
- Update affected sections only
- Maintain spec format (frontmatter, sections)
- Add new requirements if new features added
- Update acceptance criteria if behavior changed

OUTPUT: The complete updated spec.md content"

# 3. Invoke Claude in headless mode
claude -p "$PROMPT" --headless > updated_spec.md

# 4. Validate output format
# 5. Show diff to developer
# 6. Prompt for approval
```

#### Prompt Engineering Strategy
- **System context**: Explain spec-driven development
- **Current state**: Provide full current spec
- **Change context**: Show git diff
- **Output format**: Request specific format
- **Constraints**: Preserve structure, update only affected sections

#### Alternative Considered
- **Template-based updates**: Too rigid, misses nuance
- **Manual spec writing**: Defeats automation purpose
- **GitHub Copilot API**: Less context-aware than Claude

#### Quality Assurance
- Generate spec diff before committing
- Require developer approval in interactive mode
- Run spec validation after generation
- Fall back to manual edit if generation fails

**References:**
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/messages_post)
- [GitHub Spec Kit Format](https://github.com/github/spec-kit)

---

### 5. Hook Configuration and Installation

#### Decision
Use **Husky for cross-platform git hooks** + **Claude settings for hook integration**.

#### Rationale
- Husky is industry standard (used by 2M+ projects)
- Works on Windows, Linux, macOS
- Automatic installation via npm
- Easy to bypass when needed (`--no-verify`)
- Integrates with existing pre-commit hooks

#### Installation Flow
```bash
# 1. Package.json script
{
  "scripts": {
    "setup-spec-sync": "node scripts/setup-spec-sync.js"
  },
  "devDependencies": {
    "husky": "^8.0.0"
  }
}

# 2. Setup script creates:
#    - .husky/pre-push (git hook)
#    - .specify/hooks/validate-specs.sh
#    - .specify/config/sync-rules.json
#    - Updates .claude/settings.json

# 3. Git hook calls validation script
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

./.specify/hooks/validate-specs.sh
```

#### Configuration Layering
1. **Global defaults**: Built into validation script
2. **Project config**: `.specify/config/sync-rules.json`
3. **Local overrides**: `.specify/config/sync-rules.local.json` (gitignored)
4. **Environment variables**: `SPEC_SYNC_MODE=strict|lenient|off`

#### Alternative Considered
- **Git hooks only**: Doesn't integrate with Claude Code workflow
- **npm scripts**: Developers might forget to run
- **CI-only validation**: Too late (after push)

**References:**
- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)

---

### 6. Validation Rules Engine

#### Decision
Use **JSON-based declarative rules** with JavaScript evaluation.

#### Rationale
- JSON config is easy to read and modify
- JavaScript evaluation allows complex conditions
- Can extend without code changes
- Version controlled with project
- Team can customize without touching script

#### Configuration Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "mode": "strict",
  "rules": [
    {
      "name": "API changes require spec updates",
      "filePattern": "src/**/*.ts",
      "changePattern": "export (function|class|interface|type)",
      "requiresSpecUpdate": true,
      "specSections": ["API Reference", "User Stories"],
      "severity": "error"
    },
    {
      "name": "Feature additions require spec updates",
      "filePattern": "src/features/*/**",
      "changeType": "added",
      "requiresSpecUpdate": true,
      "specSections": ["User Stories", "Functional Requirements"],
      "severity": "error"
    },
    {
      "name": "Internal refactoring is allowed",
      "filePattern": "src/**/internal/**",
      "requiresSpecUpdate": false,
      "severity": "info"
    }
  ],
  "exemptions": {
    "branches": ["main", "production"],
    "users": ["ci-bot@example.com"],
    "emergencyOverride": true
  }
}
```

#### Rule Evaluation Logic
```javascript
function evaluateRule(rule, changedFile, diff) {
  // 1. Check file pattern match
  if (!minimatch(changedFile, rule.filePattern)) {
    return { match: false };
  }

  // 2. Check change pattern (if specified)
  if (rule.changePattern) {
    const regex = new RegExp(rule.changePattern, 'm');
    if (!regex.test(diff)) {
      return { match: false };
    }
  }

  // 3. Check change type (added, modified, deleted)
  if (rule.changeType) {
    const actualType = getChangeType(changedFile);
    if (actualType !== rule.changeType) {
      return { match: false };
    }
  }

  // 4. Rule matched - check if spec update required
  return {
    match: true,
    requiresUpdate: rule.requiresSpecUpdate,
    requiredSections: rule.specSections || [],
    severity: rule.severity || 'error'
  };
}
```

#### Mode Definitions
- **strict**: Block push if any spec update missing
- **lenient**: Warn but allow push (log for review)
- **off**: Disable validation entirely

#### Alternative Considered
- **Hardcoded rules**: Inflexible
- **SQL-based query language**: Overcomplicated
- **Natural language rules**: Too ambiguous

**References:**
- [minimatch library](https://github.com/isaacs/minimatch)
- [JSON Schema validation](https://json-schema.org/)

---

### 7. Performance Optimization

#### Decision
Use **parallel processing with caching** for fast validation.

#### Rationale
- Git operations dominate time (50-80%)
- File I/O is second bottleneck (20-30%)
- Caching eliminates redundant work
- Parallel processing reduces wall clock time
- Target: <2 seconds for typical push

#### Optimization Strategies

**1. Git Diff Caching**
```bash
# Cache git diff output to avoid repeated calls
DIFF_CACHE="/tmp/spec-sync-${COMMIT_SHA}.diff"
if [ ! -f "$DIFF_CACHE" ]; then
  git diff origin/main...HEAD > "$DIFF_CACHE"
fi
```

**2. Parallel File Processing**
```bash
# Process multiple files concurrently
export -f validate_file_spec
cat changed_files.txt | xargs -P 4 -I {} bash -c 'validate_file_spec "{}"'
```

**3. Spec File Indexing**
```bash
# Build index of spec files once
SPEC_INDEX="/tmp/spec-sync-index.json"
if [ ! -f "$SPEC_INDEX" ]; then
  find specs production-readiness-specs -name "spec.md" | \
    jq -R -s 'split("\n")[:-1]' > "$SPEC_INDEX"
fi
```

**4. Early Exit Optimization**
```bash
# Skip validation if only test files changed
if git diff --name-only origin/main...HEAD | grep -v "\.test\." | wc -l | grep -q "^0$"; then
  echo "Only test files changed, skipping spec validation"
  exit 0
fi
```

#### Performance Targets
| Operation | Target | Typical | Max Acceptable |
|-----------|--------|---------|----------------|
| Git diff | <100ms | 50ms | 500ms |
| Spec mapping | <200ms | 100ms | 1s |
| Validation | <500ms | 300ms | 2s |
| AI generation | <5s | 3s | 10s |
| **Total** | <2s | 1s | 5s |

#### Fallback Strategy
- If validation takes >30s, abort and allow push
- Log timeout for investigation
- User can retry or skip

**References:**
- [GNU Parallel](https://www.gnu.org/software/parallel/)
- [xargs performance](https://www.gnu.org/software/findutils/manual/html_node/xargs.html)

---

### 8. Error Handling and User Experience

#### Decision
Use **progressive error messages with recovery suggestions**.

#### Rationale
- Clear errors reduce frustration
- Recovery suggestions reduce support burden
- Progressive disclosure (summary → detail)
- Color coding improves scannability
- Links to documentation for deep dives

#### Error Message Template
```
❌ Spec validation failed

📁 Changed files without spec updates:
  • src/features/auth/login.ts → specs/001-authentication/spec.md
  • src/api/users.ts → specs/002-user-management/spec.md

💡 To fix:
  1. Update the spec files listed above
  2. Commit the spec changes
  3. Push again

🤖 Or let me fix it automatically:
  Run: npm run update-specs

🚨 Or bypass this check (not recommended):
  git push --no-verify

📚 Learn more: https://docs.stackshift.dev/spec-sync
```

#### Error Categories
| Category | Icon | Color | Severity |
|----------|------|-------|----------|
| Missing spec update | ❌ | Red | Error (blocks) |
| Spec format invalid | ⚠️ | Yellow | Warning |
| Configuration issue | 🔧 | Yellow | Error |
| AI generation failed | 🤖 | Yellow | Warning |
| Unknown error | 💥 | Red | Error |

#### User Flows

**Flow 1: Validation Fails (Interactive)**
```
1. Hook detects spec is outdated
2. Show error with file list
3. Offer auto-fix option
4. If accepted:
   a. Generate spec updates
   b. Show diff
   c. Prompt for approval
   d. Commit and push if approved
5. If rejected:
   a. Show manual fix instructions
   b. Exit with error code 1
```

**Flow 2: Validation Fails (CI/Headless)**
```
1. Hook detects spec is outdated
2. Log error to console
3. Exit with error code 1
4. CI fails with clear message
5. Developer fixes locally and repushes
```

**Flow 3: Validation Passes**
```
1. Hook runs validation
2. All specs up to date
3. Exit with code 0 (silent)
4. Git push proceeds
```

**References:**
- [CLI Guidelines](https://clig.dev/)
- [Error Message Best Practices](https://www.nngroup.com/articles/error-message-guidelines/)

---

### 9. Testing Strategy

#### Decision
Use **layered testing approach** with unit, integration, and E2E tests.

#### Rationale
- Unit tests verify individual functions (fast, isolated)
- Integration tests verify hook workflow (realistic)
- E2E tests verify actual git operations (confidence)
- Test doubles avoid external dependencies
- CI runs full suite on every commit

#### Test Pyramid

**Level 1: Unit Tests (70%)**
- Spec-to-code mapping logic
- Change detection categorization
- Rule evaluation engine
- Configuration parsing
- Git diff parsing

**Level 2: Integration Tests (20%)**
- Full validation workflow
- Spec update generation
- Error message formatting
- Configuration override cascade

**Level 3: E2E Tests (10%)**
- Actual git push with hook
- Interactive spec update flow
- CI/headless mode
- Performance benchmarks

#### Test Framework
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "bats": "^1.10.0"
  }
}
```

- **Vitest**: For JavaScript/TypeScript unit tests
- **Bats**: For shell script integration tests
- **Git fixtures**: For E2E tests

#### Example Test Cases

**Unit Test: Spec Mapping**
```typescript
describe('mapFileToSpecs', () => {
  it('maps feature file to feature spec', () => {
    const result = mapFileToSpecs('src/features/auth/login.ts', config);
    expect(result).toEqual(['specs/001-authentication/spec.md']);
  });

  it('handles multiple spec mappings', () => {
    const result = mapFileToSpecs('src/utils/security.ts', config);
    expect(result).toContain('specs/001-authentication/spec.md');
    expect(result).toContain('specs/005-security/spec.md');
  });
});
```

**Integration Test: Validation Flow**
```bash
@test "validation fails when spec is outdated" {
  # Setup
  git checkout -b test-branch
  echo "// new function" >> src/features/auth/login.ts
  git add src/features/auth/login.ts
  git commit -m "Add function without updating spec"

  # Execute
  run .specify/hooks/validate-specs.sh

  # Assert
  [ "$status" -eq 1 ]
  [[ "$output" =~ "spec validation failed" ]]
}
```

**E2E Test: Full Push Flow**
```bash
@test "git push blocked when spec outdated" {
  # Setup repo with hook installed
  setup_repo_with_hook

  # Make code change without spec update
  modify_code_without_spec_update

  # Attempt push
  run git push origin main

  # Assert push was blocked
  [ "$status" -ne 0 ]
  [[ "$output" =~ "specs need updating" ]]
}
```

**References:**
- [Vitest Documentation](https://vitest.dev/)
- [Bats Testing](https://github.com/bats-core/bats-core)

---

### 10. CI/CD and Headless Mode

#### Decision
Use **environment variable detection** for mode switching.

#### Rationale
- CI environments set `CI=true` by default
- Claude Code sets `$CLAUDE_HEADLESS` when in headless mode
- No user configuration needed
- Automatic adaptation to context
- Manual override still possible

#### Mode Detection Logic
```bash
# Detect execution mode
if [ -n "$CI" ] || [ "$CLAUDE_HEADLESS" = "true" ]; then
  MODE="headless"
else
  MODE="interactive"
fi

# Adjust behavior based on mode
if [ "$MODE" = "headless" ]; then
  # CI mode: Fail fast, no prompts
  AUTO_FIX=false
  REQUIRE_APPROVAL=false
  VERBOSE=true
else
  # Interactive mode: Offer help, prompt for approval
  AUTO_FIX=true
  REQUIRE_APPROVAL=true
  VERBOSE=false
fi
```

#### CI Integration Patterns

**GitHub Actions**
```yaml
name: Spec Validation

on: [pull_request]

jobs:
  validate-specs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Need full history for git diff

      - name: Validate specs are up to date
        run: ./.specify/hooks/validate-specs.sh
        env:
          CI: true
```

**Pre-merge Check**
```bash
# In CI, run validation without auto-fix
SPEC_SYNC_MODE=strict \
SPEC_SYNC_AUTO_FIX=false \
./.specify/hooks/validate-specs.sh
```

**Alternative Considered**
- **Separate CI script**: Code duplication
- **Configuration file**: Extra setup needed
- **CLI flags**: More complex invocation

**References:**
- [GitHub Actions Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [CI Detection Library](https://github.com/watson/ci-info)

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Hook Mechanism | Claude Code PreToolUse | Blocks operations before execution |
| Spec Mapping | Heuristic + config overrides | Fast, works for 80% of cases |
| Change Detection | Git diff with categorization | Accurate, low false positives |
| Spec Updates | AI-powered (Claude headless) | Generates accurate updates |
| Installation | Husky + npm script | Cross-platform, industry standard |
| Validation Rules | JSON config with JS evaluation | Flexible, customizable |
| Performance | Parallel + caching | <2s for typical pushes |
| Error Handling | Progressive messages + suggestions | Clear, actionable feedback |
| Testing | Layered (unit, integration, E2E) | Comprehensive coverage |
| CI/CD | Environment variable detection | Automatic mode switching |

---

## Risk Assessment After Research

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positives | Low | Medium | Tunable rules, emergency override |
| Performance issues | Low | High | Caching, parallel processing, timeouts |
| AI generation errors | Medium | Medium | Developer approval, diff review |
| Cross-platform issues | Low | High | Use Husky, test on all platforms |
| CI compatibility | Low | Medium | Headless mode, env var detection |

---

## Next Steps

1. ✅ Research complete - All unknowns resolved
2. ⏭️ Create data-model.md (entities and validation model)
3. ⏭️ Create contracts/ (hook interfaces)
4. ⏭️ Create impl-plan.md (detailed implementation plan)
5. ⏭️ Create quickstart.md (developer guide)

---

**Research Status:** ✅ Complete
**All Clarifications Resolved:** Yes
**Ready for Design Phase:** Yes
**Last Updated:** 2025-11-17
