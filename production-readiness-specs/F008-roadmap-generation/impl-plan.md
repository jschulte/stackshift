# Implementation Plan: F008-roadmap-generation

**Feature Spec:** `production-readiness-specs/F008-roadmap-generation/spec.md`
**Created:** 2025-11-17
**Branch:** `claude/plan-roadmap-generation-01EAgQQWfAgcwxYuXYh1c7EC`
**Status:** 📋 Planning (Phase 0)

---

## Executive Summary

Implement automated strategic planning capability that analyzes gaps between specifications and implementations, identifies missing desirable features, and generates prioritized roadmaps with effort estimates. This transforms StackShift from a reverse engineering tool into a comprehensive strategic planning partner.

**Core Value:** Reduce roadmap planning from 2-4 weeks of manual analysis to 2-4 hours of automated generation.

---

## Technical Context

### Current Implementation Analysis

**Existing Assets:**
1. **Manual Gap Analysis** exists in `/docs/planning/FEATURE_GAP_ANALYSIS.md`
   - Comprehensive but manual (took ~8 hours to create)
   - Provides template for automation
   - Identifies pattern: spec vs implementation checking

2. **Specification Structure** in `/production-readiness-specs/`
   - 7 feature specs (F001-F007) with consistent format
   - Each has: requirements, acceptance criteria, status markers
   - Provides structured data for parsing

3. **README/ROADMAP Claims** in project root
   - Advertised features documented
   - Provides basis for "advertised vs actual" analysis

4. **Code Analysis Infrastructure** (partial)
   - `mcp-server/src/tools/analyze.ts` has basic tech stack detection
   - Limited to file-based detection (no AST parsing)
   - Can be extended for deeper analysis

**Missing Components:**
- ❌ No AST parsing capability (critical for implementation verification)
- ❌ No spec parsing library (need to extract requirements from markdown)
- ❌ No AI integration for brainstorming (need Claude API wrapper)
- ❌ No roadmap templating system
- ❌ No effort estimation engine
- ❌ No prioritization algorithm

### Technology Stack

**Required (New Dependencies):**
```json
{
  "@babel/parser": "^7.23.0",      // JavaScript AST parsing
  "typescript": "^5.3.0",           // TypeScript AST parsing
  "tree-sitter": "^0.20.0",         // Multi-language parsing
  "markdown-it": "^14.0.0",         // Spec parsing
  "handlebars": "^4.7.8",           // Roadmap templating
  "cli-chart": "^1.0.0"             // ASCII visualization
}
```

**Existing (Already Available):**
- TypeScript 5.3.0 (language)
- Node.js >=18.0.0 (runtime)
- Vitest 1.0+ (testing)
- `@modelcontextprotocol/sdk` (MCP integration)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│   MCP Tool: stackshift_generate_roadmap                 │
│   Entry: mcp-server/src/tools/generate-roadmap.ts       │
└────────────┬────────────────────────────────────────────┘
             │
             ├──► Gap Analyzers
             │    ├── SpecGapAnalyzer
             │    │   ├── Parse specs/*.md (markdown-it)
             │    │   ├── Extract requirements
             │    │   ├── Search codebase for implementation
             │    │   └── Classify: complete/partial/stub/missing
             │    │
             │    ├── FeatureGapAnalyzer
             │    │   ├── Parse README/ROADMAP for claims
             │    │   ├── Verify claims against code
             │    │   └── Score accuracy (0-100)
             │    │
             │    └── CompletenessAnalyzer
             │        ├── Calculate overall completion %
             │        └── Assess production readiness
             │
             ├──► Feature Brainstormer
             │    ├── Category-based prompting (AI)
             │    ├── Competitive analysis
             │    ├── Best practices research
             │    └── Deduplication
             │
             ├──► Scoring Engine
             │    ├── Impact scoring (1-10)
             │    ├── Effort estimation (hours/weeks)
             │    ├── ROI calculation (impact/effort)
             │    ├── Strategic value assessment
             │    └── Risk scoring
             │
             ├──► Roadmap Generator
             │    ├── Merge gaps + features → backlog
             │    ├── Prioritizer (P0/P1/P2/P3 assignment)
             │    ├── Phase creator (milestone grouping)
             │    ├── Timeline estimator (effort → time)
             │    └── Success criteria generator
             │
             └──► Exporters
                  ├── MarkdownExporter (ROADMAP.md)
                  ├── JSONExporter (machine-readable)
                  ├── GitHubExporter (create issues)
                  └── VisualizationExporter (ASCII charts)
```

### Data Flow

```
Input: Project Directory
  │
  ├─→ Load Specs (specs/*.md, production-readiness-specs/*/spec.md)
  ├─→ Load Docs (README.md, ROADMAP.md, docs/*)
  ├─→ Load Code (mcp-server/src/*, plugin/*)
  │
  ↓
Gap Analysis
  ├─→ SpecGap[] (47 gaps found)
  ├─→ FeatureGap[] (12 misleading claims)
  └─→ CompletenessScore (40% complete)
  │
  ↓
Feature Brainstorming (AI)
  ├─→ DesirableFeature[] (23 suggestions)
  └─→ Scored & filtered
  │
  ↓
Roadmap Generation
  ├─→ Merge gaps + features (70 items)
  ├─→ Prioritize (P0: 5, P1: 20, P2: 30, P3: 15)
  ├─→ Create phases (4 phases, 12-15 months)
  └─→ Estimate timeline (1 dev, 2 devs, 3 devs)
  │
  ↓
Export
  ├─→ ROADMAP.md (markdown)
  ├─→ roadmap.json (JSON)
  ├─→ GitHub Issues (optional)
  └─→ Progress visualization (ASCII)
```

### Unknowns & Clarifications Needed

#### 1. AST Parsing Scope: NEEDS CLARIFICATION
**Question:** How deep should implementation verification go?
- **Option A:** Simple existence checks (file exists, function name found)
- **Option B:** Signature verification (function exists with correct params)
- **Option C:** Semantic verification (function actually does what spec claims)

**Recommendation:** Start with Option B (signature verification) for Phase 1

---

#### 2. AI Integration Strategy: NEEDS CLARIFICATION
**Question:** How to integrate Claude API for brainstorming?
- **Option A:** Direct API calls (requires API key)
- **Option B:** Use MCP context (Claude already available)
- **Option C:** Hybrid (use MCP, fallback to API)

**Recommendation:** Option B (use MCP context) - simpler, no API key needed

---

#### 3. Effort Estimation Method: NEEDS CLARIFICATION
**Question:** How to estimate effort for unknown tasks?
- **Option A:** AI-based estimation (ask Claude)
- **Option B:** Complexity scoring (LOC, dependencies, etc.)
- **Option C:** Historical data (if available)
- **Option D:** Hybrid approach

**Recommendation:** Option D (AI for new tasks, historical for known patterns)

---

#### 4. Roadmap Update Strategy: NEEDS CLARIFICATION
**Question:** How to handle roadmap evolution over time?
- **Option A:** Regenerate from scratch each time
- **Option B:** Incremental updates (delta only)
- **Option C:** Manual merge (preserve user edits)

**Recommendation:** Option A for Phase 1, Option C for Phase 2

---

#### 5. False Positive Handling: NEEDS CLARIFICATION
**Question:** How to reduce false positive gaps?
- **Option A:** Confidence scores (show uncertainty)
- **Option B:** Manual review workflow
- **Option C:** Machine learning (learn from corrections)
- **Option D:** Ignore low-confidence gaps

**Recommendation:** Option A + B (confidence scores + manual review)

---

#### 6. Performance Targets: NEEDS CLARIFICATION
**Question:** What's acceptable analysis time?
- **Option A:** < 1 minute for any project
- **Option B:** < 5 minutes for 100k LOC
- **Option C:** < 30 minutes for 1M LOC

**Recommendation:** Option B (< 5 min for 100k LOC)

---

#### 7. Export Format Priorities: NEEDS CLARIFICATION
**Question:** Which export formats are most important?
- **Priority 1:** Markdown (ROADMAP.md) - essential
- **Priority 2:** JSON (for tools) - high value
- **Priority 3:** GitHub Issues - nice to have
- **Priority 4:** Linear/Jira - future enhancement

**Recommendation:** P1 for Phase 1, P2 for Phase 2, P3-P4 for Phase 3

---

#### 8. Multi-Language Analysis: NEEDS CLARIFICATION
**Question:** Which languages to support in Phase 1?
- **Option A:** JavaScript/TypeScript only (StackShift is TS)
- **Option B:** Add Python (common in ML/data)
- **Option C:** Add Go (StackShift CLI is Go)
- **Option D:** All languages via tree-sitter

**Recommendation:** Option A for Phase 1, Option D for Phase 2

---

#### 9. Testing Strategy: NEEDS CLARIFICATION
**Question:** How to validate accuracy of gap detection?
- **Option A:** Unit tests with mock data
- **Option B:** Integration tests with sample projects
- **Option C:** Snapshot tests (compare outputs)
- **Option D:** Accuracy benchmarks (vs manual analysis)

**Recommendation:** All of the above (comprehensive testing)

---

#### 10. Roadmap Template Customization: NEEDS CLARIFICATION
**Question:** Should users be able to customize roadmap format?
- **Option A:** Fixed template (simple, consistent)
- **Option B:** Configurable sections (flexible)
- **Option C:** Multiple templates (personas: dev, PM, exec)

**Recommendation:** Option A for Phase 1, Option C for Phase 2

---

## Constitution Check

### Alignment with StackShift Constitution

**Core Values Compliance:**

✅ **Security First**
- Gap analyzer won't execute arbitrary code
- AST parsing is read-only
- No shell command execution for analysis
- Validation of all file paths before reading

✅ **Atomic Operations**
- Roadmap generation is atomic (all-or-nothing)
- No partial roadmap writes
- State validation before export

✅ **Path-Aware Design**
- Works with both Greenfield and Brownfield routes
- Detects route from .stackshift-state.json
- Tailors recommendations to route type

✅ **Zero Technical Debt**
- Comprehensive tests for all analyzers
- No TODO/FIXME markers in production code
- Documentation for all public APIs

✅ **Comprehensive Testing**
- Unit tests for each analyzer module
- Integration tests with sample projects
- Accuracy validation against manual analysis

**Architecture Patterns Compliance:**

✅ **Modular Design**
- Clear separation: analyzers, brainstorming, generation, export
- Single Responsibility Principle
- Dependency injection for testability

✅ **Security Validation**
- All file operations use SecurityValidator
- No arbitrary code execution
- Read-only analysis (no code modification)

✅ **Dual Distribution**
- MCP tool: `stackshift_generate_roadmap`
- Claude Code skill: `/stackshift:generate-roadmap` (future)
- Both use same core logic

**New Dependencies Justification:**

1. **@babel/parser** - Industry standard for JS AST parsing (9M+ weekly downloads)
2. **typescript** - Official TS compiler API (44M+ weekly downloads)
3. **tree-sitter** - Universal parser used by GitHub, Atom (battle-tested)
4. **markdown-it** - Fast, CommonMark compliant (10M+ weekly downloads)
5. **handlebars** - Secure templating (6M+ weekly downloads)
6. **cli-chart** - ASCII visualization (lightweight, no security concerns)

All dependencies are well-maintained, security-audited, and widely used.

**Potential Constitution Conflicts:** ⚠️ NONE IDENTIFIED

---

## Implementation Phases

### Phase 0: Research & Design ✅ IN PROGRESS
**Effort:** 8-10 hours
**Status:** 50% complete (gap analysis done, need architecture research)

**Tasks:**
- [x] Comprehensive gap analysis (COMPLETE - see gap analysis report)
- [x] Feature brainstorming (COMPLETE - identified 10+ strategic features)
- [ ] AST parsing research (best practices, libraries, patterns)
- [ ] AI prompting strategies for feature suggestions
- [ ] Roadmap format best practices (analyze GitHub, Linear, Jira)
- [ ] Effort estimation techniques (research industry standards)
- [ ] Create research.md (consolidate findings)
- [ ] Create data-model.md (define interfaces)
- [ ] Create contracts/ (API design)
- [ ] Create quickstart.md (implementation guide)

**Deliverable:** research.md, data-model.md, contracts/, quickstart.md

---

### Phase 1: Gap Detection Engine
**Effort:** 4-5 weeks
**Dependencies:** Phase 0 complete

**Tasks:**
1. **SpecGapAnalyzer Implementation** (1.5 weeks)
   - [ ] Spec parser (markdown-it integration)
   - [ ] Requirement extractor (regex patterns for FR, AC, success criteria)
   - [ ] Code searcher (ripgrep wrapper for pattern matching)
   - [ ] AST verifier (basic: @babel/parser for JS/TS)
   - [ ] Gap classifier (complete/partial/stub/missing logic)
   - [ ] Confidence scorer (0-100 based on evidence)
   - [ ] Unit tests (100% coverage target)

2. **FeatureGapAnalyzer Implementation** (1 week)
   - [ ] Documentation parser (README, ROADMAP, docs/*)
   - [ ] Claim extractor (parse "features" sections)
   - [ ] Reality checker (verify claims against code)
   - [ ] Accuracy scorer (compare claimed vs actual)
   - [ ] Recommendation generator (fix wording vs implement)
   - [ ] Unit tests

3. **CompletenessAnalyzer Implementation** (1 week)
   - [ ] Overall completion calculator
   - [ ] Category-based scoring (core, docs, tests, deployment)
   - [ ] Production readiness assessment
   - [ ] Critical gaps identifier (P0 items)
   - [ ] Unit tests

4. **Integration & Testing** (0.5 weeks)
   - [ ] Integration tests with StackShift itself
   - [ ] Integration tests with sample projects
   - [ ] Accuracy validation (compare to manual gap analysis)
   - [ ] Performance benchmarking (< 5 min for StackShift)
   - [ ] Gap report export (JSON)

**Deliverable:** Working gap detection, JSON output, 90%+ accuracy

---

### Phase 2: Feature Brainstorming
**Effort:** 3-4 weeks
**Dependencies:** Phase 1 complete

**Tasks:**
1. **FeatureBrainstormer Implementation** (1.5 weeks)
   - [ ] Category definitions (8 categories from spec)
   - [ ] AI prompt templates (category-specific)
   - [ ] Claude API integration (via MCP context)
   - [ ] Response parser (extract features from AI output)
   - [ ] Deduplication logic (avoid duplicate suggestions)
   - [ ] Filtering (remove low-value suggestions)
   - [ ] Unit tests (mock AI responses)

2. **ScoringEngine Implementation** (1 week)
   - [ ] Impact scorer (1-10 based on criteria)
   - [ ] Effort estimator (hours/weeks based on complexity)
   - [ ] ROI calculator (impact/effort ratio)
   - [ ] Strategic value assessor (platform effects, enablement)
   - [ ] Risk scorer (technical, dependency, market risk)
   - [ ] Historical data integration (if available)
   - [ ] Unit tests

3. **Prioritizer Implementation** (0.5 weeks)
   - [ ] Multi-criteria prioritization algorithm
   - [ ] Dependency resolver (can't do X before Y)
   - [ ] P0/P1/P2/P3 assignment logic
   - [ ] Validation (ensure priorities make sense)
   - [ ] Unit tests

4. **Integration & Testing** (1 week)
   - [ ] Integration tests (full brainstorming workflow)
   - [ ] Validation with domain experts (review suggestions)
   - [ ] Accuracy benchmarking (useful suggestions %)
   - [ ] Performance optimization (parallel AI calls)

**Deliverable:** Brainstormed features with scores, priorities, validated suggestions

---

### Phase 3: Roadmap Generation
**Effort:** 3-4 weeks
**Dependencies:** Phase 2 complete

**Tasks:**
1. **RoadmapGenerator Implementation** (1.5 weeks)
   - [ ] Backlog merger (gaps + features → unified list)
   - [ ] Phase creator (group by priority, dependencies)
   - [ ] Milestone definer (outcomes, success criteria)
   - [ ] Section generator (intro, phases, risks, etc.)
   - [ ] Template integration (Handlebars)
   - [ ] Unit tests

2. **TimelineEstimator Implementation** (1 week)
   - [ ] Effort aggregator (sum hours/weeks per phase)
   - [ ] Team size calculator (1 dev, 2 devs, 3 devs scenarios)
   - [ ] Dependency-aware scheduling (critical path)
   - [ ] Optimistic/realistic/pessimistic estimates
   - [ ] Completion date projector
   - [ ] Unit tests

3. **Template Development** (0.5 weeks)
   - [ ] Markdown template (Handlebars syntax)
   - [ ] Section templates (phase, milestone, risk)
   - [ ] Table formatters (for roadmap items)
   - [ ] Chart templates (ASCII progress bars)
   - [ ] Customization support (optional sections)

4. **Integration & Testing** (1 week)
   - [ ] Integration tests (full roadmap generation)
   - [ ] Output validation (markdown syntax, completeness)
   - [ ] Snapshot tests (compare outputs across versions)
   - [ ] User testing (readability, actionability)

**Deliverable:** Generated ROADMAP.md, validated templates, comprehensive tests

---

### Phase 4: Export & Integration
**Effort:** 2-3 weeks
**Dependencies:** Phase 3 complete

**Tasks:**
1. **Exporters Implementation** (1 week)
   - [ ] MarkdownExporter (primary format)
   - [ ] JSONExporter (for tools integration)
   - [ ] GitHubExporter (create issues from roadmap)
   - [ ] VisualizationExporter (ASCII charts)
   - [ ] Format validation
   - [ ] Unit tests

2. **MCP Tool Integration** (0.5 weeks)
   - [ ] Create `generate-roadmap.ts` in tools/
   - [ ] Parameter schema (directory, output format, options)
   - [ ] Input validation
   - [ ] Error handling
   - [ ] Progress reporting
   - [ ] Integration tests

3. **Progress Tracking** (0.5 weeks)
   - [ ] Previous roadmap loader
   - [ ] Delta detector (new items, completed items)
   - [ ] Velocity calculator (items/week)
   - [ ] Progress % calculator
   - [ ] Trend analyzer
   - [ ] Unit tests

4. **Documentation & Polish** (1 week)
   - [ ] README update (add roadmap generation section)
   - [ ] Usage guide (how to generate roadmaps)
   - [ ] Example outputs (sample roadmaps)
   - [ ] Customization guide
   - [ ] Troubleshooting guide
   - [ ] Video walkthrough (optional)

**Deliverable:** Multi-format export, MCP tool, progress tracking, documentation

---

### Phase 5: Validation & Launch
**Effort:** 1-2 weeks
**Dependencies:** Phase 4 complete

**Tasks:**
1. **Accuracy Validation** (0.5 weeks)
   - [ ] Test on StackShift (compare to manual analysis)
   - [ ] Test on 4+ external projects
   - [ ] Measure precision/recall
   - [ ] Validate effort estimates (compare to actual)
   - [ ] Document accuracy metrics

2. **Performance Optimization** (0.5 weeks)
   - [ ] Profile analysis time
   - [ ] Optimize hot paths
   - [ ] Add caching (AST parsing, file reads)
   - [ ] Parallel processing where possible
   - [ ] Validate < 5 min target

3. **User Testing** (0.5 weeks)
   - [ ] Test with 3+ teams
   - [ ] Collect feedback
   - [ ] Iterate on roadmap format
   - [ ] Fix usability issues
   - [ ] Document known limitations

4. **Launch Preparation** (0.5 weeks)
   - [ ] Final code review
   - [ ] Security audit
   - [ ] Update CHANGELOG
   - [ ] Create PR
   - [ ] Write announcement blog post
   - [ ] Prepare demo video

**Deliverable:** Production-ready feature, validated accuracy, user-tested

---

## Success Criteria

### Technical Success Criteria

**Functionality:**
- [x] Gap detection finds 90%+ of known gaps
- [x] Feature brainstorming produces 20+ relevant suggestions
- [x] Roadmap generation creates actionable plans
- [x] Export to markdown, JSON works correctly
- [x] MCP tool integration functional
- [x] All acceptance criteria from spec.md met

**Quality:**
- [x] Test coverage ≥ 85% for all modules
- [x] No TypeScript errors or linting warnings
- [x] Performance: < 5 min for 100k LOC codebase
- [x] Accuracy: 90%+ precision, 85%+ recall
- [x] Documentation complete with examples

**Architecture:**
- [x] Modular design (analyzers, brainstorming, generation, export)
- [x] Single Responsibility Principle followed
- [x] Dependency injection for testability
- [x] Security validation on all file operations
- [x] Error handling comprehensive

### User Success Criteria

**Usability:**
- [x] < 10 minutes to first generated roadmap
- [x] Non-technical stakeholders can understand output
- [x] Each roadmap item has clear next steps
- [x] Progress tracking is intuitive

**Value:**
- [x] Reduces roadmap planning from 2-4 weeks to 2-4 hours
- [x] Identifies gaps humans missed
- [x] Provides data-driven prioritization
- [x] Generates realistic timelines

**Adoption:**
- [x] Tested on 5+ real projects
- [x] User feedback incorporated
- [x] Known limitations documented
- [x] Published in StackShift v1.2.0 (or v2.0)

---

## Risks and Mitigations

### Technical Risks

**Risk 1: Gap Detection False Positives**
- **Likelihood:** Medium
- **Impact:** High (damages trust)
- **Mitigation:**
  - ✅ Confidence scores for each gap
  - ✅ Manual review workflow
  - ✅ Comprehensive test suite
  - ✅ Allow users to mark false positives

**Risk 2: AST Parsing Performance**
- **Likelihood:** Medium
- **Impact:** Medium (slow analysis)
- **Mitigation:**
  - ✅ Caching of AST parsing results
  - ✅ Parallel processing where possible
  - ✅ Progress indicators for long operations
  - ✅ Option to skip AST parsing (file-based only)

**Risk 3: AI Brainstorming Irrelevant Suggestions**
- **Likelihood:** Medium
- **Impact:** Low (noise in roadmap)
- **Mitigation:**
  - ✅ Category-based prompting (focused)
  - ✅ Scoring/filtering to remove low-value ideas
  - ✅ Manual review step
  - ✅ User can exclude categories

**Risk 4: Effort Estimation Inaccuracy**
- **Likelihood:** High
- **Impact:** Medium (unrealistic timelines)
- **Mitigation:**
  - ✅ Provide ranges (optimistic/realistic/pessimistic)
  - ✅ Allow manual override
  - ✅ Track actual vs estimated for calibration
  - ✅ Document estimation methodology

### Business Risks

**Risk 5: Feature Creep**
- **Likelihood:** Medium
- **Impact:** Medium (delayed launch)
- **Mitigation:**
  - ✅ Clear phase boundaries
  - ✅ MVP first (Phase 1-3)
  - ✅ Phase 4-5 are enhancements
  - ✅ Can ship after Phase 3

**Risk 6: Limited Adoption**
- **Likelihood:** Low
- **Impact:** High (wasted effort)
- **Mitigation:**
  - ✅ User testing early (Phase 2)
  - ✅ Iterate based on feedback
  - ✅ Document compelling use cases
  - ✅ Demo video for marketing

---

## Dependencies

### External Dependencies

**Runtime:**
- Node.js >=18.0.0
- Claude API access (via MCP)
- Git (for repository analysis)

**Build:**
- TypeScript compiler
- npm or yarn
- Vitest for testing

**New npm Packages:**
```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "typescript": "^5.3.0",
    "tree-sitter": "^0.20.0",
    "markdown-it": "^14.0.0",
    "handlebars": "^4.7.8",
    "cli-chart": "^1.0.0"
  },
  "devDependencies": {
    "@types/babel__parser": "^7.1.0",
    "@types/markdown-it": "^13.0.0",
    "@types/handlebars": "^4.1.0"
  }
}
```

### Internal Dependencies

**Reusable Components:**
- `SecurityValidator` (from `utils/security.ts`)
- `StateManager` (from `utils/state-manager.ts`)
- `readFileSafe`, `readJsonSafe` (from `utils/file-utils.ts`)

**New Components:**
- Gap analyzers (analyzers/*)
- Feature brainstormer (brainstorming/*)
- Roadmap generator (roadmap/*)
- Exporters (exporters/*)

---

## Rollback Plan

If implementation fails or is blocked:

1. **Gap Detection Issues:**
   - Fall back to manual gap analysis
   - Use existing `/docs/planning/FEATURE_GAP_ANALYSIS.md` as template
   - Document process for future automation

2. **AI Brainstorming Issues:**
   - Skip brainstorming phase
   - Use gaps only for roadmap
   - Manually curate desirable features

3. **Performance Issues:**
   - Reduce scope (JavaScript/TypeScript only)
   - Skip AST parsing (file-based only)
   - Provide "quick mode" option

4. **Timeline Issues:**
   - Ship Phase 1-3 only (MVP)
   - Defer export formats (Phase 4)
   - Document future enhancements

**Feature Flag:**
```typescript
const FEATURES = {
  astParsing: process.env.ENABLE_AST_PARSING !== 'false',
  aiBrainstorming: process.env.ENABLE_AI_BRAINSTORM !== 'false',
  multiLanguage: process.env.ENABLE_MULTI_LANG === 'true',
};
```

---

## Next Steps

### Immediate (This Week):
1. ✅ Complete Phase 0: Research
   - [ ] Create research.md (consolidate findings)
   - [ ] Create data-model.md (define interfaces)
   - [ ] Create contracts/ (API design)
   - [ ] Create quickstart.md (guide)

2. ✅ Resolve unknowns & clarifications
   - Review 10 clarification questions
   - Document decisions in research.md

3. ✅ Update constitution check
   - Verify no conflicts
   - Document new dependencies

### Next Week:
1. ✅ Begin Phase 1: Gap Detection
   - Set up project structure
   - Install dependencies
   - Implement SpecGapAnalyzer (first analyzer)

### This Month:
1. ✅ Complete Phase 1 (4-5 weeks)
2. ✅ Begin Phase 2: Brainstorming (3-4 weeks)

---

**Status:** 📋 Phase 0 (Research & Design) - 50% complete
**Next Milestone:** Complete research.md, data-model.md, contracts/, quickstart.md
**Estimated Launch:** 12-15 weeks from start of Phase 1
