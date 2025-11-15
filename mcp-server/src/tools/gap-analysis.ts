/**
 * Gear 4: Gap Analysis Tool
 *
 * Runs /speckit.analyze and creates prioritized roadmap
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface GapAnalysisArgs {
  directory?: string;
}

export async function gapAnalysisToolHandler(args: GapAnalysisArgs) {
  const directory = args.directory || process.cwd();

  try {
    // Load state
    const stateFile = path.join(directory, '.stackshift-state.json');
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    const route = state.path;

    const response = `# StackShift - Gear 4: Gap Analysis

## Route: ${route === 'greenfield' ? 'Greenfield' : 'Brownfield'}

## Step 1: Run GitHub Spec Kit Validation

\`\`\`bash
# In Claude Code or AI agent
> /speckit.analyze
\`\`\`

${route === 'brownfield' ? `
**Expected for Brownfield:**
- Should show ~100% alignment initially (specs match code)
- May reveal minor inconsistencies
- Good baseline for ongoing management
` : `
**Expected for Greenfield:**
- Most/all features marked ❌ MISSING (to be built in new stack)
- Focus on identifying which features are P0/P1/P2
`}

## Step 2: Create Gap Analysis Report

Generate \`docs/gap-analysis-report.md\` with:

- Overall completion percentage
- COMPLETE features (✅)
- PARTIAL features (⚠️) - what exists vs missing
- MISSING features (❌)
- [NEEDS CLARIFICATION] markers for ambiguous requirements
- Prioritized roadmap (P0 → P1 → P2 → P3)

## Step 3: Prioritize Implementation

### Phase 1: P0 Critical
- Essential features
- Security issues
- Blocking bugs

### Phase 2: P1 High Value
- Important features
- High user impact

### Phase 3: P2/P3 Enhancements
- Nice-to-have
- Future improvements

## Next Gear

Ready to shift into **Gear 5: Complete Specification**

Use tool: \`stackshift_complete_spec\`

Then run: \`/speckit.clarify\` to resolve ambiguities
`;

    // Update state
    if (!state.completedSteps.includes('gap-analysis')) {
      state.completedSteps.push('gap-analysis');
    }
    state.currentStep = 'complete-spec';
    state.stepDetails['gap-analysis'] = {
      completed: new Date().toISOString(),
      status: 'completed',
    };
    state.updated = new Date().toISOString();
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Gap analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
