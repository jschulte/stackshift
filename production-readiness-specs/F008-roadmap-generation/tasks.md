# Tasks: F008 Strategic Roadmap Generation from Gap Analysis

**Input**: Design documents from `/production-readiness-specs/F008-roadmap-generation/`
**Prerequisites**: spec.md, impl-plan.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not explicitly requested in spec - tests are OPTIONAL for this implementation

**Organization**: Tasks are grouped by user story (FR1-FR5) to enable independent implementation and testing of each functional requirement.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which functional requirement/user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Single TypeScript project structure:
- Source: `mcp-server/src/`
- Tests: `mcp-server/src/**/__tests__/`
- Types: `mcp-server/src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per impl-plan.md

- [ ] T001 Install new npm dependencies: @babel/parser@^7.23.0, @babel/types@^7.23.0, typescript@^5.3.0, markdown-it@^14.0.0, handlebars@^4.7.8, cli-chart@^1.0.0, p-limit@^5.0.0, ora@^8.0.0 in mcp-server/package.json
- [ ] T002 Install dev dependencies: @types/babel__parser, @types/babel__types, @types/markdown-it, @types/handlebars in mcp-server/package.json
- [ ] T003 [P] Create directory structure: mcp-server/src/analyzers/, mcp-server/src/brainstorming/, mcp-server/src/roadmap/, mcp-server/src/exporters/
- [ ] T004 [P] Create test directories: mcp-server/src/analyzers/__tests__/, mcp-server/src/brainstorming/__tests__/, mcp-server/src/roadmap/__tests__/, mcp-server/src/exporters/__tests__/
- [ ] T005 [P] Create types file mcp-server/src/types/roadmap.ts with core interfaces from data-model.md (SpecGap, FeatureGap, RoadmapItem, Phase, Roadmap)
- [ ] T006 [P] Create Handlebars template file mcp-server/src/exporters/templates/roadmap.hbs based on spec.md roadmap structure example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Implement SpecParser utility in mcp-server/src/analyzers/utils/spec-parser.ts using markdown-it to parse spec.md files
- [ ] T008 [P] Implement FileSearcher utility in mcp-server/src/analyzers/utils/file-searcher.ts to find TypeScript files recursively
- [ ] T009 [P] Implement ASTParser utility in mcp-server/src/analyzers/utils/ast-parser.ts using @babel/parser for JavaScript/TypeScript AST parsing
- [ ] T010 [P] Implement ConfidenceScorer utility in mcp-server/src/analyzers/utils/confidence-scorer.ts to calculate gap confidence scores (0-100)
- [ ] T011 [P] Create base Error classes in mcp-server/src/types/errors.ts (RoadmapGenerationError, SpecParsingError, GapDetectionError, ExportError)
- [ ] T012 [P] Configure Vitest test setup in mcp-server/vitest.config.ts with coverage thresholds

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Spec vs Implementation Gap Detection (Priority: P0) 🎯 MVP

**Goal**: Analyze specifications against codebase to identify implementation gaps with 90%+ accuracy

**Independent Test**: Run analyzer on StackShift's F002 spec, verify it detects missing StackShiftError class and state backups

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create Evidence type and helper functions in mcp-server/src/types/roadmap.ts
- [ ] T014 [P] [US1] Implement parseSpecFile method in mcp-server/src/analyzers/gap-analyzer.ts to extract requirements from spec.md using SpecParser
- [ ] T015 [P] [US1] Implement findSpecFiles method in mcp-server/src/analyzers/gap-analyzer.ts to recursively discover all spec.md files
- [ ] T016 [US1] Implement searchForFunction method in mcp-server/src/analyzers/gap-analyzer.ts using ASTParser to find function declarations
- [ ] T017 [US1] Implement verifyFunctionSignature method in mcp-server/src/analyzers/gap-analyzer.ts using @babel/types to check function parameters
- [ ] T018 [US1] Implement detectStubFunction method in mcp-server/src/analyzers/gap-analyzer.ts to identify functions returning guidance text
- [ ] T019 [US1] Implement verifyRequirement method in mcp-server/src/analyzers/gap-analyzer.ts to check if requirement is implemented (depends on T016, T017, T018)
- [ ] T020 [US1] Implement analyzeSpec method in mcp-server/src/analyzers/gap-analyzer.ts to analyze single spec file (depends on T014, T019)
- [ ] T021 [US1] Implement analyzeSpecs method in mcp-server/src/analyzers/gap-analyzer.ts to analyze all specs in directory (depends on T015, T020)
- [ ] T022 [US1] Implement SpecGapAnalyzer class export with ISpecGapAnalyzer interface in mcp-server/src/analyzers/gap-analyzer.ts
- [ ] T023 [US1] Add error handling and logging for gap detection failures in mcp-server/src/analyzers/gap-analyzer.ts

**Checkpoint**: At this point, spec gap detection should be fully functional - can detect gaps in F001-F007 specs

---

## Phase 4: User Story 2 - Feature Completeness Analysis (Priority: P0)

**Goal**: Analyze advertised features (README, ROADMAP) against actual capabilities to identify misleading documentation

**Independent Test**: Run analyzer on StackShift's README.md, verify it detects "Cruise Control" claim mismatch (advertised: automatic, actual: config only)

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create FeatureGap and DocumentationClaim types in mcp-server/src/types/roadmap.ts
- [ ] T025 [P] [US2] Implement parseDocumentation method in mcp-server/src/analyzers/feature-analyzer.ts using markdown-it to extract feature claims from README/ROADMAP
- [ ] T026 [P] [US2] Implement findDocFiles method in mcp-server/src/analyzers/feature-analyzer.ts to locate README.md, ROADMAP.md, docs/ files
- [ ] T027 [US2] Implement extractClaims method in mcp-server/src/analyzers/feature-analyzer.ts using regex patterns to find advertised features
- [ ] T028 [US2] Implement verifyClaimAgainstCode method in mcp-server/src/analyzers/feature-analyzer.ts to check if feature claim matches implementation
- [ ] T029 [US2] Implement calculateAccuracyScore method in mcp-server/src/analyzers/feature-analyzer.ts to score claim accuracy (0-100)
- [ ] T030 [US2] Implement classifyFeatureGap method in mcp-server/src/analyzers/feature-analyzer.ts (accurate/misleading/false)
- [ ] T031 [US2] Implement verifyClaim method in mcp-server/src/analyzers/feature-analyzer.ts (depends on T028, T029, T030)
- [ ] T032 [US2] Implement analyzeFeatures method in mcp-server/src/analyzers/feature-analyzer.ts (depends on T025, T026, T027, T031)
- [ ] T033 [US2] Implement FeatureGapAnalyzer class export with IFeatureGapAnalyzer interface in mcp-server/src/analyzers/feature-analyzer.ts
- [ ] T034 [P] [US2] Implement CompletenessAnalyzer class in mcp-server/src/analyzers/completeness-analyzer.ts with assessCompleteness method
- [ ] T035 [US2] Implement calculateProductionReadiness method in mcp-server/src/analyzers/completeness-analyzer.ts
- [ ] T036 [US2] Add error handling and logging for feature gap detection in mcp-server/src/analyzers/feature-analyzer.ts

**Checkpoint**: Feature gap detection complete - can identify misleading documentation in README/ROADMAP

---

## Phase 5: User Story 3 - Desirable Feature Brainstorming (Priority: P1)

**Goal**: AI-powered brainstorming of strategic features across 8 categories with impact/effort scoring

**Independent Test**: Run brainstormer on StackShift project context, verify it suggests 20+ relevant features across categories

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create DesirableFeature, ScoredFeature, BrainstormConfig types in mcp-server/src/types/roadmap.ts
- [ ] T038 [P] [US3] Create ProjectContext type and loadProjectContext utility in mcp-server/src/brainstorming/utils/project-context.ts
- [ ] T039 [P] [US3] Implement buildPrompt method in mcp-server/src/brainstorming/feature-brainstormer.ts for category-specific AI prompts
- [ ] T040 [P] [US3] Implement callAI method in mcp-server/src/brainstorming/feature-brainstormer.ts using MCP context for Claude integration
- [ ] T041 [US3] Implement parseAIResponse method in mcp-server/src/brainstorming/feature-brainstormer.ts to extract features from AI JSON response
- [ ] T042 [US3] Implement brainstormCategory method in mcp-server/src/brainstorming/feature-brainstormer.ts (depends on T039, T040, T041)
- [ ] T043 [US3] Implement brainstormFeatures method in mcp-server/src/brainstorming/feature-brainstormer.ts to brainstorm all 8 categories (depends on T042)
- [ ] T044 [P] [US3] Implement scoreImpact method in mcp-server/src/brainstorming/scoring-engine.ts to score feature impact (1-10)
- [ ] T045 [P] [US3] Implement scoreEffort method in mcp-server/src/brainstorming/scoring-engine.ts to score implementation effort (1-10)
- [ ] T046 [P] [US3] Implement calculateROI method in mcp-server/src/brainstorming/scoring-engine.ts (impact/effort ratio)
- [ ] T047 [P] [US3] Implement scoreStrategicValue method in mcp-server/src/brainstorming/scoring-engine.ts
- [ ] T048 [P] [US3] Implement scoreRisk method in mcp-server/src/brainstorming/scoring-engine.ts
- [ ] T049 [US3] Implement scoreFeatures method in mcp-server/src/brainstorming/feature-brainstormer.ts combining all scoring methods (depends on T044-T048)
- [ ] T050 [US3] Implement FeatureBrainstormer class export with IFeatureBrainstormer interface in mcp-server/src/brainstorming/feature-brainstormer.ts
- [ ] T051 [US3] Add deduplication logic in mcp-server/src/brainstorming/feature-brainstormer.ts to remove duplicate suggestions
- [ ] T052 [US3] Add error handling for AI integration failures in mcp-server/src/brainstorming/feature-brainstormer.ts

**Checkpoint**: Feature brainstorming complete - can generate and score 20+ strategic feature suggestions

---

## Phase 6: User Story 4 - Prioritized Roadmap Generation (Priority: P0)

**Goal**: Generate structured roadmaps with phases, priorities (P0-P3), timeline estimates, and dependencies

**Independent Test**: Generate roadmap from gaps + features, verify it has 4+ phases with correct priority ordering (P0 items in early phases)

### Implementation for User Story 4

- [ ] T053 [P] [US4] Create RoadmapItem, Phase, Timeline, Dependency types in mcp-server/src/types/roadmap.ts
- [ ] T054 [P] [US4] Implement createRoadmapItems method in mcp-server/src/roadmap/roadmap-generator.ts to convert gaps + features to RoadmapItem[]
- [ ] T055 [P] [US4] Implement assignPriority method in mcp-server/src/roadmap/prioritizer.ts to assign P0/P1/P2/P3 based on criteria
- [ ] T056 [P] [US4] Implement detectCircularDependencies method in mcp-server/src/roadmap/prioritizer.ts to find circular dependency chains
- [ ] T057 [US4] Implement resolveDependencies method in mcp-server/src/roadmap/prioritizer.ts for topological sort (depends on T056)
- [ ] T058 [US4] Implement prioritize method in mcp-server/src/roadmap/prioritizer.ts (depends on T055, T057)
- [ ] T059 [P] [US4] Implement groupByPriority method in mcp-server/src/roadmap/roadmap-generator.ts to organize items by P0/P1/P2/P3
- [ ] T060 [US4] Implement createPhases method in mcp-server/src/roadmap/roadmap-generator.ts to group items into phases (depends on T058, T059)
- [ ] T061 [P] [US4] Implement calculateTotalEffort method in mcp-server/src/roadmap/timeline-estimator.ts to sum effort hours
- [ ] T062 [P] [US4] Implement estimateByTeamSize method in mcp-server/src/roadmap/timeline-estimator.ts (1 dev, 2 devs, 3 devs scenarios)
- [ ] T063 [P] [US4] Implement findCriticalPath method in mcp-server/src/roadmap/timeline-estimator.ts for longest dependency chain
- [ ] T064 [US4] Implement estimateTimeline method in mcp-server/src/roadmap/timeline-estimator.ts (depends on T061, T062, T063)
- [ ] T065 [US4] Implement generateMetadata method in mcp-server/src/roadmap/roadmap-generator.ts for RoadmapMetadata
- [ ] T066 [US4] Implement generateSummary method in mcp-server/src/roadmap/roadmap-generator.ts for RoadmapSummary
- [ ] T067 [US4] Implement generateRoadmap method in mcp-server/src/roadmap/roadmap-generator.ts combining all components (depends on T054, T058, T060, T064, T065, T066)
- [ ] T068 [US4] Implement RoadmapGenerator class export with IRoadmapGenerator interface in mcp-server/src/roadmap/roadmap-generator.ts
- [ ] T069 [US4] Add validation for roadmap completeness in mcp-server/src/roadmap/roadmap-generator.ts
- [ ] T070 [US4] Add error handling for roadmap generation failures in mcp-server/src/roadmap/roadmap-generator.ts

**Checkpoint**: Roadmap generation complete - can create structured roadmaps with phases, priorities, and timelines

---

## Phase 7: User Story 5 - Export and Tracking (Priority: P1)

**Goal**: Export roadmaps to Markdown, JSON, CSV formats and track progress over time

**Independent Test**: Generate and export roadmap, verify ROADMAP.md matches template structure and JSON is valid machine-readable format

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create ExportFormat, ExportOptions, ExportResult types in mcp-server/src/types/roadmap.ts
- [ ] T072 [P] [US5] Implement loadTemplate method in mcp-server/src/exporters/markdown-exporter.ts to load Handlebars template
- [ ] T073 [P] [US5] Register Handlebars helpers in mcp-server/src/exporters/markdown-exporter.ts for formatting (date, percentage, etc.)
- [ ] T074 [US5] Implement exportMarkdown method in mcp-server/src/exporters/markdown-exporter.ts using Handlebars (depends on T072, T073)
- [ ] T075 [P] [US5] Implement exportJSON method in mcp-server/src/exporters/json-exporter.ts with JSON serialization
- [ ] T076 [P] [US5] Implement exportCSV method in mcp-server/src/exporters/csv-exporter.ts for Excel/Sheets compatibility
- [ ] T077 [P] [US5] Implement generateASCIIChart method in mcp-server/src/exporters/utils/visualization.ts using cli-chart for progress bars
- [ ] T078 [US5] Implement export method in mcp-server/src/exporters/roadmap-exporter.ts to dispatch to correct exporter (depends on T074, T075, T076)
- [ ] T079 [US5] Implement RoadmapExporter class export with IRoadmapExporter interface in mcp-server/src/exporters/roadmap-exporter.ts
- [ ] T080 [P] [US5] Create RoadmapProgress, RoadmapDelta types in mcp-server/src/types/roadmap.ts
- [ ] T081 [P] [US5] Implement loadProgress method in mcp-server/src/roadmap/progress-tracker.ts to parse existing ROADMAP.md
- [ ] T082 [P] [US5] Implement calculateDelta method in mcp-server/src/roadmap/progress-tracker.ts to compare roadmap versions
- [ ] T083 [P] [US5] Implement calculateVelocity method in mcp-server/src/roadmap/progress-tracker.ts (items completed per week)
- [ ] T084 [P] [US5] Implement estimateCompletion method in mcp-server/src/roadmap/progress-tracker.ts based on velocity
- [ ] T085 [US5] Implement updateProgress method in mcp-server/src/roadmap/progress-tracker.ts (depends on T081, T082, T083, T084)
- [ ] T086 [US5] Add file write operations with error handling in mcp-server/src/exporters/markdown-exporter.ts
- [ ] T087 [US5] Add export validation (verify generated markdown/JSON is valid) in mcp-server/src/exporters/roadmap-exporter.ts

**Checkpoint**: All export formats working - ROADMAP.md, roadmap.json, roadmap.csv generated successfully

---

## Phase 8: MCP Tool Integration

**Purpose**: Integrate roadmap generation into StackShift MCP tool ecosystem

- [ ] T088 Create MCP tool entry point in mcp-server/src/tools/generate-roadmap.ts with GenerateRoadmapArgs interface
- [ ] T089 Implement loadProjectContext helper in mcp-server/src/tools/generate-roadmap.ts to gather project info
- [ ] T090 Implement generateRoadmapTool function in mcp-server/src/tools/generate-roadmap.ts orchestrating all components (depends on US1-US5 completion)
- [ ] T091 Add progress reporting with ora spinners in mcp-server/src/tools/generate-roadmap.ts
- [ ] T092 Register stackshift_generate_roadmap tool in mcp-server/src/index.ts with proper schema
- [ ] T093 Add comprehensive error handling and user-friendly messages in mcp-server/src/tools/generate-roadmap.ts
- [ ] T094 Add input validation for MCP tool parameters in mcp-server/src/tools/generate-roadmap.ts

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T095 [P] Update mcp-server/README.md with roadmap generation documentation
- [ ] T096 [P] Create usage examples in production-readiness-specs/F008-roadmap-generation/examples/ directory
- [ ] T097 [P] Add TypeScript type exports in mcp-server/src/types/index.ts for external use
- [ ] T098 Optimize AST parsing with caching in mcp-server/src/analyzers/utils/ast-parser.ts
- [ ] T099 Add parallel processing using p-limit in mcp-server/src/analyzers/gap-analyzer.ts for file scanning
- [ ] T100 [P] Add logging throughout all analyzers, brainstormers, generators for debugging
- [ ] T101 Validate roadmap output against quickstart.md validation criteria
- [ ] T102 Run performance benchmarks (verify < 5 min for 100k LOC target)
- [ ] T103 Code cleanup and remove any TODO/FIXME comments
- [ ] T104 Final integration test: Generate roadmap for StackShift itself, verify accuracy against manual gap analysis

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Independent of US1
  - US3 (Phase 5): Can start after Foundational - Independent of US1, US2
  - US4 (Phase 6): Depends on US1, US2, US3 (needs gaps + features as input)
  - US5 (Phase 7): Depends on US4 (needs Roadmap to export)
- **MCP Tool (Phase 8)**: Depends on US1-US5 completion
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) [BLOCKS ALL]
    ↓
    ├─→ US1: Spec Gap Detection (Phase 3) ────────┐
    ├─→ US2: Feature Gap Analysis (Phase 4) ──────┤
    ├─→ US3: Feature Brainstorming (Phase 5) ─────┤
    │                                              ↓
    │                                   US4: Roadmap Generation (Phase 6)
    │                                              ↓
    │                                   US5: Export & Tracking (Phase 7)
    │                                              ↓
    └──────────────────────────────────→ MCP Tool Integration (Phase 8)
                                                   ↓
                                        Polish (Phase 9)
```

### Parallel Opportunities

**Within Setup (Phase 1):**
- T003 and T004 can run in parallel (different directories)
- T005 and T006 can run in parallel (different files)

**Within Foundational (Phase 2):**
- T008, T009, T010, T011, T012 can all run in parallel (different files)

**Between User Stories:**
- US1, US2, US3 can be implemented in parallel by different developers
- US4 must wait for US1, US2, US3 to complete
- US5 must wait for US4 to complete

**Within US1:**
- T013, T014, T015 can run in parallel (different concerns)

**Within US2:**
- T024, T025, T026 can run in parallel (different files)
- T034, T035 can run in parallel (CompletenessAnalyzer is separate)

**Within US3:**
- T037, T038, T039, T040 can run in parallel (different files)
- T044-T048 can all run in parallel (different scoring methods)

**Within US4:**
- T053, T054, T055, T056 can run in parallel (different files/concerns)
- T061, T062, T063 can run in parallel (different timeline calculations)

**Within US5:**
- T071, T072, T073 can run in parallel (different files)
- T074, T075, T076, T077 can run in parallel (different exporters)
- T080, T081, T082, T083, T084 can run in parallel (different tracking methods)

---

## Parallel Example: User Story 1 (Spec Gap Detection)

```shell
# Launch foundation utilities in parallel:
Task: "Implement SpecParser utility in mcp-server/src/analyzers/utils/spec-parser.ts"
Task: "Implement FileSearcher utility in mcp-server/src/analyzers/utils/file-searcher.ts"
Task: "Implement ASTParser utility in mcp-server/src/analyzers/utils/ast-parser.ts"
Task: "Implement ConfidenceScorer utility in mcp-server/src/analyzers/utils/confidence-scorer.ts"

# Then launch US1 tasks in parallel:
Task: "Create Evidence type in mcp-server/src/types/roadmap.ts"
Task: "Implement parseSpecFile in mcp-server/src/analyzers/gap-analyzer.ts"
Task: "Implement findSpecFiles in mcp-server/src/analyzers/gap-analyzer.ts"
```

---

## Parallel Example: User Story 3 (Feature Brainstorming)

```shell
# Launch all scoring methods in parallel:
Task: "Implement scoreImpact in mcp-server/src/brainstorming/scoring-engine.ts"
Task: "Implement scoreEffort in mcp-server/src/brainstorming/scoring-engine.ts"
Task: "Implement calculateROI in mcp-server/src/brainstorming/scoring-engine.ts"
Task: "Implement scoreStrategicValue in mcp-server/src/brainstorming/scoring-engine.ts"
Task: "Implement scoreRisk in mcp-server/src/brainstorming/scoring-engine.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US4 Minimum)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Spec Gap Detection) - **Core capability**
4. Skip US2, US3 temporarily
5. Complete Phase 6: US4 (Roadmap Generation) using only US1 gaps - **Minimal roadmap**
6. Complete Phase 7: US5 (Export to Markdown only)
7. **STOP and VALIDATE**: Test gap detection + basic roadmap generation
8. Deploy/demo if ready

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Spec Gaps) → Test independently → **Can detect spec gaps!**
3. Add US2 (Feature Gaps) → Test independently → **Can detect doc inaccuracies!**
4. Add US3 (Brainstorming) → Test independently → **Can suggest features!**
5. Add US4 (Roadmap Gen) → Test with all inputs → **Can generate complete roadmaps!**
6. Add US5 (Export) → Test all formats → **Can export to Markdown/JSON/CSV!**
7. Add Phase 8 (MCP Tool) → **Integrate into StackShift workflow!**
8. Add Phase 9 (Polish) → **Production ready!**

### Parallel Team Strategy (3 Developers)

With 3 developers after Foundational phase completes:

1. **Developer A**: US1 (Spec Gap Detection)
2. **Developer B**: US2 (Feature Gap Analysis)
3. **Developer C**: US3 (Feature Brainstorming)
4. **All together**: US4 (Roadmap Generation) - needs all inputs
5. **Developer A**: US5 (Export & Tracking)
6. **Developer B**: MCP Tool Integration
7. **Developer C**: Polish & Documentation

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - Spec Gap Detection)**: 11 tasks
- **Phase 4 (US2 - Feature Completeness)**: 13 tasks
- **Phase 5 (US3 - Feature Brainstorming)**: 16 tasks
- **Phase 6 (US4 - Roadmap Generation)**: 18 tasks
- **Phase 7 (US5 - Export & Tracking)**: 17 tasks
- **Phase 8 (MCP Tool)**: 7 tasks
- **Phase 9 (Polish)**: 10 tasks

**Total Tasks**: 104 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel

**Estimated Timeline**:
- 1 developer (sequential): 12-15 weeks
- 2 developers (parallel where possible): 7-9 weeks
- 3 developers (parallel where possible): 5-7 weeks

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific functional requirement for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group (T001-T006, T013-T023, etc.)
- Stop at any checkpoint to validate story independently
- **Tests are OPTIONAL**: No test tasks included per spec - can add unit/integration tests if desired
- Prioritize US1 + US4 for MVP (gap detection + basic roadmap generation)
- US2, US3 add significant value but are not strictly required for minimal functionality
- Performance target: < 5 minutes for 100k LOC codebase (validate in T102)
- Accuracy target: 90%+ gap detection precision (validate against manual analysis in T104)
