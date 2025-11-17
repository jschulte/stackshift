# Legacy Prompts - For Historical Reference Only

**Status**: SUPERSEDED by `plugin/skills/` interactive skills
**Date Archived**: 2024-11-17

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

## Migration Guide

| Old Prompt | New Location | Usage |
|-----------|-------------|-------|
| `01-initial-analysis.md` | `plugin/skills/analyze/SKILL.md` | `/stackshift:analyze` |
| `02-reverse-engineer.md` | `plugin/skills/reverse-engineer/SKILL.md` | `/stackshift:reverse-engineer` |
| `03-create-specifications.md` | `plugin/skills/create-specs/SKILL.md` | `/stackshift:create-specs` |
| `04-gap-analysis.md` | `plugin/skills/gap-analysis/SKILL.md` | `/stackshift:gap-analysis` |
| `05-complete-specification.md` | `plugin/skills/complete-spec/SKILL.md` | `/stackshift:complete-spec` |
| `06-implement-from-spec.md` | `plugin/skills/implement/SKILL.md` | `/stackshift:implement` |
| `greenfield/02-reverse-engineer-business-logic.md` | Embedded in skills | Auto-detected |
| `brownfield/02-reverse-engineer-full-stack.md` | Embedded in skills | Auto-detected |

---

## If You Need Manual Prompts

For web-based usage (claude.ai), use:
- `web/WEB_BOOTSTRAP.md` - Bootstrap prompt for browser use
- `web/convert-reverse-engineering-to-speckit.md` - Spec conversion

These are maintained and current.

---

## Historical Note

These files are preserved in this archive for:
- Reference when debugging skills
- Understanding the evolution of StackShift
- Recovering specific prompt language if needed

They remain in git history and can be restored if necessary.

**Do not use these for new work.** Use the plugin skills, MCP server, or CLI instead.
