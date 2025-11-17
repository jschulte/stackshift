# F002: Automated Spec Generation

## Implementation Status

**Status**: ✅ **INTEGRATED into Gear 3** (as of 2024-11-17)

Gear 3 (`mcp-server/src/tools/create-specs.ts`) now calls F002 automated spec generation tools:
- `generateAllSpecsToolHandler` - Orchestrates full spec generation
- `createConstitutionToolHandler` - Generates constitution from reverse engineering docs
- `createFeatureSpecsToolHandler` - Creates specs for ALL features (complete, partial, missing)
- `createImplPlansToolHandler` - Generates implementation plans for incomplete features

**Result**: Brownfield repos now get 100% spec coverage for entire application!

## Overview

Previously, StackShift Gear 3 (Create Specs) provided guidance for manually creating GitHub Spec Kit specifications, but didn't automatically generate the spec files. This feature enhanced Gear 3 to programmatically create all Spec Kit artifacts from reverse-engineering documentation.

## Problem Statement (RESOLVED)

The previous implementation of `create-specs` tool only returned instructional text telling users HOW to create specs manually. This created a workflow gap:

1. **Current State**: User completes Gears 1-2, has `docs/reverse-engineering/` with 8+ comprehensive documents
2. **Gear 3 Today**: Returns markdown instructions saying "manually create .specify/ directory and spec files"
3. **User Experience**: Must manually transform functional-specification.md into individual feature specs
4. **Pain Point**: Time-consuming, error-prone, doesn't leverage existing reverse-engineering artifacts

### Impact

- **Time Loss**: 2-3 hours of manual spec creation per project
- **Inconsistency**: Manual specs may not follow Spec Kit format correctly
- **Workflow Friction**: Breaks the automated "shift through gears" experience
- **Reduced Adoption**: Users expect automation from a tool called "StackShift"

## Requirements

### Functional Requirements

1. **Automatic Spec Kit Initialization**
   - Create `.specify/` directory structure
   - Initialize with proper templates from Spec Kit
   - Handle both Greenfield and Brownfield routes

2. **Constitution Generation**
   - Read `docs/reverse-engineering/functional-specification.md`
   - Extract project purpose, values, and technical decisions
   - Generate `.specify/memory/constitution.md` using route-appropriate template
   - Greenfield: Tech-agnostic (business-focused)
   - Brownfield: Tech-prescriptive (with implementation details)

3. **Feature Specification Generation**
   - Parse functional-specification.md to identify distinct features
   - Create `specs/###-feature-name/` directories for each feature
   - Generate `spec.md` for each feature with:
     - User stories from requirements
     - Acceptance criteria
     - Implementation status (✅/⚠️/❌) based on codebase analysis
     - Technical requirements (Brownfield only)
   - Use consistent numbering (001, 002, 003, etc.)

4. **Implementation Plan Generation**
   - For each PARTIAL or MISSING feature
   - Create `specs/###-feature-name/plan.md`
   - Include:
     - Current state (what exists)
     - Target state (what's needed)
     - Technical approach
     - Task breakdown
     - Risks and mitigations

5. **Template Integration**
   - Use existing templates in `plugin/templates/`
   - Constitution: `constitution-agnostic-template.md` or `constitution-prescriptive-template.md`
   - Feature Spec: `feature-spec-template.md`
   - Follow GitHub Spec Kit conventions

6. **File Reading and Parsing**
   - Read all reverse-engineering docs (8 files)
   - Parse markdown structure (headers, lists, code blocks)
   - Extract structured data (features, requirements, dependencies)
   - Identify implementation status from technical-debt-analysis.md

### Non-Functional Requirements

1. **Security**
   - All file operations MUST use SecurityValidator
   - Validate all paths before reading/writing
   - Use readFileSafe() for large files
   - Maintain CWE-22, CWE-400 protections

2. **Performance**
   - Complete spec generation in <30 seconds for typical projects
   - Handle projects with 50+ features
   - Streaming output for large operations

3. **Reliability**
   - Atomic file operations (temp + rename)
   - Graceful handling of missing docs
   - Rollback capability if generation fails mid-process
   - Preserve existing .specify/ content if reinitializing

4. **Usability**
   - Clear progress indicators during generation
   - Helpful error messages if docs are incomplete
   - Summary of generated artifacts
   - Link to next step (Gear 4)

### Technical Requirements

1. **Dependencies**
   - No new external dependencies
   - Use existing utilities (security, file-utils, state-manager)
   - Leverage existing template files

2. **Output Structure**
   ```
   .specify/
   ├── memory/
   │   └── constitution.md
   ├── templates/           # From Spec Kit
   └── scripts/             # From Spec Kit

   specs/
   ├── 001-feature-name/
   │   ├── spec.md
   │   └── plan.md
   ├── 002-another-feature/
   │   ├── spec.md
   │   └── plan.md
   └── ...
   ```

3. **Integration Points**
   - Read from: `docs/reverse-engineering/`
   - Write to: `.specify/` and `specs/`
   - Update: State file (completion status)
   - Template sources: `plugin/templates/`

## User Stories

### US1: Automated Constitution Creation
**As a** developer running StackShift on my codebase
**I want** the constitution to be generated automatically from my reverse-engineering docs
**So that** I don't have to manually extract and format project principles

**Acceptance Criteria:**
- [ ] Constitution.md created in `.specify/memory/`
- [ ] Contains project purpose, values, and technical decisions
- [ ] Uses tech-agnostic template for Greenfield route
- [ ] Uses tech-prescriptive template for Brownfield route
- [ ] Includes all sections: Purpose, Values, Architecture, Standards, Governance

### US2: Feature Specification Extraction
**As a** developer with functional-specification.md
**I want** individual feature specs automatically created in specs/ directories
**So that** I can use /speckit commands without manual conversion

**Acceptance Criteria:**
- [ ] Each distinct feature gets its own `specs/###-name/` directory
- [ ] spec.md includes user stories and acceptance criteria
- [ ] Implementation status marked (✅/⚠️/❌)
- [ ] Features numbered sequentially (001, 002, 003...)
- [ ] Cross-references between related features maintained

### US3: Implementation Plan Generation
**As a** developer identifying missing features
**I want** implementation plans created for PARTIAL/MISSING features
**So that** I have a clear roadmap for completing the codebase

**Acceptance Criteria:**
- [ ] plan.md created for each PARTIAL or MISSING feature
- [ ] Includes current state, target state, and approach
- [ ] Task breakdown with clear steps
- [ ] Risks identified with mitigations
- [ ] Dependencies on other features noted

### US4: Error Handling and Recovery
**As a** developer with incomplete reverse-engineering docs
**I want** clear error messages about what's missing
**So that** I can fix the issue and retry generation

**Acceptance Criteria:**
- [ ] Validates required files exist before starting
- [ ] Clear error message if functional-specification.md missing
- [ ] Warns if docs seem incomplete
- [ ] Suggests running previous gears if content inadequate
- [ ] Supports retrying without corrupting existing files

### US5: Progress Visibility
**As a** developer waiting for spec generation
**I want** to see progress indicators
**So that** I know the operation is working and how long it will take

**Acceptance Criteria:**
- [ ] Shows "Parsing reverse-engineering docs..."
- [ ] Shows "Generating constitution..."
- [ ] Shows "Creating specifications (N of M)..."
- [ ] Shows "Generating implementation plans..."
- [ ] Final summary: "Created X specs, Y plans"

## Implementation Details

### Phase 1: Constitution Generation (P0)

**Input:** `docs/reverse-engineering/functional-specification.md`

**Logic:**
1. Read functional-specification.md
2. Extract:
   - Project purpose (first section)
   - Core features (features list)
   - Technical stack (if Brownfield)
   - Quality requirements (non-functional requirements section)
3. Select template based on route
4. Populate template with extracted data
5. Write to `.specify/memory/constitution.md`

### Phase 2: Feature Extraction (P0)

**Input:** `docs/reverse-engineering/functional-specification.md`

**Logic:**
1. Parse markdown to find "Features" section
2. Each H2 or H3 under Features = one feature
3. For each feature:
   - Generate slug (lowercase, dashes)
   - Assign sequential number (001, 002, ...)
   - Create directory `specs/###-slug/`
   - Extract user stories (bullet points starting with "As a")
   - Extract acceptance criteria (checklists)
   - Determine status:
     - Check technical-debt-analysis.md for mentions
     - Default to ⚠️ PARTIAL if uncertainty
   - Generate spec.md from feature-spec-template.md

### Phase 3: Plan Generation (P0)

**Input:** Generated specs + technical-debt-analysis.md

**Logic:**
1. For each spec with status PARTIAL or MISSING:
   - Read spec.md to understand requirements
   - Read technical-debt-analysis.md for context
   - Generate plan.md with:
     - Current state (what exists from analysis)
     - Target state (requirements from spec)
     - Tasks (diff between current and target)
     - Risks (from technical-debt-analysis.md)

### Phase 4: Progress Tracking (P1)

**Display during execution:**
```
Parsing reverse-engineering documentation...
✓ Found 8 files in docs/reverse-engineering/

Generating constitution...
✓ Created .specify/memory/constitution.md (Brownfield/Tech-Prescriptive)

Creating feature specifications...
✓ 001-user-authentication (⚠️ PARTIAL)
✓ 002-fish-management (⚠️ PARTIAL)
✓ 003-analytics-dashboard (❌ MISSING)
✓ 004-photo-upload (⚠️ PARTIAL)
...
✓ Created 12 specifications

Generating implementation plans...
✓ plan.md for 001-user-authentication
✓ plan.md for 003-analytics-dashboard
✓ plan.md for 008-export-functionality
...
✓ Created 8 implementation plans

Summary:
- Constitution: .specify/memory/constitution.md
- Specifications: 12 features in specs/
- Implementation Plans: 8 plans for PARTIAL/MISSING features

Ready to shift into 4th gear: Gap Analysis
Run: stackshift_gap_analysis
```

## Success Criteria

1. ✅ Constitution automatically generated from reverse-engineering docs
2. ✅ Individual feature specs created in specs/ directories
3. ✅ Implementation plans generated for incomplete features
4. ✅ All file operations use security validation
5. ✅ Generation completes in <30 seconds for typical projects
6. ✅ Clear progress indicators during execution
7. ✅ Helpful error messages for missing/incomplete docs
8. ✅ State file updated with completion status
9. ✅ Output follows GitHub Spec Kit conventions
10. ✅ Compatible with /speckit.* slash commands

## Dependencies

**Required Before Starting:**
- Gear 1 (Analyze) complete
- Gear 2 (Reverse Engineer) complete
- `docs/reverse-engineering/` exists with at least functional-specification.md
- Templates exist in `plugin/templates/`

**Blocks:**
- Gear 4 (Gap Analysis) - needs specs to analyze
- /speckit.* commands - need specs to operate on

**External Dependencies:**
- None (uses existing utilities)

## Non-Goals

- Not replacing the entire GitHub Spec Kit CLI
- Not adding interactive prompts (use existing docs)
- Not modifying existing reverse-engineering docs
- Not generating code or tests (that's Gear 6)
- Not validating specs (that's Gear 4)

## Timeline

- **Estimated Effort:** 12-16 hours
- **Priority:** P1 - HIGH (workflow gap)
- **Testing:** 4-6 additional hours

## Rollback Plan

If automated generation causes issues:
1. Revert commits
2. Preserve existing Gear 3 guidance-only behavior
3. Add feature flag: `STACKSHIFT_AUTO_SPECS=false`
4. Gradually enable per route (Brownfield first)
5. Collect feedback before full rollout

## References

- GitHub Spec Kit: https://github.com/github/spec-kit
- SPEC_KIT_INTEGRATION.md (this repo)
- Current create-specs implementation: `mcp-server/src/tools/create-specs.ts`
- Skill definition: `plugin/skills/create-specs/SKILL.md`
- Templates: `plugin/templates/`

## Related Specifications

- F003: Test Coverage Improvements (needs specs to verify)
- F006: Feature Completion (uses specs to identify gaps)
- F007: CLI Orchestrator (automates spec generation across repos)
