# Known Issues & Fix Tracking

**Date**: 2024-11-17
**Status**: Active development

---

## 🔴 Critical: TypeScript Build Errors in F005/F008

**Status**: MCP server does not currently build due to type errors in merged PR code

**Affected Features**:
- F005 (Mermaid Diagrams) - Missing type definitions
- F008 (Roadmap Generation) - Type interface mismatches

### F008 Type Errors (62 errors)

**Files with errors**:
- `src/brainstorming/feature-brainstormer.ts`
  - `'integrations'` should be `'integration'` (FeatureCategory type)

- `src/brainstorming/scoring-engine.ts`
  - `ScoredFeature` missing `impact`, `title`, `strategicAlignment` properties
  - `DesirableFeature` type definition incomplete

- `src/exporters/roadmap-exporter.ts`
  - `ExportResult` missing `success` property
  - `RoadmapItem` missing `assignee`, `source` properties

- `src/roadmap/prioritizer.ts`
  - `RoadmapItemType` doesn't include `'gap-fix'`
  - Type errors in sorting functions

- `src/roadmap/roadmap-generator.ts`
  - Timeline interface missing `hours` property
  - `RoadmapItemType` enum incomplete

**Fix Required**:
1. Review `src/types/roadmap.ts` and add missing properties
2. Fix `FeatureCategory` enum to use correct values
3. Update all type interfaces to match usage
4. Run `npm test` to ensure no regressions

**Priority**: P1 (High) - Blocks Gear 4 automation

---

### F002 Minor Build Issues

**Files with errors**:
- `src/tools/create-impl-plans.ts` - Iterator downlevel compilation issue
- `src/utils/template-engine.ts` - Iterator downlevel compilation issue

**Fix Required**:
1. Add `"downlevelIteration": true` to `tsconfig.json`, OR
2. Change iterator usage to use Array.from()

**Priority**: P2 (Medium) - Gear 3 works but has compile warnings

**Workaround**: TypeScript compiles with errors but runtime works

---

### F005 Type Issues (Unknown count)

**Status**: Not verified - imported dependencies but not tested

**Likely Issues**:
- AST parser type definitions
- Mermaid generator interfaces
- Diagram embedder contracts

**Fix Required**: Implementation and testing of F005

**Priority**: P2 (Medium) - Feature not integrated into gears yet

---

## 🟡 Medium: Gears Not Fully Automated

**Status**: Some gears still return guidance instead of executing

### Current State

| Gear | Tool | Status | Should Be |
|------|------|--------|-----------|
| 1 | `stackshift_analyze` | ✅ Executes | Executes (tech detection, state) |
| 2 | `stackshift_reverse_engineer` | ⚠️ Guidance | Guidance (requires AI analysis) |
| 3 | `stackshift_create_specs` | ✅ **NOW FIXED** | Calls F002 automated tools |
| 4 | `stackshift_gap_analysis` | ⚠️ Guidance | Should call F008 (blocked by type errors) |
| 5 | `stackshift_complete_spec` | ⚠️ Guidance | Guidance (interactive) |
| 6 | `stackshift_implement` | ⚠️ Guidance | Guidance (complex implementation) |

### What Was Fixed

**Gear 3 (create-specs.ts)**:
- ✅ Now calls `generate All SpecsToolHandler` from F002
- ✅ Creates specs for ALL features (complete, partial, missing)
- ✅ Returns detailed success summary
- ✅ Handles errors gracefully with troubleshooting

**Gear 4 (gap-analysis.ts)**:
- ⚠️ Updated to call `generateRoadmapToolHandler` from F008
- ❌ **REVERTED** due to F008 type errors
- Must wait for F008 type fixes before re-enabling

### Action Items

- [ ] Fix F008 type errors (see above)
- [ ] Re-enable Gear 4 automation after F008 is fixed
- [ ] Test end-to-end workflow (Gears 1-6)

---

## 🟢 Resolved Issues

### ✅ Husky Deprecation Warning
**Status**: FIXED
**File**: `.husky/pre-commit`
**Change**: Removed deprecated `#!/usr/bin/env sh` and `. "$(dirname -- "$0")/_/husky.sh"` lines
**Result**: No more deprecation warnings

### ✅ Internal Company References
**Status**: FIXED
**Files**: `cli/README.md`, `cli/QUICKSTART.md`, `production-readiness-specs/F007-cli-orchestrator/spec.md`
**Change**: Replaced `wsm-*` internal names with generic examples
**Result**: Repository ready for public use

### ✅ Hardcoded Home Paths
**Status**: FIXED
**Files**: Multiple documentation files
**Change**: `/Users/jonahschulte/git` → `~/git`
**Result**: Portable documentation

### ✅ Duplicate Prompts
**Status**: FIXED
**Changes**:
- Removed `plugin/speckit-templates/` (exact duplicates)
- Archived `prompts/` to `legacy/original-prompts/`
- Removed unused `constitution-template.md`
**Result**: Clean, organized structure

### ✅ Incomplete Spec Coverage (Brownfield)
**Status**: FIXED
**Solution**: Created `web/reconcile-specs.md` comprehensive reconciliation prompt
**Result**: Can now create specs for ENTIRE app, not just gaps

### ✅ Spec Kit Conversion Tool
**Status**: CREATED
**File**: `web/convert-reverse-engineering-to-speckit.md`
**Result**: Can convert existing reverse engineering docs to proper Spec Kit format

---

## 📋 Implementation Priorities

### P0 - Critical (Blocks Core Functionality)
1. **Fix F008 Type Errors** (62 errors)
   - Unblocks Gear 4 automation
   - Enables automated roadmap generation
   - Estimated: 2-4 hours

### P1 - High (Improves Automation)
2. **Fix F002 Iterator Issues** (3 errors)
   - Add downlevelIteration or refactor iterators
   - Estimated: 30 minutes

3. **Test F002 End-to-End**
   - Verify Gear 3 actually creates all specs
   - Test with sample repository
   - Estimated: 1 hour

### P2 - Medium (Future Enhancements)
4. **Implement F005 (Mermaid Diagrams)**
   - Complete implementation from planning docs
   - Add to gear workflow
   - Estimated: 1-2 weeks

5. **Implement F006 (Automated Spec Updates)**
   - Git hooks for spec synchronization
   - Automatic drift detection
   - Estimated: 1 week

6. **Implement F003/F004 (AST Support)**
   - TypeScript AST utilities
   - Multi-language AST support
   - Estimated: 2-3 weeks

---

## 🔧 How to Fix

### Fix F008 Type Errors

1. **Update type definitions** in `src/types/roadmap.ts`:
   ```typescript
   export interface RoadmapItem {
     // Add missing properties:
     assignee?: string;
     source?: string;
     // ...
   }

   export type RoadmapItemType =
     | 'feature'
     | 'gap-fix'  // Add this
     | 'enhancement'
     | 'technical-debt';

   export interface ScoredFeature {
     // Add missing properties:
     impact?: number;
     title: string;
     // ...
   }
   ```

2. **Fix FeatureCategory** in brainstorming types:
   ```typescript
   type FeatureCategory =
     | 'authentication'
     | 'integration'  // Not 'integrations'
     | 'data'
     // ...
   ```

3. **Run tests**:
   ```bash
   npm run build
   npm test
   ```

### Fix F002 Iterator Issues

**Option A - Enable downlevel iteration**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "downlevelIteration": true
  }
}
```

**Option B - Refactor to use Array.from()**:
```typescript
// Instead of: for (const [key, value] of map)
// Use: for (const [key, value] of Array.from(map))
```

---

## 📊 Test Status

| Component | Build | Tests | Status |
|-----------|-------|-------|--------|
| Core Tools (Gears 1-2) | ✅ | ✅ | Working |
| Gear 3 (create-specs) | ⚠️ | ❓ | Updated, not tested |
| Gear 4 (gap-analysis) | ❌ | ❓ | Blocked by F008 errors |
| Gears 5-6 | ✅ | ✅ | Working (guidance) |
| F002 Tools | ⚠️ | ✅ | Minor iterator warnings |
| F008 Tools | ❌ | ❓ | 62 type errors |
| F005 Tools | ❓ | ❓ | Not integrated yet |

---

## 🎯 Next Steps

1. **Immediate**: Fix F008 type errors to enable builds
2. **Short-term**: Test Gear 3 with F002 integration
3. **Medium-term**: Implement remaining features (F005, F006)
4. **Long-term**: Complete F003/F004 AST support

---

**Last Updated**: 2024-11-17
**Tracking**: This file will be updated as issues are resolved
