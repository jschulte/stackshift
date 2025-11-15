#!/usr/bin/env node

/**
 * Workflow State Manager
 *
 * Tracks progress through the 6-step reverse engineering process:
 * 1. analyze - Initial Analysis
 * 2. reverse-engineer - Reverse Engineer
 * 3. create-specs - Create Specifications
 * 4. gap-analysis - Gap Analysis
 * 5. complete-spec - Complete Specification
 * 6. implement - Implement from Spec
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = '.stackshift-state.json';

const STEPS = [
  { id: 'analyze', name: 'Initial Analysis', output: 'analysis-report.md' },
  { id: 'reverse-engineer', name: 'Reverse Engineer', output: 'docs/reverse-engineering/' },
  { id: 'create-specs', name: 'Create Specifications', output: 'specs/' },
  { id: 'gap-analysis', name: 'Gap Analysis', output: 'specs/gap-analysis.md' },
  { id: 'complete-spec', name: 'Complete Specification', output: 'specs/ (all [NEEDS CLARIFICATION] resolved)' },
  { id: 'implement', name: 'Implement from Spec', output: 'All features ✅ COMPLETE' }
];

class StateManager {
  constructor() {
    this.cwd = process.cwd();
    this.statePath = path.join(this.cwd, STATE_FILE);
  }

  /**
   * Initialize state file if it doesn't exist
   */
  init() {
    if (!fs.existsSync(this.statePath)) {
      const initialState = {
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        path: null, // 'greenfield' or 'brownfield'
        currentStep: null,
        completedSteps: [],
        metadata: {
          projectName: path.basename(this.cwd),
          projectPath: this.cwd
        },
        stepDetails: {}
      };
      this.saveState(initialState);
      return initialState;
    }
    return this.loadState();
  }

  /**
   * Set the path (greenfield or brownfield)
   */
  setPath(pathChoice) {
    const state = this.loadState() || this.init();

    if (pathChoice !== 'greenfield' && pathChoice !== 'brownfield') {
      console.error(`Invalid path: ${pathChoice}. Must be 'greenfield' or 'brownfield'`);
      return false;
    }

    state.path = pathChoice;
    state.metadata.pathDescription = pathChoice === 'greenfield'
      ? 'Build new app from business logic (tech-agnostic)'
      : 'Manage existing app with Spec Kit (tech-prescriptive)';

    this.saveState(state);
    return true;
  }

  /**
   * Get the current path
   */
  getPath() {
    const state = this.loadState();
    return state ? state.path : null;
  }

  /**
   * Load state from file
   */
  loadState() {
    try {
      const data = fs.readFileSync(this.statePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading state:', error.message);
      return null;
    }
  }

  /**
   * Save state to file
   */
  saveState(state) {
    try {
      state.updated = new Date().toISOString();
      fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving state:', error.message);
      return false;
    }
  }

  /**
   * Start a step
   */
  startStep(stepId) {
    const state = this.loadState() || this.init();
    const step = STEPS.find(s => s.id === stepId);

    if (!step) {
      console.error(`Unknown step: ${stepId}`);
      return false;
    }

    state.currentStep = stepId;
    state.stepDetails[stepId] = {
      started: new Date().toISOString(),
      status: 'in_progress'
    };

    this.saveState(state);
    return true;
  }

  /**
   * Complete a step
   */
  completeStep(stepId, details = {}) {
    const state = this.loadState();
    if (!state) return false;

    if (!state.completedSteps.includes(stepId)) {
      state.completedSteps.push(stepId);
    }

    state.stepDetails[stepId] = {
      ...state.stepDetails[stepId],
      completed: new Date().toISOString(),
      status: 'completed',
      ...details
    };

    // Auto-advance to next step
    const currentIndex = STEPS.findIndex(s => s.id === stepId);
    if (currentIndex < STEPS.length - 1) {
      state.currentStep = STEPS[currentIndex + 1].id;
    } else {
      state.currentStep = null; // All steps complete
    }

    this.saveState(state);
    return true;
  }

  /**
   * Get current status
   */
  getStatus() {
    const state = this.loadState();
    if (!state) {
      return {
        initialized: false,
        message: 'No state file found. Run: node state-manager.js init'
      };
    }

    const currentStep = state.currentStep ? STEPS.find(s => s.id === state.currentStep) : null;
    const completedCount = state.completedSteps.length;
    const totalSteps = STEPS.length;
    const progress = Math.round((completedCount / totalSteps) * 100);

    return {
      initialized: true,
      progress: `${completedCount}/${totalSteps} (${progress}%)`,
      currentStep: currentStep ? currentStep.name : 'All steps complete!',
      currentStepId: state.currentStep,
      completedSteps: state.completedSteps,
      metadata: state.metadata,
      updated: state.updated
    };
  }

  /**
   * Get progress summary
   */
  getProgressSummary() {
    const state = this.loadState();
    if (!state) return null;

    return STEPS.map(step => {
      const isCompleted = state.completedSteps.includes(step.id);
      const isCurrent = state.currentStep === step.id;
      const details = state.stepDetails[step.id];

      return {
        id: step.id,
        name: step.name,
        output: step.output,
        status: isCompleted ? '✅ Complete' : isCurrent ? '🔄 In Progress' : '⏳ Pending',
        started: details?.started,
        completed: details?.completed
      };
    });
  }

  /**
   * Reset state (start over)
   */
  reset() {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
      console.log('State reset successfully');
      return true;
    }
    return false;
  }

  /**
   * Check if a step's output exists
   */
  checkStepOutput(stepId) {
    const step = STEPS.find(s => s.id === stepId);
    if (!step) return false;

    const outputPath = path.join(this.cwd, step.output);
    return fs.existsSync(outputPath);
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new StateManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'init':
      manager.init();
      console.log('State initialized');
      console.log(JSON.stringify(manager.getStatus(), null, 2));
      break;

    case 'start':
      if (!arg) {
        console.error('Usage: node state-manager.js start <step-id>');
        process.exit(1);
      }
      if (manager.startStep(arg)) {
        console.log(`Started step: ${arg}`);
        console.log(JSON.stringify(manager.getStatus(), null, 2));
      }
      break;

    case 'complete':
      if (!arg) {
        console.error('Usage: node state-manager.js complete <step-id>');
        process.exit(1);
      }
      if (manager.completeStep(arg)) {
        console.log(`Completed step: ${arg}`);
        console.log(JSON.stringify(manager.getStatus(), null, 2));
      }
      break;

    case 'status':
      console.log(JSON.stringify(manager.getStatus(), null, 2));
      break;

    case 'progress':
      const summary = manager.getProgressSummary();
      if (summary) {
        console.log('\n=== Reverse Engineering Progress ===\n');
        summary.forEach((step, index) => {
          console.log(`${index + 1}. ${step.status} ${step.name}`);
          console.log(`   Output: ${step.output}`);
          if (step.started) {
            console.log(`   Started: ${new Date(step.started).toLocaleString()}`);
          }
          if (step.completed) {
            console.log(`   Completed: ${new Date(step.completed).toLocaleString()}`);
          }
          console.log('');
        });
      }
      break;

    case 'reset':
      if (manager.reset()) {
        console.log('State has been reset. Run "init" to start over.');
      } else {
        console.log('No state file to reset.');
      }
      break;

    case 'set-path':
      if (!arg || (arg !== 'greenfield' && arg !== 'brownfield')) {
        console.error('Usage: node state-manager.js set-path <greenfield|brownfield>');
        process.exit(1);
      }
      if (manager.setPath(arg)) {
        console.log(`Path set to: ${arg}`);
        console.log(JSON.stringify(manager.getStatus(), null, 2));
      }
      break;

    case 'get-path':
      const currentPath = manager.getPath();
      if (currentPath) {
        console.log(`Current path: ${currentPath}`);
      } else {
        console.log('Path not set. Run: node state-manager.js set-path <greenfield|brownfield>');
      }
      break;

    default:
      console.log(`
StackShift - State Manager

Usage:
  node state-manager.js init                       Initialize state tracking
  node state-manager.js set-path <path>            Set path (greenfield|brownfield)
  node state-manager.js get-path                   Get current path
  node state-manager.js start <step-id>            Start a step
  node state-manager.js complete <step-id>         Complete a step
  node state-manager.js status                     Show current status
  node state-manager.js progress                   Show detailed progress
  node state-manager.js reset                      Reset state (start over)

Paths:
  greenfield   - Build new app from business logic (tech-agnostic)
  brownfield   - Manage existing app with Spec Kit (tech-prescriptive)

Steps:
  1. analyze           - Initial Analysis
  2. reverse-engineer  - Reverse Engineer
  3. create-specs      - Create Specifications
  4. gap-analysis      - Gap Analysis
  5. complete-spec     - Complete Specification
  6. implement         - Implement from Spec
      `);
  }
}

module.exports = StateManager;
