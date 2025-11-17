# StackShift Documentation - Specific Improvements

**Purpose:** Line-by-line recommendations for improving existing documentation files

---

## README.md Improvements

### Issue 1: Missing Table of Contents

**Current:** Readme starts directly with content
**Problem:** Long document (3,400+ lines) is hard to navigate
**Solution:** Add TOC at top

**Add after title and badges:**

```markdown
## Table of Contents

- [Quick Overview](#quick-overview)
- [What StackShift Does](#what-stackshift-does)
- [The 6-Gear Process](#-6-gear-process)
- [Quick Start](#-quick-start)
- [Choosing Your Route](#-choose-your-route)
- [Documentation](#-documentation)
- [Process Guide](#-detailed-process-guide)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---
```

**Estimated Effort:** 30 minutes

---

### Issue 2: Inconsistent "Path" vs "Route" Terminology

**Current:** Uses both "path", "route", and "transmission" inconsistently
**Problem:** Confusing for new users
**Solution:** Standardize terminology section

**Add new section before "Choose Your Route":**

```markdown
## Key Terminology

**Route** - Your choice of Greenfield (tech-agnostic) or Brownfield (tech-prescriptive)
**Gear** - One of the 6 steps (Analysis → Reverse Engineer → ... → Implement)
**Transmission** - Manual (review each step) or Cruise Control (automatic)
**Shift/Shifting** - Moving from one gear to the next
**Specification** - Formal technical/business requirements document
**Gap** - Missing feature or incomplete implementation

These terms are used throughout StackShift documentation.

---
```

**Estimated Effort:** 30 minutes

---

### Issue 3: Links to Non-Existent "API Reference"

**Current:** README mentions "API reference" in several places but doesn't exist
**Problem:** Broken promise, incomplete documentation
**Solution:** Remove reference or create stub with "Coming Soon"

**Option A: Remove reference** (if not ready)
Find and remove: "API reference documentation" mentions

**Option B: Create placeholder** (if planning to create)
Create: `docs/reference/API_REFERENCE.md` with:
```markdown
# StackShift API Reference

Coming Soon! See [README](../../README.md) for current documentation.

## Tools

(Documentation coming soon...)

## Resources

(Documentation coming soon...)
```

**Estimated Effort:** 30 minutes (Option A) or 1 hour (Option B)

---

### Issue 4: "Troubleshooting" Section is Too Brief

**Current:** Only 3-4 common issues listed
**Problem:** Users have more questions than documented
**Solution:** Expand with more common scenarios

**Current Section (README):**
```markdown
## 🛠️ Troubleshooting

### "Claude can't find my configuration files"
- Make sure you're in the project root directory
- Check that config files aren't gitignored
- Explicitly mention unusual config locations

### "Generated specs are inaccurate"
- Step 5 is where you correct inaccuracies
- Use `[NEEDS CLARIFICATION]` to mark uncertain areas
- Review and refine before implementing

### "Too much output, can't process"
- Break large monoliths into modules
- Run toolkit per module/microservice
- Increase context window (use Claude Sonnet 4.5)

### "Missing important features in gap analysis"
- Manually add to `specs/features/`
- Use templates in `templates/` folder
- Re-run Step 4 with hints about what's missing
```

**Recommended Expansion:**

```markdown
## 🛠️ Troubleshooting

### Plugin Installation

**Q: Plugin doesn't appear in Claude Code after installation**
- Make sure you restarted Claude Code completely (not just new conversation)
- Check symlink exists: `ls -la ~/.claude/plugins/local/stackshift`
- If missing, run: `./install-local.sh` from repo root

**Q: Skills aren't auto-activating**
- Try trigger phrases: "Analyze this codebase", "Run analysis"
- Or explicitly: "Use the analyze skill"
- Check plugin loaded: `/plugin list` should show stackshift

**Q: State manager commands don't work**
- Make sure you're in the project root (where `.stackshift-state.json` lives)
- Check file is readable: `cat .stackshift-state.json`
- Or use explicit path: `node ~/.claude/plugins/local/stackshift/plugin/scripts/state-manager.js status`

### Analysis & Reverse Engineering

**Q: Tech stack detection misses my framework**
- Check you have the right config file (package.json, requirements.txt, etc.)
- File must be in project root
- If custom setup, mention explicitly: "I'm using [tech] in [location]"

**Q: Generated documentation is inaccurate**
- This is normal! Step 5 (Complete Specification) is where you correct it
- Use `[NEEDS CLARIFICATION]` markers to flag issues
- Provide corrections during Step 5 Q&A

**Q: Documentation extraction is slow or incomplete**
- For large projects (>100K lines), consider:
  - Breaking into modules first
  - Running on one module at a time
  - Increasing Claude's context window (upgrade to Sonnet)

### Specifications & Gaps

**Q: Spec Kit directory missing or incomplete**
- Make sure Step 3 completed successfully
- Check: `ls .specify/`
- If missing, manually create: `mkdir -p .specify/memory`
- Run Step 3 again with: "Create specifications"

**Q: Important features marked as MISSING but they exist**
- This might be correct (feature might be hidden or partial)
- Review feature with: "/speckit.clarify" for clarification
- Or manually add to `specs/` with correct status

**Q: Can't implement everything in one session**
- You can stop and resume anytime
- Your progress is saved in `.stackshift-state.json`
- Paste: "Resume StackShift from current gear"

### Web Usage

**Q: Web session times out or disconnects**
- Save your work: GitHub has the branch with commits
- Pull locally: `git fetch && git checkout <branch-name>`
- Or continue in web: Paste WEB_BOOTSTRAP.md again, it resumes

**Q: Browser compatibility issues**
- Recommended: Chrome, Firefox, or Safari (latest versions)
- Edge should work but may have occasional issues
- Ensure JavaScript enabled

### Common Errors

**Error: "Path traversal detected"**
- Don't use relative paths with `..`
- Use absolute paths: `/Users/username/project`
- Or relative from current directory: `./project`

**Error: "State file locked"**
- Another session is accessing state file
- Wait a moment and try again
- Or remove lock: `rm .stackshift-state.json.lock` (rare)

**Error: "Missing configuration"**
- Make sure you answered initial questions (route, mode, etc.)
- Check: `cat .stackshift-state.json`
- If empty or missing, start over: "I want to analyze this codebase"

### Getting Help

If you can't find an answer:

1. **Check [Full Documentation](docs/README.md)** - May have section on your issue
2. **[GitHub Issues](https://github.com/jschulte/stackshift/issues)** - Search existing issues
3. **[GitHub Discussions](https://github.com/jschulte/stackshift/discussions)** - Ask the community
4. **Email Support** - Open issue and tag it `help needed`

---
```

**Estimated Effort:** 1.5-2 hours

---

## QUICKSTART.md Improvements

### Issue 1: Missing Prerequisites Section

**Add before "Choose Your Installation Method":**

```markdown
## Prerequisites

Before starting, make sure you have:

- ✅ **Git** - To manage your codebase
- ✅ **Claude Code** - Latest version installed
- ✅ **Node.js 18+** - For state management and MCP server
- ✅ **npm 9+** - Package manager (included with Node.js)
- ✅ **GitHub Account** - To use Web option or browse your repo

**Check your versions:**
```bash
node --version    # Should be 18+
npm --version     # Should be 9+
```

---
```

**Estimated Effort:** 30 minutes

---

### Issue 2: Verify All Links

**Current:** QUICKSTART references files that may not exist at expected locations
**Problem:** Broken links frustrate users

**Audit needed:**
- `docs/guides/INSTALLATION.md` - ✓ EXISTS
- `docs/guides/BATCH_PROCESSING_GUIDE.md` - ❓ CHECK LOCATION
- `web/WEB_BOOTSTRAP.md` - ✓ EXISTS
- `mcp-server/README.md` - ✓ EXISTS

**Action:** Verify all links and fix any that point to wrong locations

**Estimated Effort:** 30 minutes

---

## docs/guides/INSTALLATION.md Improvements

### Issue 1: Marketplace References Outdated

**Current (Lines 78-222):**
```markdown
## 📦 Option 2: Install from GitHub (Public)

Once the repository is public and configured:
```

**Problem:** References non-existent marketplace, outdated instructions
**Solution:** Update or remove outdated Option 2 & 3

**Recommended: Simplify to 2 clear options:**

```markdown
## 📦 Option 2: From GitHub (Manual)

Install directly from the GitHub repository:

```bash
# Option A: Symlink to local clone
git clone https://github.com/jschulte/stackshift.git
ln -s $(pwd)/stackshift ~/.claude/plugins/local/stackshift

# Option B: Direct copy
git clone https://github.com/jschulte/stackshift.git
cp -r stackshift ~/.claude/plugins/local/

# Restart Claude Code
```

Verify: `/plugin list` should show stackshift

---

## 🌐 Option 3: From Marketplace (When Available)

*(This section will be available once the plugin is published to the official Claude Code marketplace)*

For now, use Option 1 (local) or Option 2 (GitHub).

---
```

**Estimated Effort:** 1 hour

---

### Issue 2: Platform-Specific Notes Missing

**Current:** Generic installation, doesn't account for OS differences
**Solution:** Add platform-specific section

**Add after "Option 1: Install Locally":**

```markdown
### Platform-Specific Notes

#### macOS
- Symlinks work natively
- Restart Claude Code from Command+Q → Open again
- Path expansion with `$(pwd)` works normally

#### Linux
- Symlinks work natively
- All paths use forward slashes `/`
- Restart Claude Code from your desktop environment

#### Windows
- Use backslashes `\` for paths (or forward slashes `/` in some contexts)
- Or use full path: `C:\Users\Username\stackshift`
- Symlinks may require Administrator mode (use Option 2 copy instead)

**Windows Example:**
```bash
# Copy instead of symlink (safer)
git clone https://github.com/jschulte/stackshift.git
cd stackshift
xcopy /E /I . "%APPDATA%\.claude\plugins\local\stackshift\"
```

---
```

**Estimated Effort:** 1 hour

---

## docs/guides/PLUGIN_GUIDE.md Improvements

### Issue: Incomplete - Only Shows ~100 Lines

**Current:** Guide cuts off after initial sections
**Problem:** Users can't find documentation for complete plugin usage
**Solution:** Complete the missing sections

**Missing Sections to Add:**

```markdown
## Cruise Control Mode

[Documentation for cruise control feature - currently missing]

### What is Cruise Control?

Cruise control mode automatically shifts through all 6 gears without requiring approval at each step.

### Enabling Cruise Control

In Step 1 (Initial Analysis), choose:
```
Transmission: Manual or Cruise Control?
→ Cruise Control
```

### Configuration

When enabling cruise control, answer these questions:

1. **Clarifications Strategy**
   - Defer: Save clarifications for later (default, recommended)
   - Prompt: Ask clarifications during execution
   - Skip: Don't ask any clarifications

2. **Implementation Scope** (Brownfield only)
   - None: Just generate specs
   - P0: Critical features only
   - P0+P1: Recommended scope
   - All: Implement everything

3. **Target Tech Stack** (Greenfield only)
   - Next.js, Node.js, Python, Go, etc.
   - Or: Keep source tech

### How It Works

Once configured:
1. System automatically shifts to next gear
2. No approval needed between steps
3. State file tracks progress
4. Can interrupt and resume anytime

---

## State Management

### Checking Progress

```bash
# See which gear you're in
node plugin/scripts/state-manager.js progress

# See full state
cat .stackshift-state.json

# Parse state (if installed)
node plugin/scripts/state-manager.js get-route
node plugin/scripts/state-manager.js get-gear
```

### Resetting State

```bash
# Start over
rm .stackshift-state.json

# Or ask Claude: "Reset StackShift and start over"
```

### State File Structure

`.stackshift-state.json`:
```json
{
  "version": "1.0.0",
  "route": "greenfield|brownfield",
  "gear": 1-6,
  "transmission": "manual|cruise-control",
  "configuration": {
    "clarificationStrategy": "defer|prompt|skip",
    "implementationScope": "none|p0|p0_p1|all"
  }
}
```

---

## Extending the Plugin

### Adding Custom Prompts

You can customize StackShift by creating custom prompt files.

[Documentation for custom prompts - out of scope for this doc review]

### Custom Agents

Use `@stackshift` agent mentions to integrate with custom tools.

[Documentation for custom agents - out of scope for this doc review]

---

## Known Limitations

- Analyze phase is synchronous (can be slow for huge codebases >500MB)
- Cruise control may require context adjustments for very large specs
- State file is JSON (not encrypted) - keep it private

---

## Getting Help

See [TROUBLESHOOTING.md](../user-guides/TROUBLESHOOTING.md) for common issues.

For questions: [GitHub Issues](https://github.com/jschulte/stackshift/issues)

---
```

**Estimated Effort:** 2-3 hours

---

## web/README.md Improvements

### Issue: Missing Session Handling Documentation

**Current:** Doesn't document what happens if session disconnects
**Solution:** Add section about session persistence

**Add new section:**

```markdown
## Session Management

### What Happens If I Close the Browser?

Your work is saved! Here's what happens:

1. **GitHub Branch** - All commits are pushed to your branch
2. **Local Clone** - Pull the branch: `git fetch && git checkout <branch-name>`
3. **Resume** - Paste WEB_BOOTSTRAP.md again, it picks up where you left off

### Session Timeout

Claude Code Web sessions expire after ~2 hours of inactivity.

**If your session expires:**
1. Copy any important output
2. Check your branch on GitHub
3. Pull locally: `git fetch origin && git checkout <branch-name>`
4. Or continue in web: Restart with WEB_BOOTSTRAP.md

**Tip:** After each gear completes, pull locally to back up your work:
```bash
git fetch origin
git checkout <branch-name>
git log  # See StackShift's commits
```

---

## Browser Requirements

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required:**
- JavaScript enabled
- 4GB+ RAM (for large codebases)
- Stable internet connection

---
```

**Estimated Effort:** 1 hour

---

## mcp-server/README.md Improvements

### Issue: Incomplete Tool Documentation

**Current:** Only shows first ~100 lines of tools
**Problem:** Users can't see all tool documentation
**Solution:** Complete the tool reference

**Add/complete sections:**

```markdown
## Available Tools Reference

### Complete Tool List

#### 1. stackshift_analyze
Analyze codebase for tech stack detection and route selection

**Parameters:**
- `directory` (string, optional) - Project directory path
- `route` (string, optional) - "greenfield" or "brownfield"

**Returns:**
- `analysis_report` (string) - Markdown analysis
- `state_updated` (boolean) - State file created/updated

**Usage:**
```
@stackshift use stackshift_analyze with greenfield route
```

#### 2. stackshift_reverse_engineer
Extract comprehensive documentation from codebase

**Parameters:**
- (Uses state from previous analyze tool)

**Returns:**
- `documentation_files` (array) - 8 markdown files generated
- `docs_path` (string) - Location of generated docs

**Usage:**
```
@stackshift use stackshift_reverse_engineer
```

[Continue for all 7 tools...]

---

## Available Resources

### 1. stackshift_templates
Access to Spec Kit templates

**Files Available:**
- `feature-spec-template.md`
- `constitution-template.md`
- `implementation-status-template.md`

**Usage:**
```
@stackshift use stackshift_templates
```

[Continue for all 3 resources...]

---

## Configuration

### VSCode Settings

```json
{
  "mcp.servers": {
    "stackshift": {
      "command": "npx",
      "args": ["-y", "stackshift-mcp"],
      "env": {
        "DEBUG": "stackshift:*"  // Optional: verbose logging
      }
    }
  }
}
```

### GitHub Copilot

Add to `.copilot/config.json` (if exists):
```json
{
  "mcpServers": {
    "stackshift": {
      "command": "npx",
      "args": ["-y", "stackshift-mcp"]
    }
  }
}
```

---

## Troubleshooting

### Tools Not Available

- Check configuration is correct (absolute paths)
- Verify npm is installed: `npm --version`
- Restart VSCode/Copilot
- Check MCP server output: View > Output > MCP Log

### Connection Errors

```
Error: Failed to connect to stackshift MCP server
```

**Solution:**
1. Test MCP server locally: `npx stackshift-mcp` (should output some text)
2. Check command path is correct
3. Verify `node` is in PATH: `which node`

### Debugging

Enable verbose logging:
```json
{
  "mcp.servers": {
    "stackshift": {
      "env": {
        "DEBUG": "stackshift:*"
      }
    }
  }
}
```

Check logs: VSCode Output panel

---
```

**Estimated Effort:** 2-3 hours

---

## Summary of Specific Improvements

### Ranked by Effort and Impact

| File | Issue | Effort | Impact | Status |
|------|-------|--------|--------|--------|
| README.md | Add TOC | 30 min | Medium | Quick Win |
| README.md | Fix terminology | 30 min | Medium | Quick Win |
| README.md | Expand troubleshooting | 2 hours | High | Important |
| QUICKSTART.md | Add prerequisites | 30 min | Medium | Quick Win |
| QUICKSTART.md | Verify all links | 30 min | Medium | Quick Win |
| INSTALLATION.md | Update marketplace info | 1 hour | Medium | Important |
| INSTALLATION.md | Add platform notes | 1 hour | High | Important |
| PLUGIN_GUIDE.md | Complete missing sections | 2-3 hours | High | Critical |
| web/README.md | Add session management | 1 hour | Medium | Important |
| mcp-server/README.md | Complete tool reference | 2-3 hours | High | Critical |

**Total Improvement Effort:** 12-15 hours

**Quick Wins (4 hours):**
- Add TOC to README
- Fix terminology
- Add prerequisites
- Verify links

---

## Implementation Priority

### Week 1: Quick Wins + Critical Gaps
1. Create missing files (CONTRIBUTING.md, SECURITY.md, CHANGELOG.md) - 5 hours
2. Quick improvements to README - 2 hours
3. Complete PLUGIN_GUIDE.md - 3 hours

### Week 2: More Improvements
1. Complete MCP server README - 2-3 hours
2. Update INSTALLATION.md - 2 hours
3. Improve QUICKSTART.md - 1 hour

### Total estimated time to reach 85% documentation: **15-20 hours**

---

**Start with the Quick Wins - they take 4 hours but improve user experience significantly!**
