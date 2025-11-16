/**
 * Security Validation Utilities
 *
 * Provides directory validation and path sanitization to prevent:
 * - Path traversal attacks (CWE-22)
 * - Command injection (CWE-78)
 * - Unauthorized file access
 */

import { resolve, relative, normalize, isAbsolute } from 'path';
import { access } from 'fs/promises';
import { tmpdir } from 'os';

export class SecurityValidator {
  private allowedBasePaths: string[];

  /**
   * Create a security validator with allowed workspace paths
   * @param allowedBasePaths Array of allowed base directories
   */
  constructor(allowedBasePaths: string[]) {
    this.allowedBasePaths = allowedBasePaths.map(p => resolve(normalize(p)));
  }

  /**
   * Validates that a directory is within allowed workspace
   * Prevents path traversal attacks (CWE-22)
   *
   * @param directory Directory path to validate
   * @returns Validated absolute path
   * @throws Error if directory is outside allowed workspace
   */
  validateDirectory(directory: string): string {
    // Check for shell metacharacters that could enable command injection
    if (/[;&|`$(){}[\]<>\\!]/.test(directory)) {
      throw new Error(
        `Invalid directory path: contains shell metacharacters`
      );
    }

    // Resolve to absolute normalized path
    const resolved = resolve(normalize(directory));

    // Check if within any allowed base path
    const isAllowed = this.allowedBasePaths.some(basePath => {
      const rel = relative(basePath, resolved);
      // Valid if:
      // - Not empty (exact match is ok)
      // - Doesn't start with '..' (not a parent directory)
      // - Not an absolute path (would indicate completely different root)
      return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
    });

    if (!isAllowed) {
      throw new Error(
        `Directory access denied: "${directory}" is outside allowed workspace. ` +
        `Allowed paths: ${this.allowedBasePaths.join(', ')}`
      );
    }

    return resolved;
  }

  /**
   * Validates a file path is within allowed directory
   * Prevents path traversal in file operations
   *
   * @param directory Validated base directory
   * @param filename Filename or relative path
   * @returns Validated absolute file path
   * @throws Error if file path escapes directory
   */
  validateFilePath(directory: string, filename: string): string {
    // First validate the directory
    const validDir = this.validateDirectory(directory);

    // Check filename for shell metacharacters
    if (/[;&|`$(){}[\]<>\\!]/.test(filename)) {
      throw new Error(
        `Invalid filename: contains shell metacharacters`
      );
    }

    // Resolve file path
    const filePath = resolve(normalize(`${validDir}/${filename}`));

    // Ensure file is still within validated directory
    const rel = relative(validDir, filePath);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      throw new Error(
        `File path escapes directory: "${filename}"`
      );
    }

    return filePath;
  }

  /**
   * Sanitize a string to prevent command injection
   * Use with extreme caution - prefer native APIs over shell commands
   *
   * @param input String to sanitize
   * @returns Sanitized string
   */
  sanitizeShellInput(input: string): string {
    // Remove all shell metacharacters
    return input.replace(/[;&|`$(){}[\]<>\\!'"\n\r]/g, '');
  }

  /**
   * Validate that a path exists and is accessible
   *
   * @param filePath Path to check
   * @returns true if accessible, false otherwise
   */
  async pathExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a default security validator for current working directory
 * This is the most common use case for MCP tools
 *
 * In test environments (NODE_ENV=test or VITEST=true), also allows /tmp directory
 * to enable integration testing with temporary test directories.
 *
 * **Security Note:** Test mode detection is based on environment variables.
 * Ensure these are NEVER set in production deployments.
 */
export function createDefaultValidator(): SecurityValidator {
  const basePaths = [process.cwd()];

  // Allow /tmp in test environments for integration testing
  // Check multiple test indicators for reliability
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    process.env.npm_lifecycle_event === 'test';

  if (isTestEnv) {
    basePaths.push(tmpdir());
  }

  return new SecurityValidator(basePaths);
}

/**
 * Validate route parameter
 * @param route Route value to validate
 * @returns Validated route
 * @throws Error if route is invalid
 */
export function validateRoute(route: unknown): 'greenfield' | 'brownfield' | null {
  if (route === null || route === undefined) {
    return null;
  }

  if (typeof route !== 'string') {
    throw new Error(`Invalid route type: expected string, got ${typeof route}`);
  }

  if (route !== 'greenfield' && route !== 'brownfield') {
    throw new Error(
      `Invalid route: "${route}". Must be "greenfield" or "brownfield"`
    );
  }

  return route;
}

/**
 * Validate clarifications strategy
 */
export function validateClarificationsStrategy(
  strategy: unknown
): 'defer' | 'prompt' | 'skip' {
  if (typeof strategy !== 'string') {
    throw new Error(
      `Invalid clarifications_strategy type: expected string, got ${typeof strategy}`
    );
  }

  if (!['defer', 'prompt', 'skip'].includes(strategy)) {
    throw new Error(
      `Invalid clarifications_strategy: "${strategy}". Must be "defer", "prompt", or "skip"`
    );
  }

  return strategy as 'defer' | 'prompt' | 'skip';
}

/**
 * Validate implementation scope
 */
export function validateImplementationScope(
  scope: unknown
): 'none' | 'p0' | 'p0_p1' | 'all' {
  if (typeof scope !== 'string') {
    throw new Error(
      `Invalid implementation_scope type: expected string, got ${typeof scope}`
    );
  }

  if (!['none', 'p0', 'p0_p1', 'all'].includes(scope)) {
    throw new Error(
      `Invalid implementation_scope: "${scope}". Must be "none", "p0", "p0_p1", or "all"`
    );
  }

  return scope as 'none' | 'p0' | 'p0_p1' | 'all';
}
