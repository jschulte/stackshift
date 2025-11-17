/**
 * Gear 3: Create Specs Tool
 *
 * Automatically generates GitHub Spec Kit specifications from reverse engineering docs
 *
 * IMPLEMENTATION:
 * - Delegates to F002 automated spec generation tools
 * - Creates specs for ALL features (complete, partial, and missing)
 * - Generates constitution, feature specs, and implementation plans
 *
 * SECURITY FIXES:
 * - Fixed path traversal vulnerability (CWE-22) - added directory validation
 * - Fixed TOCTOU race conditions (CWE-367) - using atomic state operations
 * - Added input validation and safe JSON parsing
 */

import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';
import { generateAllSpecsToolHandler } from './generate-all-specs.js';

interface CreateSpecsArgs {
  directory?: string;
}

export async function createSpecsToolHandler(args: CreateSpecsArgs) {
  try {
    // SECURITY: Validate directory parameter to prevent path traversal
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // Load state to get route
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = state.path;

    if (!route) {
      throw new Error('Route not set. Run stackshift_analyze first.');
    }

    // Verify reverse engineering docs exist
    const docsPath = `${directory}/docs/reverse-engineering`;
    try {
      validator.validateDirectory(docsPath);
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: `# StackShift - Gear 3: Create Specifications

⚠️ **Prerequisites not met**

Gear 2 (Reverse Engineer) must be completed first.

**Missing**: \`docs/reverse-engineering/\` directory

**Action**: Run \`stackshift_reverse_engineer\` to create reverse engineering documentation first.
`,
          },
        ],
      };
    }

    // Delegate to F002 automated spec generation
    console.error('[Gear 3] Starting automated spec generation...');
    console.error(`[Gear 3] Route: ${route}`);
    console.error('[Gear 3] Calling stackshift_generate_all_specs...');

    const result = await generateAllSpecsToolHandler({
      directory,
      route: route,
    });

    // SECURITY: Update state using atomic operations
    await stateManager.completeStep('create-specs');

    // Format success response
    if (result.success) {
      const summary = result.summary;
      const response = `# StackShift - Gear 3: Create Specifications ✅

## Route: ${route === 'greenfield' ? 'Greenfield' : 'Brownfield'}

## ✅ Automated Spec Generation Complete

Generated specifications for the ENTIRE application using F002 automated tools.

### 📋 Constitution
- **Created**: ${summary.constitution.path}
- **Values**: ${summary.constitution.valuesCount} core principles

### 📝 Feature Specifications
- **Total Features**: ${summary.featureSpecs.total}
- **✅ Complete**: ${summary.featureSpecs.complete} features (fully implemented)
- **⚠️ Partial**: ${summary.featureSpecs.partial} features (partially implemented)
- **❌ Missing**: ${summary.featureSpecs.missing} features (not implemented)

### 📐 Implementation Plans
- **Created**: ${summary.implPlans.total} plans
- **For**: PARTIAL and MISSING features only

### ⏱️ Performance
- **Duration**: ${result.duration}

## 📂 Output Structure

\`\`\`
specs/
${
  summary.featureSpecs.total > 0
    ? `├── 001-{feature-name}/
│   ├── spec.md              # Full specification
│   └── plan.md              # Implementation plan (if needed)
├── 002-{feature-name}/
│   └── spec.md
└── ...${summary.featureSpecs.total} total features`
    : '(No features extracted - check functional-specification.md)'
}

.specify/
├── memory/
│   └── constitution.md       # Project principles
└── templates/                # Spec Kit templates
\`\`\`

## ✅ Spec Coverage: 100%

All features from \`docs/reverse-engineering/functional-specification.md\` now have specifications.

**This includes**:
- ✅ Existing features (captured in specs for future spec-driven changes)
- ⚠️ Partial features (documented what exists + what's missing)
- ❌ Missing features (ready for implementation)

## Next Steps

### Validate Specifications
\`\`\`bash
# Run Spec Kit validation
/speckit.analyze
\`\`\`

### Ready for Gear 4
\`\`\`bash
# Shift into 4th gear: Gap Analysis
stackshift_gap_analysis
\`\`\`

This will analyze all ${summary.featureSpecs.total} specs and create a prioritized roadmap for implementing the ${summary.featureSpecs.partial + summary.featureSpecs.missing} incomplete features.

---

**🎉 Success**: All ${summary.featureSpecs.total} features are now under spec control!
`;

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } else {
      // If F002 tools failed, return helpful error
      return {
        content: [
          {
            type: 'text',
            text: `# StackShift - Gear 3: Create Specifications ❌

## Error During Spec Generation

${result.error || 'Unknown error occurred'}

### Troubleshooting

1. **Check reverse engineering docs exist**:
   \`\`\`bash
   ls docs/reverse-engineering/functional-specification.md
   \`\`\`

2. **Verify docs are properly formatted**:
   - functional-specification.md should have feature sections
   - Check for parsing errors in the markdown

3. **Try manual approach**:
   - Use \`web/WEB_BOOTSTRAP.md\` for manual guidance
   - Or use \`web/reconcile-specs.md\` for step-by-step conversion

### Debug Information
${JSON.stringify(result, null, 2)}
`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    throw new Error(
      `Spec creation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
