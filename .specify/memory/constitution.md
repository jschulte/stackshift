# StackShift Constitution

**Version:** 1.0.0
**Route:** Brownfield (Tech-Prescriptive)
**Last Updated:** 2025-11-16

---

## Purpose & Values

### Mission
StackShift is a reverse engineering toolkit that transforms codebases into fully-specified, spec-driven projects using a systematic 6-gear process. We enable developers to extract specifications from existing applications (Greenfield: tech-agnostic for rebuilds; Brownfield: tech-prescriptive for management) and transition to spec-driven development with GitHub Spec Kit.

### Core Values
- **Security First**: Comprehensive input validation prevents CWE-22, CWE-78, CWE-367 vulnerabilities
- **Atomic Operations**: State management prevents race conditions and data corruption
- **Path-Aware Design**: Dual workflow (Greenfield/Brownfield) serves different use cases
- **Zero Technical Debt**: Clean codebase with no TODO/FIXME markers in production
- **Comprehensive Testing**: Security-focused test coverage with 67+ test cases

---

## Technical Architecture

### Primary Technology Stack
- **Language**: TypeScript 5.3.0 (ES2022 target, strict mode)
- **Runtime**: Node.js >=18.0.0
- **Build System**: TypeScript compiler + npm
- **Testing**: Vitest 1.0+ with V8 coverage
- **Protocol**: Model Context Protocol (MCP) 1.0

### Distribution Models
1. **MCP Server**: npm package (`stackshift-mcp`)
   - Entry point: `mcp-server/dist/index.js`
   - Dependencies: @modelcontextprotocol/sdk@^1.0.0

2. **Claude Code Plugin**: Skill-based system
   - Location: `plugin/`
   - Skills: 7 (analyze, reverse-engineer, create-specs, gap-analysis, complete-spec, implement, cruise-control)
   - Agents: 2 (code-analyzer, technical-writer)

### Architecture Patterns
- **Modular Design**: 4 utility modules (security, state-manager, file-utils, skill-loader)
- **Atomic State Management**: Temporary file + rename for POSIX atomicity
- **Security Validation**: All inputs validated via SecurityValidator class
- **Dual Distribution**: MCP server + Claude Code plugin for maximum reach

---

## File Organization

### MCP Server Structure
```
mcp-server/
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── tools/                # 7 MCP tools (gears)
│   │   ├── analyze.ts        # Gear 1 (210 lines)
│   │   ├── reverse-engineer.ts    # Gear 2 (115 lines)
│   │   ├── create-specs.ts   # Gear 3 (140 lines)
│   │   ├── gap-analysis.ts   # Gear 4 (103 lines)
│   │   ├── complete-spec.ts  # Gear 5 (161 lines)
│   │   ├── implement.ts      # Gear 6 (198 lines)
│   │   └── cruise-control.ts # Auto mode (144 lines)
│   ├── resources/            # MCP resources (state, progress, route)
│   │   └── index.ts
│   └── utils/                # Utilities
│       ├── security.ts       # Path validation, CWE prevention (197 lines)
│       ├── state-manager.ts  # Atomic state ops (370 lines)
│       ├── file-utils.ts     # Safe file operations (154 lines)
│       └── skill-loader.ts   # SKILL.md loader (79 lines)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Plugin Structure
```
plugin/
├── skills/                   # 7 skill definitions
│   ├── analyze/
│   │   ├── SKILL.md         # 437 lines
│   │   └── operations/      # 5 operation guides
│   ├── reverse-engineer/
│   ├── create-specs/
│   ├── gap-analysis/
│   ├── complete-spec/
│   ├── implement/
│   └── cruise-control/
├── agents/                   # 2 specialized agents
│   ├── stackshift-code-analyzer/
│   └── stackshift-technical-writer/
├── templates/                # Constitution, feature spec templates
├── speckit-templates/        # Spec Kit command fallbacks
├── scripts/
│   └── state-manager.js     # State management CLI
└── .claude-plugin/
    └── plugin.json          # Plugin metadata
```

---

## Technical Decisions & Rationale

### Decision 1: TypeScript Strict Mode
**Choice**: Enable strict mode with comprehensive compiler checks
**Rationale**: Catch type errors at compile-time, prevent runtime bugs
**Files**: `mcp-server/tsconfig.json` (strict: true)
**Impact**: Zero type-related bugs in production

### Decision 2: Native File APIs Over Shell Commands
**Choice**: Replace shell commands with fs/promises native APIs
**Rationale**: Prevent command injection (CWE-78), improve security
**Example**: `countFiles()` replaces `find | wc -l`
**Files**: `file-utils.ts`
**Impact**: Zero command injection vulnerabilities

### Decision 3: Atomic State Management
**Choice**: Temporary file + atomic rename for state updates
**Rationale**: Prevent race conditions (CWE-367), ensure data integrity
**Files**: `state-manager.ts` (atomicWrite method)
**Impact**: State corruption impossible even with concurrent access

### Decision 4: Path Traversal Prevention
**Choice**: Comprehensive path validation before all file operations
**Rationale**: Prevent CWE-22 attacks, ensure workspace containment
**Files**: `security.ts` (SecurityValidator class)
**Impact**: Zero path traversal vulnerabilities

### Decision 5: Dual Workflow Support
**Choice**: Greenfield (tech-agnostic) vs Brownfield (tech-prescriptive)
**Rationale**: Serve two distinct use cases with same toolkit
**Implementation**: Route selection in state, path-aware extraction
**Impact**: Flexible for rebuilds OR managing existing code

### Decision 6: Minimal Dependencies
**Choice**: Only 1 production dependency (@modelcontextprotocol/sdk)
**Rationale**: Reduce security surface area, simplify maintenance
**Impact**: Low maintenance burden, fast installs, fewer vulnerabilities

---

## Development Standards

### Code Quality
- **TypeScript**: Strict mode, ES2022 features
- **Modularity**: Single Responsibility Principle
- **Error Handling**: Try-catch in all MCP handlers
- **Validation**: All inputs validated before processing
- **Documentation**: JSDoc comments on public APIs

### Testing Requirements
- **Current Coverage**: 30% (67+ test cases)
- **Target Coverage**: 80%
- **Test Types**: Unit (70%), Integration (20%), Security (10%)
- **Required Tests**:
  - Security: Path traversal, command injection, race conditions
  - Functionality: All MCP tools, utilities
  - Integration: Full workflow tests

### Security Standards
- **Input Validation**: 100% of user inputs validated
- **Path Operations**: All paths validated via SecurityValidator
- **State Operations**: All state updates atomic
- **Resource Limits**: Max file size (10MB), max files (10K), max depth (10)
- **Vulnerability Scanning**: npm audit on every build

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, test, refactor, chore
Scopes: gear-1 through gear-6, mcp-server, plugin, security, tests

---

## Quality Standards

### Code Quality Metrics
- TypeScript strict mode: ✅ Enabled
- ESLint: ❌ Not configured (P2)
- Prettier: ❌ Not configured (P2)
- Pre-commit hooks: ❌ Not configured (P2)

### Test Coverage Targets
- Overall: 80% (current: 30%)
- Security modules: 100% (current: 100% ✅)
- MCP tools: 80% (current: 13% - only analyze tested)
- Utilities: 90% (current: 50% - security, state done; files, skills missing)

### Documentation Standards
- All public APIs: JSDoc comments
- All skills: Comprehensive SKILL.md files (✅ Complete)
- All operations: Step-by-step guides
- README: Installation, usage, examples (✅ Complete)

---

## Non-Functional Requirements

### Performance
- Tool execution: <10 seconds for typical projects
- State operations: <100ms
- File scanning: <5 seconds for 10K files
- Memory usage: <500MB typical

### Reliability
- State file corruption: 0% (atomic writes)
- Tool failure rate: <1%
- Concurrent access: Safe (tested with 10 parallel)
- Recovery: Resume from any checkpoint

### Security (All COMPLETE ✅)
- CWE-22 Path Traversal: FIXED v1.0.1
- CWE-78 Command Injection: FIXED v1.0.1
- CWE-367 TOCTOU: FIXED v1.0.1
- Prototype Pollution: FIXED v1.0.0
- DoS Protection: Resource limits in place

---

## Dependency Management

### Production Dependencies
- **@modelcontextprotocol/sdk**: ^1.0.0 (MCP protocol)
  - Update policy: Minor/patch auto, major manual review

### Development Dependencies
- **typescript**: ^5.3.0 (compiler)
- **vitest**: ^1.0.0 (testing)
- **@vitest/coverage-v8**: ^1.0.0 (coverage)
- **@types/node**: ^20.0.0 (type definitions)

### Update Policy
- Security patches: Apply immediately
- Minor versions: Auto-update via Dependabot (future)
- Major versions: Manual review and testing required

---

## Known Technical Debt

### High Priority (P0/P1)
1. **Test Coverage Expansion**: 30% → 80%
   - Add tests for 6 untested MCP tools
   - Effort: ~19 hours

2. **CI/CD Pipeline**: Not configured
   - GitHub Actions for tests, linting, releases
   - Effort: ~4 hours

### Medium Priority (P2)
3. **Code Linting**: ESLint not configured
   - Effort: ~2 hours

4. **Code Formatting**: Prettier not configured
   - Effort: ~1 hour

5. **Pre-commit Hooks**: Husky not configured
   - Effort: ~2 hours

### Low Priority (P3)
6. **Architectural Diagrams**: Text-only documentation
   - Add Mermaid diagrams
   - Effort: ~4 hours

7. **Integration Tests**: Only unit tests exist
   - Add full workflow tests
   - Effort: ~8 hours

---

## Success Metrics

### Business KPIs
- Workflow completion rate: >90%
- Average time to complete 6 gears: <2 hours
- Route distribution: Track Greenfield vs Brownfield usage
- Adoption: GitHub stars, npm downloads

### Technical KPIs
- Test coverage: ≥80%
- Security vulnerabilities: 0 critical, 0 high
- Build time: <10 seconds
- npm audit: 0 vulnerabilities
- State file corruption rate: 0%

---

## Governance

### Decision-Making
- Security issues: Immediate fix priority
- Breaking changes: Major version bump
- New features: User feedback + maintainer approval
- Technical debt: Prioritize P0/P1 before new features

### Change Management
- All changes: Git commit with descriptive message
- State changes: Versioned state file format
- Breaking changes: Migration guide required
- Deprecations: 1 major version notice

---

**Constitution Version**: 1.0.0
**Maintained By**: Jonah Schulte
**License**: MIT
**Repository**: https://github.com/jschulte/stackshift
