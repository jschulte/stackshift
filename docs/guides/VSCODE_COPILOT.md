# Using StackShift with VSCode and GitHub Copilot

**Multiple options for VSCode users!**

---

## Option 1: Use WEB_BOOTSTRAP.md (Recommended!)

**⚠️ Important:** GitHub Copilot and standard VSCode do NOT support `.claude/commands/` slash commands. Slash commands only work in Claude Code.

For VSCode/Copilot users, use the web bootstrap prompt instead.

### Installation

```bash
# Clone StackShift
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git ~/stackshift
```

### Usage

1. **Open Copilot Chat in VSCode** (Cmd+I or Ctrl+I)
2. **Copy the bootstrap prompt:**
   ```bash
   cat ~/stackshift/web/WEB_BOOTSTRAP.md
   ```
3. **Paste into Copilot Chat**
4. **Copilot becomes StackShift!**

Copilot will then:
- Check for existing work
- Ask configuration questions
- Guide you through all 6 gears
- Create documentation and specs
- Implement features (if requested)

**Benefits:**
- ✅ No installation required
- ✅ Works immediately
- ✅ Functionally equivalent to Claude Code plugin
- ✅ Self-contained prompt
- ✅ Works with any LLM (Copilot, ChatGPT, Claude.ai, Gemini)

---

---

## Recommended Approach

### For VSCode/Copilot Users
**Use WEB_BOOTSTRAP.md** - Just paste it into Copilot Chat and go!

**Why:** Slash commands don't work in VSCode/Copilot. Only Claude Code supports the `.claude/commands/*.md` pattern.

### For Claude Code Users
**Install the plugin** - Full slash command support

---

## Example: Using WEB_BOOTSTRAP in Copilot

```bash
# 1. Get the bootstrap prompt
cat ~/stackshift/web/WEB_BOOTSTRAP.md

# 2. Copy the entire output

# 3. Open VSCode Copilot Chat (Cmd+I or Ctrl+I)

# 4. Paste the prompt

# 5. Copilot becomes StackShift!

Copilot: "Let me check what's already done in this repository..."

[Copilot runs checks]

Copilot: "Nothing found. Let's start from Gear 1.
         Which route? Greenfield or Brownfield?"

You: "Greenfield - I want to rebuild this in Next.js"

Copilot: "Transmission: Manual or Cruise Control?"

You: "Cruise Control"

[Copilot shifts through all 6 gears automatically]

Copilot: "✅ Complete! Generated:
         - .specify/ with 15 specifications
         - docs/reverse-engineering/ with 8 docs
         - greenfield/ with new Next.js app
         Ready to deploy!"
```

---

## Updating StackShift

### Slash Commands
```bash
# Pull latest version
cd ~/stackshift
git pull origin main

# Copy updated commands
cp ~/stackshift/commands/*.md /path/to/your/project/.claude/commands/
```

### WEB_BOOTSTRAP
```bash
# Pull latest version
cd ~/stackshift
git pull origin main

# Use updated bootstrap (just paste new version)
cat ~/stackshift/web/WEB_BOOTSTRAP.md
```

---

## Troubleshooting

### "Slash commands not working in Copilot"
GitHub Copilot doesn't support slash commands the same way Claude Code does. Use WEB_BOOTSTRAP.md instead.

### "Want to use slash commands anyway"
Install Claude Code extension for VSCode (if available) or use Claude Code CLI.

### "Need this for entire team"
Commit slash commands to `.claude/commands/` in your repo. When teammates clone, they get the commands automatically.

---

## Need Help?

- 📖 **Full docs:** See [README.md](../../README.md)
- 🔧 **Installation:** See [INSTALLATION.md](INSTALLATION.md)
- 🐛 **Issues:** Report at github.com/jschulte/stackshift/issues
- 💡 **Questions:** Ask in #web-platform Slack

---

**Ready to shift gears in VSCode!** 🚗💨
