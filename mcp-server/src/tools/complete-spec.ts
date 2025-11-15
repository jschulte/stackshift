/**
 * Gear 5: Complete Specification Tool
 *
 * Interactive clarification to resolve ambiguities
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CompleteSpecArgs {
  directory?: string;
  clarifications?: Array<{ question: string; answer: string }>;
}

export async function completeSpecToolHandler(args: CompleteSpecArgs) {
  const directory = args.directory || process.cwd();
  const clarifications = args.clarifications || [];

  try {
    // Load state
    const stateFile = path.join(directory, '.stackshift-state.json');
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));

    const response = `# StackShift - Gear 5: Complete Specification

## Interactive Clarification Session

${clarifications.length > 0 ? `
### Clarifications Provided

${clarifications.map((c, i) => `
**Q${i + 1}:** ${c.question}
**A${i + 1}:** ${c.answer}
`).join('\n')}

✅ These clarifications will be incorporated into specifications
` : `
### Use /speckit.clarify

Run the GitHub Spec Kit clarification command:

\`\`\`bash
> /speckit.clarify
\`\`\`

This will:
1. Identify all [NEEDS CLARIFICATION] markers
2. Ask interactive questions
3. Update specifications with answers
4. Remove clarification markers

### Common Clarification Topics

- Missing feature details (what charts for analytics?)
- UX/UI preferences (drag-drop or click-browse?)
- Business rule specifics (max items? timeout values?)
- Priority confirmation (is this really P0?)
`}

## Specification Readiness

After resolving all clarifications:

- ✅ All [NEEDS CLARIFICATION] markers removed
- ✅ Acceptance criteria complete
- ✅ Implementation details finalized
- ✅ Priorities confirmed
- ✅ Ready for implementation

## Next Gear

Ready to **Gear 6: Implement from Spec** 🚀

Use tool: \`stackshift_implement\`

Then run: \`/speckit.tasks\` and \`/speckit.implement\`
`;

    // Update state
    if (!state.completedSteps.includes('complete-spec')) {
      state.completedSteps.push('complete-spec');
    }
    state.currentStep = 'implement';
    state.stepDetails['complete-spec'] = {
      completed: new Date().toISOString(),
      status: 'completed',
      clarifications: clarifications.length,
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
    throw new Error(`Spec completion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
