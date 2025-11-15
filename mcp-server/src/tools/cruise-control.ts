/**
 * Cruise Control Tool
 *
 * Automatic mode - runs all 6 gears sequentially
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CruiseControlArgs {
  directory?: string;
  route: 'greenfield' | 'brownfield';
  clarifications_strategy?: 'defer' | 'prompt' | 'skip';
  implementation_scope?: 'none' | 'p0' | 'p0_p1' | 'all';
}

export async function cruiseControlToolHandler(args: CruiseControlArgs) {
  const directory = args.directory || process.cwd();
  const route = args.route;
  const clarifications_strategy = args.clarifications_strategy || 'defer';
  const implementation_scope = args.implementation_scope || 'none';

  if (!route) {
    throw new Error('Route required. Specify: greenfield or brownfield');
  }

  try {
    // Initialize or update state with cruise control config
    const stateFile = path.join(directory, '.stackshift-state.json');

    const state = {
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      path: route,
      auto_mode: true,
      currentStep: 'analyze',
      completedSteps: [],
      metadata: {
        projectName: path.basename(directory),
        projectPath: directory,
        pathDescription: route === 'greenfield'
          ? 'Build new app from business logic (tech-agnostic)'
          : 'Manage existing app with Spec Kit (tech-prescriptive)',
      },
      auto_config: {
        clarifications_strategy,
        implementation_scope,
        pause_between_gears: false,
      },
      stepDetails: {},
    };

    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    const response = `# StackShift - Cruise Control Engaged! 🚗💨

## Configuration

**Route:** ${route === 'greenfield' ? '🔀 Greenfield (Shift to new tech stack)' : '⚙️ Brownfield (Manage existing code)'}

**Clarifications Strategy:** ${clarifications_strategy}
${clarifications_strategy === 'defer' ? '- Will mark [NEEDS CLARIFICATION] items, continue anyway' : ''}
${clarifications_strategy === 'prompt' ? '- Will stop and ask questions interactively' : ''}
${clarifications_strategy === 'skip' ? '- Will skip unclear features, implement only what\'s clear' : ''}

**Implementation Scope:** ${implementation_scope}
${implementation_scope === 'none' ? '- Stop after specs ready (no implementation)' : ''}
${implementation_scope === 'p0' ? '- Implement critical features only' : ''}
${implementation_scope === 'p0_p1' ? '- Implement critical + high-value features' : ''}
${implementation_scope === 'all' ? '- Implement ALL features (may take hours/days)' : ''}

## What Happens Next

StackShift will automatically shift through all 6 gears:

1. 🔍 **1st Gear: Analyze** - Detect tech stack, assess completeness
2. 🔄 **2nd Gear: Reverse Engineer** - Extract documentation (${route === 'greenfield' ? 'business logic only' : 'full stack'})
3. 📋 **3rd Gear: Create Specs** - Generate GitHub Spec Kit specifications
4. 🔍 **4th Gear: Gap Analysis** - Run /speckit.analyze, create roadmap
5. ✨ **5th Gear: Complete Spec** - ${clarifications_strategy === 'defer' ? 'Mark clarifications, continue' : clarifications_strategy === 'prompt' ? 'Ask questions' : 'Skip unclear items'}
6. 🚀 **6th Gear: Implement** - ${implementation_scope === 'none' ? 'Skip implementation' : `Build ${implementation_scope} features`}

## Monitoring Progress

While cruise control runs, check progress:

\`\`\`bash
# Via state manager
node plugin/scripts/state-manager.js progress

# Via MCP resource
Read stackshift://progress
\`\`\`

## Pause/Stop

To regain manual control:

\`\`\`bash
node plugin/scripts/state-manager.js manual
\`\`\`

Or say: "Pause cruise control" or "Switch to manual mode"

## State Saved

Cruise control configuration saved to: \`.stackshift-state.json\`

---

**Note:** This tool initializes cruise control. The actual execution happens
through the individual gear tools (stackshift_analyze, stackshift_reverse_engineer, etc.)
which detect auto_mode and proceed automatically.

**For plugin users:** Simply say "Run cruise control in brownfield mode"
**For MCP users:** Call this tool to enable auto mode, then call the gear tools
`;

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Cruise control failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
