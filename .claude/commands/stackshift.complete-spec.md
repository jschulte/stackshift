---
description: Gear 5 - Resolve clarifications and complete specifications
---

# Gear 5: Complete Specifications

**IMPORTANT**: This uses cached AST analysis to provide evidence-based clarifications.

## Step 1: Check AST Analysis Cache

Verify AST analysis is available for evidence extraction:

```bash
~/stackshift/scripts/run-ast-analysis.mjs check .
```

**Why**: AST provides code evidence for clarification questions (e.g., "Found 3 different auth implementations - which is correct?")

## Step 2: Resolve Clarifications

Use the Skill tool with skill="complete-spec".

**The skill will**:
- Find all `[NEEDS CLARIFICATION]` markers in specs
- Read `.stackshift-analysis/raw-analysis.json` for code evidence
- Ask targeted questions with actual code examples
- Update specs with answers

**Enhanced with AST**:
- Show actual code contradictions (not guesses)
- Provide evidence from real implementations
- Detect multiple implementations of same feature
- Suggest consolidation based on AST findings
