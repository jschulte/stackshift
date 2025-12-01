# Changelog

All notable changes to StackShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2025-12-01

### Added
- **File-Based AST Architecture**: Run AST analysis once in Gear 1, all other gears read from cached files (50-90% performance improvement)
- **Deterministic AST Execution**: All slash commands now explicitly invoke Bash tool for guaranteed AST execution (no interpretation needed)
- **Smart Caching**: AST results cached in `.stackshift-analysis/` directory with 1-hour TTL and auto-refresh
- **Complete Gear Integration**: AST analysis now integrated across all 6 gears deterministically
- New command: `analyze` - Run full AST analysis and save to cache
- New command: `check` - Verify cache exists and is fresh
- New command: `status` - Show implementation status from cache

### Changed
- **Gear 1**: Now runs comprehensive AST analysis upfront and saves to `.stackshift-analysis/`
- **Gear 2**: Enhanced documentation extraction using cached AST data
- **Gear 3**: Auto-detects implementation status (✅/⚠️/❌) from cached AST analysis
- **Gear 4**: Reads cached roadmap instead of re-running analysis (10x faster)
- **Gear 5**: Provides evidence-based clarifications using cached AST data
- **Gear 6**: Verifies implementations against cached AST analysis
- **Cruise Control**: Runs AST upfront, all gears use cache throughout workflow
- Enhanced `scripts/run-ast-analysis.mjs` with caching and multiple commands
- Updated all slash commands (`.claude/commands/*.md`) for deterministic execution
- Updated README.md with AST integration details in gear descriptions

### Fixed
- AST analysis no longer depends on Claude interpreting skill instructions (deterministic)
- Eliminated duplicate AST parsing across gears (run once, cache to files)
- Cache automatically refreshes when stale (> 1 hour old)
- Graceful fallback to manual analysis if Node.js unavailable

### Documentation
- Created 9 comprehensive AST integration documents
- Added test suite with 8 test cases
- Documented performance benchmarks and success metrics
- Added comparison to other AST tools (Tree-sitter, TypeScript API, SonarQube)

## [1.8.0] - 2025-11-29

### Added
- **GitHub Spec Kit Scripts Installer**: New `scripts/install-speckit-scripts.sh` that automatically downloads and installs prerequisite scripts needed by `/speckit.*` commands
- Graceful fallback in Gear 4 when scripts are missing - offers to download or use manual gap analysis

### Fixed
- **Gear 4 Script Dependency Issue**: Fixed error where `/speckit.analyze` failed with "Script not found" because Gear 3 created `.specify/scripts/` directory but left it empty
- Gear 3 now installs GitHub Spec Kit scripts (check-prerequisites.sh, setup-plan.sh, create-new-feature.sh, update-agent-context.sh, common.sh) before creating specs
- Gear 4 now verifies scripts exist and provides three recovery options if missing

### Changed
- Updated `skills/create-specs/SKILL.md` to add Step 1: Install GitHub Spec Kit Scripts
- Updated `skills/gap-analysis/SKILL.md` to add script verification and manual fallback

## [1.7.0] - 2025-11-28

Previous releases - see git history.
