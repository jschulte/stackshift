# Feature: Reverse Engineering Documentation (Gear 2)

**Feature ID**: reverse-engineer
**Status**: ✅ COMPLETE
**Priority**: P0 (Critical)
**Route**: Brownfield

---

## Overview

Deep codebase analysis that generates 8 comprehensive documentation files. Adapts extraction based on route: Greenfield extracts business logic only (tech-agnostic); Brownfield extracts business logic + technical implementation (tech-prescriptive).

---

## User Stories

### US-004: Path-Aware Documentation Extraction
**As a** developer
**I want** documentation extraction to adapt based on my chosen route
**So that** I get tech-agnostic specs (Greenfield) or tech-prescriptive specs (Brownfield)

**Acceptance Criteria:**
- [x] Checks route from state file
- [x] Greenfield: Extracts WHAT (business logic only)
- [x] Brownfield: Extracts WHAT + HOW (business + technical)
- [x] Generates 8 documentation files
- [x] Creates docs/reverse-engineering/ directory

### US-005: Comprehensive Documentation Coverage
**As a** developer
**I want** all aspects of my application documented
**So that** I have complete understanding for spec creation

**Acceptance Criteria:**
- [x] Functional specification (requirements, user stories)
- [x] Configuration reference (all config options)
- [x] Data architecture (models, schemas, APIs)
- [x] Operations guide (deployment, monitoring)
- [x] Technical debt analysis (issues, improvements)
- [x] Observability requirements (logging, metrics)
- [x] Visual design system (UI patterns, markdown standards)
- [x] Test documentation (coverage, strategy)

---

## Technical Requirements

### Implementation
- **File**: `mcp-server/src/tools/reverse-engineer.ts` (115 lines)
- **Framework**: TypeScript 5.3.0
- **MCP Tool**: `stackshift_reverse_engineer`
- **Agent**: Uses `stackshift:code-analyzer` (or Explore fallback)

### Input Parameters
```typescript
{
  directory?: string  // Optional, defaults to cwd
}
```

### Prerequisites
- Gear 1 completed (analysis-report.md exists)
- Route selected in state file

### Output
- **Directory**: `docs/reverse-engineering/`
- **Files**: 8 markdown files (3,178 lines for StackShift)

---

## Implementation Status

### Completed
- ✅ Route detection from state
- ✅ Directory creation
- ✅ 8 documentation files generation
- ✅ Path-aware extraction (Greenfield vs Brownfield)
- ✅ Agent integration (code-analyzer)
- ✅ State update on completion

### Missing
- ❌ Unit tests (0% coverage)
- ❌ Integration tests

---

## Testing

**Test File**: None (❌ NOT TESTED)

**Required Tests:**
```typescript
describe('reverse-engineer tool', () => {
  it('should verify analyze completed');
  it('should load route from state');
  it('should create docs/reverse-engineering/');
  it('should generate 8 documentation files');
  it('should adapt extraction to route (greenfield vs brownfield)');
  it('should mark step as completed');
  it('should advance to create-specs');
});
```

**Effort**: ~2 hours

---

## Related Specifications
- [Analyze](../analyze/spec.md) - Previous gear
- [Create Specs](../create-specs/spec.md) - Next gear

---

**Specification Version**: 1.0.0
**Last Updated**: 2025-11-16
