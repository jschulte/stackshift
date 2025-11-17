/**
 * Generate All Specs Tool - Master orchestrator for automated spec generation
 *
 * Part of F002-automated-spec-generation
 * Automates the complete GitHub Spec Kit setup:
 * 1. Generate constitution
 * 2. Extract and generate feature specs
 * 3. Generate implementation plans for incomplete features
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createConstitutionToolHandler } from './create-constitution.js';
import { createFeatureSpecsToolHandler } from './create-feature-specs.js';
import { createImplPlansToolHandler } from './create-impl-plans.js';

interface GenerateAllSpecsArgs {
  directory?: string;
  route?: 'greenfield' | 'brownfield';
}

export async function generateAllSpecsToolHandler(args: GenerateAllSpecsArgs) {
  const startTime = Date.now();
  const results: Record<string, any> = {};
  const allProgress: Array<any> = [];

  try {
    // Step 1: Generate Constitution
    console.log('Step 1/3: Generating constitution...');
    const constitutionResult = await createConstitutionToolHandler(args);
    results.constitution = constitutionResult;
    allProgress.push(...(constitutionResult.progress || []));

    if (!constitutionResult.success) {
      throw new Error(`Constitution generation failed: ${constitutionResult.error}`);
    }

    console.log(`✅ Constitution generated: ${constitutionResult.constitutionPath}`);

    // Step 2: Generate Feature Specs
    console.log('Step 2/3: Generating feature specifications...');
    const featureSpecsResult = await createFeatureSpecsToolHandler(args);
    results.featureSpecs = featureSpecsResult;
    allProgress.push(...(featureSpecsResult.progress || []));

    if (!featureSpecsResult.success) {
      throw new Error(`Feature specs generation failed: ${featureSpecsResult.error}`);
    }

    console.log(`✅ Generated ${featureSpecsResult.specsGenerated} feature specifications`);

    // Step 3: Generate Implementation Plans
    console.log('Step 3/3: Generating implementation plans...');
    const implPlansResult = await createImplPlansToolHandler(args);
    results.implPlans = implPlansResult;
    allProgress.push(...(implPlansResult.progress || []));

    if (!implPlansResult.success) {
      throw new Error(`Implementation plans generation failed: ${implPlansResult.error}`);
    }

    console.log(`✅ Generated ${implPlansResult.plansGenerated} implementation plans`);

    // Step 4: Set up Spec Kit slash commands (if not already present)
    console.log('Step 4/4: Setting up Spec Kit slash commands...');
    const directory = args.directory || process.cwd();
    const claudeCommandsDir = path.join(directory, '.claude', 'commands');

    try {
      await fs.mkdir(claudeCommandsDir, { recursive: true });

      // Copy speckit commands from plugin
      const pluginCommandsDir = path.resolve(__dirname, '../../../plugin/claude-commands');
      const specKitCommands = [
        'speckit.analyze.md',
        'speckit.clarify.md',
        'speckit.implement.md',
        'speckit.plan.md',
        'speckit.specify.md',
        'speckit.tasks.md',
      ];

      let commandsCopied = 0;
      for (const cmd of specKitCommands) {
        const src = path.join(pluginCommandsDir, cmd);
        const dest = path.join(claudeCommandsDir, cmd);

        try {
          await fs.copyFile(src, dest);
          commandsCopied++;
        } catch (copyError) {
          // If plugin commands don't exist, skip (already in repo .claude/commands/)
          console.log(`Note: ${cmd} not copied (may already exist)`);
        }
      }

      console.log(`✅ Spec Kit commands available (${commandsCopied} installed)`);
      allProgress.push({
        phase: 'setup-commands',
        status: 'completed',
        message: `Spec Kit slash commands configured (${commandsCopied} commands)`,
      });
    } catch (cmdError) {
      // Non-fatal - commands may already exist
      console.log(`Note: Spec Kit commands setup skipped (may already be configured)`);
      allProgress.push({
        phase: 'setup-commands',
        status: 'warning',
        message: 'Spec Kit commands not copied (may already exist in .claude/commands/)',
      });
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      route: args.route || results.constitution.route,
      duration: `${(duration / 1000).toFixed(2)}s`,
      summary: {
        constitution: {
          path: results.constitution.constitutionPath,
          valuesCount: results.constitution.stats?.valuesCount || 0,
        },
        featureSpecs: {
          total: results.featureSpecs.specsGenerated || 0,
          complete: results.featureSpecs.stats?.complete || 0,
          partial: results.featureSpecs.stats?.partial || 0,
          missing: results.featureSpecs.stats?.missing || 0,
        },
        implPlans: {
          total: results.implPlans.plansGenerated || 0,
        },
      },
      details: results,
      progress: allProgress,
      message: `✅ Successfully generated all specifications in ${(duration / 1000).toFixed(2)}s

📋 Constitution: ${results.constitution.constitutionPath}
📝 Feature Specs: ${results.featureSpecs.specsGenerated} generated
📊 Implementation Plans: ${results.implPlans.plansGenerated} generated

Next steps:
1. Review generated files in .specify/memory/
2. Run: specify analyze (to validate specs)
3. Run: specify implement <feature-id> (to start implementation)`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      duration: `${(duration / 1000).toFixed(2)}s`,
      error: error instanceof Error ? error.message : String(error),
      partialResults: results,
      progress: allProgress,
      message: `❌ Spec generation failed after ${(duration / 1000).toFixed(2)}s: ${error instanceof Error ? error.message : String(error)}

Partial results available in 'partialResults' field.`,
    };
  }
}
