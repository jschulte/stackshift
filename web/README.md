# StackShift for Claude Code Web

**Use StackShift in your browser** - No installation required!

---

## Quick Start

### 1. Upload Your Project

In Claude Code Web:
- Click "Upload Folder" or drag-and-drop
- Select your project directory
- Wait for upload to complete

### 2. Copy the Orchestrator Prompt

Open [`stackshift-web-orchestrator.md`](stackshift-web-orchestrator.md) and copy the entire prompt (from "You are StackShift..." to the end).

### 3. Paste and Configure

Paste into Claude Code Web. Answer the configuration questions:
- Route: Greenfield or Brownfield?
- Mode: Manual or Cruise Control?
- (If cruise control) Clarifications strategy?
- (If cruise control) Implementation scope?
- (If greenfield) Target tech stack?

### 4. Let StackShift Run!

**Manual Mode:** Claude will stop at each gear
**Cruise Control:** Claude will shift through all 6 gears automatically

---

## What Works in Web

✅ **All 6 gears** - Complete workflow
✅ **Cruise control** - Automatic mode
✅ **Both routes** - Greenfield and Brownfield
✅ **GitHub Spec Kit integration** - Can run `specify` CLI commands
✅ **State persistence** - Saved to `.stackshift-state.json`
✅ **Resume capability** - Re-upload state file to continue

---

## What's Different from Plugin

| Feature | CLI Plugin | Web Orchestrator |
|---------|------------|------------------|
| **Installation** | One-time plugin install | Copy-paste prompt each time |
| **Auto-activation** | Skills auto-activate | Manual prompt |
| **State persistence** | Automatic between sessions | Manual (download/re-upload file) |
| **MCP Server** | Can run locally | Not available |
| **All 6 gears** | ✅ Yes | ✅ Yes |
| **Cruise control** | ✅ Yes | ✅ Yes |
| **Cost** | Uses local Claude Code | Uses cloud credits |

---

## Resume Interrupted Sessions

### If Session Expires

1. **Download `.stackshift-state.json`** from files panel
2. **Start new Claude Code Web session**
3. **Upload your project folder + state file**
4. **Say:** "Resume StackShift from current gear"

Claude reads the state and continues!

### Example State File

```json
{
  "version": "1.0.0",
  "path": "brownfield",
  "auto_mode": true,
  "currentStep": "gap-analysis",
  "completedSteps": ["analyze", "reverse-engineer", "create-specs"],
  "config": {
    "route": "brownfield",
    "mode": "cruise",
    "clarifications_strategy": "defer",
    "implementation_scope": "p0_p1"
  }
}
```

Claude sees: "You're in Gear 4, completed Gears 1-3, ready to continue!"

---

## Saving Your Work

### After StackShift Completes

**Download these files:**
- `.stackshift-state.json` - Your configuration and progress
- `docs/reverse-engineering/` - 8 documentation files
- `.specify/` - GitHub Spec Kit specifications
- `analysis-report.md` - Initial analysis
- `docs/gap-analysis-report.md` - Gap analysis

**Then:**
```bash
# On your local machine
git add .stackshift-state.json docs/ .specify/
git commit -m "docs: add StackShift specifications"
git push
```

Now your specs are in version control!

---

## Advanced: Claude Projects

### Save as Reusable Project

1. **Create a Claude Project** with custom instructions
2. **Add StackShift orchestrator** as project instructions
3. **Upload project folders** as needed
4. **Reuse the project** for multiple codebases!

**Project Instructions:**
```markdown
This project uses StackShift to reverse engineer codebases into
GitHub Spec Kit specifications.

When I say "analyze this codebase":
1. Ask configuration questions (route, mode, etc.)
2. Shift through the 6-gear process
3. Generate specifications in .specify/ format

[Include the orchestrator prompt here]
```

Now you can analyze multiple projects without re-pasting the prompt!

---

## Workflow Comparison

### CLI Plugin (Local)
```
Install once → Use forever
Skills auto-activate
State persists automatically
MCP server available
```

### Web Orchestrator (Browser)
```
Copy-paste prompt → Use immediately
Manual prompting
Download/upload state for persistence
No MCP (but doesn't need it!)
```

---

## Tips for Web Users

### 1. Use Cruise Control

For web, cruise control is ideal:
- Set it and forget it
- Come back to completed specs
- No need to monitor progress

### 2. Save State Frequently

Download `.stackshift-state.json` periodically:
- After completing each gear
- Before closing the browser
- Before long-running operations

### 3. Work in Sessions

Break work into sessions:
- **Session 1:** Gears 1-3 (analysis, docs, specs) ~30 min
- **Session 2:** Gear 4-5 (gap analysis, clarifications) ~15 min
- **Session 3:** Gear 6 (implementation) ~hours/days

Download state between sessions!

### 4. Commit Early and Often

```bash
# After each gear
git add .
git commit -m "feat: StackShift Gear X complete"
git push
```

---

## Alternative: GitHub Codespaces

**Best of both worlds!**

1. **Open your repo in Codespaces**
2. **Install StackShift plugin** (works like local!)
3. **Use in browser** with full plugin capabilities

```bash
# In Codespaces terminal
git clone https://github.com/jschulte/stackshift.git
./stackshift/install-local.sh

# Restart Codespaces
# Now you have the full plugin in the browser!
```

**Benefits:**
✅ Works in browser
✅ Full plugin capabilities
✅ MCP server support
✅ Persistent environment
✅ Can save to repo

---

## Future: Browser Extension

**Concept** (not yet implemented):

A browser extension that:
- Detects Claude Code Web
- Injects StackShift orchestrator
- Adds UI buttons for each gear
- Manages state in browser localStorage
- One-click cruise control

Would make web experience equal to plugin!

---

## Getting Started

**Quick Start:**
1. Go to Claude Code Web (https://claude.ai/code)
2. Upload your project folder
3. Copy-paste `stackshift-web-orchestrator.md`
4. Answer questions
5. Shift through the gears! 🚗

**For Persistent Workflow:**
1. Use GitHub Codespaces
2. Install StackShift plugin there
3. Get full plugin experience in browser

---

## Resources

- **Web Orchestrator Prompt:** [`stackshift-web-orchestrator.md`](stackshift-web-orchestrator.md)
- **Manual Prompts:** [`../prompts/greenfield/`](../prompts/greenfield/) or [`../prompts/brownfield/`](../prompts/brownfield/)
- **Plugin Installation:** [`../INSTALLATION.md`](../INSTALLATION.md)
- **GitHub Codespaces:** https://github.com/features/codespaces

---

**StackShift works everywhere** - CLI, Web, Codespaces, VSCode! 🚗💨
