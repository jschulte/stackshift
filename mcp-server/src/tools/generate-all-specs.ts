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

    // Step 4: Verify/setup Spec Kit slash commands
    console.log('Step 4/4: Verifying Spec Kit slash commands...');
    const directory = args.directory || process.cwd();
    const claudeCommandsDir = path.join(directory, '.claude', 'commands');

    try {
      // Check if .claude/commands already has speckit commands
      const existingCommands = await fs.readdir(claudeCommandsDir).catch(() => []);
      const hasSpecKitCommands = existingCommands.some((file) => file.startsWith('speckit.'));

      if (hasSpecKitCommands) {
        console.log(`✅ Spec Kit commands already configured (${existingCommands.filter((f) => f.startsWith('speckit.')).length} found)`);
        allProgress.push({
          phase: 'verify-commands',
          status: 'completed',
          message: 'Spec Kit slash commands already configured',
        });
      } else {
        console.log('ℹ️  Spec Kit commands not found. Users should copy commands from StackShift repo.');
        allProgress.push({
          phase: 'verify-commands',
          status: 'warning',
          message:
            'Spec Kit slash commands not found. Copy from .claude/commands/ in StackShift repo or the commands will be available through the plugin.',
        });
      }
    } catch (cmdError) {
      // Non-fatal - not critical for spec generation
      console.log(`Note: Could not verify slash commands (non-fatal)`);
      allProgress.push({
        phase: 'verify-commands',
        status: 'info',
        message: 'Slash command verification skipped. Commands may already be available through plugin.',
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
