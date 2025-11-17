/**
 * Gear 3: Create Specs Tool
 *
 * Generates GitHub Spec Kit specifications
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

interface CreateSpecsArgs {
  directory?: string;
}

export async function createSpecsToolHandler(args: CreateSpecsArgs) {
  try {
    // SECURITY: Validate directory parameter to prevent path traversal
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // Load state using secure state manager
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = state.path;

    if (!route) {
      throw new Error('Route not set. Run stackshift_analyze first.');
    }

    const response = `# StackShift - Gear 3: Create Specifications

## Route: ${route === 'greenfield' ? 'Greenfield' : 'Brownfield'}

## GitHub Spec Kit Integration

### Step 1: Initialize Spec Kit

Run:
\`\`\`bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Non-interactive mode (use --ai claude flag)
specify init --here --ai claude --force

# Or with project name
specify init <project-name> --ai claude
\`\`\`

**Important:** The \`--ai claude\` flag prevents interactive prompts.

### Step 2: Generate Constitution

${
  route === 'greenfield'
    ? `
**Using:** Tech-Agnostic Template

Create \`.specify/memory/constitution.md\` with:
- Business purpose and values
- Non-functional requirements (no tech specifics)
- Business rules and governance
- Quality standards (goals, not implementation)

**Template:** \`plugin/templates/constitution-agnostic-template.md\`
`
    : `
**Using:** Tech-Prescriptive Template

Create \`.specify/memory/constitution.md\` with:
- Business purpose and values
- **Exact technical architecture** (frameworks, versions, file paths)
- **Technical decisions with rationale**
- Development standards (current implementation)
- Dependency management policy

**Template:** \`plugin/templates/constitution-prescriptive-template.md\`
`
}

### Step 3: Generate Feature Specifications

Transform \`docs/reverse-engineering/functional-specification.md\` into individual
feature specs in \`.specify/memory/specifications/\`

Each spec includes:
- User stories and acceptance criteria
${route === 'brownfield' ? '- Current implementation details (tech stack, file paths, dependencies)' : '- Business requirements only (no tech specifics)'}
- Implementation status: ✅ COMPLETE / ⚠️ PARTIAL / ❌ MISSING

### Step 4: Create Implementation Plans

For PARTIAL and MISSING features, create plans in \`.specify/memory/plans/\`

## Output Structure

\`\`\`
.specify/
├── memory/
│   ├── constitution.md
│   ├── specifications/
│   │   ├── user-authentication.md
│   │   ├── feature-2.md
│   │   └── ...
│   └── plans/
│       ├── feature-impl-plan-1.md
│       └── ...
├── templates/
└── scripts/
\`\`\`

## Next Gear

Ready to shift into **4th gear: Gap Analysis**

Use tool: \`stackshift_gap_analysis\`

Then run: \`/speckit.analyze\` to validate specs

---

**Manual prompt:** \`web/WEB_BOOTSTRAP.md\` (Gear 3)
**Legacy:** \`legacy/original-prompts/${route}/03-create-${route === 'greenfield' ? 'agnostic' : 'prescriptive'}-specs.md\`
`;

    // SECURITY: Update state using atomic operations
    await stateManager.completeStep('create-specs');

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
      `Spec creation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
