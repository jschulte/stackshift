# StackShift Documentation

Complete documentation for StackShift - organized for easy navigation.

---

## 📖 Getting Started

- **[Quick Start](../QUICKSTART.md)** - 5-minute setup guide
- **[Main README](../README.md)** - Overview and features

---

## 📘 User Guides

### Installation & Setup

- **[Installation Guide](guides/INSTALLATION.md)** - Install on all platforms
  - Local plugin installation
  - Web (browser) usage
  - MCP server setup for VSCode
  - Testing and verification

### Usage Guides

- **[Plugin Guide](guides/PLUGIN_GUIDE.md)** - Using the Claude Code plugin
  - Interactive skills
  - Cruise control mode
  - State management
  - Custom agents

- **[Web Guide](../web/README.md)** - Using Claude Code Web (browser)
  - No installation required
  - Orchestrator prompt usage
  - State persistence
  - Resume capability

- **[MCP Guide](../mcp-server/README.md)** - MCP server for VSCode/Copilot
  - 7 tools, 3 resources
  - Configuration
  - Usage examples

### Advanced Guides

- **[Batch Processing Guide](../scripts/BATCH_PROCESSING_GUIDE.md)** - Process multiple projects
  - Maximize token usage
  - Parallel processing
  - CI/CD integration
  - Token optimization

- **[Greenfield Structure](../web/GREENFIELD_STRUCTURE.md)** - Building new apps from specs
  - Subfolder approach
  - Project organization
  - Migration strategy

- **[Spec Kit Fallback](../web/SPECKIT_FALLBACK.md)** - When Spec Kit CLI unavailable
  - Manual .specify/ creation
  - Fallback templates
  - Direct prompt usage

---

## 🔧 Development Documentation

Internal documentation about how StackShift was built:

- **[Transformation Summary](development/TRANSFORMATION_SUMMARY.md)** - How the plugin was created
- **[Greenfield/Brownfield Summary](development/GREENFIELD_BROWNFIELD_SUMMARY.md)** - Dual workflow design

---

## 📁 Documentation Structure

```
stackshift/
├── README.md                    # Main overview
├── QUICKSTART.md                # 5-minute quick start
├── LICENSE                      # MIT license
├── docs/
│   ├── README.md               # This file
│   ├── guides/
│   │   ├── INSTALLATION.md     # Installation guide
│   │   └── PLUGIN_GUIDE.md     # Plugin usage guide
│   └── development/            # Internal/development docs
│       ├── TRANSFORMATION_SUMMARY.md
│       └── GREENFIELD_BROWNFIELD_SUMMARY.md
├── web/
│   ├── README.md               # Web usage guide
│   ├── stackshift-web-orchestrator.md
│   ├── GREENFIELD_STRUCTURE.md
│   └── SPECKIT_FALLBACK.md
├── mcp-server/
│   └── README.md               # MCP server guide
└── scripts/
    └── BATCH_PROCESSING_GUIDE.md
```

---

## Quick Links

**For Users:**
- [Quick Start](../QUICKSTART.md) ⭐ Start here!
- [Installation](guides/INSTALLATION.md)
- [Plugin Usage](guides/PLUGIN_GUIDE.md)
- [Web Usage](../web/README.md)
- [MCP Usage](../mcp-server/README.md)

**For Contributors:**
- [Development Docs](development/)
- [GitHub Issues](https://github.com/jschulte/stackshift/issues)
- [Pull Requests](https://github.com/jschulte/stackshift/pulls)

---

**All documentation is version controlled and kept up-to-date.**

Found something unclear? [Open an issue](https://github.com/jschulte/stackshift/issues/new)!
