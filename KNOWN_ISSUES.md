# Known Issues

**Last Updated**: 2024-11-17

---

## 🟡 TypeScript Build Issues (F008 Roadmap)

**Status**: MCP server builds with type errors. Core gears (1-3) and F002 tools work correctly.

**Impact**: F008 roadmap generation has remaining logic errors after type definition fixes.

### F008 Roadmap Generation (~47 remaining errors)

**Files**:
- `src/brainstorming/feature-brainstormer.ts`
- `src/brainstorming/scoring-engine.ts`
- `src/exporters/roadmap-exporter.ts`
- `src/roadmap/prioritizer.ts`
- `src/roadmap/roadmap-generator.ts`

**Partial Fixes Applied**:
- ✅ Added missing properties to `DesirableFeature` (title, strategicAlignment)
- ✅ Added missing properties to `ScoredFeature` (impact)
- ✅ Added missing properties to `RoadmapItem` (assignee, source)
- ✅ Extended `RoadmapItemType` enum (gap-fix, feature)
- ✅ Extended `FeatureCategory` enum (integrations)
- ✅ Added success property to `ExportResult`
- ✅ Added downlevelIteration to tsconfig.json

**Remaining Issues** (~47 errors):
- Logic errors in brainstorming/scoring-engine.ts (treating numbers as arrays)
- Type mismatches in feature-brainstormer.ts
- Export path handling in roadmap-exporter.ts
- Nullable safety in roadmap-generator.ts
- Timeline interface hours property inconsistency

**Impact**: F008 tools exist but cannot be called from Gear 4 until fixed.

**Workaround**: Use `/speckit.analyze` manually for gap analysis.

**Priority**: P2 (Medium) - Advanced feature, doesn't block core workflow

---

## 🟢 What Works

- ✅ All core gears (1-6)
- ✅ F002 automated spec generation (Gear 3 integration)
- ✅ CLI orchestrator (batch processing)
- ✅ Plugin skills (interactive workflow)
- ✅ Web prompts (manual usage)
- ✅ Spec sync hooks (PreToolUse + PostToolUse)
- ✅ State management and security

---

## 📋 Fix Priorities

**P1 High**: None (core functionality works)

**P2 Medium**:
- Fix F008 type errors (enables full Gear 4 automation)
- Implement F005 (Mermaid diagrams)

**P3 Low**:
- Fix F002 iterator warnings
- Implement F003/F004 (AST support)

**See specs**: `production-readiness-specs/F00*/` for implementation details
