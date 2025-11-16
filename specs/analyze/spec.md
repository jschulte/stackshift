# Feature: Initial Codebase Analysis (Gear 1)

**Feature ID**: analyze
**Status**: ✅ COMPLETE
**Priority**: P0 (Critical)
**Route**: Brownfield

---

## Overview

Automated codebase analysis that detects technology stack, assesses completeness across 5 dimensions, and enables users to choose between Greenfield (tech-agnostic extraction) or Brownfield (tech-prescriptive management) workflows.

---

## User Stories

### US-001: Automatic Tech Stack Detection
**As a** developer
**I want** StackShift to automatically detect my project's technology stack
**So that** I don't have to manually specify frameworks and languages

**Acceptance Criteria:**
- [x] Detects Node.js/JavaScript (package.json)
- [x] Detects Python (requirements.txt, Pipfile, pyproject.toml)
- [x] Detects Go (go.mod)
- [x] Detects Rust (Cargo.toml)
- [x] Identifies build system (npm, pip, cargo, go)
- [x] Extracts version numbers from manifests

### US-002: Completeness Assessment
**As a** developer
**I want** to know how complete my application is
**So that** I can understand the scope of reverse engineering work

**Acceptance Criteria:**
- [x] Assesses overall completion percentage
- [x] Breaks down by: backend, frontend, tests, documentation
- [x] Counts test files (*.test.*, *.spec.*)
- [x] Checks for README.md existence
- [x] Provides evidence for estimates

### US-003: Route Selection
**As a** developer
**I want** to choose between Greenfield and Brownfield workflows
**So that** the toolkit adapts to my use case

**Acceptance Criteria:**
- [x] Presents route choice (Greenfield vs Brownfield)
- [x] Explains each route's purpose
- [x] Saves route selection to state file
- [x] Uses route for subsequent gears

---

## Technical Requirements

### Implementation
- **File**: `mcp-server/src/tools/analyze.ts` (210 lines)
- **Framework**: TypeScript 5.3.0, Node.js >=18.0.0
- **MCP Tool**: `stackshift_analyze`
- **Dependencies**:
  - `security.ts` - Path validation
  - `state-manager.ts` - State persistence
  - `file-utils.ts` - Safe file counting

### Input Parameters
```typescript
{
  directory?: string,  // Optional, defaults to cwd
  route?: 'greenfield' | 'brownfield'  // Optional
}
```

### Security
- Path traversal prevention (CWE-22)
- Command injection prevention (CWE-78)
- No shell commands (uses native file-utils)

### Output
- **File**: `analysis-report.md` in project root
- **State**: Creates/updates `.stackshift-state.json`

---

## Implementation Status

### Completed
- ✅ Tech stack detection (Node.js, Python, Go, Rust)
- ✅ Completeness assessment (5 dimensions)
- ✅ Route selection and storage
- ✅ Security validation (path, input)
- ✅ State file creation/update
- ✅ Analysis report generation
- ✅ Test coverage: 90% (analyze.security.test.ts)

### Dependencies
- None (first gear in workflow)

---

## Testing

**Test File**: `mcp-server/src/tools/__tests__/analyze.security.test.ts` (251 lines, 15+ tests)

**Coverage:**
- Path traversal prevention
- Command injection prevention
- Input validation (route, directory)
- State file security
- Concurrent access (5 parallel calls)
- Tech stack detection

**Test Commands:**
```bash
npm test -- analyze.security.test.ts
npm run test:security
```

---

## Related Specifications
- [Reverse Engineer](../reverse-engineer/spec.md) - Next gear
- [Cruise Control](../cruise-control/spec.md) - Automatic mode

---

**Specification Version**: 1.0.0
**Last Updated**: 2025-11-16
