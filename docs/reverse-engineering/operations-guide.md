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

### Option 2: MCP Server (VSCode/Copilot)

**Install via npm:**
```bash
npm install -g stackshift-mcp
```

**Configure MCP:**
Add to your MCP settings:
```json
{
  "mcpServers": {
    "stackshift": {
      "command": "stackshift-mcp"
    }
  }
}
```

### Option 3: Web (Claude Code in Browser)

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
```bash
# Configure and run
node plugin/scripts/state-manager.js config brownfield cruise defer p0_p1

# Runs all 6 gears automatically
```

---

## Deployment

### Distribution Methods

**1. npm Package (MCP Server)**
```bash
cd mcp-server
npm run build
npm publish  # Requires npm account
```

**2. Claude Code Plugin**
- Included in marketplace via `.claude-plugin/marketplace.json`
- Auto-distributed on marketplace update

**3. GitHub Releases**
```bash
git tag v1.0.1
git push --tags
# Create release on GitHub
```

---

## Monitoring

### Progress Tracking

**Via State Manager:**
```bash
node plugin/scripts/state-manager.js progress
```

**Output:**
```
✅ analyze
✅ reverse-engineer
🔄 create-specs
⏳ gap-analysis
⏳ complete-spec
⏳ implement
```

**Via MCP Resource:**
```
Read: stackshift://progress
```

### State Inspection

**Check Current State:**
```bash
node plugin/scripts/state-manager.js status
```

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
node plugin/scripts/state-manager.js reset

# Start over from Gear 1
```

### Issue: Tests Failing

**Cause:** Missing dependencies or Node.js version

**Solution:**
```bash
# Check Node version
node --version  # Should be >=18.0.0

# Install dependencies
cd mcp-server
npm install

# Run tests
npm test
```

---

## Maintenance

### Update Dependencies

**Check for Updates:**
```bash
cd mcp-server
npm outdated
```

**Update:**
```bash
npm update
npm audit fix
```

### Run Security Scan

**npm audit:**
```bash
npm audit
```

**Security Tests:**
```bash
npm run test:security
```

### Clean Build

```bash
cd mcp-server
rm -rf dist node_modules
npm install
npm run build
```

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
