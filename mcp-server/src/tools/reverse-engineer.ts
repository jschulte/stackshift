/**
 * Gear 2: Reverse Engineer Tool
 *
 * Extracts comprehensive documentation based on route
 *
 * SECURITY FIXES:
 * - Fixed path traversal vulnerability (CWE-22) - added directory validation
 * - Fixed TOCTOU race conditions (CWE-367) - using atomic state operations
 * - Added input validation and safe JSON parsing
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';

interface ReverseEngineerArgs {
  directory?: string;
}

export async function reverseEngineerToolHandler(args: ReverseEngineerArgs) {
  try {
    // SECURITY: Validate directory parameter to prevent path traversal
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // Load state using secure state manager
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = state.path;

    if (!route) {
      throw new Error('Route not set. Run stackshift_analyze with route parameter first.');
    }

    // Create docs directory (validated path)
    const docsDir = validator.validateFilePath(directory, 'docs/reverse-engineering');
    await fs.mkdir(docsDir, { recursive: true });

    const response = `# StackShift - Gear 2: Reverse Engineer

## Route: ${route === 'greenfield' ? 'Greenfield (Business Logic Only)' : 'Brownfield (Full Stack)'}

${
  route === 'greenfield'
    ? `
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
`
    : `
### Extraction Focus: Full Stack

Extracting:
✅ Business logic and requirements
✅ Exact technical implementation
✅ Framework and library versions
✅ Database schemas with ORM details
✅ File paths and code structure
✅ Configuration and environment variables

**Output:** Prescriptive specifications that document current implementation
`
}

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
or the web bootstrap prompt.

**Manual prompt:** \`web/WEB_BOOTSTRAP.md\` (Gear 2)
**Legacy:** \`legacy/original-prompts/${route}/02-reverse-engineer-${route === 'greenfield' ? 'business-logic' : 'full-stack'}.md\`
`;

    // SECURITY: Update state using atomic operations
    await stateManager.completeStep('reverse-engineer');

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
      `Reverse engineering failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
