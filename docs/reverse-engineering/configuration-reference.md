# Configuration Reference: StackShift

**Date:** 2025-11-16
**Version:** 1.0.0
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

Complete inventory of all configuration for StackShift toolkit including plugin system, state management, and runtime requirements.

---

## State Configuration (.stackshift-state.json)

**Location:** Project root
**Format:** JSON
**Max Size:** 10MB
**Purpose:** Track workflow progress and configuration

**Structure:**
```json
{
  "version": "1.0.0",
  "created": "ISO timestamp",
  "updated": "ISO timestamp",
  "path": "greenfield" | "brownfield",
  "auto_mode": true | false,
  "currentStep": "analyze" | "reverse-engineer" | "create-specs" | "gap-analysis" | "complete-spec" | "implement" | null,
  "completedSteps": ["analyze", "reverse-engineer"],
  "metadata": {
    "projectName": "string",
    "projectPath": "/absolute/path",
    "pathDescription": "string"
  },
  "config": {
    "route": "greenfield" | "brownfield",
    "mode": "manual" | "cruise",
    "clarifications_strategy": "defer" | "prompt" | "skip",
    "implementation_scope": "none" | "p0" | "p0_p1" | "all",
    "target_stack": "string (greenfield only)",
    "greenfield_location": "string (greenfield only)",
    "pause_between_gears": boolean
  },
  "stepDetails": {
    "step-id": {
      "started": "ISO timestamp",
      "completed": "ISO timestamp",
      "status": "completed",
      "details": {}
    }
  }
}
```

**Validation Rules:**
- Version must be "1.0.0"
- Path must be null or "greenfield"/"brownfield"
- currentStep must be valid step ID or null
- completedSteps must be array of valid step IDs
- Prototype pollution properties rejected (`__proto__`, `constructor`, `prototype`)

---

## Plugin Configuration

### Plugin Metadata (plugin/.claude-plugin/plugin.json)

```json
{
  "name": "stackshift",
  "version": "1.0.0",
  "description": "Reverse engineering toolkit with manual control...",
  "author": {
    "name": "Jonah Schulte"
  },
  "repository": "https://github.com/jschulte/stackshift",
  "license": "MIT",
  "keywords": [
    "stackshift", "reverse-engineering", "specifications",
    "spec-driven", "github-spec-kit", "migration", "refactoring",
    "greenfield", "brownfield", "openapi", "json-schema"
  ]
}
```

---

## Security Configuration

### Path Validation (security.ts)

**Allowed Base Paths:**
- Default: Current working directory
- Configurable via SecurityValidator constructor

**Shell Metacharacters Detected:**
```regexp
/[;&|`$(){}[\]<>\\!'"\n\r]/
```

**Validation Steps:**
1. Check for shell metacharacters
2. Resolve to absolute normalized path
3. Verify within allowed base paths
4. Reject parent directory escapes (`..`)

---

## Resource Limits

### File Operations
- **Max Files Processed:** 10,000 per scan
- **Max Directory Depth:** 10 levels
- **Max File Size:** 10MB (for safe reads)
- **State File Size:** 10MB max

### Input Validation
- **Max Clarifications:** 100 per request
- **Max String Length:** 5,000 characters (clarifications)
- **Max Feature Name:** 200 characters
- **Path Separators:** Rejected in feature names

### Skipped Directories
- `node_modules/`
- `.git/`
- `.stackshift/`
- `.speckit/`
- Hidden directories (starting with `.`)
- `dist/`, `build/`, `target/`

---

## Runtime Requirements

### Node.js
- **Minimum Version:** 18.0.0
- **Reason:** ES2022 features, MCP SDK compatibility
- **Recommended:** Latest LTS (20.x or 22.x)

### Operating Systems
- Linux (primary)
- macOS
- Windows (WSL recommended)

### Disk Space
- Plugin: ~2MB
- State Files: <1MB typically
- Generated Docs: 1-5MB per project

---

## Environment Configuration

### No Environment Variables Required
StackShift does not require environment variables. All configuration is via:
- State file (`.stackshift-state.json`)
- Tool parameters
- Plugin metadata files

---

## Distribution Configuration

### Claude Code Plugin

**Installation Paths:**
1. `~/.claude/plugins/marketplaces/jschulte/stackshift/` (via marketplace)
2. Manual: Copy to `.claude/plugins/`

**Skill Discovery:** Automatic via `skills/*/SKILL.md` structure

---

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-16
