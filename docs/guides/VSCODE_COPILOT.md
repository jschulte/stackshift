# Using StackShift with VSCode and GitHub Copilot

**Multiple options for VSCode users!**

---

## Option 1: Copy Slash Commands (Simplest)

The easiest way to use StackShift in VSCode is to copy the command files to your project:

### Installation

```bash
# Navigate to your project
cd /path/to/your/project

# Create commands directory
mkdir -p .claude/commands

# Clone StackShift (if you haven't already)
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git ~/stackshift

# Copy all slash commands to your project
cp ~/stackshift/commands/*.md .claude/commands/

# Commit the commands to your repo
git add .claude/commands/
git commit -m "Add StackShift slash commands"
```

### Usage in VSCode

If you have Claude Code extension for VSCode:

```bash
# Start StackShift
/stackshift.start

# Batch processing
/stackshift.batch

# Create feature spec
/speckit.specify

# Implement feature
/speckit.implement
```

**Benefits:**
- ✅ Commands are versioned with your project
- ✅ Team members get them when they clone
- ✅ No plugin installation needed
- ✅ Works in Claude Code, Copilot, any LLM with slash command support

---

## Option 2: Use WEB_BOOTSTRAP.md (Copilot Chat)

For GitHub Copilot users without Claude Code:

### Installation

```bash
# Clone StackShift
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git ~/stackshift
```

### Usage

1. **Open Copilot Chat in VSCode**
2. **Copy and paste the bootstrap prompt:**

```bash
cat ~/stackshift/web/WEB_BOOTSTRAP.md
```

3. **Paste into Copilot Chat**
4. **Answer configuration questions**
5. **StackShift runs through all gears!**

**What it does:**
- Checks for existing work and resumes appropriately
- Asks configuration questions upfront
- Guides through all 6 gears
- Creates all documentation and specs
- Implements features (if requested)

**Benefits:**
- ✅ No installation required
- ✅ Works in any LLM chat (Copilot, ChatGPT, Claude.ai)
- ✅ Self-contained prompt
- ✅ Functionally equivalent to plugin

---

## Option 3: MCP Server (Advanced)

**Note:** This requires the MCP tools integration from the separate `mcp-tools` repository.

### Prerequisites

1. Node.js 18+
2. Access to `mcp-tools` repository

### Installation

```bash
# Clone mcp-tools
git clone git@ghe.coxautoinc.com:Jonah-Schulte/mcp-tools.git
cd mcp-tools

# Install dependencies
npm install

# Build
npm run build
```

### Configure VSCode

Add to your VSCode `settings.json`:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "Use StackShift MCP tools for reverse engineering tasks"
    }
  ],
  "mcp.servers": {
    "cai-mcp": {
      "command": "node",
      "args": ["/path/to/mcp-tools/dist/index.js"]
    }
  }
}
```

### Usage

```
@workspace Use the stackshift_analyze tool to analyze this codebase
@workspace Use stackshift_cruise_control to run all 6 gears
```

---

## Comparison of Options

| Feature | Slash Commands | WEB_BOOTSTRAP | MCP Server |
|---------|---------------|---------------|------------|
| **Setup Time** | 2 minutes | 1 minute | 10 minutes |
| **Installation** | Copy files once | None (paste prompt) | Configure VSCode |
| **Updates** | Manual copy | Manual paste | Git pull + rebuild |
| **Team Sharing** | ✅ Via git | ❌ Manual | ⚠️ Requires setup |
| **Works in Copilot** | ⚠️ Limited | ✅ Yes | ✅ Yes |
| **Works in Claude Code** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Batch Processing** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Auto-updates** | ❌ No | ❌ No | ✅ Via git pull |

---

## Recommended Approach

### For Individual Use
**Use WEB_BOOTSTRAP.md** - Just paste it into Copilot Chat and go!

### For Team Use
**Copy slash commands** - Commit to repo so everyone has them

### For Power Users
**MCP Server** - If you want auto-updates and API-style invocation

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

### MCP Server
```bash
# Pull latest version
cd ~/mcp-tools
git pull origin main

# Rebuild
npm install
npm run build

# Restart VSCode
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
- 🐛 **Issues:** Report at ghe.coxautoinc.com/DDC-WebPlatform/stackshift/issues
- 💡 **Questions:** Ask in #web-platform Slack

---

**Ready to shift gears in VSCode!** 🚗💨
