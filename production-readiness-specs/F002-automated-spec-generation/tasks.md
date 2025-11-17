# Tasks: F002 Automated Spec Generation

**Feature:** Automated Spec Generation
**Branch:** `claude/plan-spec-generation-01HuBbSA8FWUFd6WTsFKTdtz`
**Estimated Effort:** 24-30 hours
**Generated:** 2025-11-17

---

## Summary

This task list implements automated GitHub Spec Kit specification generation from reverse-engineering documentation. The implementation is organized into 5 user stories with 65 tasks total.

**User Stories:**
- **US1**: Automated Constitution Creation (10 tasks)
- **US2**: Feature Specification Extraction (15 tasks)
- **US3**: Implementation Plan Generation (12 tasks)
- **US4**: Error Handling and Recovery (14 tasks)
- **US5**: Progress Visibility (8 tasks)

**MVP Scope:** US1 only (constitution generation) - 10 tasks, ~8 hours

---

## Phase 1: Setup (Project Initialization)

**Goal:** Prepare development environment and create foundational file structure

- [ ] T001 Create test fixtures directory at mcp-server/src/utils/__tests__/fixtures/
- [ ] T002 [P] Create sample-functional-spec.md fixture with 5 features in fixtures/
- [ ] T003 [P] Create sample-tech-debt.md fixture in fixtures/
- [ ] T004 [P] Create malformed-functional-spec.md fixture for error testing in fixtures/
- [ ] T005 [P] Create large-functional-spec.md fixture with 100+ features in fixtures/

**Completion Criteria:**
- ✅ All fixture files exist and are valid markdown
- ✅ Fixtures cover happy path, edge cases, and error scenarios

---

## Phase 2: Foundational (Core Infrastructure)

**Goal:** Build reusable components that ALL user stories depend on

### Component 1: Markdown Parser

- [ ] T006 Create MarkdownParser interface in mcp-server/src/utils/markdown-parser.ts
- [ ] T007 Implement parse() method with regex patterns for headings, lists, code blocks
- [ ] T008 Implement findSection() method with case-insensitive title matching
- [ ] T009 [P] Implement extractHeadings() method filtering by level
- [ ] T010 [P] Implement extractListItems() method for nested lists
- [ ] T011 Create ParseError class with lineNumber property
- [ ] T012 Create MarkdownParser test file at mcp-server/src/utils/__tests__/markdown-parser.test.ts
- [ ] T013 Write 15+ unit tests covering all node types and edge cases
- [ ] T014 Verify 95%+ test coverage for markdown-parser.ts

**Independent Test:** Parse sample-functional-spec.md and verify 5 features extracted as H2 headings

### Component 2: Template Engine

- [ ] T015 Create TemplateEngine interface in mcp-server/src/utils/template-engine.ts
- [ ] T016 Implement loadTemplate() method reading from plugin/templates/
- [ ] T017 Implement handleVariables() for {{variableName}} substitution
- [ ] T018 [P] Implement handleConditionals() for {{#if}} blocks
- [ ] T019 [P] Implement handleLoops() for {{#each}} blocks
- [ ] T020 Implement populate() orchestrating all replacements
- [ ] T021 [P] Implement validateTemplate() checking for missing variables
- [ ] T022 Create TemplateError class with missingVariables property
- [ ] T023 Create TemplateEngine test file at mcp-server/src/utils/__tests__/template-engine.test.ts
- [ ] T024 Write 12+ unit tests for variables, conditionals, loops
- [ ] T025 Verify 90%+ test coverage for template-engine.ts

**Independent Test:** Populate constitution-brownfield template with sample data and verify all variables replaced

### Component 3: Spec Generator

- [ ] T026 Create SpecGenerator interface in mcp-server/src/utils/spec-generator.ts
- [ ] T027 Implement extractFeatures() with hierarchical heuristic
- [ ] T028 Implement slugify() converting names to URL-safe slugs
- [ ] T029 [P] Implement detectStatus() with hybrid approach (debt + checkboxes + default)
- [ ] T030 [P] Implement extractDescription() finding first paragraph after heading
- [ ] T031 [P] Implement extractUserStories() parsing "As a X, I want Y" pattern
- [ ] T032 [P] Implement extractAcceptanceCriteria() parsing [x]/[ ] checklists
- [ ] T033 Implement extractConstitution() extracting purpose, values, tech stack
- [ ] T034 [P] Implement generatePlans() for PARTIAL/MISSING features
- [ ] T035 Create ExtractionError class with phase property
- [ ] T036 Create SpecGenerator test file at mcp-server/src/utils/__tests__/spec-generator.test.ts
- [ ] T037 Write 20+ unit tests using sample fixtures
- [ ] T038 Verify 85%+ test coverage for spec-generator.ts

**Independent Test:** Extract features from sample-functional-spec.md and verify correct IDs, slugs, and status

### Component 4: File Writer

- [ ] T039 Create FileWriter interface in mcp-server/src/utils/spec-file-generator.ts
- [ ] T040 Implement initializeSpecKit() creating .specify/ structure
- [ ] T041 Implement writeAtomic() using temp file + rename pattern
- [ ] T042 [P] Implement writeConstitution() to .specify/memory/constitution.md
- [ ] T043 [P] Implement writeSpec() to specs/###-slug/spec.md
- [ ] T044 [P] Implement writePlan() to specs/###-slug/plan.md
- [ ] T045 Create FileSystemError class with code and filePath properties
- [ ] T046 Create FileWriter test file at mcp-server/src/utils/__tests__/spec-file-generator.test.ts
- [ ] T047 Write 10+ unit tests using temp directories
- [ ] T048 Verify atomic rollback on failure (no partial files)
- [ ] T049 Verify 90%+ test coverage for spec-file-generator.ts

**Independent Test:** Generate files in temp directory, verify structure, then clean up atomically

**Foundational Completion Criteria:**
- ✅ All 4 components implemented with interfaces
- ✅ 90%+ test coverage across all components
- ✅ All independent tests pass
- ✅ Security: All paths validated via SecurityValidator
- ✅ Zero production dependencies added

---

## Phase 3: User Story 1 - Automated Constitution Creation

**Goal:** Generate .specify/memory/constitution.md automatically from functional-specification.md

**Priority:** P0 (MVP)

**User Story:**
> As a developer running StackShift on my codebase, I want the constitution to be generated automatically from my reverse-engineering docs, so that I don't have to manually extract and format project principles.

### Implementation Tasks

- [ ] T050 [US1] Update createSpecsToolHandler() in mcp-server/src/tools/create-specs.ts to use SpecGenerator
- [ ] T051 [US1] Load functional-specification.md using readFileSafe()
- [ ] T052 [US1] Parse markdown using MarkdownParser.parse()
- [ ] T053 [US1] Extract constitution data using SpecGenerator.extractConstitution()
- [ ] T054 [US1] Determine route (greenfield/brownfield) from state
- [ ] T055 [US1] Load appropriate template (constitution-agnostic or constitution-prescriptive)
- [ ] T056 [US1] Populate template using TemplateEngine.populate()
- [ ] T057 [US1] Write constitution using FileWriter.writeConstitution()
- [ ] T058 [US1] Update state using StateManager.completeStep('create-specs')
- [ ] T059 [US1] Return success message with constitution path

### Testing Tasks

- [ ] T060 [P] [US1] Create integration test in mcp-server/src/tools/__tests__/create-specs-integration.test.ts
- [ ] T061 [US1] Test Greenfield route generates tech-agnostic constitution
- [ ] T062 [US1] Test Brownfield route generates tech-prescriptive constitution
- [ ] T063 [US1] Test missing functional-specification.md returns helpful error
- [ ] T064 [US1] Verify state file updated atomically

**US1 Acceptance Criteria:**
- [x] Constitution.md created in .specify/memory/
- [x] Contains project purpose, values, and technical decisions
- [x] Uses tech-agnostic template for Greenfield route
- [x] Uses tech-prescriptive template for Brownfield route
- [x] Includes all sections: Purpose, Values, Architecture, Standards, Governance

**US1 Independent Test:**
```bash
# Setup
mkdir -p /tmp/test-us1/docs/reverse-engineering
cp fixtures/sample-functional-spec.md /tmp/test-us1/docs/reverse-engineering/functional-specification.md

# Execute
node dist/tools/create-specs.js --directory /tmp/test-us1

# Verify
test -f /tmp/test-us1/.specify/memory/constitution.md
grep "Purpose" /tmp/test-us1/.specify/memory/constitution.md
grep "Values" /tmp/test-us1/.specify/memory/constitution.md

# Cleanup
rm -rf /tmp/test-us1
```

---

## Phase 4: User Story 2 - Feature Specification Extraction

**Goal:** Generate individual spec.md files for each feature automatically

**Priority:** P1

**User Story:**
> As a developer with functional-specification.md, I want individual feature specs automatically created in specs/ directories, so that I can use /speckit commands without manual conversion.

### Implementation Tasks

- [ ] T065 [US2] Implement feature extraction loop in createSpecsToolHandler()
- [ ] T066 [US2] For each feature, generate sequential ID (001, 002, 003...)
- [ ] T067 [US2] Create specs/###-slug/ directory using FileWriter
- [ ] T068 [US2] Load feature-spec template using TemplateEngine
- [ ] T069 [US2] Map Feature entity to template data structure
- [ ] T070 [US2] Include user stories in spec (from extractUserStories())
- [ ] T071 [US2] Include acceptance criteria in spec (from extractAcceptanceCriteria())
- [ ] T072 [US2] Include implementation status (from detectStatus())
- [ ] T073 [US2] Add technical requirements if Brownfield route
- [ ] T074 [US2] Populate and write spec.md for each feature
- [ ] T075 [US2] Track spec paths in array for summary
- [ ] T076 [US2] Handle features with no user stories gracefully
- [ ] T077 [US2] Handle features with no acceptance criteria gracefully
- [ ] T078 [US2] Detect and populate cross-references between features

### Testing Tasks

- [ ] T079 [P] [US2] Test feature extraction with 5-feature fixture
- [ ] T080 [US2] Test sequential ID assignment (001, 002, 003...)
- [ ] T081 [US2] Test slug generation (spaces → hyphens, lowercase)
- [ ] T082 [US2] Test status detection (COMPLETE/PARTIAL/MISSING)
- [ ] T083 [US2] Test user story extraction from markdown
- [ ] T084 [US2] Test acceptance criteria extraction (checkboxes)
- [ ] T085 [US2] Test cross-reference detection between features
- [ ] T086 [US2] Verify all specs follow Spec Kit format

**US2 Acceptance Criteria:**
- [x] Each distinct feature gets its own specs/###-name/ directory
- [x] spec.md includes user stories and acceptance criteria
- [x] Implementation status marked (✅/⚠️/❌)
- [x] Features numbered sequentially (001, 002, 003...)
- [x] Cross-references between related features maintained

**US2 Independent Test:**
```bash
# Setup
mkdir -p /tmp/test-us2/docs/reverse-engineering
cp fixtures/sample-functional-spec.md /tmp/test-us2/docs/reverse-engineering/functional-specification.md

# Execute
node dist/tools/create-specs.js --directory /tmp/test-us2

# Verify
test -d /tmp/test-us2/specs/001-user-authentication
test -f /tmp/test-us2/specs/001-user-authentication/spec.md
grep "User Stories" /tmp/test-us2/specs/001-user-authentication/spec.md
grep "Acceptance Criteria" /tmp/test-us2/specs/001-user-authentication/spec.md

# Cleanup
rm -rf /tmp/test-us2
```

---

## Phase 5: User Story 3 - Implementation Plan Generation

**Goal:** Generate plan.md files for PARTIAL/MISSING features automatically

**Priority:** P1

**User Story:**
> As a developer identifying missing features, I want implementation plans created for PARTIAL/MISSING features, so that I have a clear roadmap for completing the codebase.

### Implementation Tasks

- [ ] T087 [US3] Filter features to PARTIAL/MISSING only
- [ ] T088 [US3] For each incomplete feature, generate ImplementationPlan
- [ ] T089 [US3] Extract current state from technical-debt-analysis.md if available
- [ ] T090 [US3] Define target state from feature's acceptance criteria
- [ ] T091 [US3] Generate task breakdown based on spec requirements
- [ ] T092 [US3] Identify risks from technical-debt-analysis.md mentions
- [ ] T093 [US3] Add mitigation strategies for each risk
- [ ] T094 [US3] Load implementation-plan template
- [ ] T095 [US3] Populate template with plan data
- [ ] T096 [US3] Write plan.md to feature directory
- [ ] T097 [US3] Track plan paths in array for summary
- [ ] T098 [US3] Skip plan generation for COMPLETE features

### Testing Tasks

- [ ] T099 [P] [US3] Test plan generation for PARTIAL feature
- [ ] T100 [US3] Test plan generation for MISSING feature
- [ ] T101 [US3] Test no plan generated for COMPLETE feature
- [ ] T102 [US3] Test risk extraction from tech-debt-analysis.md
- [ ] T103 [US3] Test task breakdown includes all acceptance criteria
- [ ] T104 [US3] Verify plan.md follows Spec Kit format

**US3 Acceptance Criteria:**
- [x] plan.md created for each PARTIAL or MISSING feature
- [x] Includes current state, target state, and approach
- [x] Task breakdown with clear steps
- [x] Risks identified with mitigations
- [x] Dependencies on other features noted

**US3 Independent Test:**
```bash
# Setup
mkdir -p /tmp/test-us3/docs/reverse-engineering
cp fixtures/sample-functional-spec.md /tmp/test-us3/docs/reverse-engineering/functional-specification.md
cp fixtures/sample-tech-debt.md /tmp/test-us3/docs/reverse-engineering/technical-debt-analysis.md

# Execute
node dist/tools/create-specs.js --directory /tmp/test-us3

# Verify
test -f /tmp/test-us3/specs/001-user-authentication/plan.md
grep "Current State" /tmp/test-us3/specs/001-user-authentication/plan.md
grep "Tasks" /tmp/test-us3/specs/001-user-authentication/plan.md

# Cleanup
rm -rf /tmp/test-us3
```

---

## Phase 6: User Story 4 - Error Handling and Recovery

**Goal:** Gracefully handle missing/malformed docs with helpful error messages

**Priority:** P0

**User Story:**
> As a developer with incomplete reverse-engineering docs, I want clear error messages about what's missing, so that I can fix the issue and retry generation.

### Implementation Tasks

- [ ] T105 [US4] Validate functional-specification.md exists before parsing
- [ ] T106 [US4] Return helpful error if functional-specification.md missing
- [ ] T107 [US4] Catch ParseError and include line number in error message
- [ ] T108 [US4] Catch ExtractionError and suggest adding structure to docs
- [ ] T109 [US4] Catch TemplateError and list missing variables
- [ ] T110 [US4] Catch FileSystemError and include permission/path details
- [ ] T111 [US4] Implement atomic rollback using temp directory
- [ ] T112 [US4] On error, clean up temp directory before throwing
- [ ] T113 [US4] Include suggested fix in all error messages
- [ ] T114 [US4] Log errors to stderr but keep stdout clean for MCP
- [ ] T115 [US4] Support re-running without corrupting existing specs
- [ ] T116 [US4] Detect existing .specify/ and ask before overwriting

### Testing Tasks

- [ ] T117 [P] [US4] Test error when functional-specification.md missing
- [ ] T118 [US4] Test error when markdown is malformed (unclosed code blocks)
- [ ] T119 [US4] Test error when no Features section found
- [ ] T120 [US4] Test error when template variable missing
- [ ] T121 [US4] Test atomic rollback (no partial files on error)
- [ ] T122 [US4] Test helpful error messages include line numbers
- [ ] T123 [US4] Test re-running doesn't corrupt existing files

**US4 Acceptance Criteria:**
- [x] Validates required files exist before starting
- [x] Clear error message if functional-specification.md missing
- [x] Warns if docs seem incomplete
- [x] Suggests running previous gears if content inadequate
- [x] Supports retrying without corrupting existing files

**US4 Independent Test:**
```bash
# Test 1: Missing file
mkdir -p /tmp/test-us4-missing/docs/reverse-engineering
node dist/tools/create-specs.js --directory /tmp/test-us4-missing 2>&1 | grep "functional-specification.md not found"

# Test 2: Malformed markdown
mkdir -p /tmp/test-us4-malformed/docs/reverse-engineering
cp fixtures/malformed-functional-spec.md /tmp/test-us4-malformed/docs/reverse-engineering/functional-specification.md
node dist/tools/create-specs.js --directory /tmp/test-us4-malformed 2>&1 | grep "line"

# Test 3: Atomic rollback
mkdir -p /tmp/test-us4-rollback/docs/reverse-engineering
echo "invalid" > /tmp/test-us4-rollback/docs/reverse-engineering/functional-specification.md
node dist/tools/create-specs.js --directory /tmp/test-us4-rollback || true
test ! -d /tmp/test-us4-rollback/.specify  # Should not exist after error

# Cleanup
rm -rf /tmp/test-us4-*
```

---

## Phase 7: User Story 5 - Progress Visibility

**Goal:** Show progress indicators during spec generation

**Priority:** P2

**User Story:**
> As a developer waiting for spec generation, I want to see progress indicators, so that I know the operation is working and how long it will take.

### Implementation Tasks

- [ ] T124 [US5] Add progress message "Parsing reverse-engineering documentation..."
- [ ] T125 [US5] Show file count after parsing (e.g., "Found 8 files")
- [ ] T126 [US5] Add progress message "Generating constitution..."
- [ ] T127 [US5] Show success checkmark after constitution created
- [ ] T128 [US5] Add progress message "Creating feature specifications..."
- [ ] T129 [US5] Show feature count and status as each is created
- [ ] T130 [US5] Add progress message "Generating implementation plans..."
- [ ] T131 [US5] Show plan count as each is created
- [ ] T132 [US5] Display final summary with counts
- [ ] T133 [US5] Include paths to generated files in summary
- [ ] T134 [US5] Show next step hint ("Ready for Gear 4: Gap Analysis")

### Testing Tasks

- [ ] T135 [P] [US5] Capture stdout during generation
- [ ] T136 [US5] Verify progress messages appear in order
- [ ] T137 [US5] Verify summary includes accurate counts

**US5 Acceptance Criteria:**
- [x] Shows "Parsing reverse-engineering docs..."
- [x] Shows "Generating constitution..."
- [x] Shows "Creating specifications (N of M)..."
- [x] Shows "Generating implementation plans..."
- [x] Final summary: "Created X specs, Y plans"

**US5 Independent Test:**
```bash
# Execute with output capture
mkdir -p /tmp/test-us5/docs/reverse-engineering
cp fixtures/sample-functional-spec.md /tmp/test-us5/docs/reverse-engineering/functional-specification.md
OUTPUT=$(node dist/tools/create-specs.js --directory /tmp/test-us5)

# Verify progress messages
echo "$OUTPUT" | grep "Parsing reverse-engineering"
echo "$OUTPUT" | grep "Generating constitution"
echo "$OUTPUT" | grep "Creating feature specifications"
echo "$OUTPUT" | grep "Summary"

# Cleanup
rm -rf /tmp/test-us5
```

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal:** Documentation, final integration, and cleanup

### Documentation Tasks

- [ ] T138 Update mcp-server/README.md noting Gear 3 automation
- [ ] T139 Update QUICKSTART.md with Gear 3 automation description
- [ ] T140 Update plugin/skills/create-specs/SKILL.md to reflect automation
- [ ] T141 Add troubleshooting section to SKILL.md
- [ ] T142 Create migration guide at docs/guides/GEAR-3-AUTOMATION-MIGRATION.md
- [ ] T143 Update JSDoc comments on all public APIs
- [ ] T144 Add code examples to API documentation

### Final Integration Tasks

- [ ] T145 Run full test suite and verify all tests pass
- [ ] T146 Check test coverage is 90%+ for new code
- [ ] T147 Run TypeScript compiler and verify no errors
- [ ] T148 Run linter and fix any warnings
- [ ] T149 Test manually on 3+ real projects
- [ ] T150 Verify performance <30 seconds for 50 features
- [ ] T151 Run security audit (npm audit)
- [ ] T152 Verify zero new vulnerabilities introduced

### Cleanup Tasks

- [ ] T153 Remove console.log statements
- [ ] T154 Remove commented-out code
- [ ] T155 Verify no TODOs or FIXMEs in production code
- [ ] T156 Format code with Prettier (if configured)

**Polish Completion Criteria:**
- ✅ All documentation updated
- ✅ All tests passing
- ✅ 90%+ coverage achieved
- ✅ No TypeScript errors
- ✅ Performance targets met
- ✅ Security audit clean

---

## Dependencies & Execution Strategy

### Sequential Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) - BLOCKS ALL USER STORIES
    ↓
├─→ Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3)
├─→ Phase 6 (US4) [can run in parallel with US1-3]
└─→ Phase 7 (US5) [can run in parallel with US1-3]
    ↓
Phase 8 (Polish)
```

### User Story Dependencies

- **US1** (Constitution): No dependencies, can start after Foundational
- **US2** (Feature Specs): Depends on US1 (shares SpecGenerator)
- **US3** (Plans): Depends on US2 (needs features extracted)
- **US4** (Errors): Independent, can run parallel with US1-3
- **US5** (Progress): Independent, can run parallel with US1-3

### Parallel Execution Opportunities

**After Phase 2 completes, these can run in parallel:**

```bash
# Team Member 1: Core generation (US1 → US2 → US3)
git checkout -b feature/core-generation
# Implement T050-T104

# Team Member 2: Error handling (US4)
git checkout -b feature/error-handling
# Implement T105-T123

# Team Member 3: Progress UI (US5)
git checkout -b feature/progress-ui
# Implement T124-T137
```

### MVP Execution (Fastest Path to Value)

**MVP = US1 only (10 tasks, ~8 hours)**

```
T001-T005 (Setup) → T006-T049 (Foundational) → T050-T064 (US1)
```

This delivers automated constitution generation, providing immediate value while deferring feature spec extraction.

### Incremental Delivery Strategy

1. **Sprint 1** (Week 1): Setup + Foundational + US1
   - Deliverable: Constitution automation
   - Risk: Low (core components)

2. **Sprint 2** (Week 2): US2 + US3
   - Deliverable: Full spec generation
   - Risk: Medium (feature detection heuristics)

3. **Sprint 3** (Week 3): US4 + US5 + Polish
   - Deliverable: Production-ready
   - Risk: Low (polish work)

---

## Testing Strategy Summary

### Unit Tests
- **Target:** 90%+ coverage
- **Location:** `__tests__/` alongside source files
- **Count:** 50+ unit tests across 4 components
- **Focus:** Individual methods, edge cases, error conditions

### Integration Tests
- **Target:** All user story workflows
- **Location:** `mcp-server/src/tools/__tests__/create-specs-integration.test.ts`
- **Count:** 10+ integration tests
- **Focus:** End-to-end generation, route variations, error scenarios

### Security Tests
- **Target:** All file operations
- **Focus:** Path validation, atomic operations, rollback
- **Count:** 8+ security tests
- **Tools:** Malicious inputs, large files, permission errors

### Performance Tests
- **Target:** <30 seconds for 50 features
- **Fixture:** `large-functional-spec.md` (100+ features)
- **Metrics:** Execution time, memory usage

---

## Task Summary

**Total Tasks:** 156
- Setup: 5 tasks
- Foundational: 44 tasks
- US1: 15 tasks
- US2: 22 tasks
- US3: 18 tasks
- US4: 19 tasks
- US5: 14 tasks
- Polish: 19 tasks

**Effort Breakdown:**
- Setup: 1 hour
- Foundational: 12-14 hours
- US1: 3-4 hours
- US2: 4-5 hours
- US3: 3-4 hours
- US4: 2-3 hours
- US5: 1-2 hours
- Polish: 2-3 hours

**Total Effort:** 28-36 hours

**Parallelizable Tasks:** 45 tasks marked with [P]

**MVP Path:** T001-T005 + T006-T049 + T050-T064 = ~8 hours

---

## Validation Checklist

Before marking feature complete:

- [ ] All 156 tasks checked off
- [ ] All 5 user stories independently tested and passing
- [ ] Test coverage ≥90% for new code
- [ ] No TypeScript compilation errors
- [ ] No linting warnings
- [ ] Performance <30 sec for 50 features
- [ ] Security audit clean (npm audit)
- [ ] Documentation updated (README, SKILL.md, migration guide)
- [ ] Manual testing on 3+ real projects successful
- [ ] Constitution alignment verified (zero new dependencies)

---

**Tasks Status:** ✅ Ready for Execution
**Last Updated:** 2025-11-17
