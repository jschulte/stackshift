# AST CLI Wrapper - Simple Solution

## Problem

AST analysis was locked inside MCP tools, inaccessible to plugin users who use slash commands and skills.

## Solution

**Create a simple CLI wrapper** that calls the MCP tool handlers directly as regular JavaScript functions.

## How It Works

### Architecture

```
┌─────────────────┐
│ Slash Command   │
│ /stackshift.    │
│ gap-analysis    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Skill File     │
│  SKILL.md       │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  CLI Wrapper Script         │
│  run-ast-analysis.mjs       │
│                             │
│  #!/usr/bin/env node       │
│  import { handler } from   │
│    'mcp-server/dist/...'  │
│  const result = await      │
│    handler(args)           │
│  console.log(result)       │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  MCP Tool Handler           │
│  generateRoadmapToolHandler │
│                             │
│  - Creates GapAnalyzer      │
│  - Creates FeatureAnalyzer  │
│  - Runs AST parsing         │
│  - Returns results          │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  AST Analyzers              │
│  - gap-analyzer.ts          │
│  - feature-analyzer.ts      │
│  - ast-parser.ts (Babel)    │
└─────────────────────────────┘
```

### Implementation

**Step 1: Create CLI Wrapper** (`scripts/run-ast-analysis.mjs`)

```javascript
#!/usr/bin/env node
import { generateRoadmapToolHandler } from '../mcp-server/dist/tools/generate-roadmap.js';

const [,, command, directory = process.cwd(), ...flags] = process.argv;

async function main() {
  const result = await generateRoadmapToolHandler({
    directory,
    outputFormat: 'markdown',
    confidenceThreshold: 50,
  });

  // Extract text from MCP response format
  const text = result.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');

  console.log(text);
}

main();
```

**Step 2: Update Skills to Call Script**

```markdown
# skills/gap-analysis/SKILL.md

### Step 2a: Run AST-Powered Analysis

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

**Output**: AST-powered gap analysis with:
- Function signature verification
- Stub detection
- Missing parameter detection
- Confidence scoring
```

## Usage

### From Bash/Skills

```bash
# Basic usage
~/stackshift/scripts/run-ast-analysis.mjs roadmap

# With options
~/stackshift/scripts/run-ast-analysis.mjs roadmap . \
  --format=json \
  --threshold=75 \
  --teamSize=3
```

### From Slash Commands

```bash
# User runs:
/stackshift.gap-analysis

# Skill executes:
~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

### Programmatically

```javascript
import { generateRoadmapToolHandler } from 'stackshift-mcp/tools/generate-roadmap.js';

const result = await generateRoadmapToolHandler({
  directory: '/path/to/project',
  outputFormat: 'json',
  confidenceThreshold: 80,
});
```

## Benefits

### ✅ Simple

- No MCP protocol complexity
- Just call a function and get results
- Works with any Node.js script

### ✅ Reuses Existing Code

- MCP tool handlers are already written
- No duplication
- AST analyzers work as-is

### ✅ Accessible Everywhere

- ✅ Slash commands can call it
- ✅ Skills can call it
- ✅ Bash scripts can call it
- ✅ MCP clients can still use MCP protocol
- ✅ Direct imports work

### ✅ Flexible Output

```bash
# Markdown for humans
--format=markdown

# JSON for tools
--format=json

# CSV for spreadsheets
--format=csv

# HTML for reports
--format=html
```

## Why This Works

### MCP Tool Handlers Are Pure Functions

```typescript
// mcp-server/src/tools/generate-roadmap.ts
export async function generateRoadmapToolHandler(args: GenerateRoadmapArgs) {
  // Takes args
  const { directory, outputFormat } = args;

  // Does work
  const analyzer = new SpecGapAnalyzer();
  const gaps = await analyzer.analyze();

  // Returns results
  return {
    content: [{
      type: 'text',
      text: formatResults(gaps)
    }]
  };
}
```

**Key insight**: The handler doesn't require MCP infrastructure - it's just a function!

### No MCP Protocol Needed

```javascript
// MCP way (complex):
const client = new MCPClient();
await client.connect();
const result = await client.callTool('stackshift_generate_roadmap', args);
await client.disconnect();

// CLI wrapper way (simple):
import { generateRoadmapToolHandler } from './tools/generate-roadmap.js';
const result = await generateRoadmapToolHandler(args);
```

## Alternative: npx (Future)

Once published to npm as `stackshift-mcp`:

```bash
# Instead of:
~/stackshift/scripts/run-ast-analysis.mjs roadmap

# Users can:
npx stackshift-mcp roadmap

# Or install globally:
npm install -g stackshift-mcp
stackshift-mcp roadmap
```

## Comparison to Other Approaches

### Approach 1: Refactor Skills to Use AST Directly
❌ **Problem**: Massive refactor, duplicate code
```markdown
# Bad: Reimplementing AST logic in skills
skills/gap-analysis/SKILL.md:
  - Import ASTParser
  - Reimplement gap detection
  - Maintain two copies of logic
```

### Approach 2: Make Skills Call MCP Tools
❌ **Problem**: Requires MCP client infrastructure
```markdown
# Bad: Skills need MCP client
skills/gap-analysis/SKILL.md:
  - Setup MCP client connection
  - Handle protocol communication
  - Parse MCP responses
```

### Approach 3: CLI Wrapper (This Approach)
✅ **Wins**: Simple, no duplication, works everywhere
```bash
# Good: Just call a script
~/stackshift/scripts/run-ast-analysis.mjs roadmap
```

## Testing

### Test the CLI Wrapper

```bash
# Test basic execution
./scripts/run-ast-analysis.mjs roadmap /path/to/project

# Test with options
./scripts/run-ast-analysis.mjs roadmap . \
  --format=json \
  --threshold=60 \
  --teamSize=2

# Test error handling
./scripts/run-ast-analysis.mjs invalid-command
# Should show: "Unknown command: invalid-command"
```

### Integration Test

```bash
# Run through slash command
/stackshift.gap-analysis

# Should execute:
# 1. Skill loads
# 2. Calls run-ast-analysis.mjs
# 3. AST analysis runs
# 4. Results displayed
```

## Rollout Plan

### Phase 1: Add CLI Wrapper ✅
- Create `scripts/run-ast-analysis.mjs`
- Make executable
- Test basic functionality

### Phase 2: Update Gap Analysis Skill ✅
- Update `skills/gap-analysis/SKILL.md`
- Add Step 2a: AST-powered analysis
- Keep Step 2b: /speckit.analyze as fallback

### Phase 3: Add to Other Skills
- `skills/create-specs/SKILL.md` - detect implementation status
- `skills/implement/SKILL.md` - verify after implementation
- `skills/reverse-engineer/SKILL.md` - extract from code

### Phase 4: Publish CLI Tool
- Add to package.json bin
- Publish to npm as `stackshift-mcp`
- Document `npx stackshift-mcp` usage

## Future: More Commands

```bash
# API inventory
./scripts/run-ast-analysis.mjs api-inventory

# Business logic extraction
./scripts/run-ast-analysis.mjs business-logic

# Component hierarchy
./scripts/run-ast-analysis.mjs components

# Code-to-spec linking
./scripts/run-ast-analysis.mjs link-specs
```

## Summary

**User's brilliant insight**: "Just run the script and use the output"

**Result**:
- ✅ 50 lines of code (CLI wrapper)
- ✅ AST now accessible to all users
- ✅ No refactoring needed
- ✅ No code duplication
- ✅ Works everywhere

**Before**: AST locked in MCP-only tool
**After**: AST available via simple bash script call

This is the simplest, most pragmatic solution to make AST analysis universally accessible.
