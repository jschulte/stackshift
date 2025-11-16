/**
 * Gear 5: Complete Specification Tool
 *
 * Interactive clarification to resolve ambiguities
 *
 * SECURITY FIXES:
 * - Fixed path traversal vulnerability (CWE-22) - added directory validation
 * - Fixed TOCTOU race conditions (CWE-367) - using atomic state operations
 * - Added input validation for clarifications array
 * - Added size limits to prevent DoS
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';

interface Clarification {
  question: string;
  answer: string;
}

interface CompleteSpecArgs {
  directory?: string;
  clarifications?: Clarification[];
}

const MAX_CLARIFICATIONS = 100;
const MAX_STRING_LENGTH = 5000;

export async function completeSpecToolHandler(args: CompleteSpecArgs) {
  try {
    // SECURITY: Validate directory parameter to prevent path traversal
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // SECURITY: Validate clarifications array
    const clarifications = args.clarifications || [];

    // Prevent DoS with too many clarifications
    if (clarifications.length > MAX_CLARIFICATIONS) {
      throw new Error(
        `Too many clarifications: ${clarifications.length} (max ${MAX_CLARIFICATIONS})`
      );
    }

    // Validate each clarification
    for (const [index, clarification] of clarifications.entries()) {
      if (!clarification || typeof clarification !== 'object') {
        throw new Error(`Invalid clarification at index ${index}: not an object`);
      }

      if (typeof clarification.question !== 'string') {
        throw new Error(`Invalid clarification at index ${index}: question must be a string`);
      }

      if (typeof clarification.answer !== 'string') {
        throw new Error(`Invalid clarification at index ${index}: answer must be a string`);
      }

      if (
        clarification.question.length === 0 ||
        clarification.question.length > MAX_STRING_LENGTH
      ) {
        throw new Error(
          `Invalid clarification question at index ${index}: length must be 1-${MAX_STRING_LENGTH} characters`
        );
      }

      if (clarification.answer.length === 0 || clarification.answer.length > MAX_STRING_LENGTH) {
        throw new Error(
          `Invalid clarification answer at index ${index}: length must be 1-${MAX_STRING_LENGTH} characters`
        );
      }
    }

    // Load state using secure state manager
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();

    const response = `# StackShift - Gear 5: Complete Specification

## Interactive Clarification Session

${
  clarifications.length > 0
    ? `
### Clarifications Provided

${clarifications
  .map(
    (c, i) => `
**Q${i + 1}:** ${c.question}
**A${i + 1}:** ${c.answer}
`
  )
  .join('\n')}

✅ These clarifications will be incorporated into specifications
`
    : `
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
`
}

## Specification Readiness

After resolving all clarifications:

- ✅ All [NEEDS CLARIFICATION] markers removed
- ✅ Acceptance criteria complete
- ✅ Implementation details finalized
- ✅ Priorities confirmed
- ✅ Ready for implementation

## Next Gear

Ready to shift into **6th gear: Implement from Spec** 🚀

Use tool: \`stackshift_implement\`

Then run: \`/speckit.tasks\` and \`/speckit.implement\`
`;

    // SECURITY: Update state using atomic operations
    await stateManager.update(state => ({
      ...state,
      completedSteps: state.completedSteps.includes('complete-spec')
        ? state.completedSteps
        : [...state.completedSteps, 'complete-spec'],
      currentStep: 'implement',
      stepDetails: {
        ...state.stepDetails,
        'complete-spec': {
          completed: new Date().toISOString(),
          status: 'completed',
          clarifications: clarifications.length,
        },
      },
    }));

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Spec completion failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
