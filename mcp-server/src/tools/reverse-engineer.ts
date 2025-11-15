/**
 * Gear 2: Reverse Engineer Tool
 *
 * Extracts comprehensive documentation based on route
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ReverseEngineerArgs {
  directory?: string;
}

export async function reverseEngineerToolHandler(args: ReverseEngineerArgs) {
  const directory = args.directory || process.cwd();

  try {
    // Load state to get route
    const stateFile = path.join(directory, '.stackshift-state.json');
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    const route = state.path;

    if (!route) {
      throw new Error('Route not set. Run stackshift_analyze with route parameter first.');
    }

    // Create docs directory
    const docsDir = path.join(directory, 'docs', 'reverse-engineering');
    await fs.mkdir(docsDir, { recursive: true });

    const response = `# StackShift - Gear 2: Reverse Engineer

## Route: ${route === 'greenfield' ? 'Greenfield (Business Logic Only)' : 'Brownfield (Full Stack)'}

${route === 'greenfield' ? `
### Extraction Focus: Business Logic Only

Extracting:
✅ User stories and capabilities
✅ Business rules and workflows
✅ Data relationships (abstract)
✅ Non-functional requirements

Avoiding:
❌ Framework/library names
❌ Database technology specifics
❌ Implementation details
❌ File paths and code structure

**Output:** Tech-agnostic specifications that can be implemented in any stack
` : `
### Extraction Focus: Full Stack

Extracting:
✅ Business logic and requirements
✅ Exact technical implementation
✅ Framework and library versions
✅ Database schemas with ORM details
✅ File paths and code structure
✅ Configuration and environment variables

**Output:** Prescriptive specifications that document current implementation
`}

## Documentation Generated

The following files should be created in \`docs/reverse-engineering/\`:

1. ✅ functional-specification.md
2. ✅ configuration-reference.md
3. ✅ data-architecture.md
4. ✅ operations-guide.md
5. ✅ technical-debt-analysis.md
6. ✅ observability-requirements.md
7. ✅ visual-design-system.md
8. ✅ test-documentation.md

## Next Gear

Ready to shift into **3rd gear: Create Specifications**

Use tool: \`stackshift_create_specs\`

---

**Note:** This MCP tool provides guidance. For full extraction, use the Claude Code plugin
or manual prompts in \`prompts/${route}/\` directory.

**Manual prompt:** \`prompts/${route}/02-reverse-engineer-${route === 'greenfield' ? 'business-logic' : 'full-stack'}.md\`
`;

    // Update state
    state.completedSteps.push('analyze');
    if (!state.completedSteps.includes('reverse-engineer')) {
      state.completedSteps.push('reverse-engineer');
    }
    state.currentStep = 'create-specs';
    state.stepDetails['reverse-engineer'] = {
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
    throw new Error(`Reverse engineering failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
