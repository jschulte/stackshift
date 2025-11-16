/**
 * MCP Resources
 *
 * Expose StackShift state and progress as readable resources
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const GEARS = [
  { id: 'analyze', name: 'Gear 1: Initial Analysis', emoji: '🔍' },
  { id: 'reverse-engineer', name: 'Gear 2: Reverse Engineer', emoji: '🔄' },
  { id: 'create-specs', name: 'Gear 3: Create Specifications', emoji: '📋' },
  { id: 'gap-analysis', name: 'Gear 4: Gap Analysis', emoji: '🔍' },
  { id: 'complete-spec', name: 'Gear 5: Complete Specification', emoji: '✨' },
  { id: 'implement', name: 'Gear 6: Implement from Spec', emoji: '🚀' },
];

/**
 * Get current state
 */
export async function getStateResource() {
  const directory = process.cwd();
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const state = await fs.readFile(stateFile, 'utf-8');
    return {
      contents: [
        {
          uri: 'stackshift://state',
          mimeType: 'application/json',
          text: state,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: 'stackshift://state',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              error: 'No state file found',
              message: 'Run stackshift_analyze to initialize',
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Get progress through gears
 */
export async function getProgressResource() {
  const directory = process.cwd();
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const stateData = await fs.readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateData);

    const progress = GEARS.map(gear => {
      const isCompleted = state.completedSteps.includes(gear.id);
      const isCurrent = state.currentStep === gear.id;

      return {
        gear: gear.name,
        emoji: gear.emoji,
        status: isCompleted ? '✅ Complete' : isCurrent ? '🔄 In Progress' : '⏳ Pending',
        details: state.stepDetails[gear.id] || null,
      };
    });

    const completedCount = state.completedSteps.length;
    const totalGears = GEARS.length;
    const percentage = Math.round((completedCount / totalGears) * 100);

    const output = `# StackShift Progress

**Route:** ${state.path === 'greenfield' ? '🔀 Greenfield (Shift to New Stack)' : state.path === 'brownfield' ? '⚙️ Brownfield (Manage Existing)' : '❓ Not selected'}

**Progress:** ${completedCount}/${totalGears} gears (${percentage}%)

## Gears

${progress.map(p => `${p.emoji} ${p.gear}\n   ${p.status}`).join('\n\n')}

${completedCount === totalGears ? '\n🏁 **All gears complete! Cruise into production!**' : ''}
`;

    return {
      contents: [
        {
          uri: 'stackshift://progress',
          mimeType: 'text/plain',
          text: output,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: 'stackshift://progress',
          mimeType: 'text/plain',
          text: 'No progress data. Run stackshift_analyze to start.',
        },
      ],
    };
  }
}

/**
 * Get selected route
 */
export async function getRouteResource() {
  const directory = process.cwd();
  const stateFile = path.join(directory, '.stackshift-state.json');

  try {
    const stateData = await fs.readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateData);

    const routeInfo =
      state.path === 'greenfield'
        ? '🔀 Greenfield: Shift to new tech stack (tech-agnostic specs)'
        : state.path === 'brownfield'
          ? '⚙️ Brownfield: Manage existing code with specs (tech-prescriptive)'
          : '❓ Not selected - run stackshift_analyze to choose';

    return {
      contents: [
        {
          uri: 'stackshift://route',
          mimeType: 'text/plain',
          text: routeInfo,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: 'stackshift://route',
          mimeType: 'text/plain',
          text: 'Route not set. Run stackshift_analyze to choose your route.',
        },
      ],
    };
  }
}
