#!/usr/bin/env tsx

/**
 * Main entry point for diagram generation
 * @module index
 */

import { DiagramGenerator } from './diagram-generator.js';

async function main() {
  const generator = new DiagramGenerator({
    rootDir: process.cwd(),
    outputDir: 'docs/diagrams',
    verbose: process.argv.includes('--verbose')
  });

  console.log('🎨 Generating Mermaid diagrams...\n');

  try {
    const result = await generator.generateAll();

    console.log('\n✅ Generation complete!');
    console.log(`  Workflow: ${result.workflow ? '✓' : '✗'}`);
    console.log(`  Architecture: ${result.architecture ? '✓' : '✗'}`);
    console.log(`  Class diagrams: ${result.classDiagrams.length}`);
    console.log(`  Sequence diagrams: ${result.sequenceDiagrams.length}`);

    if (result.errors.length > 0) {
      console.warn(`\n⚠️  ${result.errors.length} errors encountered`);
      result.errors.forEach(err => console.warn(`  - ${err.message}`));
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
