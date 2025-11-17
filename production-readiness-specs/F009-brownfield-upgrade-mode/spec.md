# F009: Brownfield Upgrade Mode

**Priority:** P1 - HIGH
**Status:** ✅ IMPLEMENTED (Skill created, needs integration testing)
**Effort:** 20-30 hours
**Impact:** Enables dependency modernization for brownfield projects without full rewrites

---

## Overview

Add optional "Upgrade" mode to the Brownfield workflow that allows users to modernize all dependencies to latest versions after establishing complete spec coverage. This enables teams to upgrade legacy applications (React 16→18, Next 12→14, ancient npm packages, etc.) with spec-guided breaking change fixes, improving security and leveraging modern tooling without full rewrites.

## Business Value

### Problem Statement

Organizations with legacy applications face a dilemma:
- **Full rewrites** are expensive, risky, and time-consuming
- **Staying on old dependencies** creates security vulnerabilities and technical debt
- **Manual upgrades** are error-prone without clear requirements documentation
- **Breaking changes** are hard to fix without understanding intended behavior

**Current State:** Teams must choose between:
- Keep old dependencies (security risk, missing features)
- Manual upgrade (time-consuming, high breakage risk)
- Full rewrite (expensive, business disruption)

**Desired State:** Spec-guided upgrade process that:
- Establishes complete spec coverage FIRST (safety net)
- Upgrades ALL dependencies systematically
- Uses specs to guide breaking change fixes
- Validates behavior preservation with /speckit.analyze
- Improves test coverage to enterprise standards (85%+)

### Success Metrics

- ✅ Reduce upgrade time from weeks to days
- ✅ Prevent behavioral regressions (specs guide fixes)
- ✅ Achieve 85%+ test coverage during upgrade
- ✅ Security vulnerabilities eliminated
- ✅ Modern dependencies without full rewrite

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legacy App Modernization (Priority: P1)

As a development team lead managing a legacy application, I need to upgrade all dependencies to latest versions while maintaining existing functionality so that we can address security vulnerabilities and leverage modern tooling without the risk and cost of a full rewrite.

**Why this priority**: High-value feature that significantly reduces risk and cost of modernization. Many teams have legacy apps stuck on old versions.

**Independent Test**: Can be tested by selecting "Upgrade" mode during Gear 1 on a repo with old dependencies, running through Gears 1-6, then verifying the modernize skill triggers and successfully upgrades all dependencies.

**Acceptance Scenarios**:

1. **Given** user selects Brownfield path during Gear 1, **When** asked about upgrade mode, **Then** system offers "Standard" vs "Upgrade" options with clear descriptions
2. **Given** user selects "Upgrade" mode, **When** Gear 1 completes, **Then** state file contains `modernize: true` flag
3. **Given** modernize flag is true AND Gear 6 completes, **When** in cruise control mode, **Then** modernize skill automatically triggers
4. **Given** modernize skill runs, **When** dependencies are upgraded, **Then** all tests are run to detect breaking changes
5. **Given** breaking changes are detected, **When** fixing issues, **Then** specs guide the fixes to preserve intended behavior

---

### User Story 2 - Spec-Guided Breaking Change Fixes (Priority: P0)

As a developer fixing breaking changes after dependency upgrades, I need specs to guide my fixes so that I preserve intended behavior and don't introduce regressions while updating to new dependency APIs.

**Why this priority**: Critical for upgrade safety. Without spec guidance, developers may unknowingly change behavior while fixing breaking changes.

**Independent Test**: Can be tested by upgrading a dependency with known breaking changes, verifying that the skill uses relevant feature specs to guide fixes, and confirming behavior preservation with /speckit.analyze.

**Acceptance Scenarios**:

1. **Given** dependency upgrade causes test failures, **When** analyzing failures, **Then** skill identifies which feature spec covers the failing code
2. **Given** spec is identified for failing test, **When** reviewing fix approach, **Then** skill uses spec acceptance criteria to guide the fix
3. **Given** breaking change fix is implemented, **When** tests are re-run, **Then** tests pass and /speckit.analyze confirms no behavioral drift
4. **Given** dependency changes API behavior, **When** updating code, **Then** spec is updated to reflect new behavior OR implementation preserves old behavior
5. **Given** all breaking changes fixed, **When** validation runs, **Then** all tests pass with 85%+ coverage and specs match implementation

---

### User Story 3 - Test Coverage Improvement (Priority: P1)

As a quality assurance lead, I need the upgrade process to improve test coverage to 85%+ so that we have confidence in the modernized application and can catch regressions early.

**Why this priority**: High coverage ensures upgrade didn't break untested code paths. Critical for enterprise applications.

**Independent Test**: Can be tested by running modernize on a project with <85% coverage and verifying coverage improves to 85%+ with new tests guided by spec acceptance criteria.

**Acceptance Scenarios**:

1. **Given** current coverage is <85%, **When** modernize runs, **Then** skill identifies modules below threshold
2. **Given** modules below threshold identified, **When** adding tests, **Then** skill uses spec acceptance criteria as test cases
3. **Given** new tests added, **When** coverage is measured, **Then** all modules achieve 85%+ coverage
4. **Given** coverage target met, **When** running /speckit.analyze, **Then** specs validate that behavior is preserved

---

### Edge Cases

- What happens when dependency upgrade changes behavior in a way that's incompatible with spec?
- How does the system handle dependencies with multiple major version jumps (e.g., React 16→18)?
- What happens when breaking changes affect multiple interconnected features?
- How does the system handle peer dependency conflicts after upgrades?
- What happens when test coverage can't reach 85% due to legacy code patterns?
- How does the system detect and handle deprecated packages with no modern replacement?
- What happens when upgrade introduces new security vulnerabilities?
- How does the system handle database migration breaking changes (ORM upgrades)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ask during Gear 1 (analyze) if user wants upgrade mode for brownfield projects
- **FR-002**: System MUST save modernize flag in state file when user selects upgrade mode
- **FR-003**: System MUST trigger modernize skill after Gear 6 completes if modernize flag is true
- **FR-004**: System MUST detect package manager from tech stack (npm, yarn, pnpm, pip, go mod, cargo)
- **FR-005**: System MUST create .modernize/ directory for upgrade artifacts (baseline, reports)
- **FR-006**: System MUST document current dependency versions before upgrade
- **FR-007**: System MUST run tests before upgrade to establish baseline
- **FR-008**: System MUST upgrade dependencies using appropriate command for detected package manager
- **FR-009**: System MUST run tests after upgrade to detect breaking changes
- **FR-010**: System MUST identify which feature specs correspond to failing tests
- **FR-011**: System MUST use spec acceptance criteria to guide breaking change fixes
- **FR-012**: System MUST preserve behavior specified in specs (or update specs if behavior changes)
- **FR-013**: System MUST improve test coverage to 85%+ on all modules
- **FR-014**: System MUST use spec acceptance criteria as basis for new tests
- **FR-015**: System MUST update specs if dependency changes require behavior modifications
- **FR-016**: System MUST run /speckit.analyze to validate specs match implementation after upgrade
- **FR-017**: System MUST generate upgrade report documenting changes, fixes, and validation results
- **FR-018**: System MUST handle upgrade failures gracefully with rollback instructions
- **FR-019**: System MUST identify security vulnerabilities resolved by upgrade
- **FR-020**: System MUST validate no new high/critical vulnerabilities introduced

### Key Entities *(include if feature involves data)*

- **UpgradeState**: Tracks modernization progress (baseline captured, upgrade applied, tests passing, coverage met, specs validated)
- **DependencySnapshot**: Records current versions before upgrade (package name, old version, new version, breaking changes)
- **BreakingChange**: Documents detected breaking changes (test failure, affected feature, spec reference, fix approach)
- **CoverageReport**: Tracks coverage improvement (module name, before %, after %, new tests added)
- **UpgradeReport**: Final report (dependencies upgraded, breaking changes fixed, coverage achieved, specs updated, validation status)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select "Upgrade" mode during Gear 1 for brownfield projects
- **SC-002**: Modernize skill automatically triggers after Gear 6 when modernize flag is true
- **SC-003**: All dependencies upgrade to latest stable versions using appropriate package manager
- **SC-004**: Breaking changes are detected within 5 minutes via automated test execution
- **SC-005**: 90%+ of breaking changes are fixed with spec guidance (matching spec requirements)
- **SC-006**: Test coverage improves from initial % to 85%+ on all modules
- **SC-007**: New tests are derived from spec acceptance criteria (traceable to specs)
- **SC-008**: /speckit.analyze shows zero drift after upgrade (specs match implementation)
- **SC-009**: Upgrade report generated documenting all changes and validation results
- **SC-010**: No high or critical security vulnerabilities in final state
- **SC-011**: Upgrade completes 5-10x faster than manual approach
- **SC-012**: Behavior preservation rate: 95%+ (specs validate no unintended changes)

### Non-Functional Requirements

- **Performance**: Upgrade detection and planning completes in under 2 minutes
- **Reliability**: Upgrade process maintains rollback capability throughout (baseline preserved)
- **Security**: Automated security audit before and after upgrade
- **Maintainability**: Upgrade report provides complete audit trail for future reference
- **Usability**: Clear progress indicators and error messages guide users through upgrade process

## Assumptions

1. Repository has completed Gears 1-6 and has 100% spec coverage before modernize runs
2. Repository has test infrastructure in place (can run tests)
3. Package manager tools are available in environment (npm, pip, go, cargo)
4. Repository is in clean git state (no uncommitted changes) before upgrade
5. Tests are reliable (not flaky) and accurately reflect application behavior
6. Specs accurately document intended behavior (Gear 5 resolved all clarifications)
7. Development environment can install and run latest dependency versions

## Dependencies

- Completed Gears 1-6 (brownfield workflow)
- 100% spec coverage (from Gear 3)
- Test infrastructure with coverage reporting
- Package manager (npm/yarn/pnpm/pip/go mod/cargo)
- /speckit.analyze command available
- Git (for rollback capability)
- modernize skill implementation

## Out of Scope

- Automatic resolution of complex breaking changes (manual intervention expected)
- Database schema migrations (user handles separately)
- Infrastructure/deployment config updates (Terraform, CloudFormation, etc.)
- Upgrading to unsupported/beta dependency versions (latest stable only)
- Cross-language migrations (e.g., Python→Node.js - that's greenfield)
- Performance optimization beyond what new dependencies provide
- Refactoring to use new dependency features (just fix breaking changes)
- Support for monorepos with complex dependency management
- Automatic rollback on failure (provides rollback instructions only)

## References

- State management: `mcp-server/src/utils/state-manager.ts`
- Modernize skill: `plugin/skills/modernize/SKILL.md`
- Analyze skill (question integration): `plugin/skills/analyze/SKILL.md`
- Cruise control integration: `plugin/skills/cruise-control/SKILL.md`
- Slash command: `.claude/commands/stackshift.modernize.md`
