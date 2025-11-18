# StackShift Quick Start

**Get started in under 5 minutes!** 🚗💨

---

## Installation

### Via Marketplace (Recommended)

**First, add the DDC Web Platform marketplace (one-time setup):**

```bash
# Add the marketplace
/plugin marketplace add ddc-webplatform git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git

# Update the marketplace
/plugin marketplace update ddc-webplatform
```

**Then install StackShift:**

```bash
# Install from marketplace
/plugin install stackshift@ddc-webplatform

# Restart Claude Code
```

### Manual Installation

```bash
# Clone and install locally
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git
cd stackshift
./install-local.sh

# Restart Claude Code
```

---

## First Run - Start the Analysis

**Use the slash command to begin:**

```bash
/stackshift.start
```

This will:
1. Show you the overview of all 3 routes
2. Auto-detect your repository type
3. Start Gear 1 (Analysis) automatically
4. Guide you through the configuration questions

---

## Configuration Questions

StackShift asks 2-6 questions upfront:

**1. Route** (always):
- **Greenfield:** Extract business logic → rebuild in new stack
- **Brownfield:** Document existing → manage with GitHub Spec Kit
- **Osiris:** Extract Cox Osiris widgets + modules

**2. Transmission** (always):
- **Manual:** Review each gear before proceeding
- **Cruise Control:** Automatic - shift through all gears!

**3-6. If Cruise Control** (conditional):
- Clarifications strategy (defer/prompt/skip)
- Implementation scope (none/p0/p0_p1/all)
- Target tech stack (if greenfield/osiris)
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

## Available Slash Commands

### StackShift Commands

```bash
/stackshift.start           # Start analysis (recommended entry point)
/stackshift.batch          # Batch process multiple repos
/stackshift.modernize      # Brownfield: Upgrade all dependencies
/stackshift.version        # Show installed version
/stackshift.setup          # Install commands to current project
```

### Spec Kit Commands (Available after Gear 3)

```bash
/speckit.specify           # Create feature specification
/speckit.plan              # Create implementation plan
/speckit.tasks             # Generate task list
/speckit.implement         # Execute implementation
/speckit.clarify           # Resolve ambiguities
/speckit.analyze           # Validate specs match code
```

---

## Example Sessions

### Brownfield (Manage Existing App)

```bash
# Start the process
/stackshift.start

# StackShift shows overview, then asks:
Route: Brownfield
Transmission: Cruise Control
Implementation scope: None - Just specs

🚗 Cruise control engaged!

[Shifts through all 6 gears automatically]

✅ Complete! Generated:
- .specify/ with 12 specifications
- docs/ with 8 comprehensive docs
- All committed to branch
```

### Greenfield (Rebuild in New Stack)

```bash
# Start the process
/stackshift.start

# Configuration
Route: Greenfield
Transmission: Cruise Control
Implementation scope: All
Target stack: Next.js 15 + TypeScript

🚗 Engaging cruise control...

[Extracts business logic]
[Creates tech-agnostic specs]
[Builds NEW Next.js app in greenfield/]

✅ Complete! New app in greenfield/ ready to deploy!
```

### Batch Processing (Multiple Repos)

```bash
# Process 30 widgets at once
cd ~/git/osiris
/stackshift.batch

# Answer configuration questions ONCE
# All 30 widgets use same configuration automatically!

✅ Time saved: 58 minutes on 90 repos!
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
/speckit.specify

# Plan implementation
/speckit.plan

# Generate tasks
/speckit.tasks

# Build it
/speckit.implement

# Validate alignment
/speckit.analyze
```

### Greenfield

You have:
- ✅ `.specify/` - Tech-agnostic specifications
- ✅ `docs/` - Business logic documentation
- ✅ `greenfield/` - NEW app in chosen stack!

**Next:** Deploy the new app, migrate users gradually!

---

## Check Progress

```bash
# View current state
cat .stackshift-state.json

# Or use state manager
node plugin-scripts/state-manager.js progress
```

---

## Troubleshooting

### Slash Commands Not Showing?

1. **Update the plugin:**
   ```bash
   /plugin update stackshift
   ```

2. **Restart Claude Code**

3. **Check installation:**
   ```bash
   /plugin list
   ```

### Natural Language Not Working?

**Use slash commands instead!** Natural language prompts like "analyze this codebase" may not trigger StackShift reliably. Always use:

```bash
/stackshift.start    # ← Use this!
```

Not:
```
"analyze this codebase"    # ← Don't use this
"reverse engineer this app" # ← Don't use this
```

---

## Need Help?

- 📖 **Full docs:** See [README.md](README.md)
- 🔧 **Installation:** See [INSTALL.md](INSTALL.md)
- 🐛 **Issues:** Report at ghe.coxautoinc.com/DDC-WebPlatform/stackshift/issues
- 💡 **Questions:** Ask in #web-platform Slack

---

**Ready to shift gears!** 🚗💨

Run `/stackshift.start` to begin!
