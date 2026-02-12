# Operations Guide: StackShift

**Date:** 2025-11-16  
**Version:** 1.0.0  
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

This guide covers installation, deployment, usage, and troubleshooting for the StackShift reverse engineering toolkit.

---

## Installation

### Option 1: Claude Code Plugin (Recommended)

**Via Marketplace:**
1. Open Claude Code
2. Navigate to Plugins
3. Search for "stackshift"
4. Click Install
5. Restart Claude Code

**Manual Installation:**
```bash
git clone https://github.com/jschulte/stackshift.git
cd stackshift
./install-local.sh
# Restart Claude Code
```

### Option 2: Web (Claude Code in Browser)

1. Go to https://claude.ai/code
2. Connect to GitHub
3. Select repository
4. Copy-paste `web/WEB_BOOTSTRAP.md`
5. Hit enter

---

## Usage

### Basic Workflow (Manual Mode)

**Step 1: Analyze**
```
User: "Analyze this codebase"

→ Answer questions:
  - Route: Greenfield or Brownfield?
  - Mode: Manual or Cruise Control?
```

**Step 2: Reverse Engineer**
```
User: "Reverse engineer the application"

→ Generates 8 documentation files in docs/reverse-engineering/
```

**Step 3: Create Specifications**
```
User: "Create specifications"

→ Initializes GitHub Spec Kit
→ Generates constitution + feature specs
```

**Step 4: Gap Analysis**
```
User: "Analyze gaps"

→ Runs /speckit.analyze
→ Generates gap-analysis-report.md
```

**Step 5: Complete Specification**
```
User: "Complete specifications"

→ Resolves [NEEDS CLARIFICATION] markers
→ Interactive Q&A
```

**Step 6: Implement**
```
User: "Implement features"

→ Uses /speckit.tasks + /speckit.implement
→ Systematic feature building
```

### Cruise Control Mode

**One Command:**
```
Use /stackshift:cruise-control to run all 6 gears automatically
```

---

## Deployment

### Distribution Methods

**1. Claude Code Plugin**
- Included in marketplace via `.claude-plugin/marketplace.json`
- Auto-distributed on marketplace update

**2. GitHub Releases**
```bash
git tag v1.0.1
git push --tags
# Create release on GitHub
```

---

## Monitoring

### Progress Tracking

**Via State File:**
```bash
cat .stackshift-state.json | jq '{currentStep, completedSteps}'
```

### State Inspection

**View State File:**
```bash
cat .stackshift-state.json | jq
```

---

## Troubleshooting

### Issue: "Route not set" Error

**Cause:** Trying to run Gear 2+ without completing Gear 1

**Solution:**
```bash
# Check state
cat .stackshift-state.json

# Run analyze if path is null
```

### Issue: Spec Kit Commands Not Working

**Cause:** `specify init` failed or CLI not installed

**Solution:** Use fallback templates (automatically copied)
```bash
ls .claude/commands/speckit.*
# Should see 6 command files
```

### Issue: Path Traversal Rejected

**Cause:** Directory outside allowed workspace

**Solution:**
```bash
# Use absolute path within current workspace
cd /path/to/project
# Run from project root
```

### Issue: State File Corrupted

**Cause:** Interrupted write or manual editing

**Solution:**
```bash
# Reset state
rm .stackshift-state.json

# Start over from Gear 1
```

### Issue: Tests Failing

**Cause:** Missing dependencies or Node.js version

**Solution:**
```bash
# Check Node version
node --version  # Should be >=18.0.0
```

---

## Maintenance

### Update Plugin

Update the plugin by pulling the latest version from the marketplace or repository.

---

## Backup

### What to Backup
- `.stackshift-state.json` (workflow state)
- `docs/reverse-engineering/` (generated docs)
- `.specify/` + `specs/` (specifications)
- `analysis-report.md`
- `docs/gap-analysis-report.md`

### Backup Command
```bash
tar -czf stackshift-backup-$(date +%Y%m%d).tar.gz \
  .stackshift-state.json \
  analysis-report.md \
  docs/reverse-engineering \
  docs/gap-analysis-report.md \
  .specify \
  specs
```

---

## Performance Tuning

### Large Codebases
- Increase max file limit in `file-utils.ts` if needed
- Use `.gitignore` patterns to skip large directories
- Run in cruise control mode overnight

### Parallel Processing
- MCP tools can run concurrently (different projects)
- State files are per-project (isolated)

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-16
