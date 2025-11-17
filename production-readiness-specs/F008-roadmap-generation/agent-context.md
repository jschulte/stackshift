# Agent Context: F008 Roadmap Generation

**Feature:** F008-roadmap-generation
**Status:** 📋 Planning Complete (Phase 0)
**Last Updated:** 2025-11-17

---

## Quick Reference

### What This Feature Does

Automated strategic planning tool that:
1. Analyzes gaps between specifications and implementation
2. Identifies advertised features that don't match reality
3. Brainstorms desirable features using AI
4. Generates prioritized roadmaps with effort estimates
5. Exports to multiple formats (Markdown, JSON, GitHub Issues)

### Key Technologies

- **AST Parsing:** `@babel/parser`, `typescript` compiler API
- **Markdown Parsing:** `markdown-it`
- **Templating:** `handlebars`
- **AI Integration:** Claude via MCP context
- **Visualization:** `cli-chart` for ASCII charts

### Current Status

- ✅ Phase 0: Research & Design (COMPLETE)
  - spec.md created
  - impl-plan.md created
  - research.md created (all clarifications resolved)
  - data-model.md created (all interfaces defined)
  - contracts/README.md created (API contracts defined)
  - quickstart.md created (implementation guide)

- 📋 Phase 1: Gap Detection Engine (NOT STARTED)
  - SpecGapAnalyzer
  - FeatureGapAnalyzer
  - CompletenessAnalyzer

- 📋 Phase 2: Feature Brainstorming (NOT STARTED)
- 📋 Phase 3: Roadmap Generation (NOT STARTED)
- 📋 Phase 4: Export & Integration (NOT STARTED)

### File Locations

```
production-readiness-specs/F008-roadmap-generation/
├── spec.md                 # Feature specification
├── impl-plan.md            # Implementation plan with technical context
├── research.md             # Research findings & decisions
├── data-model.md           # TypeScript interfaces & types
├── quickstart.md           # Developer implementation guide
├── contracts/
│   └── README.md           # API contracts
└── agent-context.md        # This file
```

---

## For AI Agents

### When to Use This Feature

Use F008 roadmap generation when:
- User asks "what's missing in this project?"
- User asks "what features should we build next?"
- User asks "create a roadmap"
- User asks "analyze gaps between specs and code"
- User asks "what's the current completion status?"

### How to Use

```bash
# Once implemented (Phase 4):
/stackshift:generate-roadmap

# Or via MCP tool:
stackshift_generate_roadmap { "directory": "/path/to/project" }
```

### Current Implementation Status

**Not yet implemented** - Still in planning phase (Phase 0 complete).

To implement:
1. Read quickstart.md for step-by-step implementation guide
2. Start with Phase 1: Gap Detection Engine
3. Follow the 4-phase implementation plan
4. Estimated timeline: 12-15 weeks for full implementation

---

## Technical Decisions Made

### 1. AST Parsing Strategy
- **Decision:** Signature Verification (Option B)
- **Rationale:** Balance of accuracy vs performance
- **Implementation:** Use `@babel/parser` for JavaScript/TypeScript

### 2. AI Integration
- **Decision:** Use MCP Context (Option B)
- **Rationale:** No API key needed, free to users
- **Implementation:** Claude via MCP message passing

### 3. Effort Estimation
- **Decision:** Hybrid Approach (Option D)
- **Rationale:** Combine historical, AI, complexity scoring
- **Implementation:** Fallback chain with confidence scores

### 4. Roadmap Updates
- **Decision:** Regenerate from Scratch (Phase 1), Manual Merge (Phase 2)
- **Rationale:** Simple first, add complexity later
- **Implementation:** Overwrite ROADMAP.md with warning

### 5. Multi-Language Support
- **Decision:** JavaScript/TypeScript only for Phase 1
- **Rationale:** Prove value, largest user base
- **Implementation:** Add Python, Go in Phase 2 via tree-sitter

---

## Dependencies

### npm Packages Required

```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/types": "^7.23.0",
    "typescript": "^5.3.0",
    "markdown-it": "^14.0.0",
    "handlebars": "^4.7.8",
    "cli-chart": "^1.0.0",
    "p-limit": "^5.0.0",
    "ora": "^8.0.0"
  }
}
```

### Future Dependencies (Phase 2+)

```json
{
  "dependencies": {
    "tree-sitter": "^0.20.0",
    "tree-sitter-python": "^0.20.0",
    "tree-sitter-go": "^0.20.0"
  }
}
```

---

## Key Interfaces

### SpecGap

```typescript
interface SpecGap {
  id: string;
  spec: string;
  requirement: string;
  status: 'complete' | 'partial' | 'stub' | 'missing';
  confidence: number; // 0-100
  evidence: Evidence[];
  effort: EffortEstimate;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}
```

### Roadmap

```typescript
interface Roadmap {
  metadata: RoadmapMetadata;
  summary: RoadmapSummary;
  phases: Phase[];
  allItems: RoadmapItem[];
  priorities: { p0: {}, p1: {}, p2: {}, p3: {} };
  timeline: Timeline;
}
```

See [data-model.md](./data-model.md) for complete type definitions.

---

## Implementation Phases

### Phase 1: Gap Detection (4-5 weeks)
- SpecGapAnalyzer - Parse specs, search codebase, classify gaps
- FeatureGapAnalyzer - Parse docs, verify claims, score accuracy
- CompletenessAnalyzer - Calculate completion %, assess readiness

### Phase 2: Feature Brainstorming (3-4 weeks)
- FeatureBrainstormer - AI-powered feature suggestions
- ScoringEngine - Impact, effort, ROI, risk scoring
- Prioritizer - Multi-criteria prioritization

### Phase 3: Roadmap Generation (3-4 weeks)
- RoadmapGenerator - Merge gaps + features, create phases
- TimelineEstimator - Effort → time conversion, team sizing
- Template system - Handlebars templates for Markdown

### Phase 4: Export & Integration (2-3 weeks)
- MarkdownExporter - ROADMAP.md generation
- JSONExporter - Machine-readable format
- GitHubExporter - Create GitHub Issues
- MCP tool integration

---

## Performance Targets

- **Analysis Time:** < 5 minutes for 100k LOC codebase
- **StackShift (10k LOC):** < 30 seconds
- **Medium Project (50k LOC):** < 2 minutes
- **Large Project (100k LOC):** < 5 minutes

## Accuracy Targets

- **Gap Detection:** 90%+ precision, 85%+ recall
- **Effort Estimation:** ±30% accuracy for known domains
- **Priority Assignment:** 85%+ agreement with human judgment

---

## Example Output

```markdown
# StackShift Strategic Roadmap

**Generated:** 2025-11-17
**Total Items:** 70
**Completion:** 17%

## Phase 1: Foundation (Weeks 1-4)
**Goal:** Production readiness, trust, accuracy

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Fix F004 documentation gaps | 10h |
| P0 | Publish to npm (F005) | 4h |
| P0 | Update README accuracy | 2h |

**Total:** 16 hours
**Outcome:** v1.0.1 - Trustworthy, accurate, accessible

[... more phases ...]
```

---

## Related Features

- **F001:** Security Fixes (✅ Complete) - Shows example of completed spec
- **F007:** CLI Orchestrator (✅ Complete) - Similar complexity, good reference
- **Gear 4:** Gap Analysis - Manual process this feature automates

---

## Next Steps for Implementation

1. Install dependencies:
   ```bash
   cd mcp-server
   npm install --save @babel/parser @babel/types markdown-it handlebars
   ```

2. Create directory structure:
   ```bash
   mkdir -p src/analyzers/__tests__
   mkdir -p src/brainstorming/__tests__
   mkdir -p src/roadmap/__tests__
   mkdir -p src/exporters/__tests__
   ```

3. Implement Phase 1 (Gap Detection):
   - Follow [quickstart.md](./quickstart.md) step-by-step
   - Start with SpecGapAnalyzer
   - Write tests for each component
   - Validate against StackShift itself

4. Iterate through Phases 2-4

---

## Risks & Mitigations

**Risk: Gap Detection False Positives**
- Mitigation: Confidence scores, manual review workflow, comprehensive tests

**Risk: AST Parsing Performance**
- Mitigation: Caching, parallel processing, early termination

**Risk: AI Brainstorming Irrelevant Suggestions**
- Mitigation: Category-specific prompts, filtering, scoring

**Risk: Effort Estimation Inaccuracy**
- Mitigation: Provide ranges, track actual vs estimated, calibrate over time

---

## Status Summary

✅ **Phase 0 Complete** - All planning artifacts created
📋 **Ready for Phase 1** - Implementation can begin
⏱️ **Estimated Completion** - 12-15 weeks from Phase 1 start
🎯 **Target Version** - StackShift v1.2.0 (or v2.0)

**Last Updated:** 2025-11-17
