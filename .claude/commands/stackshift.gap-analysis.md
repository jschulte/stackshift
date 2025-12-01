---
description: Gear 4 - Analyze gaps and create prioritized implementation roadmap
---

# Gear 4: Gap Analysis

**IMPORTANT**: This command runs AST-powered analysis automatically.

## Step 1: Run AST Analysis (Deterministic - Always Executes)

First, use the Bash tool to execute the AST analysis script:

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

**This will**:
- Parse codebase with Babel AST
- Extract function signatures, stubs, business logic
- Compare against specifications
- Generate prioritized roadmap with confidence scores
- Output detailed gap analysis

## Step 2: If AST Fails, Use Fallback

If the AST command fails (script not found, Node.js issue, permissions):

Use the Skill tool with skill="gap-analysis" for manual analysis.
