/**
 * Create Feature Specs Tool - Automated feature spec generation
 *
 * Part of F002-automated-spec-generation
 * Automates GitHub Spec Kit feature specification creation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';
import { MarkdownParser } from '../utils/markdown-parser.js';
import { SpecGenerator, MarkdownDocument, Feature } from '../utils/spec-generator.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { FileWriter } from '../utils/file-writer.js';

interface CreateFeatureSpecsArgs {
  directory?: string;
  route?: 'greenfield' | 'brownfield';
}

export async function createFeatureSpecsToolHandler(args: CreateFeatureSpecsArgs) {
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

    // Load functional specification
    const funcSpecPath = path.join(directory, 'docs', 'reverse-engineering', 'functional-specification.md');
    const funcSpec = await loadDocument(funcSpecPath);

    progress.push({
      phase: 'loading',
      status: 'completed',
      message: 'Functional specification loaded',
      details: { nodes: funcSpec.nodes.length },
    });

    // Load technical debt analysis (optional)
    let techDebtDoc: MarkdownDocument | undefined;
    const techDebtPath = path.join(directory, 'docs', 'reverse-engineering', 'technical-debt-analysis.md');
    try {
      techDebtDoc = await loadDocument(techDebtPath);
      progress.push({
        phase: 'loading',
        status: 'completed',
        message: 'Technical debt analysis loaded',
      });
    } catch (error) {
      progress.push({
        phase: 'loading',
        status: 'warning',
        message: 'Technical debt analysis not found, features will be marked as MISSING',
      });
    }

    // Extract features
    progress.push({
      phase: 'extraction',
      status: 'starting',
      message: 'Extracting features from specification',
    });

    const generator = new SpecGenerator();
    const features = await generator.extractFeatures(funcSpec, techDebtDoc);

    progress.push({
      phase: 'extraction',
      status: 'completed',
      message: `Extracted ${features.length} features`,
      details: {
        total: features.length,
        complete: features.filter((f) => f.status === '✅ COMPLETE').length,
        partial: features.filter((f) => f.status === '⚠️ PARTIAL').length,
        missing: features.filter((f) => f.status === '❌ MISSING').length,
      },
    });

    // Load template
    const templateEngine = new TemplateEngine(path.join(directory, 'plugin', 'templates'));
    const template = await templateEngine.loadTemplate('feature-spec-template');

    progress.push({
      phase: 'templating',
      status: 'completed',
      message: 'Feature spec template loaded',
    });

    // Generate specs for each feature
    progress.push({
      phase: 'generation',
      status: 'starting',
      message: `Generating ${features.length} feature specifications`,
    });

    const outputDir = path.join(directory, '.specify', 'memory', 'specifications');
    const writer = new FileWriter(outputDir);
    const generatedSpecs: Array<{feature: string; path: string; status: string}> = [];

    for (const feature of features) {
      try {
        // Prepare template data
        const templateData = {
          featureName: feature.name,
          featureId: feature.id,
          description: feature.description,
          status: feature.status,
          userStories: feature.userStories.map((s) => ({
            role: s.role,
            goal: s.goal,
            benefit: s.benefit,
          })),
          acceptanceCriteria: feature.acceptanceCriteria.map((c) => ({
            description: c.description,
            checked: c.checked,
          })),
          dependencies: feature.dependencies,
          hasTechnicalRequirements: !!feature.technicalRequirements && route === 'brownfield',
          technicalRequirements: feature.technicalRequirements || {},
        };

        // Populate template
        const content = templateEngine.populate(template, templateData);

        // Write spec file
        const fileName = `${feature.id}-${feature.slug}.md`;
        const result = await writer.writeFile(path.join(outputDir, fileName), content);

        generatedSpecs.push({
          feature: feature.name,
          path: result.filePath,
          status: feature.status,
        });
      } catch (error) {
        progress.push({
          phase: 'generation',
          status: 'error',
          message: `Failed to generate spec for ${feature.name}: ${error}`,
        });
      }
    }

    progress.push({
      phase: 'generation',
      status: 'completed',
      message: `Generated ${generatedSpecs.length} feature specifications`,
      details: {
        outputDir,
        count: generatedSpecs.length,
      },
    });

    return {
      success: true,
      route,
      featuresCount: features.length,
      specsGenerated: generatedSpecs.length,
      outputDir,
      specs: generatedSpecs,
      stats: {
        complete: features.filter((f) => f.status === '✅ COMPLETE').length,
        partial: features.filter((f) => f.status === '⚠️ PARTIAL').length,
        missing: features.filter((f) => f.status === '❌ MISSING').length,
      },
      progress,
      message: `✅ Generated ${generatedSpecs.length} feature specifications in ${outputDir}`,
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
      message: `❌ Failed to generate feature specs: ${error instanceof Error ? error.message : String(error)}`,
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
