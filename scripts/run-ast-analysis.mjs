#!/usr/bin/env node

/**
 * CLI wrapper for AST-powered analysis tools
 * Allows bash scripts and skills to use AST analysis without MCP protocol
 *
 * Usage:
 *   ./scripts/run-ast-analysis.mjs roadmap [directory] [--format=markdown]
 *   ./scripts/run-ast-analysis.mjs gap-analysis [directory]
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateRoadmapToolHandler } from '../mcp-server/dist/tools/generate-roadmap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line args
const [,, command, directory = process.cwd(), ...flags] = process.argv;

// Parse flags
const options = {};
flags.forEach(flag => {
  const [key, value] = flag.replace('--', '').split('=');
  options[key] = value || true;
});

async function main() {
  try {
    switch (command) {
      case 'roadmap':
      case 'gap-analysis': {
        console.log('🔬 Running AST-powered gap analysis...\n');

        const result = await generateRoadmapToolHandler({
          directory,
          outputFormat: options.format || 'markdown',
          confidenceThreshold: parseInt(options.threshold) || 50,
          teamSize: parseInt(options.teamSize) || 2,
        });

        // Extract text content from MCP response
        if (result.content && Array.isArray(result.content)) {
          const textContent = result.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n');

          console.log(textContent);
          process.exit(0);
        } else {
          console.error('Unexpected result format:', result);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('\nAvailable commands:');
        console.error('  roadmap       - Generate AST-powered roadmap');
        console.error('  gap-analysis  - Same as roadmap (alias)');
        console.error('\nOptions:');
        console.error('  --format=<markdown|json|csv|html>  Output format');
        console.error('  --threshold=<0-100>                Confidence threshold');
        console.error('  --teamSize=<number>                Team size for estimates');
        console.error('\nExample:');
        console.error('  ./scripts/run-ast-analysis.mjs roadmap . --format=json');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
