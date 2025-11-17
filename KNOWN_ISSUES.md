# Known Issues

**Last Updated**: 2025-11-17
**Cox Automotive Version**: Adapted from upstream with MCP server removed

---

## 📝 MCP Server Removed

**Status**: MCP server component has been removed from this repository.

**Reason**: The MCP server should live in `~/git/mcp-tools` instead for Cox infrastructure.

**Impact**:
- F008 roadmap generation features (planned but not implemented) removed with MCP server
- Core plugin-based workflow (Gears 1-6) remains fully functional
- Specs in `production-readiness-specs/F008-roadmap-generation/` remain for reference

**Note**: If MCP server support is needed, it should be implemented in the mcp-tools repository separately.

---

## 🟢 What Works (Cox Automotive Version)

- ✅ All core gears (1-6) via Claude Code plugin
- ✅ Plugin skills (interactive workflow)
- ✅ Web prompts (manual usage via Claude Code Web)
- ✅ State management and progress tracking
- ✅ Cruise control (automated workflow)
- ✅ Osiris widget documentation (ws-scripts reference)

---

## 📋 Current Status

**No Blocking Issues**: All core functionality is operational.

**Cox-Specific Additions**:
- ✅ Osiris ws-scripts capabilities documentation (`docs/osiris/`)
- ✅ README adapted for Cox Automotive enterprise use
- ✅ MCP server removed (should live in mcp-tools)

**Future Enhancements** (Optional, not blocking):
- Implement MCP server support in mcp-tools repository if needed
- Add Cox-specific widget migration workflows for ddcai-widgets
- Extend Osiris documentation based on team feedback

**See specs**: `production-readiness-specs/` for detailed feature specifications
