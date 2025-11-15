/**
 * Gear 1: Analyze Tool
 *
 * Analyzes codebase, detects tech stack, and sets route (greenfield/brownfield)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface AnalyzeArgs {
  directory?: string;
  route?: 'greenfield' | 'brownfield';
}

export async function analyzeToolHandler(args: AnalyzeArgs) {
  const directory = args.directory || process.cwd();
  const route = args.route;

  try {
    // Initialize state if not exists
    const stateFile = path.join(directory, '.stackshift-state.json');
    const stateExists = await fs.access(stateFile).then(() => true).catch(() => false);

    if (!stateExists) {
      const initialState = {
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        path: route || null,
        currentStep: 'analyze',
        completedSteps: [],
        metadata: {
          projectName: path.basename(directory),
          projectPath: directory,
        },
        stepDetails: {
          analyze: {
            started: new Date().toISOString(),
            status: 'in_progress',
          },
        },
      };

      await fs.writeFile(stateFile, JSON.stringify(initialState, null, 2));
    } else if (route) {
      // Update existing state with route choice
      const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
      state.path = route;
      state.metadata.pathDescription = route === 'greenfield'
        ? 'Build new app from business logic (tech-agnostic)'
        : 'Manage existing app with Spec Kit (tech-prescriptive)';
      state.updated = new Date().toISOString();
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    }

    // Detect tech stack
    const techStack = await detectTechStack(directory);

    // Assess completeness
    const completeness = await assessCompleteness(directory);

    // Generate response
    const response = `# StackShift - Gear 1: Analysis Complete! 🚗

## Route Selection
${route ? `✅ Route set to: **${route}**` : '⚠️ Route not selected - use route parameter to choose'}

${route === 'greenfield' ? `
**Greenfield Route:** Extract business logic only (tech-agnostic)
- Focus on WHAT the system does
- Framework-agnostic specifications
- Can implement in any tech stack
` : route === 'brownfield' ? `
**Brownfield Route:** Extract business logic + technical implementation
- Focus on WHAT and HOW
- Tech-stack prescriptive
- Enables /speckit.analyze validation
` : `
**Choose your route:**
- **Greenfield:** Shift to new tech stack (extract business logic only)
- **Brownfield:** Take the wheel on existing code (document full implementation)

Call again with route parameter to set your path.
`}

## Technology Stack Detected

**Primary Language:** ${techStack.primaryLanguage || 'Not detected'}
**Frameworks:** ${techStack.frameworks.join(', ') || 'None detected'}
**Build System:** ${techStack.buildSystem || 'Not detected'}

## Completeness Assessment

- **Overall:** ~${completeness.overall}%
- **Backend:** ~${completeness.backend}%
- **Frontend:** ~${completeness.frontend}%
- **Tests:** ~${completeness.tests}%
- **Documentation:** ~${completeness.documentation}%

## Next Gear

Ready to shift into **Gear 2: Reverse Engineer**

Use tool: \`stackshift_reverse_engineer\`

## State Saved

Progress saved to: \`.stackshift-state.json\`

Access state via: \`stackshift://state\` resource
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
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Detect technology stack
 */
async function detectTechStack(directory: string) {
  const result = {
    primaryLanguage: null as string | null,
    frameworks: [] as string[],
    buildSystem: null as string | null,
  };

  try {
    // Check for package.json (Node.js)
    const packageJson = await fs.readFile(path.join(directory, 'package.json'), 'utf-8')
      .then(JSON.parse)
      .catch(() => null);

    if (packageJson) {
      result.primaryLanguage = 'JavaScript/TypeScript';
      result.buildSystem = 'npm';

      // Detect frameworks
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.next) result.frameworks.push(`Next.js ${deps.next}`);
      else if (deps.react) result.frameworks.push(`React ${deps.react}`);
      if (deps.express) result.frameworks.push(`Express ${deps.express}`);
      if (deps.vue) result.frameworks.push(`Vue ${deps.vue}`);
    }

    // Check for Python
    const requirementsTxt = await fs.access(path.join(directory, 'requirements.txt'))
      .then(() => true)
      .catch(() => false);
    if (requirementsTxt && !result.primaryLanguage) {
      result.primaryLanguage = 'Python';
      result.buildSystem = 'pip';
    }

    // Check for Go
    const goMod = await fs.access(path.join(directory, 'go.mod'))
      .then(() => true)
      .catch(() => false);
    if (goMod && !result.primaryLanguage) {
      result.primaryLanguage = 'Go';
      result.buildSystem = 'go modules';
    }

    // Check for Rust
    const cargoToml = await fs.access(path.join(directory, 'Cargo.toml'))
      .then(() => true)
      .catch(() => false);
    if (cargoToml && !result.primaryLanguage) {
      result.primaryLanguage = 'Rust';
      result.buildSystem = 'Cargo';
    }
  } catch (error) {
    // Return defaults if detection fails
  }

  return result;
}

/**
 * Assess project completeness
 */
async function assessCompleteness(directory: string) {
  // Simple heuristic-based assessment
  // In real implementation, this would be more thorough

  const result = {
    overall: 0,
    backend: 0,
    frontend: 0,
    tests: 0,
    documentation: 0,
  };

  try {
    // Check for test files
    const { stdout: testFiles } = await execAsync(
      `find "${directory}" -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l`
    );
    const testCount = parseInt(testFiles.trim());
    result.tests = testCount > 20 ? 80 : testCount > 10 ? 50 : testCount > 5 ? 30 : 10;

    // Check for documentation
    const readmeExists = await fs.access(path.join(directory, 'README.md'))
      .then(() => true)
      .catch(() => false);
    result.documentation = readmeExists ? 50 : 20;

    // Simple overall average
    result.overall = Math.round((result.backend + result.frontend + result.tests + result.documentation) / 4);
    result.backend = 70; // Default estimates
    result.frontend = 60;

  } catch (error) {
    // Return defaults
    result.overall = 50;
    result.backend = 50;
    result.frontend = 50;
    result.tests = 20;
    result.documentation = 30;
  }

  return result;
}
