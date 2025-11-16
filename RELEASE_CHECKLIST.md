# StackShift v1.0 Release Checklist

---

## Pre-Release Verification

### Core Functionality
- [x] Claude Code Plugin (7 skills + 2 agents)
- [x] MCP Server (7 tools, 3 resources)
- [x] Web orchestrator (browser support)
- [x] Cruise control mode
- [x] Greenfield/Brownfield routes
- [x] GitHub Spec Kit integration
- [x] State management
- [x] Batch processing tools

### Documentation
- [x] README.md (main overview with logo)
- [x] QUICKSTART.md (5-minute setup)
- [x] LICENSE (MIT)
- [x] INSTALLATION.md → docs/guides/
- [x] Plugin guide
- [x] MCP guide
- [x] Web guide
- [x] Batch processing guide
- [x] Roadmap (v1.1+ features)

### Code Quality
- [x] TypeScript builds without errors
- [x] MCP server compiles cleanly
- [x] Scripts are executable
- [x] .gitignore properly configured
- [x] No sensitive data in repo

### Repository
- [x] Clean root directory (6 files)
- [x] Organized docs/ structure
- [x] Professional appearance
- [x] All commits pushed
- [x] Username corrected (jschulte)
- [x] Repository name: stackshift

---

## Release Steps

### 1. Tag Release

```bash
git tag -a v1.0.0 -m "StackShift v1.0.0 - Initial Release

Features:
- 6-gear reverse engineering process
- Dual workflow: Greenfield (tech-agnostic) + Brownfield (tech-prescriptive)
- Claude Code plugin with 7 skills and 2 custom agents
- MCP server with 7 tools and 3 resources
- Web orchestrator for Claude Code Web (browser)
- Cruise control: automatic mode for unattended execution
- Batch processing tools for analyzing multiple projects
- Complete GitHub Spec Kit integration
- Comprehensive documentation

Works with:
- Claude Code (local)
- Claude Code Web (browser)
- VSCode + GitHub Copilot (via MCP)
- Any MCP-compatible client

Start in reverse (engineering), shift through 6 gears, cruise into spec-driven development!"

git push origin v1.0.0
```

### 2. Create GitHub Release

**On GitHub:**
1. Go to: https://github.com/jschulte/stackshift/releases
2. Click "Create a new release"
3. Choose tag: `v1.0.0`
4. Title: `v1.0.0 - StackShift: Shift Gears in Your Codebase`
5. Description: [Use release notes below]
6. Publish release

**Release Notes:**

```markdown
## StackShift v1.0.0 🚗💨

**Shift gears in your codebase** - Transform any application into a fully-specified, spec-driven project with complete control.

### What is StackShift?

A reverse engineering toolkit with manual control over your codebase transformation. Like a stick shift gives you manual control over your drive, StackShift gives you control over transforming applications into spec-driven projects.

### Features

🔄 **6-Gear Process**
- Start in reverse (engineering)
- Shift through analysis, documentation, specifications, gap analysis, clarification, implementation
- Manual or cruise control (automatic) mode

🔀 **Dual Workflow**
- **Greenfield:** Extract business logic for rebuilding in new stack (tech-agnostic)
- **Brownfield:** Document existing for management with GitHub Spec Kit (tech-prescriptive)

🚗 **Cruise Control**
- Automatic mode: shift through all 6 gears without stopping
- Perfect for unattended execution or batch processing
- Configure once, let it run!

📋 **GitHub Spec Kit Integration**
- `/speckit.analyze` - Validate specs vs code
- `/speckit.implement` - Build features from specs
- `/speckit.clarify` - Resolve ambiguities
- Full integration with Spec Kit workflow

### Three Ways to Use

1. **Claude Code Plugin (Local)** - Interactive skills, best experience
2. **Claude Code Web (Browser)** - No installation, works anywhere
3. **MCP Server (VSCode/Copilot)** - Cross-platform AI integration

### Installation

**Local:**
```bash
git clone https://github.com/jschulte/stackshift.git
cd stackshift
./install-local.sh
```

**Web:**
- Upload project to Claude Code Web
- Copy-paste `web/stackshift-web-orchestrator.md`
- Answer questions and shift through the gears!

**VSCode/Copilot:**
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

### What's Included

- 7 interactive skills (6 gears + cruise control)
- 2 custom agents (technical-writer, code-analyzer)
- MCP server with 7 tools and 3 resources
- Web orchestrator for browser usage
- Batch processing scripts
- Comprehensive documentation (~23,000 lines)
- Spec Kit fallback templates

### Documentation

- [Quick Start](QUICKSTART.md)
- [Installation Guide](docs/guides/INSTALLATION.md)
- [Full Documentation](docs/README.md)
- [Roadmap](ROADMAP.md)

### What's Next (v1.1)

- **StackSync:** Keep legacy and greenfield apps in sync during migrations
- **Dual-Spec Mode:** Generate both prescriptive and agnostic specs in one run

See [ROADMAP.md](ROADMAP.md) for details.

### Contributors

Built by [@jschulte](https://github.com/jschulte)

### License

MIT - See [LICENSE](LICENSE)

---

**Start in reverse (engineering), shift through 6 gears, cruise into spec-driven development!** 🚗💨
```

### 3. Publish MCP Server to npm (Optional)

```bash
cd mcp-server
npm version 1.0.0
npm publish

# Now users can:
npx stackshift-mcp
```

### 4. Submit to Claude Code Marketplace (When Ready)

- Check Claude Code plugin marketplace submission process
- Ensure .claude-plugin/marketplace.json is correct
- Submit for review

---

## Post-Release

### Announce

- [ ] Tweet/share on social media
- [ ] Post in Claude Code community
- [ ] Share in relevant Discord/Slack channels
- [ ] Write blog post (optional)

### Monitor

- [ ] Watch for GitHub issues
- [ ] Respond to questions in Discussions
- [ ] Collect feedback for v1.1

---

## Ready to Release!

**Current status:** ✅ v1.0.0 ready to ship

**Next steps:**
1. Tag v1.0.0 (command above)
2. Create GitHub release
3. Start using it for your token burn! 💰🔥

**v1.1 planning:**
- StackSync (based on your usage feedback)
- Dual-Spec Mode
- Any issues discovered in v1.0

---

**Ship it!** 🚢
