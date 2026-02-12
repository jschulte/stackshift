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

## 📋 Project Planning & Reviews

### Planning Documents (`/docs/planning/`)
Project roadmaps and improvement plans:
- **[Implementation Roadmap](planning/IMPLEMENTATION_ROADMAP.md)** - Development roadmap
- **[Feature Gap Analysis](planning/FEATURE_GAP_ANALYSIS.md)** - Missing features
- **[Prompt Improvements](planning/PROMPT_IMPROVEMENTS.md)** - Prompt enhancements

### Review Documents (`/docs/reviews/`)
Historical analysis and assessments:
- **[Documentation Reviews](reviews/)** - Documentation quality assessments
- **[Test Coverage Analysis](reviews/test-coverage-analysis.md)** - Testing metrics
- **[Analysis Report](reviews/analysis-report.md)** - Feature analysis

---

## 📁 Documentation Structure

```
stackshift/
├── README.md                    # Main overview
├── QUICKSTART.md                # 5-minute quick start
├── ROADMAP.md                   # Project roadmap
├── LICENSE                      # MIT license
├── docs/
│   ├── README.md               # This file
│   ├── guides/                 # User guides
│   │   ├── INSTALLATION.md
│   │   └── PLUGIN_GUIDE.md
│   ├── development/            # Development docs
│   │   ├── TRANSFORMATION_SUMMARY.md
│   │   └── GREENFIELD_BROWNFIELD_SUMMARY.md
│   ├── planning/               # Project planning
│   │   ├── IMPLEMENTATION_ROADMAP.md
│   │   ├── FEATURE_GAP_ANALYSIS.md
│   │   └── PROMPT_IMPROVEMENTS.md
│   └── reverse-engineering/    # Sample outputs
├── web/
│   └── README.md               # Web usage guide
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

**For Contributors:**
- [Development Docs](development/)
- [GitHub Issues](https://github.com/jschulte/stackshift/issues)
- [Pull Requests](https://github.com/jschulte/stackshift/pulls)

---

**All documentation is version controlled and kept up-to-date.**

Found something unclear? [Open an issue](https://github.com/jschulte/stackshift/issues/new)!
