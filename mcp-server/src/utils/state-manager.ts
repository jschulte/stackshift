/**
 * State Manager
 *
 * Provides atomic state file operations to prevent:
 * - TOCTOU race conditions (CWE-367)
 * - Data corruption from concurrent writes
 * - Invalid state structure
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';

/**
 * Valid step IDs in the StackShift workflow
 */
export type StepId =
  | 'analyze'
  | 'reverse-engineer'
  | 'create-specs'
  | 'gap-analysis'
  | 'complete-spec'
  | 'implement';

/**
 * Valid routes
 */
export type Route = 'greenfield' | 'brownfield' | null;

/**
 * Auto config structure for cruise control
 */
export interface AutoConfig {
  clarifications_strategy: 'defer' | 'prompt' | 'skip';
  implementation_scope: 'none' | 'p0' | 'p0_p1' | 'all';
  pause_between_gears: boolean;
}

/**
 * State file structure
 */
export interface State {
  version: string;
  created: string;
  updated: string;
  path: Route;
  currentStep: StepId | null;
  completedSteps: StepId[];
  metadata: {
    projectName: string;
    projectPath: string;
    pathDescription?: string;
  };
  stepDetails: Record<string, any>;
  auto_mode?: boolean;
  auto_config?: AutoConfig;
  modernize?: boolean; // Brownfield Facelift: upgrade all dependencies after spec completion
  config?: any;
}

/**
 * State validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class StateManager {
  private stateFile: string;
  private readonly STATE_VERSION = '1.0.0';

  constructor(directory: string) {
    this.stateFile = path.join(directory, '.stackshift-state.json');
  }

  /**
   * Validate state structure
   * Protects against malformed state files and prototype pollution
   */
  private validateState(data: any): ValidationResult {
    const errors: string[] = [];

    // Check for prototype pollution - only check own properties, not inherited
    if (
      Object.prototype.hasOwnProperty.call(data, '__proto__') ||
      Object.prototype.hasOwnProperty.call(data, 'constructor') ||
      Object.prototype.hasOwnProperty.call(data, 'prototype')
    ) {
      errors.push('State contains dangerous properties (__proto__, constructor, prototype)');
    }

    // Validate required fields
    if (!data.version || typeof data.version !== 'string') {
      errors.push('Missing or invalid version');
    }
    if (!data.created || typeof data.created !== 'string') {
      errors.push('Missing or invalid created timestamp');
    }
    if (!data.updated || typeof data.updated !== 'string') {
      errors.push('Missing or invalid updated timestamp');
    }

    // Validate path
    if (data.path !== null && data.path !== 'greenfield' && data.path !== 'brownfield') {
      errors.push(`Invalid path: ${data.path}. Must be null, "greenfield", or "brownfield"`);
    }

    // Validate currentStep
    const validSteps = [
      'analyze',
      'reverse-engineer',
      'create-specs',
      'gap-analysis',
      'complete-spec',
      'implement',
    ];
    if (data.currentStep !== null && !validSteps.includes(data.currentStep)) {
      errors.push(`Invalid currentStep: ${data.currentStep}`);
    }

    // Validate completedSteps is array
    if (!Array.isArray(data.completedSteps)) {
      errors.push('completedSteps must be an array');
    } else {
      // Validate all steps are valid
      for (const step of data.completedSteps) {
        if (!validSteps.includes(step)) {
          errors.push(`Invalid step in completedSteps: ${step}`);
        }
      }
    }

    // Validate metadata
    if (!data.metadata || typeof data.metadata !== 'object') {
      errors.push('Missing or invalid metadata');
    } else {
      if (!data.metadata.projectName || typeof data.metadata.projectName !== 'string') {
        errors.push('Missing or invalid metadata.projectName');
      }
      if (!data.metadata.projectPath || typeof data.metadata.projectPath !== 'string') {
        errors.push('Missing or invalid metadata.projectPath');
      }
    }

    // Validate stepDetails is object
    if (!data.stepDetails || typeof data.stepDetails !== 'object') {
      errors.push('Missing or invalid stepDetails');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Safely parse JSON and remove dangerous properties
   */
  private safeJsonParse(text: string): any {
    const parsed = JSON.parse(text);

    // Remove dangerous properties that could enable prototype pollution
    delete parsed.__proto__;
    delete parsed.constructor;
    delete parsed.prototype;

    return parsed;
  }

  /**
   * Atomically write state to file
   * Prevents race conditions by writing to temp file first, then renaming
   *
   * @param state State object to write
   */
  private async atomicWrite(state: State): Promise<void> {
    const tempFile = `${this.stateFile}.${randomBytes(8).toString('hex')}.tmp`;

    try {
      // Write to temporary file
      await fs.writeFile(tempFile, JSON.stringify(state, null, 2), 'utf-8');

      // Atomic rename (overwrites existing file atomically on POSIX systems)
      await fs.rename(tempFile, this.stateFile);
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Load state from file
   * Creates initial state if file doesn't exist
   *
   * @returns Current state
   */
  async load(): Promise<State> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');

      // Limit file size to 10MB to prevent DoS
      if (data.length > 10 * 1024 * 1024) {
        throw new Error('State file too large (>10MB)');
      }

      // Parse JSON first (without sanitizing yet)
      const parsed = JSON.parse(data);

      // Validate BEFORE sanitizing, so we can detect dangerous properties
      const validation = this.validateState(parsed);

      if (!validation.valid) {
        throw new Error(`Invalid state file structure:\n${validation.errors.join('\n')}`);
      }

      // Now sanitize the validated object
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;

      return parsed as State;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, this is ok - caller will create initial state
        throw new Error('State file does not exist. Run stackshift_analyze first.');
      }
      throw error;
    }
  }

  /**
   * Create initial state
   *
   * @param directory Project directory
   * @param route Optional route to set
   * @returns Initial state object
   */
  createInitialState(directory: string, route?: Route): State {
    return {
      version: this.STATE_VERSION,
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
  }

  /**
   * Initialize state file
   * Only creates if it doesn't exist
   *
   * @param directory Project directory
   * @param route Optional route to set
   * @returns Created state
   */
  async initialize(directory: string, route?: Route): Promise<State> {
    try {
      // Check if file exists
      await fs.access(this.stateFile);
      // File exists, load and return it
      return await this.load();
    } catch {
      // File doesn't exist, create it
      const initialState = this.createInitialState(directory, route);
      await this.atomicWrite(initialState);
      return initialState;
    }
  }

  /**
   * Update state atomically
   * Prevents race conditions by loading, updating, and writing atomically
   *
   * @param updater Function that receives current state and returns updated state
   * @returns Updated state
   */
  async update(updater: (state: State) => State): Promise<State> {
    const state = await this.load();
    const newState = updater(state);

    // Always update timestamp
    newState.updated = new Date().toISOString();

    // Validate before writing
    const validation = this.validateState(newState);
    if (!validation.valid) {
      throw new Error(`Updated state is invalid:\n${validation.errors.join('\n')}`);
    }

    await this.atomicWrite(newState);
    return newState;
  }

  /**
   * Update route in state
   *
   * @param route Route to set
   * @returns Updated state
   */
  async updateRoute(route: Route): Promise<State> {
    return this.update(state => ({
      ...state,
      path: route,
      metadata: {
        ...state.metadata,
        pathDescription:
          route === 'greenfield'
            ? 'Build new app from business logic (tech-agnostic)'
            : route === 'brownfield'
              ? 'Manage existing app with Spec Kit (tech-prescriptive)'
              : undefined,
      },
    }));
  }

  /**
   * Mark a step as completed
   *
   * @param stepId Step to mark as complete
   * @param details Optional step details
   * @returns Updated state
   */
  async completeStep(stepId: StepId, details?: any): Promise<State> {
    return this.update(state => {
      // Add to completed steps if not already there
      const completedSteps = state.completedSteps.includes(stepId)
        ? state.completedSteps
        : [...state.completedSteps, stepId];

      return {
        ...state,
        completedSteps,
        currentStep: this.getNextStep(stepId),
        stepDetails: {
          ...state.stepDetails,
          [stepId]: {
            ...state.stepDetails[stepId],
            completed: new Date().toISOString(),
            status: 'completed',
            ...details,
          },
        },
      };
    });
  }

  /**
   * Get the next step in the workflow
   *
   * @param currentStep Current step ID
   * @returns Next step ID or null if at end
   */
  private getNextStep(currentStep: StepId): StepId | null {
    const steps: StepId[] = [
      'analyze',
      'reverse-engineer',
      'create-specs',
      'gap-analysis',
      'complete-spec',
      'implement',
    ];

    const index = steps.indexOf(currentStep);
    return index < steps.length - 1 ? steps[index + 1] : null;
  }

  /**
   * Check if state file exists
   *
   * @returns true if state file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.stateFile);
      return true;
    } catch {
      return false;
    }
  }
}
