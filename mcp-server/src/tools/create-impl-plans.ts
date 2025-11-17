/**
 * Create Implementation Plans Tool - Automated plan generation for incomplete features
 *
 * Part of F002-automated-spec-generation
 * Generates implementation plans for PARTIAL and MISSING features
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';
import { MarkdownParser } from '../utils/markdown-parser.js';
import { SpecGenerator, MarkdownDocument } from '../utils/spec-generator.js';
import { FileWriter } from '../utils/file-writer.js';

interface CreateImplPlansArgs {
  directory?: string;
  route?: 'greenfield' | 'brownfield';
}

export async function createImplPlansToolHandler(args: CreateImplPlansArgs) {
  const progress: Array<{phase: string; status: string; message: string; details?: any}> = [];

  try {
    // SECURITY: Validate directory
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // Load state
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = (args.route || state.path) as 'greenfield' | 'brownfield';

    if (!route) {
      throw new Error('Route not set. Run stackshift_analyze first.');
    }

    progress.push({
      phase: 'initialization',
      status: 'completed',
      message: `Using ${route} route`,
    });

    // Load documents
    const funcSpecPath = path.join(directory, 'docs', 'reverse-engineering', 'functional-specification.md');
    const funcSpec = await loadDocument(funcSpecPath);

    let techDebtDoc: MarkdownDocument | undefined;
    const techDebtPath = path.join(directory, 'docs', 'reverse-engineering', 'technical-debt-analysis.md');
    try {
      techDebtDoc = await loadDocument(techDebtPath);
    } catch (error) {
      progress.push({
        phase: 'loading',
        status: 'warning',
        message: 'Technical debt analysis not found',
      });
    }

    progress.push({
      phase: 'loading',
      status: 'completed',
      message: 'Documents loaded',
    });

    // Extract features
    const generator = new SpecGenerator();
    const features = await generator.extractFeatures(funcSpec, techDebtDoc);

    progress.push({
      phase: 'extraction',
      status: 'completed',
      message: `Extracted ${features.length} features`,
    });

    // Generate plans
    progress.push({
      phase: 'generation',
      status: 'starting',
      message: 'Generating implementation plans for incomplete features',
    });

    const plans = await generator.generatePlans(features, techDebtDoc);

    progress.push({
      phase: 'generation',
      status: 'completed',
      message: `Generated ${plans.size} implementation plans`,
    });

    // Write plans
    const outputDir = path.join(directory, '.specify', 'memory', 'plans');
    const writer = new FileWriter(outputDir);
    const generatedPlans: Array<{feature: string; path: string}> = [];

    for (const [featureId, plan] of plans.entries()) {
      try {
        // Generate plan markdown
        const content = generatePlanMarkdown(plan);

        // Find feature to get slug
        const feature = features.find((f) => f.id === featureId);
        const fileName = feature
          ? `${featureId}-${feature.slug}-impl-plan.md`
          : `${featureId}-impl-plan.md`;

        const result = await writer.writeFile(path.join(outputDir, fileName), content);

        generatedPlans.push({
          feature: plan.featureName,
          path: result.filePath,
        });
      } catch (error) {
        progress.push({
          phase: 'writing',
          status: 'error',
          message: `Failed to write plan for ${plan.featureName}: ${error}`,
        });
      }
    }

    progress.push({
      phase: 'writing',
      status: 'completed',
      message: `Wrote ${generatedPlans.length} implementation plans`,
      details: {
        outputDir,
        count: generatedPlans.length,
      },
    });

    return {
      success: true,
      route,
      plansGenerated: generatedPlans.length,
      outputDir,
      plans: generatedPlans,
      progress,
      message: `✅ Generated ${generatedPlans.length} implementation plans in ${outputDir}`,
    };
  } catch (error) {
    progress.push({
      phase: 'error',
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      progress,
      message: `❌ Failed to generate implementation plans: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function loadDocument(filePath: string): Promise<MarkdownDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  const parser = new MarkdownParser();
  const nodes = parser.parse(content);
  const stats = await fs.stat(filePath);
  const checksum = crypto.createHash('sha256').update(content).digest('hex');

  return {
    filePath,
    content,
    nodes,
    metadata: {
      fileName: path.basename(filePath),
      fileSize: stats.size,
      lastModified: stats.mtime,
      checksum,
    },
  };
}

function generatePlanMarkdown(plan: any): string {
  const sections: string[] = [];

  sections.push(`# Implementation Plan: ${plan.featureName}`);
  sections.push('');
  sections.push(`**Feature ID:** ${plan.featureId}`);
  sections.push('');

  sections.push('## Current State');
  sections.push('');
  sections.push(plan.currentState);
  sections.push('');

  sections.push('## Target State');
  sections.push('');
  sections.push(plan.targetState);
  sections.push('');

  sections.push('## Technical Approach');
  sections.push('');
  sections.push(plan.technicalApproach);
  sections.push('');

  sections.push('## Tasks');
  sections.push('');
  for (const task of plan.tasks) {
    sections.push(`### ${task.id}: ${task.description}`);
    sections.push('');
    sections.push(`- **Category:** ${task.category}`);
    sections.push(`- **Estimated Hours:** ${task.estimatedHours}`);
    if (task.dependencies.length > 0) {
      sections.push(`- **Dependencies:** ${task.dependencies.join(', ')}`);
    }
    sections.push('');
  }

  sections.push('## Risks');
  sections.push('');
  for (const risk of plan.risks) {
    sections.push(`### ${risk.description}`);
    sections.push('');
    sections.push(`- **Probability:** ${risk.probability}`);
    sections.push(`- **Impact:** ${risk.impact}`);
    sections.push(`- **Mitigation:** ${risk.mitigation}`);
    sections.push('');
  }

  sections.push('## Estimated Effort');
  sections.push('');
  sections.push(plan.estimatedEffort);
  sections.push('');

  if (plan.dependencies.length > 0) {
    sections.push('## Feature Dependencies');
    sections.push('');
    for (const dep of plan.dependencies) {
      sections.push(`- ${dep}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}
