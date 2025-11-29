# Changelog

All notable changes to StackShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
