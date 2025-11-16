# Feature: Feature Implementation (Gear 6)

**Feature ID**: implement
**Status**: ✅ COMPLETE
**Priority**: P0
**Route**: Brownfield

## Overview
Systematically implements missing/partial features using `/speckit.implement` workflow, tracking completion against spec requirements.

## User Stories

**US-011**: Systematic Implementation
- [x] Generates tasks per feature (/speckit.tasks)
- [x] Executes implementation (/speckit.implement)
- [x] Validates against acceptance criteria
- [x] Updates spec status (❌ → ✅)

## Technical Requirements
- **File**: `mcp-server/src/tools/implement.ts` (198 lines)
- **Input**: `{ directory?, feature?: string }`
- **Validation**: Feature name max 200 chars, no path separators

## Implementation Status
- ✅ Feature name validation
- ✅ Specific feature mode
- ✅ All features mode
- ✅ Handoff workflow
- ❌ Unit tests (0% coverage)

**Required Tests**: ~2 hours

---

**Specification Version**: 1.0.0
