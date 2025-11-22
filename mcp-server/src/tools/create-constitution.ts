/**
 * Create Constitution Tool - Automated constitution generation from functional spec
 *
 * Part of F002-automated-spec-generation
 * Automates GitHub Spec Kit constitution creation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { createDefaultValidator } from '../utils/security.js';
import { StateManager } from '../utils/state-manager.js';
import { MarkdownParser } from '../utils/markdown-parser.js';
import { SpecGenerator, MarkdownDocument } from '../utils/spec-generator.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { FileWriter } from '../utils/file-writer.js';

interface CreateConstitutionArgs {
  directory?: string;
  route?: 'greenfield' | 'brownfield';
  outputPath?: string;
}

interface ProgressUpdate {
  phase: string;
  status: 'starting' | 'in-progress' | 'completed' | 'error';
  message: string;
  details?: Record<string, any>;
}

export async function createConstitutionToolHandler(args: CreateConstitutionArgs) {
  const progress: ProgressUpdate[] = [];

  try {
    progress.push({
      phase: 'initialization',
      status: 'starting',
      message: 'Starting constitution generation',
    });

    // SECURITY: Validate directory
    const validator = createDefaultValidator();
    const directory = validator.validateDirectory(args.directory || process.cwd());

    // Load state to get route
    const stateManager = new StateManager(directory);
    const state = await stateManager.load();
    const route = (args.route || state.path) as 'greenfield' | 'brownfield';

    if (!route || (route !== 'greenfield' && route !== 'brownfield')) {
      throw new Error('Route must be "greenfield" or "brownfield". Run stackshift_analyze first or specify --route parameter.');
    }

    progress.push({
      phase: 'initialization',
      status: 'completed',
      message: `Using ${route} route`,
      details: { route },
    });

    // Find functional specification
    progress.push({
      phase: 'loading',
      status: 'starting',
      message: 'Loading functional specification',
    });

    const funcSpecPath = path.join(
      directory,
      'docs',
      'reverse-engineering',
      'functional-specification.md'
    );

    let content: string;
    try {
      content = await fs.readFile(funcSpecPath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Functional specification not found at ${funcSpecPath}. Run stackshift_reverse_engineer first.`
      );
    }

    // Parse markdown
    const parser = new MarkdownParser();
    const nodes = parser.parse(content);
    const stats = await fs.stat(funcSpecPath);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    const doc: MarkdownDocument = {
      filePath: funcSpecPath,
      content,
      nodes,
      metadata: {
        fileName: path.basename(funcSpecPath),
        fileSize: stats.size,
        lastModified: stats.mtime,
        checksum,
      },
    };

    progress.push({
      phase: 'loading',
      status: 'completed',
      message: 'Functional specification loaded',
      details: {
        filePath: funcSpecPath,
        size: stats.size,
        nodes: nodes.length,
      },
    });

    // Extract constitution data
    progress.push({
      phase: 'extraction',
      status: 'starting',
      message: 'Extracting constitution data from specification',
    });

    const generator = new SpecGenerator();
    const constitutionData = await generator.extractConstitution(doc, route);

    progress.push({
      phase: 'extraction',
      status: 'completed',
      message: 'Constitution data extracted successfully',
      details: {
        purpose: constitutionData.purpose.substring(0, 100) + '...',
        valuesCount: constitutionData.values.length,
        standardsCount: constitutionData.developmentStandards.length,
        metricsCount: constitutionData.qualityMetrics.length,
        hasTechnicalStack: !!constitutionData.technicalStack,
      },
    });

    // Load template
    progress.push({
      phase: 'templating',
      status: 'starting',
      message: 'Loading constitution template',
    });

    const templateEngine = new TemplateEngine(path.join(directory, 'plugin', 'templates'));
    const templateName =
      route === 'greenfield'
        ? 'constitution-agnostic-template'
        : 'constitution-prescriptive-template';

    let template: string;
    try {
      template = await templateEngine.loadTemplate(templateName);
    } catch (error) {
      throw new Error(
        `Constitution template not found: ${templateName}.md. Ensure mcp-server/templates/ directory exists with required templates.`
      );
    }

    progress.push({
      phase: 'templating',
      status: 'in-progress',
      message: 'Populating template with data',
    });

    // Prepare template data
    const templateData: Record<string, any> = {
      purpose: constitutionData.purpose,
      values: constitutionData.values,
      developmentStandards: constitutionData.developmentStandards.map((s) => ({
        category: s.category,
        description: s.description,
        level: s.enforcementLevel,
      })),
      qualityMetrics: constitutionData.qualityMetrics.map((m) => ({
        name: m.name,
        target: m.target,
        measurement: m.measurement,
      })),
      governance: {
        decisionMaking: constitutionData.governance.decisionMaking,
        changeApproval: constitutionData.governance.changeApproval,
        conflictResolution: constitutionData.governance.conflictResolution,
      },
    };

    // Add technical stack for brownfield
    if (route === 'brownfield' && constitutionData.technicalStack) {
      templateData.technicalStack = constitutionData.technicalStack;
      templateData.hasTechnicalStack = true;
    } else {
      templateData.hasTechnicalStack = false;
    }

    // Populate template
    const populatedContent = templateEngine.populate(template, templateData);

    progress.push({
      phase: 'templating',
      status: 'completed',
      message: 'Template populated successfully',
      details: {
        templateName,
        contentLength: populatedContent.length,
      },
    });

    // Write constitution file
    progress.push({
      phase: 'writing',
      status: 'starting',
      message: 'Writing constitution file',
    });

    const outputPath = args.outputPath ||
      path.join(directory, '.specify', 'memory', 'constitution.md');

    const writer = new FileWriter(path.dirname(outputPath));
    const result = await writer.writeFile(outputPath, populatedContent);

    progress.push({
      phase: 'writing',
      status: 'completed',
      message: 'Constitution file written successfully',
      details: {
        filePath: result.filePath,
        bytesWritten: result.bytesWritten,
        checksum: result.checksum,
      },
    });

    // Return success response
    return {
      success: true,
      route,
      constitutionPath: result.filePath,
      stats: {
        purpose: constitutionData.purpose.substring(0, 150),
        valuesCount: constitutionData.values.length,
        standardsCount: constitutionData.developmentStandards.length,
        metricsCount: constitutionData.qualityMetrics.length,
        bytesWritten: result.bytesWritten,
      },
      progress,
      message: `✅ Constitution generated successfully at ${result.filePath}`,
    };
  } catch (error) {
    progress.push({
      phase: 'error',
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      details: { error: String(error) },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      progress,
      message: `❌ Failed to generate constitution: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
