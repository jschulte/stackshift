# Functional Specification: StackShift Reverse Engineering Toolkit

**Date:** 2025-11-16
**Version:** 1.0.0
**Route:** Brownfield (Tech-Prescriptive)

---

## Executive Summary

### Application Purpose
StackShift is a comprehensive reverse engineering toolkit that transforms codebases through a systematic 6-gear process. It enables developers to extract specifications from existing applications (Greenfield: tech-agnostic for rebuilds; Brownfield: tech-prescriptive for management) and transition to spec-driven development using GitHub Spec Kit.

### Current Architecture
- **Dual Distribution**: Claude Code Plugin + MCP Server
- **Tech Stack**: TypeScript (ES2022), Node.js >=18.0.0
- **Build System**: npm with TypeScript compiler
- **Integration**: Model Context Protocol (MCP) 1.0 + GitHub Spec Kit

### Technology Stack Overview
- **Primary Language**: TypeScript 5.3.0 (strict mode)
- **Runtime**: Node.js 18+ (ES2022 features)
- **Testing**: Vitest 1.0+ with V8 coverage
- **Dependencies**: Minimal (@modelcontextprotocol/sdk@^1.0.0)
- **Security**: Comprehensive validation (CWE-22, CWE-78, CWE-367 protections)

---

## FR-001: Initial Codebase Analysis

### Business Requirement
Users must be able to analyze any codebase to detect technology stack, assess completeness, and choose between Greenfield (tech-agnostic extraction) or Brownfield (tech-prescriptive management) workflows.

### Current Implementation
- **Plugin Skill**: `plugin/skills/analyze/SKILL.md`
- **Plugin Skill**: `plugin/skills/analyze/SKILL.md` (437 lines with 5 operations)
- **State Management**: Creates `.stackshift-state.json` with workflow configuration
- **Tech Detection**: Supports Node.js, Python, Go, Rust via manifest file parsing
- **Validation**: Path traversal prevention (CWE-22), no shell injection (CWE-78)

**Input Parameters:**
```typescript
{
  directory?: string,  // Validated via SecurityValidator
  route?: 'greenfield' | 'brownfield'
}
```

**Processing Steps:**
1. Validate directory (prevent path traversal)
2. Detect tech stack (package.json, requirements.txt, go.mod, Cargo.toml)
3. Count test files (native `countFiles()`, not shell commands)
4. Assess completeness (backend, frontend, tests, docs)
5. Initialize/update state with route selection
6. Generate analysis report

**Output**: `analysis-report.md` with tech stack, completeness %, architecture, recommendations

**Dependencies:**
- `security.ts` - Path validation (CWE-22, CWE-78 prevention)
- `state-manager.ts` - Atomic state operations (CWE-367 prevention)
- `file-utils.ts` - Safe file counting (replaces shell commands)

**Files:**
- `plugin/skills/analyze/SKILL.md` (437 lines)
- `plugin/skills/analyze/operations/*.md` (5 operation guides)

**Acceptance Criteria:**
- [x] Detects technology stack automatically
- [x] User chooses Greenfield or Brownfield route
- [x] Assesses completeness across 5 dimensions
- [x] Creates state file for workflow tracking
- [x] Generates comprehensive analysis report
- [x] Prevents path traversal attacks
- [x] No command injection vulnerabilities

---

## FR-002: Reverse Engineering Documentation Extraction

### Business Requirement
Users must extract comprehensive documentation (8 files) that captures either business logic only (Greenfield) or business logic + technical implementation (Brownfield).

### Current Implementation
- **Plugin Skill**: `plugin/skills/reverse-engineer/SKILL.md`
- **Plugin Skill**: `plugin/skills/reverse-engineer/SKILL.md` (282 lines)
- **Route-Aware**: Adapts extraction based on `.stackshift-state.json` path selection
- **Agent Integration**: Uses `stackshift:code-analyzer` agent for thorough extraction

**8 Documentation Files Created:**
1. `functional-specification.md` - Business logic + requirements (+ tech for Brownfield)
2. `configuration-reference.md` - Config options (abstract for Greenfield, detailed for Brownfield)
3. `data-architecture.md` - Data models (abstract for Greenfield, schemas for Brownfield)
4. `operations-guide.md` - Operational needs (requirements for Greenfield, current setup for Brownfield)
5. `technical-debt-analysis.md` - Issues and improvements
6. `observability-requirements.md` - Monitoring (goals for Greenfield, current state for Brownfield)
7. `visual-design-system.md` - UI patterns (requirements for Greenfield, implementation for Brownfield)
8. `test-documentation.md` - Testing (targets for Greenfield, current state for Brownfield)

**Greenfield Mode:**
- Extract WHAT the system does
- Business capabilities, user workflows
- Data relationships (abstract)
- No framework/technology specifics

**Brownfield Mode:**
- Extract WHAT and HOW
- Business logic + exact technical implementation
- Frameworks with versions, file paths, configurations
- Database schemas with ORM details
- API endpoints with exact paths

**Output Location**: `docs/reverse-engineering/`

**Dependencies:**
- Requires Gear 1 completed (analysis-report.md exists)
- Requires route selected in state file
- Uses `stackshift:code-analyzer` agent (or Explore fallback)

**Files:**
- `plugin/skills/reverse-engineer/SKILL.md` (282 lines)
- `plugin/agents/stackshift-code-analyzer/AGENT.md` (defines extraction agent)

**Acceptance Criteria:**
- [x] Creates docs/reverse-engineering/ directory
- [x] Generates all 8 documentation files
- [x] Adapts content based on Greenfield vs Brownfield route
- [x] Comprehensive coverage of all application aspects
- [x] Accurate to actual codebase (not assumptions)
- [x] Ready for Gear 3 (spec creation)

---

## FR-003: Specification Creation with GitHub Spec Kit

### Business Requirement
Users must transform documentation into formal GitHub Spec Kit specifications with constitution, feature specs, and implementation plans.

### Current Implementation
- **Plugin Skill**: `plugin/skills/create-specs/SKILL.md`
- **Plugin Skill**: `plugin/skills/create-specs/SKILL.md` (463 lines)
- **Integration**: GitHub Spec Kit CLI (`specify init`) or fallback templates
- **Templates**: Dual constitution templates (agnostic vs prescriptive)

**GitHub Spec Kit Structure Created:**
```
.specify/
├── memory/
│   └── constitution.md       # Route-specific (agnostic or prescriptive)
├── templates/
└── scripts/

specs/FEATURE-ID/
├── spec.md                   # Feature specification
└── plan.md                   # Implementation plan
```

**Constitution Templates:**
- **Greenfield**: `templates/constitution-agnostic-template.md` (322 lines)
  - Business purpose, requirements, rules
  - No technology specified
  - Can implement in any stack

- **Brownfield**: `templates/constitution-prescriptive-template.md` (626 lines)
  - Business logic + exact tech stack
  - Framework versions, file paths
  - Technical decisions with rationale
  - Enables `/speckit.analyze` validation

**Feature Specification Format:**
```markdown
# Feature: [Name]
## Status: ✅ COMPLETE | ⚠️ PARTIAL | ❌ MISSING
## Overview, User Stories, Acceptance Criteria
## Technical Requirements (Brownfield only)
## Implementation Status, Dependencies
```

**Spec Kit Commands Enabled:**
- `/speckit.analyze` - Validate specs vs code
- `/speckit.implement` - Build features
- `/speckit.tasks` - Generate task lists
- `/speckit.specify` - Create/refine specs
- `/speckit.plan` - Implementation planning
- `/speckit.clarify` - Resolve ambiguities

**Fallback Support:**
- If `specify init` fails, copies `claude-commands/speckit.*.md` to `.claude/commands/`
- Ensures commands work without CLI tool
- 6 command fallback files provided

**Dependencies:**
- Requires Gear 2 completed (8 docs in docs/reverse-engineering/)
- Optional: GitHub Spec Kit CLI (falls back to templates)

**Files:**
- `plugin/skills/create-specs/SKILL.md` (463 lines)
- `plugin/templates/constitution-*.md` (2 templates)
- `plugin/templates/feature-spec-template.md` (272 lines)
- `plugin/claude-commands/speckit.*.md` (6 fallback commands)

**Acceptance Criteria:**
- [x] Initializes GitHub Spec Kit structure
- [x] Generates route-appropriate constitution
- [x] Creates feature specifications for all features
- [x] Marks implementation status (✅/⚠️/❌)
- [x] Enables /speckit.* slash commands
- [x] Provides fallback if CLI unavailable

---

## FR-004: Gap Analysis and Prioritization

### Business Requirement
Users must identify missing/partial features, catalog technical debt, and create prioritized implementation roadmap (P0/P1/P2/P3).

### Current Implementation
- **Plugin Skill**: `plugin/skills/gap-analysis/SKILL.md`
- **Plugin Skill**: `plugin/skills/gap-analysis/SKILL.md` (392 lines)
- **Integration**: Uses `/speckit.analyze` to validate specs against code
- **Output**: Detailed gap analysis report with priorities

**Process:**
1. Run `/speckit.analyze` (Spec Kit validation)
2. Review COMPLETE features (✅) - verify implementation exists
3. Review PARTIAL features (⚠️) - identify what's missing
4. Review MISSING features (❌) - assess need and complexity
5. Catalog technical debt from analysis
6. Identify [NEEDS CLARIFICATION] markers
7. Prioritize work (P0 → P1 → P2 → P3)
8. Create roadmap

**Priority Levels:**
- **P0**: Critical (blocking, security, essential workflows)
- **P1**: High priority (user value, competitive)
- **P2**: Medium (improvements, edge cases)
- **P3**: Low (polish, future enhancements)

**Gap Analysis Report Contents:**
- Overall completion percentage
- Spec Kit validation results
- COMPLETE features summary
- PARTIAL features (what exists vs missing)
- MISSING features (needed? impact?)
- Technical debt catalog
- [NEEDS CLARIFICATION] list (8+ items)
- Prioritized roadmap

**Output**: `docs/gap-analysis-report.md`

**Dependencies:**
- Requires Gear 3 completed (.specify/ exists, specs created)
- Uses /speckit.analyze command

**Files:**
- `plugin/skills/gap-analysis/SKILL.md` (392 lines)

**Acceptance Criteria:**
- [x] Runs /speckit.analyze validation
- [x] Identifies all gaps (COMPLETE/PARTIAL/MISSING)
- [x] Catalogs technical debt
- [x] Identifies clarifications needed
- [x] Creates prioritized roadmap (P0/P1/P2/P3)
- [x] Generates comprehensive gap analysis report

---

## FR-005: Specification Completion via Clarifications

### Business Requirement
Users must resolve all `[NEEDS CLARIFICATION]` markers interactively to ensure specifications are fully actionable before implementation.

### Current Implementation
- **Plugin Skill**: `plugin/skills/complete-spec/SKILL.md`
- **Plugin Skill**: `plugin/skills/complete-spec/SKILL.md` (250 lines)
- **Integration**: GitHub Spec Kit `/speckit.clarify` workflow
- **Validation**: Comprehensive input validation (max 100 clarifications, max 5000 chars each)

**Input Parameters:**
```typescript
{
  directory?: string,
  clarifications?: Array<{
    question: string,  // Max 5000 chars
    answer: string     // Max 5000 chars
  }>  // Max 100 items
}
```

**Input Validation:**
```typescript
const MAX_CLARIFICATIONS = 100;
const MAX_STRING_LENGTH = 5000;

// Validates each clarification:
// - Type checking (must be object with strings)
// - Length limits (prevent DoS)
// - Empty check (no zero-length strings)
```

**Two Modes:**

**With Clarifications Provided:**
- Accepts array of Q&A pairs
- Updates state with clarification count
- Returns confirmation for incorporation

**Interactive Mode (No Clarifications):**
- Instructs to run `/speckit.clarify`
- Spec Kit identifies `[NEEDS CLARIFICATION]` markers
- Asks questions interactively
- Updates specs with answers
- Removes clarification markers

**Common Clarification Topics:**
- Feature details (chart types? filters?)
- UX/UI preferences (drag-drop vs click-browse?)
- Business rules (max items? timeout values?)
- Priorities (is this really P0?)
- Technical decisions (which approach?)

**Output**: Updated specifications with all ambiguities resolved

**Dependencies:**
- Requires Gear 4 completed (gap-analysis-report.md exists)
- Requires clarifications list from gap analysis
- Optional: GitHub Spec Kit CLI for /speckit.clarify

**Files:**
- `plugin/skills/complete-spec/SKILL.md` (250 lines)

**Acceptance Criteria:**
- [x] Collects all [NEEDS CLARIFICATION] markers
- [x] Asks structured questions for each
- [x] Updates specs with answers
- [x] Removes all clarification markers
- [x] Validates input (length, type, count)
- [x] Prevents DoS attacks (100 clarifications max)
- [x] Specs are fully actionable

---

## FR-006: Feature Implementation from Specifications

### Business Requirement
Users must systematically implement missing/partial features using `/speckit.implement` workflow, tracking completion against spec requirements.

### Current Implementation
- **Plugin Skill**: `plugin/skills/implement/SKILL.md`
- **Plugin Skill**: `plugin/skills/implement/SKILL.md` (487 lines)
- **Integration**: GitHub Spec Kit `/speckit.tasks` → `/speckit.implement` → `/speckit.analyze`
- **Modes**: Specific feature or all features

**Input Parameters:**
```typescript
{
  directory?: string,
  feature?: string  // Max 200 chars, no path separators
}
```

**Input Validation:**
```typescript
const MAX_FEATURE_NAME_LENGTH = 200;

// Validates feature name:
// - Length limit (1-200 characters)
// - Path traversal prevention (no ../, /, \)
// - Type checking (must be string)
```

**Two Implementation Modes:**

**Specific Feature:**
```
/speckit.tasks <feature>       # Generate task list
/speckit.implement <feature>   # Execute implementation
/speckit.analyze              # Validate completion
```

**All Features (Roadmap):**
- Greenfield: Implement ALL features from scratch in chosen stack
- Brownfield: Implement missing/partial features to fill gaps

**Greenfield Strategy:**
1. Choose target stack (Next.js, Python/Flask, Go, etc.)
2. Review specs (all tech-agnostic)
3. For each feature: tasks → implement → validate
4. Build complete application in new stack
5. Achieve 100% spec completion

**Brownfield Strategy:**
1. Review prioritized roadmap (P0 → P1 → P2)
2. For each missing/partial feature: tasks → implement → validate
3. Complete PARTIAL features first
4. Implement MISSING features by priority
5. Achieve 100% spec alignment

**Success Criteria:**
- All specs marked ✅ COMPLETE
- `/speckit.analyze` shows no gaps
- All tests passing
- Application ready for production

**Handoff Operation:**
- Special `operations/handoff.md` for post-reverse-engineering transition
- Celebrates completion of StackShift workflow
- Explains transition to ongoing Spec Kit development
- Offers feature branch setup
- Provides manual instructions

**Output**: Implemented features with updated status markers

**Dependencies:**
- Requires Gear 5 completed (specs finalized, no clarifications)
- Uses /speckit.tasks, /speckit.implement, /speckit.analyze

**Files:**
- `plugin/skills/implement/SKILL.md` (487 lines)
- `plugin/skills/implement/operations/handoff.md` (handoff workflow)

**Acceptance Criteria:**
- [x] Generates tasks per feature
- [x] Executes implementation systematically
- [x] Validates against acceptance criteria
- [x] Updates spec status (❌ → ✅)
- [x] Prevents path traversal in feature names
- [x] Supports both specific and all-features modes
- [x] Provides handoff guidance on completion

---

## FR-007: Cruise Control (Automated Workflow)

### Business Requirement
Users must be able to run the complete 6-gear workflow automatically without manual intervention between gears (hands-off mode).

### Current Implementation
- **Plugin Skill**: `plugin/skills/cruise-control/SKILL.md`
- **Plugin Skill**: `plugin/skills/cruise-control/SKILL.md` (298 lines)
- **Configuration**: Route, clarifications strategy, implementation scope
- **Monitoring**: State file tracks progress through all gears

**Input Parameters:**
```typescript
{
  directory?: string,
  route: 'greenfield' | 'brownfield',  // REQUIRED
  clarifications_strategy?: 'defer' | 'prompt' | 'skip',  // Default: defer
  implementation_scope?: 'none' | 'p0' | 'p0_p1' | 'all'  // Default: none
}
```

**Configuration Options:**

**Clarifications Strategy:**
- `defer`: Mark ambiguities, continue implementation (fastest)
- `prompt`: Stop and ask questions interactively (most thorough)
- `skip`: Skip unclear features (safest)

**Implementation Scope:**
- `none`: Stop after specs ready (no implementation)
- `p0`: Implement critical features only
- `p0_p1`: Implement critical + high-value features
- `all`: Implement ALL features (may take hours/days)

**Workflow Execution:**
```
🔍 Gear 1: Analyze → ✅ Auto-shift
🔄 Gear 2: Reverse Engineer → ✅ Auto-shift
📋 Gear 3: Create Specs → ✅ Auto-shift
🔍 Gear 4: Gap Analysis → ✅ Auto-shift
✨ Gear 5: Complete Spec (per strategy) → ✅ Auto-shift
🚀 Gear 6: Implement (per scope) → 🏁 Complete
```

**State Configuration Stored:**
```json
{
  "auto_mode": true,
  "auto_config": {
    "clarifications_strategy": "defer",
    "implementation_scope": "p0",
    "pause_between_gears": false
  },
  "metadata": {
    "pathDescription": "Build new app from business logic"
  }
}
```

**Safety Features:**
- Checkpoints at each gear
- State saved after each step
- Resume from checkpoint if interrupted
- Validation before proceeding
- Automatic pause on errors

**Progress Monitoring:**
```bash
# Via state file
cat .stackshift-state.json | jq '{currentStep, completedSteps}'
```

**Use Cases:**
- Overnight execution (start 5pm, review 9am)
- CI/CD integration (generate specs without implementation)
- Batch processing (multiple projects sequentially)
- Demo mode (show complete workflow)

**Output**: Complete workflow execution from analysis to implementation

**Dependencies:**
- All gear prerequisites handled automatically
- Uses state file for progress tracking
- Integrates all 6 gears seamlessly

**Files:**
- `plugin/skills/cruise-control/SKILL.md` (298 lines)

**Acceptance Criteria:**
- [x] Accepts configuration (route, strategy, scope)
- [x] Executes all 6 gears sequentially
- [x] Saves state after each gear
- [x] Resumes from checkpoint if interrupted
- [x] Respects clarification strategy
- [x] Implements per scope configuration
- [x] Provides progress monitoring
- [x] Validates route parameter (required)

---

## Non-Functional Requirements

### NFR-001: Security
**Requirement:** All user input must be validated to prevent security vulnerabilities

**Implementation:**
- **Path Traversal (CWE-22)**: `security.ts` validates all directories
  - Checks for shell metacharacters
  - Resolves to absolute normalized paths
  - Verifies within allowed workspace
  - Rejects parent directory escapes (`..`)

- **Command Injection (CWE-78)**: Native APIs replace shell commands
  - `countFiles()` replaces `find | wc -l`
  - No user input passed to shell
  - Shell metacharacter detection

- **Race Conditions (CWE-367)**: Atomic file operations
  - Temporary file + atomic rename
  - Random suffix prevents collisions
  - Cleanup on error

**Test Coverage:** 48+ security test cases

**Status:** ✅ COMPLETE

---

### NFR-002: State Management
**Requirement:** Workflow state must persist reliably across tool invocations without corruption

**Implementation:**
- **StateManager Class**: `state-manager.ts` (370 lines)
- **Atomic Operations**: Read-modify-write with temp file + rename
- **Validation**: Comprehensive structure validation on load
- **Prototype Pollution Prevention**: Removes `__proto__`, `constructor`, `prototype`
- **Concurrency Safe**: Tested with 10 parallel updates
- **File Size Limit**: 10MB max (DoS prevention)

**State File:** `.stackshift-state.json` in project root

**Test Coverage:** 15 test cases including concurrency

**Status:** ✅ COMPLETE

---

### NFR-003: Performance
**Requirement:** Tools must complete analysis within reasonable time limits

**Implementation:**
- **Resource Limits**:
  - Max 10,000 files processed during scans
  - Max directory depth of 10 (circular symlink protection)
  - Max 100 clarifications per request
  - Max 5,000 characters per clarification field
  - Max 200 characters for feature names
  - Max 10MB state file size

- **Parallel Operations**: Multiple analyses run concurrently
- **Native APIs**: File operations use fs/promises (not shell)
- **Skips**: Automatically skips node_modules, .git, hidden directories

**Status:** ✅ COMPLETE

---

### NFR-004: Reliability
**Requirement:** System must handle errors gracefully and enable recovery

**Implementation:**
- **Error Handling**: Try-catch in all MCP tool handlers
- **Validation**: Input validated before processing
- **State Persistence**: Checkpoints at each gear
- **Resume Capability**: Can resume from last completed gear
- **Rollback**: State can be reset if needed
- **Logging**: Clear error messages with context

**Status:** ✅ COMPLETE

---

### NFR-005: Maintainability
**Requirement:** Code must be well-structured, documented, and testable

**Implementation:**
- **TypeScript Strict Mode**: Full type safety
- **Modular Design**: 4 utility modules (security, state, files, skills)
- **Test Coverage**: 67+ test cases across 3 test suites
- **Documentation**: 60 markdown files, 2,731 lines of skill docs
- **Code Deduplication**: ~200 lines eliminated via utilities
- **Consistent Patterns**: All tools follow same validation → load → process → update → return

**Status:** ✅ COMPLETE

---

## Success Metrics

### Business KPIs
- Codebase analysis completion rate: ~85% typical
- Specification generation time: 30-45 minutes (Gear 2)
- Gap analysis accuracy: Validates against actual code
- Implementation tracking: Spec status markers (✅/⚠️/❌)

### Technical KPIs
- Test coverage: 67+ test cases, security coverage 100%
- Security vulnerabilities: 0 critical (v1.0.1)
- Build time: <10 seconds (TypeScript compilation)
- State file size: Typically <50KB
- MCP response time: <100ms for resource reads

---

## System Boundaries

### In Scope
- Reverse engineering of existing codebases
- Tech stack detection (Node.js, Python, Go, Rust)
- Documentation extraction (8 comprehensive files)
- GitHub Spec Kit integration
- Specification creation (constitution + feature specs)
- Gap analysis and prioritization
- Clarification workflow
- Implementation guidance
- Dual workflow support (Greenfield/Brownfield)
- MCP server distribution
- Claude Code plugin distribution

### Out of Scope
- Code compilation or execution
- Actual feature implementation (delegated to /speckit.implement)
- Version control operations (git add/commit/push)
- Deployment automation
- CI/CD pipeline execution
- Database migrations
- External API integrations
- UI design tools
- Performance optimization
- Security scanning (beyond input validation)

---

## Related Specifications
- configuration-reference.md - Complete configuration inventory
- data-architecture.md - State file structure and data models
- operations-guide.md - Deployment and usage procedures
- technical-debt-analysis.md - Known issues and improvements
- test-documentation.md - Testing strategy and coverage

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-16
**Status:** ✅ COMPLETE (Brownfield documentation)
