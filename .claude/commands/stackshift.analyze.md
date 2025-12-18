---
description: Gear 1 - Analyze codebase and detect tech stack
---

# Gear 1: Analysis

**IMPORTANT**: This command runs AST analysis ONCE and saves results for all gears.

---

## Step 0: Check for Pre-Configuration

```bash
# Check if config file exists (skip prompts if pre-configured)
if [ -f .stackshift-config.json ]; then
  echo "✅ Found .stackshift-config.json - using pre-configured settings"
  cat .stackshift-config.json | jq '.frameworks'
  SKIP_PROMPTS=true
else
  echo "ℹ️  No .stackshift-config.json found (optional)"
  echo "Create one to pre-configure options and skip prompts."
  SKIP_PROMPTS=false
fi
```

---

## Step 1: Run Full AST Analysis (Deterministic - Saves to Files)

**For all tools (Claude Code, OpenCode, Cursor, VSCode, etc.):**

```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**This will**:
- Parse entire codebase with Babel AST
- Analyze APIs, functions, classes, imports
- Detect stubs, business logic, patterns
- Save results to `.stackshift-analysis/` directory
- Generate roadmap.md, raw-analysis.json, summary.json

**Files created** (used by all other gears):
- `.stackshift-analysis/roadmap.md` - Human-readable gap analysis
- `.stackshift-analysis/raw-analysis.json` - Full AST data
- `.stackshift-analysis/summary.json` - Metadata & timestamps

**Cache duration**: 1 hour (auto-refreshes if stale)

---

## Step 2: Detect Tech Stack, Route, and Framework

### For Claude Code users:

Use the Skill tool with skill="analyze".

### For OpenCode users:

Use the StackShift agent: `@stackshift analyze this codebase`

Or run the bash workflow below.

### For VSCode/Cursor/Codex users:

Run this interactive workflow:

```bash
# 1. Detect tech stack
if [ -f package.json ]; then
  echo "📦 Node.js project detected"
  echo "Dependencies:"
  cat package.json | jq '.dependencies // {} | keys'
fi

# 2. Choose route
echo ""
echo "Choose your route:"
echo "  A) Greenfield - Shift to new tech stack (extract business logic only)"
echo "  B) Brownfield - Manage existing code (extract full implementation)"
read -p "Your choice (A/B): " route_choice
case ${route_choice^^} in
  A) ROUTE="greenfield" ;;
  B) ROUTE="brownfield" ;;
  *) ROUTE="brownfield" ;;
esac

# 3. Choose framework (BE RAD!)
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Choose Your Implementation Framework                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "A) GitHub Spec Kit"
echo "   ✓ Feature-level specs in .specify/"
echo "   ✓ Task-driven workflow with /speckit.* commands"
echo ""
echo "B) BMAD Method"
echo "   ✓ Hands off to BMAD's collaborative PM/Architect agents"
echo "   ✓ PRD + Architecture created through conversation"
echo ""
echo "C) BOTH (Recommended for maximum power! 🚀)"
echo "   ✓ Generate Spec Kit specs (.specify/)"
echo "   ✓ Hand off to BMAD with rich context"
echo "   ✓ BE RAD: Best of All Worlds!"
echo ""
read -p "Your choice (A/B/C - or press Enter for C): " fw_choice
fw_choice=${fw_choice:-C}
case ${fw_choice^^} in
  A) FRAMEWORK="speckit" ;;
  B) FRAMEWORK="bmad" ;;
  C) FRAMEWORK="both" ;;
  *) FRAMEWORK="both" ;;
esac

# 4. Save state
cat > .stackshift-state.json << EOF
{
  "route": "$ROUTE",
  "implementation_framework": "$FRAMEWORK",
  "gear": 1,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "✅ Configuration saved to .stackshift-state.json"
echo "   Route: $ROUTE"
echo "   Framework: $FRAMEWORK"
```

---

## What the Analysis Does

**The analysis will**:
- Read file structure
- Detect frameworks from package.json
- Choose route (Greenfield/Brownfield)
- Choose implementation framework (GitHub Spec Kit / BMAD Method / BOTH)
- Auto-detect app type (monorepo, Nx, etc.)
- Create analysis-report.md
- Save to .stackshift-state.json

**Framework choice determines workflow**:
- **GitHub Spec Kit**: Creates `.specify/` structure, uses `/speckit.*` commands
- **BMAD Method**: Creates `docs/reverse-engineering/`, hands off to `*workflow-init`
- **BOTH (BE RAD)**: Creates both `.specify/` AND BMAD handoff for maximum flexibility
