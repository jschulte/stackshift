/**
 * Error Handling Utilities
 *
 * Provides consistent error handling patterns across all tools:
 * - Standardized error wrapping
 * - Safe async execution with context
 * - Error type detection
 */

import { Logger, createLogger } from './logger.js';

/**
 * StackShift-specific error with operation context
 */
export class StackShiftError extends Error {
  public readonly operation: string;
  public readonly cause?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    operation: string,
    message: string,
    options?: { cause?: Error; context?: Record<string, unknown> }
  ) {
    super(`${operation} failed: ${message}`);
    this.name = 'StackShiftError';
    this.operation = operation;
    this.cause = options?.cause;
    this.context = options?.context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StackShiftError);
    }
  }
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Wrap an error with operation context
 *
 * @param operation Name of the operation that failed
 * @param error The original error
 * @param context Additional context for debugging
 * @returns StackShiftError with full context
 */
export function wrapError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): StackShiftError {
  const message = getErrorMessage(error);
  const cause = error instanceof Error ? error : undefined;
  return new StackShiftError(operation, message, { cause, context });
}

/**
 * Execute an async function with error wrapping and optional logging
 *
 * @param operation Name of the operation
 * @param fn The async function to execute
 * @param options Execution options
 * @returns Result of the function
 * @throws StackShiftError if the function throws
 */
export async function safeExecute<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: {
    logger?: Logger;
    context?: Record<string, unknown>;
    rethrow?: boolean;
  }
): Promise<T> {
  const logger = options?.logger ?? createLogger('safeExecute');

  try {
    return await fn();
  } catch (error) {
    const wrappedError = wrapError(operation, error, options?.context);

    logger.error(operation, {
      error: wrappedError.message,
      cause: wrappedError.cause?.message,
      ...options?.context,
    });

    if (options?.rethrow !== false) {
      throw wrappedError;
    }

    // This path is only taken when rethrow is explicitly false
    throw wrappedError;
  }
}

/**
 * Execute an async function, returning a result object instead of throwing
 *
 * @param operation Name of the operation
 * @param fn The async function to execute
 * @returns Success result with data, or error result
 */
export async function tryExecute<T>(
  operation: string,
  fn: () => Promise<T>,
  logger?: Logger
): Promise<{ success: true; data: T } | { success: false; error: StackShiftError }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const wrappedError = wrapError(operation, error);

    if (logger) {
      logger.error(operation, { error: wrappedError.message });
    }

    return { success: false, error: wrappedError };
  }
}

/**
 * Create an error handler for a specific tool
 *
 * @param toolName Name of the tool
 * @returns Object with bound error handling methods
 */
export function createToolErrorHandler(toolName: string) {
  const logger = createLogger(toolName);

  return {
    /**
     * Wrap an error with tool context
     */
    wrap: (operation: string, error: unknown, context?: Record<string, unknown>) =>
      wrapError(`${toolName}.${operation}`, error, context),

    /**
     * Execute with error handling
     */
    execute: <T>(
      operation: string,
      fn: () => Promise<T>,
      context?: Record<string, unknown>
    ) => safeExecute(`${toolName}.${operation}`, fn, { logger, context }),

    /**
     * Try to execute, returning result object
     */
    try: <T>(operation: string, fn: () => Promise<T>) =>
      tryExecute(`${toolName}.${operation}`, fn, logger),

    /**
     * Log an error without throwing
     */
    logError: (operation: string, error: unknown, context?: Record<string, unknown>) => {
      logger.error(`${toolName}.${operation}`, {
        error: getErrorMessage(error),
        ...context,
      });
    },

    /**
     * Log a warning
     */
    logWarning: (operation: string, message: string, context?: Record<string, unknown>) => {
      logger.warn(`${toolName}.${operation}`, { message, ...context });
    },

    logger,
  };
}

/**
 * Check if an error is a specific type of filesystem error
 */
export function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

/**
 * Check if an error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    ((error as NodeJS.ErrnoException).code === 'EACCES' ||
      (error as NodeJS.ErrnoException).code === 'EPERM')
  );
}

/**
 * Check if an error indicates the path is a directory
 */
export function isDirectoryError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'EISDIR'
  );
}
