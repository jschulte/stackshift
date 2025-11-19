# Legacy Prompts - DEPRECATED

**⚠️ These prompts are outdated and no longer maintained.**

**Status**: SUPERSEDED by slash commands and WEB_BOOTSTRAP.md
**Date Archived**: 2024-11-17
**Last Updated**: 2025-11-18

---

## What This Is

These prompts were the original manual prompts for StackShift's 6-gear reverse engineering process.

They were designed to be copy/pasted into Claude.ai for manual execution.

---

## Why Archived

All functionality from these prompts has been moved to:

- **Claude Code Plugin Skills** (`plugin/skills/`) - Interactive, auto-activated
- **MCP Server Tools** (`mcp-server/src/tools/`) - Programmatic access
- **CLI Orchestrator** (`cli/`) - Batch processing

The skills provide:
- ✅ Better user experience (interactive, guided)
- ✅ Automatic state management
- ✅ Error handling and validation
- ✅ Progress tracking
- ✅ Batch processing support

---

## Use These Instead

### For Claude Code Users
**Slash commands** (recommended):
```bash
/stackshift.start     # Start complete process
/stackshift.batch     # Batch process multiple repos
/speckit.specify      # Create feature spec
/speckit.implement    # Implement feature
```

See: [Quick Start Guide](../../QUICKSTART.md)

### For VSCode/GitHub Copilot Users
**WEB_BOOTSTRAP.md** - Copy and paste into Copilot Chat:
```bash
cat ~/stackshift/web/WEB_BOOTSTRAP.md
```

See: [VSCode/Copilot Guide](../../docs/guides/VSCODE_COPILOT.md)

### For Other LLM Users (ChatGPT, Claude.ai, Gemini)
**WEB_BOOTSTRAP.md** - Works with any LLM:
```bash
cat ~/stackshift/web/WEB_BOOTSTRAP.md
```

---

## Why These Are Deprecated

The legacy prompts (2024-11-17):
- ❌ Only 2 paths (missing 4 new routes: Osiris, Osiris-module, CMS-v9, CMS-viewmodel)
- ❌ No batch processing
- ❌ No directory-scoped sessions
- ❌ No cross-batch answer persistence
- ❌ No auto-resume from interruptions
- ❌ No Brownfield upgrade mode
- ❌ Manual state management

Current implementation (2025-11-18):
- ✅ 6 routes with auto-detection
- ✅ Batch processing (save 58 min on 90 repos)
- ✅ Directory-scoped sessions
- ✅ Cross-batch answer persistence
- ✅ Auto-resume capability
- ✅ Brownfield upgrade mode
- ✅ Automatic state management

---

## Migration Table

| Legacy Prompt | Current Equivalent | How to Use |
|---------------|-------------------|------------|
| `01-initial-analysis.md` | `skills/analyze/SKILL.md` | `/stackshift.start` or paste WEB_BOOTSTRAP.md |
| `02-reverse-engineer.md` | `skills/reverse-engineer/SKILL.md` | Auto-runs in Gear 2 |
| `03-create-specifications.md` | `skills/create-specs/SKILL.md` | Auto-runs in Gear 3 |
| `04-gap-analysis.md` | `skills/gap-analysis/SKILL.md` | Auto-runs in Gear 4 |
| `05-complete-specification.md` | `skills/complete-spec/SKILL.md` | Auto-runs in Gear 5 |
| `06-implement-from-spec.md` | `skills/implement/SKILL.md` | Auto-runs in Gear 6 |
| `greenfield/` | Embedded in skills | Auto-detected by route |
| `brownfield/` | Embedded in skills | Auto-detected by route |

---

## Historical Note

These files are preserved in this archive for:
- Reference when debugging skills
- Understanding the evolution of StackShift
- Recovering specific prompt language if needed

They remain in git history and can be restored if necessary.

**Do not use these for new work.** Use the plugin skills, MCP server, or CLI instead.
