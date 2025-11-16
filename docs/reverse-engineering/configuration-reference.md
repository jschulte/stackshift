# Configuration Reference: StackShift

**Date:** 2025-11-16
**Version:** 1.0.0
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

Complete inventory of all configuration for StackShift toolkit including MCP server, plugin system, state management, and runtime requirements.

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

## MCP Server Configuration

### Package Configuration (mcp-server/package.json)

**Dependencies:**
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0"
}
```

**DevDependencies:**
```json
{
  "@types/node": "^20.0.0",
  "@vitest/coverage-v8": "^1.0.0",
  "typescript": "^5.3.0",
  "vitest": "^1.0.0"
}
```

**Build Scripts:**
```json
{
  "build": "tsc && chmod +x dist/index.js",
  "dev": "tsc --watch",
  "start": "node dist/index.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:security": "vitest run --grep security",
  "prepublishOnly": "npm run build"
}
```

**Engine Requirements:**
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### TypeScript Configuration (mcp-server/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key Settings:**
- Strict mode enabled (full type safety)
- ES2022 target (modern JavaScript features)
- ES2022 modules (native ESM support)
- Declaration files generated (for type checking)
- Source maps enabled (debugging)

---

### Test Configuration (mcp-server/vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.config.ts']
    }
  }
});
```

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
- MCP Server: ~5MB (dist/)
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

### npm Package (MCP Server)

**Entry Point:** `dist/index.js` (shebang: `#!/usr/bin/env node`)
**Executable:** `stackshift-mcp`

**Installation:**
```bash
npm install -g stackshift-mcp
```

**Usage:**
```bash
stackshift-mcp  # Runs MCP server
```

---

### Claude Code Plugin

**Installation Paths:**
1. `~/.claude/plugins/marketplaces/jschulte/stackshift/` (via marketplace)
2. Manual: Copy to `.claude/plugins/`

**Skill Discovery:** Automatic via `skills/*/SKILL.md` structure

---

## Configuration Management

### State Manager CLI (plugin/scripts/state-manager.js)

**Commands:**
```bash
# Initialization
node state-manager.js init
node state-manager.js config <route> <mode> [options]

# Configuration
node state-manager.js set-path greenfield|brownfield
node state-manager.js cruise [strategy] [scope]
node state-manager.js manual

# Progress
node state-manager.js status
node state-manager.js progress

# Utility
node state-manager.js reset
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-16
