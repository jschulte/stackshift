/**
 * Gear 6: Implement Tool
 *
 * Use /speckit.implement to build features
 *
 * SECURITY FIXES:
 * - Fixed path traversal vulnerability (CWE-22) - added directory validation
 * - Fixed TOCTOU race conditions (CWE-367) - using atomic state operations
 * - Added input validation for feature parameter
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';

interface ImplementArgs {
  directory?: string;
  feature?: string;
}

const MAX_FEATURE_NAME_LENGTH = 200;

export async function implementToolHandler(args: ImplementArgs) {
  try {
    // SECURITY: Validate directory parameter to prevent path traversal
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // SECURITY: Validate feature parameter
    let feature: string | undefined = args.feature;
    if (feature !== undefined) {
      if (typeof feature !== 'string') {
        throw new Error(`Invalid feature parameter: must be a string`);
      }

      if (feature.length === 0 || feature.length > MAX_FEATURE_NAME_LENGTH) {
        throw new Error(
          `Invalid feature name length: must be 1-${MAX_FEATURE_NAME_LENGTH} characters`
        );
      }

      // Check for path traversal attempts in feature name
      if (feature.includes('..') || feature.includes('/') || feature.includes('\\')) {
        throw new Error(
          `Invalid feature name: cannot contain path separators or '..'`
        );
      }
    }

    // Load state using secure state manager
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = state.path;

    const response = `# StackShift - Gear 6: Implement from Spec 🚀

## Route: ${route === 'greenfield' ? 'Greenfield (Build New)' : 'Brownfield (Fill Gaps)'}

${feature ? `
## Implementing Feature: ${feature}

### GitHub Spec Kit Workflow

1. **Generate Tasks:**
   \`\`\`bash
   > /speckit.tasks ${feature}
   \`\`\`

2. **Implement:**
   \`\`\`bash
   > /speckit.implement ${feature}
   \`\`\`

3. **Validate:**
   \`\`\`bash
   > /speckit.analyze
   \`\`\`

### Expected Flow

- Spec Kit reads: \`.specify/memory/plans/${feature}.md\`
- Generates actionable tasks
- Implements step-by-step
- Tests against acceptance criteria
- Updates spec status: ❌ MISSING → ✅ COMPLETE
- Commits changes

` : `
## Implementation Process

### For ${route === 'greenfield' ? 'Greenfield' : 'Brownfield'} Route

${route === 'greenfield' ? `
**Building in NEW tech stack:**

1. Choose your stack (Next.js, Python/Flask, Go, etc.)
2. Review specs (all are tech-agnostic)
3. For each feature:
   - \`> /speckit.tasks <feature>\`
   - \`> /speckit.implement <feature>\`
   - \`> /speckit.analyze\` (validate)
4. Implement ALL features from scratch
5. Achieve 100% completion in chosen stack
` : `
**Filling gaps in existing stack:**

1. Review prioritized roadmap (P0 → P1 → P2)
2. For each missing/partial feature:
   - \`> /speckit.tasks <feature>\`
   - \`> /speckit.implement <feature>\`
   - \`> /speckit.analyze\` (validate alignment)
3. Complete PARTIAL features (finish what's started)
4. Implement MISSING features
5. Achieve 100% spec completion
`}

### Systematic Implementation

**Phase 1: P0 Critical**
- Essential features that block users
- Security fixes
- Data integrity issues

**Phase 2: P1 High Value**
- Important user-facing features
- High-impact improvements

**Phase 3: P2/P3**
- Nice-to-have features
- Polish and refinements

### Call with feature parameter to implement specific feature

Example:
\`\`\`
stackshift_implement({ feature: "user-authentication" })
\`\`\`
`}

## Completion Status

After all features implemented:

- ✅ All specs marked COMPLETE
- ✅ \`/speckit.analyze\` shows no gaps
- ✅ All tests passing
- ✅ Application ready for production

## Cruise Into Production! 🏁

${route === 'greenfield' ? `
You've successfully built a new application from the business logic
of your existing codebase using your chosen tech stack!
` : `
You've successfully brought your existing application under GitHub Spec Kit
management. All features are spec-driven going forward!
`}

### Ongoing Spec-Driven Development

Continue using GitHub Spec Kit:
- \`/speckit.specify\` - New features
- \`/speckit.plan\` - Implementation plans
- \`/speckit.tasks\` - Task breakdowns
- \`/speckit.implement\` - Build features
- \`/speckit.analyze\` - Continuous validation
`;

    // SECURITY: Update state using atomic operations
    await stateManager.update(state => ({
      ...state,
      completedSteps: state.completedSteps.includes('implement')
        ? state.completedSteps
        : [...state.completedSteps, 'implement'],
      currentStep: null, // All complete!
      stepDetails: {
        ...state.stepDetails,
        implement: {
          completed: new Date().toISOString(),
          status: 'completed',
          feature: feature || 'all',
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
    throw new Error(`Implementation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
