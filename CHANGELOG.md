# Changelog

All notable changes to StackShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-12

### Added
- **BMAD Auto-Pilot**: New `/stackshift.bmad-synthesize` skill that auto-generates BMAD artifacts (PRD, Architecture, Epics, UX Design) directly from reverse-engineering docs. Three modes:
  - **YOLO**: Fully automatic, no user input (~10 min)
  - **Guided**: Auto-fill + 5-10 targeted questions (~15-20 min)
  - **Interactive**: Section-by-section review with pre-loaded context (~25-30 min)
- **Architecture Generator**: New `/stackshift.architect` skill that generates complete architecture documents from reverse-eng docs + user constraints. Includes Mermaid diagrams (C4 context, component, data flow, infrastructure), ADRs, cost estimation, and migration paths
- **Reimagine**: New `/stackshift.reimagine` skill for multi-repo synthesis. Loads reverse-engineering docs from multiple repos, extracts a unified capability map, identifies duplication/overlap, runs a brainstorming session, and generates new specifications for a reimagined system
- **business-context.md**: New reverse-engineering doc (#10) capturing product vision, personas, business goals, competitive landscape, stakeholder map, and business constraints. Uses `[INFERRED]` and `[NEEDS USER INPUT]` confidence markers
- **decision-rationale.md**: New reverse-engineering doc (#11) capturing technology selection rationale, ADRs in standard format, design principles inferred from code patterns, trade-offs made, and historical context from git archaeology
- **integration-points.md**: Fully specified with detailed sections for external services, internal dependencies, data flow diagrams (Mermaid), auth flows, third-party SDK usage, and webhook integrations (was listed but underspecified previously)
- New framework options in Gear 1: BMAD Auto-Pilot and Architecture Only join existing Spec Kit and BMAD Method
- Cruise control paths for BMAD Auto-Pilot and Architecture Only workflows
- **Refresh Docs**: New `/stackshift.refresh-docs` skill for incremental doc updates. Pins docs to a git commit hash at generation time, then diffs against HEAD to surgically update only affected docs — no costly full regeneration needed. Tracks refresh history in `.stackshift-docs-meta.json`

### Changed
- Reverse engineering now generates **11 docs** (up from 9) in `docs/reverse-engineering/`
- **functional-specification.md** enriched with User Personas and Product Positioning sections
- **data-architecture.md** enriched with Domain Model / Bounded Contexts section
- **operations-guide.md** enriched with Scalability & Growth Strategy section
- **technical-debt-analysis.md** enriched with Migration Priority Matrix (Impact x Effort quadrants)
- Reverse engineering Phase 1 expanded with Business Context Analysis (1.5) and Decision Archaeology (1.6)
- Gear 1 analyze skill now offers 4 implementation framework choices (was 2)
- Cruise control updated with execution flows for all 4 framework paths
- All slash commands updated to reflect 11-doc output and new framework options

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
