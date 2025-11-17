# Tasks: F006 Automated Spec Updates

**Feature:** Automated Spec Updates via Claude Code Hooks
**Branch:** `claude/plan-automated-spec-updates-0116xQ21mnj6czT8sNt9bre1`
**Status:** Ready for Implementation
**Created:** 2025-11-17

---

## Overview

**Goal:** Implement a Claude Code Hook system that automatically validates code and specifications remain synchronized before git pushes.

**Tech Stack:**
- Bash 4.0+ (shell scripting)
- jq 1.6+ (JSON processing)
- Git 2.x+ (version control)
- Claude Code (hook system)
- Husky 8.x (git hook management)
- Node.js ≥18.0.0 (npm scripts)

**Prerequisites:**
- Git, bash, and jq installed
- Node.js ≥18.0.0
- Claude Code with hook support

**Test Strategy:** Unit tests (70%), Integration tests (20%), E2E tests (10%)

---

## Task Summary

**Total Tasks:** 48
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1 - Validation): 11 tasks
- Phase 4 (US3 - Configuration): 8 tasks
- Phase 5 (US2 - Auto-Fix): 9 tasks
- Phase 6 (Polish): 8 tasks

**Parallel Opportunities:** 18 tasks marked [P]
**Estimated Effort:** 24-36 hours (Core: 24h, With Auto-Fix: 36h)

---

## Phase 1: Setup (Shared Infrastructure)

**Goal:** Initialize project structure and install dependencies

**Deliverables:**
- Directory structure created
- Husky installed and configured
- Base configuration files

**Estimated Time:** 1-1.5 hours

### Tasks

- [X] T001 Create `.specify/hooks/modules` directory structure
- [X] T002 Create `.specify/config` directory for configuration files
- [X] T003 [P] Install Husky via npm: `npm install --save-dev husky`
- [X] T004 [P] Initialize Husky git hooks: `npx husky install`
- [X] T005 Create `.gitignore` entry for `.specify/config/sync-rules.local.json`

**Acceptance Criteria:**
- [ ] Directory structure matches specification
- [ ] Husky installed and functional
- [ ] Git hooks directory created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal:** Core infrastructure required before ANY user story begins

**Deliverables:**
- Configuration loading system
- Git analysis utilities
- File-to-spec mapping foundation
- Change categorization logic

**Estimated Time:** 6-8 hours

**CRITICAL:** No user story work proceeds until this phase completes.

### Tasks

- [X] T006 [P] Create default configuration schema in `.specify/config/sync-rules.json`
- [X] T007 [P] Implement `config_load()` function in `.specify/hooks/modules/config.sh`
- [X] T008 [P] Implement `config_get_mode()` function in `.specify/hooks/modules/config.sh`
- [X] T009 [P] Implement `config_should_ignore()` function in `.specify/hooks/modules/config.sh`
- [X] T010 [P] Implement `git_get_context()` function in `.specify/hooks/modules/git-analyzer.sh`
- [X] T011 [P] Implement `git_get_changed_files()` function in `.specify/hooks/modules/git-analyzer.sh`
- [X] T012 [P] Implement `git_get_file_diff()` and `git_get_last_commit_time()` in `.specify/hooks/modules/git-analyzer.sh`
- [X] T013 [P] Implement `mapper_find_specs()` function in `.specify/hooks/modules/mapper.sh`
- [X] T014 [P] Implement `mapper_check_explicit()` function in `.specify/hooks/modules/mapper.sh`
- [X] T015 [P] Implement `mapper_heuristic_match()` function in `.specify/hooks/modules/mapper.sh`
- [X] T016 [P] Implement `categorizer_analyze()` function in `.specify/hooks/modules/categorizer.sh`
- [ ] T017 Add unit tests for config module in `test/modules/config.bats`
- [ ] T018 Add unit tests for git-analyzer module in `test/modules/git-analyzer.bats`
- [ ] T019 Add unit tests for mapper module in `test/modules/mapper.bats`
- [ ] T020 Add unit tests for categorizer module in `test/modules/categorizer.bats`

**Acceptance Criteria:**
- [ ] All foundational modules implement core functions
- [ ] Configuration loads with defaults and merges project/local configs
- [ ] Git operations extract context and changed files
- [ ] Mapping logic finds specs via explicit config and heuristics
- [ ] Categorizer detects API changes, test files, documentation
- [ ] Unit tests pass with ≥80% coverage

**Parallel Execution:**
```bash
# All module implementations (T006-T016) can run concurrently
# Test writing (T017-T020) can run after modules complete
```

---

## Phase 3: User Story 1 - Automatic Spec Validation Before Push

**Goal:** Implement validation that blocks pushes when specs are outdated

**User Story:**
> As a developer working in a spec-driven project, I want my git pre-push hook to automatically validate that my code changes have corresponding spec updates, so that I never push code without updating documentation.

**Acceptance Criteria:**
- Pre-push hook automatically configured
- Hook detects code changes in commits being pushed
- Hook validates that related spec files have been updated
- Hook blocks push if spec updates are missing
- Hook provides clear error messages

**Independent Test Criteria:**
- [ ] Hook detects when code changed without spec update
- [ ] Hook allows push when spec updated after code
- [ ] Hook correctly identifies test-only changes (allows push)
- [ ] Emergency bypass works (`SKIP_SPEC_SYNC=1`)
- [ ] Performance: validation completes in <2 seconds

**Estimated Time:** 8-10 hours

### Tasks

- [X] T021 [US1] Implement `validator_check_file()` function in `.specify/hooks/modules/validator.sh`
- [X] T022 [US1] Implement `validator_run()` function in `.specify/hooks/modules/validator.sh`
- [X] T023 [US1] Create main hook entry point in `.specify/hooks/validate-specs.sh`
- [X] T024 [US1] Add JSON input parsing from `$CLAUDE_TOOL_INPUT` in `.specify/hooks/validate-specs.sh`
- [X] T025 [US1] Add git push detection logic in `.specify/hooks/validate-specs.sh`
- [X] T026 [US1] Add validation execution and result formatting in `.specify/hooks/validate-specs.sh`
- [X] T027 [US1] Add emergency bypass check for `SKIP_SPEC_SYNC` in `.specify/hooks/validate-specs.sh`
- [X] T028 [US1] Configure Claude Code PreToolUse hook in `.claude/settings.json`
- [X] T029 [US1] Make `.specify/hooks/validate-specs.sh` executable: `chmod +x`
- [ ] T030 [US1] Add unit tests for validator module in `test/modules/validator.bats`
- [ ] T031 [US1] Add integration test: outdated spec blocks push in `test/integration/validation.bats`
- [ ] T032 [US1] Add integration test: up-to-date spec allows push in `test/integration/validation.bats`
- [ ] T033 [US1] Add integration test: test-only changes allowed in `test/integration/validation.bats`
- [ ] T034 [US1] Add integration test: emergency bypass works in `test/integration/validation.bats`
- [ ] T035 [US1] Add E2E test: actual git push with hook in `test/e2e/push.bats`

**Acceptance Criteria:**
- [ ] Validator compares code vs spec timestamps
- [ ] Main hook parses input and runs validation
- [ ] Hook exits with code 0 (pass) or 1 (fail)
- [ ] Claude Code hook triggers on `git push` commands
- [ ] Clear error messages show which specs need updates
- [ ] All tests pass

**Parallel Execution:**
```bash
# Validator implementation (T021-T022) can run in parallel with hook entry point (T023-T027)
# Tests (T030-T035) can run after implementation complete
```

**MVP Scope:** This user story alone delivers a functional validation system

---

## Phase 4: User Story 3 - Configurable Validation Rules

**Goal:** Allow project maintainers to configure validation rules

**User Story:**
> As a project maintainer, I want to configure which code changes require spec updates, so that we can enforce our documentation standards.

**Acceptance Criteria:**
- Configuration file defines validation rules
- Rules specify which file patterns require spec updates
- Rules specify minimum spec update requirements
- Hook can be disabled for specific branches or scenarios
- Configuration supports strict, lenient, and off modes

**Independent Test Criteria:**
- [ ] Rules match file patterns correctly (glob patterns)
- [ ] Rules detect export changes via regex
- [ ] Strict mode blocks push when validation fails
- [ ] Lenient mode warns but allows push
- [ ] Off mode skips validation entirely
- [ ] Branch exemptions work (e.g., main branch exempt)

**Estimated Time:** 6-8 hours

### Tasks

- [ ] T036 [US3] Create JSON schema for validation rules in `.specify/config/sync-rules.json`
- [ ] T037 [P] [US3] Add rule evaluation logic to `config.sh`: `config_evaluate_rule()`
- [ ] T038 [P] [US3] Add file pattern matching (glob) to `config.sh`: `config_matches_pattern()`
- [ ] T039 [P] [US3] Add change pattern matching (regex) to `categorizer.sh`
- [ ] T040 [US3] Update validator to use configurable rules from `config.sh`
- [ ] T041 [US3] Add mode-based behavior (strict/lenient/off) to `.specify/hooks/validate-specs.sh`
- [ ] T042 [US3] Add branch exemption logic to `.specify/hooks/validate-specs.sh`
- [ ] T043 [US3] Add user exemption logic to `.specify/hooks/validate-specs.sh`
- [ ] T044 [US3] Create example rules in `.specify/config/sync-rules.json` (API changes, features, refactors)
- [ ] T045 [US3] Add tests for rule evaluation in `test/modules/config.bats`
- [ ] T046 [US3] Add integration test: strict mode blocks push in `test/integration/modes.bats`
- [ ] T047 [US3] Add integration test: lenient mode allows push in `test/integration/modes.bats`
- [ ] T048 [US3] Add integration test: off mode skips validation in `test/integration/modes.bats`

**Acceptance Criteria:**
- [ ] Rules engine evaluates file patterns and change patterns
- [ ] Multiple rules supported with priority ordering
- [ ] Configuration loads and merges correctly (default → project → local)
- [ ] Environment variables override config (`SPEC_SYNC_MODE`)
- [ ] All modes work as specified
- [ ] Tests pass

**Parallel Execution:**
```bash
# Rule logic (T037-T039) can run in parallel
# Integration (T040-T043) must run after rule logic
# Tests (T045-T048) run after implementation
```

---

## Phase 5: User Story 2 - Automatic Spec Updates (Optional)

**Goal:** AI-powered automatic spec update generation

**User Story:**
> As a developer implementing a feature, I want the pre-push hook to automatically update specs when I forget, so that I don't have to manually synchronize documentation.

**Acceptance Criteria:**
- Hook analyzes code changes to determine which specs are affected
- Hook uses AI (Claude) to generate spec updates automatically
- Hook creates a new commit with spec updates before pushing
- Developer can review and approve auto-generated spec changes
- Hook supports both interactive and CI/headless modes

**Independent Test Criteria:**
- [ ] AI generates spec updates from code diffs
- [ ] Generated specs match GitHub Spec Kit format ≥90% of time
- [ ] Interactive mode prompts for approval before applying
- [ ] Headless mode applies updates automatically (if configured)
- [ ] Generated updates are committed separately
- [ ] Validation re-runs after auto-fix and passes

**Estimated Time:** 12-16 hours

**Note:** This is optional P1. Phase 3-4 deliver a fully functional validation system.

### Tasks

- [ ] T049 [P] [US2] Create auto-fix module in `.specify/hooks/modules/auto-fix.sh`
- [ ] T050 [P] [US2] Implement `autofix_generate_update()` function using Claude headless mode
- [ ] T051 [P] [US2] Implement `autofix_show_diff()` function to display proposed changes
- [ ] T052 [P] [US2] Implement `autofix_prompt_approval()` function for interactive mode
- [ ] T053 [P] [US2] Implement `autofix_apply_update()` function to write spec files
- [ ] T054 [US2] Integrate auto-fix into `.specify/hooks/validate-specs.sh` main flow
- [ ] T055 [US2] Add auto-fix trigger logic: check `autoFix` config setting
- [ ] T056 [US2] Add approval workflow: show diff, prompt, apply if approved
- [ ] T057 [US2] Add auto-commit logic for approved spec updates
- [ ] T058 [US2] Add re-validation after auto-fix completes
- [ ] T059 [US2] Create prompt templates for spec update generation
- [ ] T060 [US2] Add unit tests for auto-fix module in `test/modules/auto-fix.bats`
- [ ] T061 [US2] Add integration test: auto-fix generates valid spec in `test/integration/auto-fix.bats`
- [ ] T062 [US2] Add integration test: approval workflow works in `test/integration/auto-fix.bats`
- [ ] T063 [US2] Add integration test: auto-commit and re-validation in `test/integration/auto-fix.bats`
- [ ] T064 [US2] Add E2E test: end-to-end auto-fix workflow in `test/e2e/auto-fix.bats`

**Acceptance Criteria:**
- [ ] Auto-fix module generates spec updates using Claude AI
- [ ] Diff shown before applying changes
- [ ] Interactive mode requires user approval
- [ ] CI/headless mode auto-applies (if configured)
- [ ] Spec updates committed with descriptive message
- [ ] Validation re-runs and passes after fix
- [ ] All tests pass

**Parallel Execution:**
```bash
# Auto-fix functions (T049-T053) can run in parallel
# Integration (T054-T058) must run sequentially
# Prompt engineering (T059) can run in parallel with implementation
# Tests (T060-T064) run after implementation
```

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal:** Complete documentation, cross-platform testing, and final polish

**Deliverables:**
- User and developer documentation
- Cross-platform compatibility verified
- Performance optimizations
- Final validation

**Estimated Time:** 4-6 hours

### Tasks

- [ ] T065 [P] Create user guide in `.specify/docs/SPEC_SYNC_GUIDE.md`
- [ ] T066 [P] Create developer guide in `.specify/docs/CONTRIBUTING.md`
- [ ] T067 [P] Create architecture documentation in `.specify/docs/ARCHITECTURE.md`
- [ ] T068 [P] Create testing guide in `.specify/docs/TESTING.md`
- [ ] T069 [P] Create configuration reference in `.specify/docs/CONFIGURATION.md`
- [ ] T070 Test on Linux (Ubuntu 22.04) - run full test suite
- [ ] T071 Test on macOS (latest) - run full test suite
- [ ] T072 Test on Windows WSL (Ubuntu) - run full test suite
- [ ] T073 Add performance benchmarks: measure validation time (<2s target)
- [ ] T074 Add npm script for hook setup: `npm run setup-spec-sync`
- [ ] T075 Update project README.md with spec sync documentation
- [ ] T076 Create troubleshooting guide with common issues and solutions

**Acceptance Criteria:**
- [ ] All documentation complete and accurate
- [ ] Tests pass on all three platforms
- [ ] Performance benchmarks pass (<2s for typical repos)
- [ ] Setup requires single npm command
- [ ] README updated with quick start guide

**Parallel Execution:**
```bash
# All documentation tasks (T065-T069) can run concurrently
# Platform testing (T070-T072) can run in parallel
```

---

## Dependencies & Execution Order

### Phase Dependencies

```
Setup (Phase 1)
  ↓
Foundational (Phase 2) ← BLOCKING FOR ALL USER STORIES
  ↓
  ├─→ User Story 1 (Phase 3) ← MVP
  ├─→ User Story 3 (Phase 4) ← Recommended before US2
  └─→ User Story 2 (Phase 5) ← Optional, depends on US1
  ↓
Polish (Phase 6)
```

### Within Each Phase

**Phase 2 (Foundational):**
- Config, git-analyzer, mapper, categorizer modules (T006-T016) → All parallelizable
- Unit tests (T017-T020) → Depend on module completion

**Phase 3 (User Story 1):**
- Validator (T021-T022) + Hook entry (T023-T027) → Can run in parallel
- Hook config (T028-T029) → Depends on hook entry
- Tests (T030-T035) → Depend on all implementation

**Phase 4 (User Story 3):**
- Rule logic (T037-T039) → Parallelizable
- Integration (T040-T043) → Sequential, depends on rule logic
- Tests (T045-T048) → Depend on implementation

**Phase 5 (User Story 2):**
- Auto-fix functions (T049-T053) → Parallelizable
- Integration (T054-T058) → Sequential
- Tests (T060-T064) → Depend on implementation

**Phase 6 (Polish):**
- Documentation (T065-T069) → All parallelizable
- Platform testing (T070-T072) → Parallelizable

---

## Parallel Opportunities

**Maximum Parallelization:**

**Phase 1:** 2 parallel tracks (directories + husky)
**Phase 2:** 11 parallel tasks (all module implementations)
**Phase 3:** 2 parallel tracks (validator + hook entry)
**Phase 4:** 3 parallel tracks (rule logic)
**Phase 5:** 5 parallel tracks (auto-fix functions + prompts)
**Phase 6:** 7 parallel tracks (docs + platform tests)

**Example Parallel Execution (Phase 2):**
```bash
# Terminal 1: Config module
$ code .specify/hooks/modules/config.sh
# Implement T007, T008, T009

# Terminal 2: Git analyzer
$ code .specify/hooks/modules/git-analyzer.sh
# Implement T010, T011, T012

# Terminal 3: Mapper
$ code .specify/hooks/modules/mapper.sh
# Implement T013, T014, T015

# Terminal 4: Categorizer
$ code .specify/hooks/modules/categorizer.sh
# Implement T016
```

---

## Implementation Strategies

### MVP First (Recommended)

**Scope:** Phase 1 + Phase 2 + Phase 3 (US1 only)
**Time:** ~16 hours
**Deliverable:** Basic validation system that blocks pushes when specs outdated

```
Setup → Foundational → User Story 1 → Validate
```

**Validation:**
1. Make code change without updating spec
2. Try to push (should be blocked)
3. Update spec
4. Try to push (should succeed)

### Incremental Delivery

**Release 1:** MVP (US1) - 16 hours
**Release 2:** Add configuration (US3) - +6 hours
**Release 3:** Add auto-fix (US2) - +12 hours
**Release 4:** Polish - +4 hours

Test and deploy at each checkpoint.

### Parallel Team

Once Foundational (Phase 2) completes:
- Developer A: User Story 1 (validation)
- Developer B: User Story 3 (configuration)
- Developer C: Documentation (Phase 6 docs)

Then:
- Developer A: User Story 2 (auto-fix)
- Developer B+C: Testing and platform validation

---

## Success Metrics

### Functional Validation

After each user story completion:

**US1 Validation:**
- [ ] Hook blocks push when spec outdated (strict mode)
- [ ] Hook detects test-only changes (allows push)
- [ ] Emergency bypass works
- [ ] Performance <2 seconds

**US3 Validation:**
- [ ] Configuration loads and merges correctly
- [ ] Strict mode blocks, lenient mode warns, off mode skips
- [ ] File pattern matching works (glob)
- [ ] Change pattern matching works (regex)

**US2 Validation:**
- [ ] AI generates valid spec updates ≥90% of time
- [ ] Interactive approval workflow works
- [ ] Auto-commit and re-validation works
- [ ] Headless mode auto-applies

### Quality Validation

**After Phase 6:**
- [ ] Test coverage ≥80%
- [ ] All tests pass on Linux, macOS, Windows WSL
- [ ] No security vulnerabilities
- [ ] Performance benchmarks pass
- [ ] Documentation complete

---

## Notes

### Task Format Compliance

All tasks follow the required format:
- ✅ Checkbox: `- [ ]`
- ✅ Task ID: `T001`, `T002`, etc. (sequential)
- ✅ [P] marker: Present on parallelizable tasks
- ✅ [Story] label: `[US1]`, `[US2]`, `[US3]` for user story phases
- ✅ Description: Clear action with file path

### File Paths

All paths are relative to repository root:
- Configuration: `.specify/config/sync-rules.json`
- Modules: `.specify/hooks/modules/*.sh`
- Main hook: `.specify/hooks/validate-specs.sh`
- Tests: `test/modules/*.bats`, `test/integration/*.bats`, `test/e2e/*.bats`
- Documentation: `.specify/docs/*.md`
- Claude Config: `.claude/settings.json`

### Testing Notes

- Unit tests use `bats` framework
- Integration tests run in isolated git repos
- E2E tests run actual git push commands
- Clean up test repositories after each test
- Mock Claude AI calls in unit tests (use fixtures)

### Security Notes

- All file paths validated before use (no path traversal)
- No command injection (all variables quoted)
- Input validation on all external data
- No unsafe operations (no eval, no uncontrolled execution)

---

**Tasks Status:** Ready for implementation
**Last Updated:** 2025-11-17
**Total Estimated Effort:** 36 hours (24 hours for MVP without auto-fix)
