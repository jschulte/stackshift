# StackShift MCP Server

**Model Context Protocol server for StackShift** - Exposes the 6-gear reverse engineering process to any MCP-compatible client.

---

## What is This?

The StackShift MCP server makes the reverse engineering workflow available to:

- ✅ **Claude Code** (via MCP integration)
- ✅ **VSCode with GitHub Copilot** (via MCP support)
- ✅ **Any MCP-compatible AI client**

Instead of using the Claude Code plugin, you can use this MCP server to access StackShift tools from any environment that supports Model Context Protocol.

---

## Installation

### Option 1: Via npx (Easiest - No Install Required)

Configure the MCP server in your client without installing:

**For Claude Code** (`~/.claude/config.json` or project config):
```json
{
  "mcpServers": {
    "stackshift": {
      "command": "npx",
      "args": ["-y", "stackshift-mcp"]
    }
  }
}
```

**For VSCode** (`.vscode/settings.json` or user settings):
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

### Option 2: Global Install

```bash
npm install -g stackshift-mcp
```

Then configure:
```json
{
  "mcpServers": {
    "stackshift": {
      "command": "stackshift-mcp"
    }
  }
}
```

### Option 3: From Source

```bash
# Clone the repo
git clone https://github.com/jschulte/stackshift.git
cd stackshift/mcp-server

# Install and build
npm install
npm run build

# Configure with absolute path
{
  "mcpServers": {
    "stackshift": {
      "command": "node",
      "args": ["/absolute/path/to/stackshift/mcp-server/dist/index.js"]
    }
  }
}
```

---

## Available Tools

The MCP server exposes **6 tools** (one for each gear):

### 1. stackshift_analyze
**Gear 1:** Analyze codebase and choose route

**Parameters:**
- `directory` (optional) - Project directory path
- `route` (optional) - "greenfield" or "brownfield"

**Usage:**
```typescript
{
  "name": "stackshift_analyze",
  "arguments": {
    "directory": "/path/to/project",
    "route": "brownfield"
  }
}
```

### 2. stackshift_reverse_engineer
**Gear 2:** Extract documentation based on route

**Parameters:**
- `directory` (optional) - Project directory path

**Generates:** 8 documentation files in `docs/reverse-engineering/`

### 3. stackshift_create_specs
**Gear 3:** Generate GitHub Spec Kit specifications

**Parameters:**
- `directory` (optional) - Project directory path

**Creates:** `.specify/` directory with constitution, specs, and plans

### 4. stackshift_gap_analysis
**Gear 4:** Run gap analysis and create roadmap

**Parameters:**
- `directory` (optional) - Project directory path

**Generates:** Gap analysis report and prioritized roadmap

### 5. stackshift_complete_spec
**Gear 5:** Complete specification with clarifications

**Parameters:**
- `directory` (optional) - Project directory path
- `clarifications` (optional) - Array of Q&A pairs

**Resolves:** [NEEDS CLARIFICATION] markers

### 6. stackshift_implement
**Gear 6:** Implement features from specs

**Parameters:**
- `directory` (optional) - Project directory path
- `feature` (optional) - Specific feature to implement

**Uses:** GitHub Spec Kit's `/speckit.implement` workflow

### 7. stackshift_cruise_control
**Cruise Control:** Automatic mode - shift through all 6 gears sequentially

**Parameters:**
- `directory` (optional) - Project directory path
- `route` (required) - Route choice: `greenfield` or `brownfield`
- `clarifications_strategy` (optional) - How to handle clarifications: `defer`, `prompt`, or `skip` (default: `defer`)
- `implementation_scope` (optional) - What to implement in Gear 6: `none`, `p0`, `p0_p1`, or `all` (default: `none`)

**Automates:** Complete StackShift workflow from analysis to implementation

### 8. stackshift_generate_roadmap (F008)
**Strategic Roadmap Generation:** Analyze gaps and generate prioritized roadmaps

**Parameters:**
- `directory` (optional) - Project directory path (defaults to current directory)
- `outputFormat` (optional) - Export format: `markdown`, `json`, `csv`, `html`, or `all` (default: `markdown`)
- `includeFeatureBrainstorming` (optional) - Whether to brainstorm desirable features (default: `false`)
- `confidenceThreshold` (optional) - Minimum confidence for gap inclusion, 0-100 (default: `50`)
- `teamSize` (optional) - Team size for timeline estimation, 1-10 (default: `2`)

**Generates:**
- Spec gap analysis (what specs say vs what code does)
- Feature gap analysis (advertised features vs actual capabilities)
- Desirable feature suggestions (optional AI-powered brainstorming)
- Prioritized roadmap with phases (P0-P3 priorities)
- Timeline estimates for different team sizes
- Export to ROADMAP.md, JSON, CSV, HTML, or GitHub Issues

**Output:** Comprehensive roadmap in requested format(s)

**Example:**
```json
{
  "directory": "/path/to/project",
  "outputFormat": "all",
  "includeFeatureBrainstorming": true,
  "confidenceThreshold": 70,
  "teamSize": 2
}
```

**See also:** [F008 Usage Examples](../production-readiness-specs/F008-roadmap-generation/examples/usage-examples.md)

---

## Available Resources

### stackshift://state
Full workflow state from `.stackshift-state.json`

**Returns:** JSON with current gear, completed gears, route, metadata

**Example:**
```json
{
  "version": "1.0.0",
  "path": "brownfield",
  "currentStep": "create-specs",
  "completedSteps": ["analyze", "reverse-engineer"],
  "metadata": {
    "projectName": "my-app",
    "pathDescription": "Manage existing app with Spec Kit"
  }
}
```

### stackshift://progress
Human-readable progress through the 6 gears

**Returns:** Markdown with current gear, progress percentage, status

**Example:**
```markdown
# StackShift Progress

**Route:** ⚙️ Brownfield (Manage Existing)
**Progress:** 2/6 gears (33%)

## Gears

🔍 Gear 1: Initial Analysis
   ✅ Complete

🔄 Gear 2: Reverse Engineer
   ✅ Complete

📋 Gear 3: Create Specifications
   🔄 In Progress

🔍 Gear 4: Gap Analysis
   ⏳ Pending

✨ Gear 5: Complete Specification
   ⏳ Pending

🚀 Gear 6: Implement from Spec
   ⏳ Pending
```

### stackshift://route
Selected route (greenfield or brownfield)

**Returns:** Text description of route

**Example:**
```
⚙️ Brownfield: Manage existing code with specs (tech-prescriptive)
```

---

## Usage Examples

### In Claude Code

```
User: "What's my StackShift progress?"

Claude: [Reads stackshift://progress resource]
Shows: Gear 2 complete, currently in Gear 3

User: "Use StackShift to analyze this codebase"

Claude: [Calls stackshift_analyze tool with route: brownfield]
Runs analysis, sets route, saves state
```

### In VSCode with Copilot

```
User: "Analyze this codebase with StackShift, brownfield route"

Copilot: [Calls stackshift_analyze]
Returns: Analysis results, tech stack detected, completeness assessment

User: "Show me my progress"

Copilot: [Reads stackshift://progress]
Returns: 1/6 gears complete (17%)
```

### Direct MCP Client

```typescript
// Call tool
await client.callTool({
  name: 'stackshift_analyze',
  arguments: {
    directory: '/path/to/project',
    route: 'greenfield'
  }
});

// Read resource
const progress = await client.readResource({
  uri: 'stackshift://progress'
});
```

---

## How It Works

### Architecture

```
┌─────────────────┐
│  AI Client      │
│  (Claude/VSCode)│
└────────┬────────┘
         │ MCP Protocol (stdio)
         │
┌────────▼────────┐
│ StackShift MCP  │
│     Server      │
├─────────────────┤
│  Tools (6)      │
│  Resources (3)  │
│  State Mgmt     │
└────────┬────────┘
         │
         ▼
  .stackshift-state.json
  (project directory)
```

### State Management

- State stored in project directory as `.stackshift-state.json`
- Tracks current gear, completed gears, route choice
- Resources provide read access to state
- Tools update state as gears progress

### Workflow

1. **Analyze** (Gear 1) - Choose route, initialize state
2. **Reverse Engineer** (Gear 2) - Extract docs (guided by route)
3. **Create Specs** (Gear 3) - Generate .specify/ structure
4. **Gap Analysis** (Gear 4) - Use /speckit.analyze
5. **Complete Spec** (Gear 5) - Resolve clarifications
6. **Implement** (Gear 6) - Use /speckit.implement

---

## Development

### Build

```bash
npm install
npm run build
```

### Run Locally

```bash
npm start
# Server listens on stdio
```

### Watch Mode

```bash
npm run dev
# Rebuilds on file changes
```

### Testing

```bash
# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Publishing

### To npm

```bash
# From mcp-server directory
npm version patch  # or minor, or major
npm publish
```

### Configuration for Users

After publishing, users can use:
```bash
npx stackshift-mcp
```

---

## Comparison: MCP Server vs Claude Code Plugin

| Feature | MCP Server | Claude Code Plugin |
|---------|------------|-------------------|
| **Works with** | Any MCP client | Claude Code only |
| **Installation** | npx (no install) | Plugin install |
| **UI/UX** | Client-dependent | Claude Code skills |
| **Auto-activation** | Via client | Yes (skills) |
| **State management** | ✅ Yes | ✅ Yes |
| **Portability** | ✅ High | Claude Code only |

**Recommendation:** Use both!
- MCP server for VSCode/Copilot users
- Claude Code plugin for Claude Code users

---

## Testing

[![Coverage](https://img.shields.io/badge/coverage-84.97%25-yellow)](https://github.com/jschulte/stackshift/actions)

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/tools/__tests__/analyze.test.ts
```

### Coverage Thresholds

The project enforces strict coverage thresholds:
- **Lines**: 85%
- **Functions**: 85%
- **Branches**: 80%
- **Statements**: 85%

CI builds will fail if coverage drops below these thresholds.

### Test Organization

```
src/
├── __tests__/              # Main server & integration tests
│   ├── index.test.ts       # MCP server initialization
│   ├── integration.test.ts # E2E workflows
│   └── fixtures/           # Test data
├── tools/__tests__/        # Tool handler tests (6 gears)
├── resources/__tests__/    # Resource handler tests
└── utils/__tests__/        # Utility tests
    ├── state-manager.test.ts
    ├── state-recovery.test.ts
    └── security.test.ts
```

### Writing Tests

See [docs/guides/TESTING.md](./docs/guides/TESTING.md) for detailed testing patterns and examples.

**Quick example:**
```typescript
import { describe, it, expect } from 'vitest';
import { analyzeToolHandler } from '../analyze.js';

describe('analyzeToolHandler', () => {
  it('should analyze project directory', async () => {
    const result = await analyzeToolHandler({
      directory: '/test/path',
      route: 'greenfield'
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain('Analysis Complete');
  });
});
```

---

## Troubleshooting

### Server Not Starting

```bash
# Check if built
ls -la dist/

# Rebuild
npm run build

# Test directly
node dist/index.js
```

### Tools Not Showing

1. Check client MCP configuration
2. Restart client completely
3. Check server logs (stderr)

### State Not Persisting

- Ensure write permissions in project directory
- Check `.stackshift-state.json` was created
- Verify `directory` parameter is correct

---

## Resources

- **StackShift Repository:** https://github.com/jschulte/stackshift
- **MCP Documentation:** https://modelcontextprotocol.io
- **GitHub Spec Kit:** https://github.com/github/spec-kit

---

**Built with Model Context Protocol** | **Part of StackShift** | **🚗 Shift with Confidence**
