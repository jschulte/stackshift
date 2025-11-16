# Feature: Cruise Control (Automated Workflow)

**Feature ID**: cruise-control
**Status**: ✅ COMPLETE
**Priority**: P1
**Route**: Brownfield

## Overview
Automated hands-off mode that shifts through all 6 gears sequentially without manual intervention.

## User Stories

**US-012**: Fully Automated Workflow
- [x] Accepts configuration (route, clarifications strategy, implementation scope)
- [x] Executes all 6 gears automatically
- [x] Saves state after each gear
- [x] Resumes from checkpoint if interrupted

## Technical Requirements
- **File**: `mcp-server/src/tools/cruise-control.ts` (144 lines)
- **Input**: `{ directory?, route!, clarifications_strategy?, implementation_scope? }`
- **Config**: Stored in state file auto_mode: true

## Implementation Status
- ✅ Configuration validation
- ✅ Auto-mode setup
- ✅ State persistence
- ❌ Unit tests (0% coverage)

**Required Tests**: ~2 hours

---

**Specification Version**: 1.0.0
