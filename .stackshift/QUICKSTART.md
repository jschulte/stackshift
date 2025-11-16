# StackShift Quick Start

**Get started in under 5 minutes!** 🚗💨

---

## Choose Your Installation Method

### 🖥️ Local (Claude Code CLI)

**Best for:** Regular use, local development

```bash
# Quick install
git clone https://github.com/jschulte/stackshift.git
cd stackshift
./install-local.sh

# Restart Claude Code
# Done! ✅
```

**Usage:**
```
"Analyze this codebase"
→ Answer questions (route, mode, scope)
→ Shift through the gears!
```

---

### 🌐 Web (Claude Code in Browser)

**Best for:** Quick analysis, any device, no installation

**1. Upload project to Claude Code Web**
```
https://claude.ai/code
→ Upload folder or connect GitHub repo
```

**2. Copy-paste orchestrator:**
```
Open: web/stackshift-web-orchestrator.md
Copy entire prompt
Paste into Claude Code Web
```

**3. Run:**
```
Answer configuration questions
→ Cruise control shifts through all 6 gears automatically!
```

---

### 🔧 VSCode/Copilot (MCP Server)

**Best for:** VSCode users, GitHub Copilot integration

**Add to VSCode settings.json:**
```json
{
  "mcp.servers": {
    "stackshift": {
      "command": "npx",
      "args": ["-y", "stackshift-mcp"]
    }
  }
}
```

**Usage:**
```
@claude use stackshift_analyze with brownfield route
@claude use stackshift_cruise_control
```

---

## First Run

### Configuration Questions

StackShift asks 2-6 questions upfront:

**1. Route** (always):
- **Greenfield:** Extract business logic → rebuild in new stack
- **Brownfield:** Document existing → manage with GitHub Spec Kit

**2. Transmission** (always):
- **Manual:** Review each gear before proceeding
- **Cruise Control:** Automatic - shift through all gears!

**3-6. If Cruise Control** (conditional):
- Clarifications strategy (defer/prompt/skip)
- Implementation scope (none/p0/p0_p1/all)
- Target tech stack (if greenfield)
- Build location (greenfield/ subfolder recommended)

**All answers saved** → Guides entire workflow!

---

## The 6 Gears

```
🔍 Gear 1: Analyze → Choose route, detect tech stack
🔄 Gear 2: Reverse Engineer → Extract documentation
📋 Gear 3: Create Specs → Generate GitHub Spec Kit specs
🔍 Gear 4: Gap Analysis → Identify what's missing
✨ Gear 5: Complete Spec → Resolve clarifications
🚀 Gear 6: Implement → Build from specs
```

**Manual mode:** Stop at each gear for review
**Cruise control:** Shift through all gears automatically!

---

## Example Sessions

### Brownfield (Manage Existing App)

```
User: "Analyze this Next.js app"

StackShift:
Choose route:
A) Greenfield
B) Brownfield

User: "B"

StackShift:
Manual or Cruise Control?

User: "Cruise Control"

StackShift:
Implementation scope?
A) None - Just specs
B) P0 - Critical only
C) P0+P1 - Recommended
D) All

User: "A - None"

StackShift:
🚗 Cruise control engaged!

[Shifts through all 6 gears automatically]

✅ Complete! Generated:
- .specify/ with 12 specifications
- docs/ with 8 comprehensive docs
- All committed to branch
```

### Greenfield (Rebuild in New Stack)

```
User: "Extract business logic from this Rails app"

StackShift:
Route: Greenfield
Mode: Cruise Control
Scope: All
Target stack: Next.js 15 + TypeScript

🚗 Engaging cruise control...

[Extracts business logic from Rails]
[Creates tech-agnostic specs]
[Builds NEW Next.js app in greenfield/]

✅ Complete! New app in greenfield/ ready to deploy!
```

---

## After StackShift Completes

### Brownfield

You have:
- ✅ `.specify/` - GitHub Spec Kit specifications
- ✅ `docs/` - Comprehensive documentation
- ✅ Specs match your existing code

**Next:** Use `/speckit.*` commands for ongoing development!

```bash
# Add new feature
> /speckit.specify

# Plan implementation
> /speckit.plan

# Build it
> /speckit.implement

# Validate
> /speckit.analyze
```

### Greenfield

You have:
- ✅ `.specify/` - Tech-agnostic specifications
- ✅ `docs/` - Business logic documentation
- ✅ `greenfield/` - NEW app in chosen stack!

**Next:** Deploy the new app, migrate users gradually!

---

## Common Commands

### Check Progress

```bash
# See which gear you're in
node plugin/scripts/state-manager.js progress

# Or read state file
cat .stackshift-state.json
```

### Switch Modes

```bash
# Enable cruise control mid-process
node plugin/scripts/state-manager.js cruise

# Switch to manual
node plugin/scripts/state-manager.js manual
```

### Resume Interrupted

```
"Resume StackShift from current gear"
```

Claude reads .stackshift-state.json and continues!

---

## Need Help?

- 📖 **Full docs:** See [README.md](README.md)
- 🔧 **Installation:** See [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/jschulte/stackshift/issues)
- 💡 **Questions:** [Discussions](https://github.com/jschulte/stackshift/discussions)

---

**Ready to shift gears!** 🚗💨

Choose your installation method above and get started in 5 minutes!
