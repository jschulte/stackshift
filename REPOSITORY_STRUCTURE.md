# StackShift Repository Structure

Clean, professional structure ready for public release.

---

## Root Directory (Clean!)

```
stackshift/
├── README.md                    ⭐ Main overview with logo
├── QUICKSTART.md                🚀 5-minute quick start
├── LICENSE                      📄 MIT license
├── install-local.sh             💻 One-command local install
└── package.json                 📦 Package metadata
```

**Just 5 files!** Clean and professional.

---

## Documentation (`docs/`)

```
docs/
├── README.md                    📚 Documentation index
├── guides/
│   ├── INSTALLATION.md          📥 Detailed installation
│   └── PLUGIN_GUIDE.md          🔌 Plugin usage guide
└── development/                 🔧 Internal/development docs
    ├── TRANSFORMATION_SUMMARY.md
    └── GREENFIELD_BROWNFIELD_SUMMARY.md
```

---

## Core Functionality

### Plugin (`plugin/`)
```
plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── skills/                      # 7 interactive skills
│   ├── analyze/
│   ├── reverse-engineer/
│   ├── create-specs/
│   ├── gap-analysis/
│   ├── complete-spec/
│   ├── implement/
│   └── cruise-control/
├── agents/                      # 2 custom agents
│   ├── stackshift-technical-writer/
│   └── stackshift-code-analyzer/
├── templates/                   # Constitution & spec templates
├── speckit-templates/           # Fallback Spec Kit templates
└── scripts/
    └── state-manager.js         # Progress tracking
```

### MCP Server (`mcp-server/`)
```
mcp-server/
├── README.md                    # MCP usage guide
├── src/
│   ├── index.ts                # Server entry point
│   ├── tools/                  # 7 tools (6 gears + cruise)
│   └── resources/              # 3 resources
├── package.json
└── tsconfig.json
```

### Web Support (`web/`)
```
web/
├── README.md                    # Web usage guide
├── stackshift-web-orchestrator.md  # Copy-paste prompt
├── GREENFIELD_STRUCTURE.md      # Greenfield guide
└── SPECKIT_FALLBACK.md          # Fallback strategy
```

### Scripts (`scripts/`)
```
scripts/
├── prepare-web-batch.sh         # Batch processing setup
└── BATCH_PROCESSING_GUIDE.md    # Token optimization guide
```

### Prompts (`prompts/`)
```
prompts/
├── greenfield/                  # Tech-agnostic prompts
│   ├── README.md
│   └── 02-reverse-engineer-business-logic.md
├── brownfield/                  # Tech-prescriptive prompts
│   ├── README.md
│   └── 02-reverse-engineer-full-stack.md
└── [legacy prompts 01-06]       # Original prompts
```

---

## User Journey

### New User Arrives

1. **Sees README** with logo and clear overview
2. **Clicks QUICKSTART.md** for fast setup
3. **Chooses installation method:**
   - Local → docs/guides/INSTALLATION.md
   - Web → web/README.md
   - VSCode → mcp-server/README.md
4. **Gets started immediately!**

### Advanced User

1. **Batch processing?** → scripts/BATCH_PROCESSING_GUIDE.md
2. **Greenfield rebuild?** → web/GREENFIELD_STRUCTURE.md
3. **Spec Kit issues?** → web/SPECKIT_FALLBACK.md

### Contributor

1. **How was this built?** → docs/development/
2. **Want to contribute?** → README → Issues/PRs

---

## Documentation Quality

✅ **Organized** - Clear structure, easy to navigate
✅ **Complete** - Covers all use cases
✅ **Accessible** - Quick start + detailed guides
✅ **Professional** - Clean root, organized subdirs
✅ **Maintained** - Version controlled, up-to-date
✅ **User-focused** - Journey-based organization

---

## Total Documentation

- **Public-facing:** ~15 markdown files
- **Development:** 2 files (in docs/development/)
- **Code docs:** Agent/skill definitions (in plugin/)
- **Total lines:** ~23,000 lines of docs + code

**Everything a user needs to get started and succeed!** 🚗💨
