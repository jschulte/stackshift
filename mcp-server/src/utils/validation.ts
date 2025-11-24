/**
 * Input Validation Module
 *
 * Provides centralized validation for all tool inputs:
 * - String length limits
 * - Safe patterns
 * - Type checking
 * - Custom validators
 */

import { createLogger } from './logger.js';

const logger = createLogger('validation');

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: unknown;
}

/**
 * Validator function type
 */
export type Validator<T> = (value: T) => string | true;

/**
 * Validation error
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly errors: string[];

  constructor(field: string, errors: string[]) {
    super(`Validation failed for ${field}: ${errors.join(', ')}`);
    this.name = 'ValidationError';
    this.field = field;
    this.errors = errors;
  }
}

// ============================================================================
// Common validators
// ============================================================================

/**
 * Create a max length validator
 */
export function maxLength(max: number): Validator<string> {
  return (value: string) =>
    value.length <= max ? true : `exceeds maximum length of ${max} characters`;
}

/**
 * Create a min length validator
 */
export function minLength(min: number): Validator<string> {
  return (value: string) =>
    value.length >= min ? true : `must be at least ${min} characters`;
}

/**
 * Create a range validator for numbers
 */
export function range(min: number, max: number): Validator<number> {
  return (value: number) =>
    value >= min && value <= max ? true : `must be between ${min} and ${max}`;
}

/**
 * Create a pattern validator
 */
export function pattern(regex: RegExp, description: string): Validator<string> {
  return (value: string) =>
    regex.test(value) ? true : `must match pattern: ${description}`;
}

/**
 * Create an enum validator
 */
export function oneOf<T>(allowed: T[], name: string = 'value'): Validator<T> {
  return (value: T) =>
    allowed.includes(value) ? true : `${name} must be one of: ${allowed.join(', ')}`;
}

/**
 * Create a safe string validator (no dangerous characters)
 */
export function safeString(): Validator<string> {
  const dangerousChars = /[<>&'";\x00-\x1f]/;
  return (value: string) =>
    !dangerousChars.test(value) ? true : 'contains potentially dangerous characters';
}

/**
 * Create a safe glob pattern validator
 */
export function safeGlobPattern(): Validator<string> {
  return (value: string) => {
    // Check for pathological patterns
    const consecutiveWildcards = (value.match(/\*[^/*]*\*/g) || []).length;
    if (consecutiveWildcards > 3) {
      return 'pattern has too many consecutive wildcards (potential ReDoS)';
    }
    if (value.length > 500) {
      return 'pattern is too long (max 500 characters)';
    }
    return true;
  };
}

/**
 * Create a file path validator
 */
export function safePath(): Validator<string> {
  return (value: string) => {
    // Check for path traversal
    if (value.includes('..')) {
      return 'path contains directory traversal (..)';
    }
    // Check for null bytes
    if (value.includes('\x00')) {
      return 'path contains null byte';
    }
    return true;
  };
}

// ============================================================================
// Validation utilities
// ============================================================================

/**
 * Validate a value with multiple validators
 */
export function validate<T>(
  value: T,
  validators: Validator<T>[],
  fieldName: string = 'value'
): ValidationResult {
  const errors: string[] = [];

  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) {
      errors.push(result);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(
  value: T,
  validators: Validator<T>[],
  fieldName: string = 'value'
): T {
  const result = validate(value, validators, fieldName);

  if (!result.valid) {
    logger.warn('Validation failed', { field: fieldName, errors: result.errors });
    throw new ValidationError(fieldName, result.errors);
  }

  return value;
}

/**
 * Create a schema-based validator for objects
 */
export function createObjectValidator<T extends Record<string, unknown>>(
  schema: Record<keyof T, Validator<unknown>[]>
): (obj: T) => ValidationResult {
  return (obj: T) => {
    const errors: string[] = [];

    for (const [field, validators] of Object.entries(schema)) {
      const value = obj[field as keyof T];

      for (const validator of validators as Validator<unknown>[]) {
        const result = validator(value);
        if (result !== true) {
          errors.push(`${field}: ${result}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
}

// ============================================================================
// Tool-specific validators
// ============================================================================

/**
 * Validate directory parameter
 */
export function validateDirectory(directory: string | undefined): string {
  if (!directory) {
    return process.cwd();
  }

  return validateOrThrow(directory, [maxLength(4096), safePath()], 'directory');
}

/**
 * Validate feature name
 */
export function validateFeatureName(name: string | undefined): string | undefined {
  if (!name) return undefined;

  return validateOrThrow(name, [maxLength(200), safeString()], 'featureName');
}

/**
 * Validate format parameter
 */
export function validateFormat(
  format: string | undefined,
  allowed: string[] = ['json', 'markdown']
): string {
  if (!format) return allowed[0];

  return validateOrThrow(format, [oneOf(allowed, 'format')], 'format');
}

/**
 * Validate confidence threshold
 */
export function validateConfidence(confidence: number | undefined): number {
  if (confidence === undefined) return 50;

  return validateOrThrow(confidence, [range(0, 100)], 'confidence');
}

/**
 * Validate array parameter
 */
export function validateArray<T>(
  arr: T[] | undefined,
  maxItems: number,
  itemValidator?: Validator<T>,
  fieldName: string = 'array'
): T[] {
  if (!arr) return [];

  if (arr.length > maxItems) {
    throw new ValidationError(fieldName, [`exceeds maximum of ${maxItems} items`]);
  }

  if (itemValidator) {
    const errors: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const result = itemValidator(arr[i]);
      if (result !== true) {
        errors.push(`[${i}]: ${result}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(fieldName, errors);
    }
  }

  return arr;
}

/**
 * Sanitize string by removing dangerous characters
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/[<>&'"]/g, '') // Remove HTML-dangerous chars
    .replace(/[\x00-\x1f]/g, '') // Remove control characters
    .trim();
}

/**
 * Sanitize HTML entities
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
