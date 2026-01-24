/**
 * Validation Module Tests
 *
 * Comprehensive tests for input validation:
 * - Common validators (maxLength, minLength, range, pattern, etc.)
 * - ValidationError class
 * - Validation utilities (validate, validateOrThrow, createObjectValidator)
 * - Tool-specific validators
 * - Sanitization functions
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationResult,
  Validator,
  ValidationError,
  maxLength,
  minLength,
  range,
  pattern,
  oneOf,
  safeString,
  safeGlobPattern,
  safePath,
  validate,
  validateOrThrow,
  createObjectValidator,
  validateDirectory,
  validateFeatureName,
  validateFormat,
  validateConfidence,
  validateArray,
  sanitizeString,
  escapeHtml,
} from '../validation.js';

describe('ValidationError', () => {
  it('should create error with field and errors', () => {
    const error = new ValidationError('username', ['too short', 'invalid characters']);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.field).toBe('username');
    expect(error.errors).toEqual(['too short', 'invalid characters']);
    expect(error.message).toBe('Validation failed for username: too short, invalid characters');
  });

  it('should handle single error', () => {
    const error = new ValidationError('email', ['invalid format']);

    expect(error.errors).toEqual(['invalid format']);
    expect(error.message).toBe('Validation failed for email: invalid format');
  });

  it('should be throwable and catchable', () => {
    const throwError = () => {
      throw new ValidationError('field', ['error']);
    };

    expect(throwError).toThrow(ValidationError);
    expect(throwError).toThrow('Validation failed for field: error');
  });
});

describe('maxLength', () => {
  it('should accept string within max length', () => {
    const validator = maxLength(10);

    expect(validator('hello')).toBe(true);
    expect(validator('1234567890')).toBe(true);
  });

  it('should reject string exceeding max length', () => {
    const validator = maxLength(5);

    expect(validator('toolong')).toBe('exceeds maximum length of 5 characters');
    expect(validator('123456')).toBe('exceeds maximum length of 5 characters');
  });

  it('should handle empty string', () => {
    const validator = maxLength(10);

    expect(validator('')).toBe(true);
  });

  it('should handle exact length', () => {
    const validator = maxLength(5);

    expect(validator('12345')).toBe(true);
  });
});

describe('minLength', () => {
  it('should accept string meeting min length', () => {
    const validator = minLength(3);

    expect(validator('abc')).toBe(true);
    expect(validator('longer')).toBe(true);
  });

  it('should reject string below min length', () => {
    const validator = minLength(5);

    expect(validator('hi')).toBe('must be at least 5 characters');
    expect(validator('test')).toBe('must be at least 5 characters');
  });

  it('should handle empty string', () => {
    const validator = minLength(1);

    expect(validator('')).toBe('must be at least 1 characters');
  });

  it('should handle exact length', () => {
    const validator = minLength(5);

    expect(validator('12345')).toBe(true);
  });
});

describe('range', () => {
  it('should accept number within range', () => {
    const validator = range(0, 100);

    expect(validator(0)).toBe(true);
    expect(validator(50)).toBe(true);
    expect(validator(100)).toBe(true);
  });

  it('should reject number below range', () => {
    const validator = range(10, 20);

    expect(validator(5)).toBe('must be between 10 and 20');
    expect(validator(0)).toBe('must be between 10 and 20');
  });

  it('should reject number above range', () => {
    const validator = range(10, 20);

    expect(validator(25)).toBe('must be between 10 and 20');
    expect(validator(100)).toBe('must be between 10 and 20');
  });

  it('should handle negative ranges', () => {
    const validator = range(-10, -5);

    expect(validator(-7)).toBe(true);
    expect(validator(-11)).toBe('must be between -10 and -5');
    expect(validator(-4)).toBe('must be between -10 and -5');
  });

  it('should handle decimal numbers', () => {
    const validator = range(0, 1);

    expect(validator(0.5)).toBe(true);
    expect(validator(0.999)).toBe(true);
    expect(validator(1.001)).toBe('must be between 0 and 1');
  });
});

describe('pattern', () => {
  it('should accept string matching pattern', () => {
    const validator = pattern(/^[a-z]+$/, 'lowercase letters only');

    expect(validator('hello')).toBe(true);
    expect(validator('abc')).toBe(true);
  });

  it('should reject string not matching pattern', () => {
    const validator = pattern(/^[a-z]+$/, 'lowercase letters only');

    expect(validator('Hello')).toBe('must match pattern: lowercase letters only');
    expect(validator('abc123')).toBe('must match pattern: lowercase letters only');
    expect(validator('123')).toBe('must match pattern: lowercase letters only');
  });

  it('should work with email pattern', () => {
    const validator = pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'valid email');

    expect(validator('user@example.com')).toBe(true);
    expect(validator('test.user@domain.co.uk')).toBe(true);
    expect(validator('invalid-email')).toBe('must match pattern: valid email');
    expect(validator('@example.com')).toBe('must match pattern: valid email');
  });

  it('should work with complex patterns', () => {
    const validator = pattern(/^\d{3}-\d{2}-\d{4}$/, 'SSN format (XXX-XX-XXXX)');

    expect(validator('123-45-6789')).toBe(true);
    expect(validator('123456789')).toBe('must match pattern: SSN format (XXX-XX-XXXX)');
  });
});

describe('oneOf', () => {
  it('should accept value in allowed list', () => {
    const validator = oneOf(['red', 'green', 'blue'], 'color');

    expect(validator('red')).toBe(true);
    expect(validator('green')).toBe(true);
    expect(validator('blue')).toBe(true);
  });

  it('should reject value not in allowed list', () => {
    const validator = oneOf(['red', 'green', 'blue'], 'color');

    expect(validator('yellow')).toBe('color must be one of: red, green, blue');
    expect(validator('purple')).toBe('color must be one of: red, green, blue');
  });

  it('should use default name when not provided', () => {
    const validator = oneOf(['a', 'b', 'c']);

    expect(validator('d')).toBe('value must be one of: a, b, c');
  });

  it('should work with numbers', () => {
    const validator = oneOf([1, 2, 3], 'number');

    expect(validator(1)).toBe(true);
    expect(validator(2)).toBe(true);
    expect(validator(4)).toBe('number must be one of: 1, 2, 3');
  });

  it('should handle empty allowed list', () => {
    const validator = oneOf([], 'value');

    expect(validator('anything')).toContain('must be one of:');
  });
});

describe('safeString', () => {
  it('should accept safe strings', () => {
    const validator = safeString();

    expect(validator('hello world')).toBe(true);
    expect(validator('test-value_123')).toBe(true);
    expect(validator('normal text with spaces')).toBe(true);
  });

  it('should reject strings with HTML characters', () => {
    const validator = safeString();

    expect(validator('<script>')).toBe('contains potentially dangerous characters');
    expect(validator('test & value')).toBe('contains potentially dangerous characters');
    expect(validator('quote"test')).toBe('contains potentially dangerous characters');
    expect(validator("quote'test")).toBe('contains potentially dangerous characters');
  });

  it('should reject strings with control characters', () => {
    const validator = safeString();

    expect(validator('test\x00null')).toBe('contains potentially dangerous characters');
    expect(validator('test\x01control')).toBe('contains potentially dangerous characters');
    expect(validator('test\x1fcontrol')).toBe('contains potentially dangerous characters');
  });

  it('should reject strings with semicolons', () => {
    const validator = safeString();

    expect(validator('test;command')).toBe('contains potentially dangerous characters');
  });

  it('should accept strings with allowed special characters', () => {
    const validator = safeString();

    expect(validator('test-value')).toBe(true);
    expect(validator('test_value')).toBe(true);
    expect(validator('test.value')).toBe(true);
    expect(validator('test@value')).toBe(true);
  });
});

describe('safeGlobPattern', () => {
  it('should accept safe glob patterns', () => {
    const validator = safeGlobPattern();

    expect(validator('*.js')).toBe(true);
    expect(validator('src/**/*.ts')).toBe(true);
    expect(validator('test/*.test.js')).toBe(true);
  });

  it('should reject patterns with too many consecutive wildcards', () => {
    const validator = safeGlobPattern();

    // The regex /\*[^/*]*\*/g matches patterns like *a* *b* etc. (non-overlapping)
    // To get more than 3 matches, we need at least 7-8 consecutive pairs
    expect(validator('*a*b*c*d*e*f*g*h*')).toBe('pattern has too many consecutive wildcards (potential ReDoS)');
    expect(validator('test*foo*bar*baz*qux*quux*corge*grault*')).toBe(
      'pattern has too many consecutive wildcards (potential ReDoS)'
    );
  });

  it('should reject patterns that are too long', () => {
    const validator = safeGlobPattern();

    const longPattern = 'a'.repeat(501);
    expect(validator(longPattern)).toBe('pattern is too long (max 500 characters)');
  });

  it('should accept patterns with 3 or fewer consecutive wildcards', () => {
    const validator = safeGlobPattern();

    expect(validator('*a*b*c*')).toBe(true);
    expect(validator('test*foo*bar*')).toBe(true);
  });

  it('should handle patterns with exactly 500 characters', () => {
    const validator = safeGlobPattern();

    const pattern = 'a'.repeat(500);
    expect(validator(pattern)).toBe(true);
  });

  it('should allow wildcards separated by slashes', () => {
    const validator = safeGlobPattern();

    expect(validator('*/*/*/*/test.js')).toBe(true);
  });
});

describe('safePath', () => {
  it('should accept safe paths', () => {
    const validator = safePath();

    expect(validator('/usr/local/bin')).toBe(true);
    expect(validator('src/utils/validation.ts')).toBe(true);
    expect(validator('./test/file.js')).toBe(true);
  });

  it('should reject paths with directory traversal', () => {
    const validator = safePath();

    expect(validator('../../../etc/passwd')).toBe('path contains directory traversal (..)');
    expect(validator('../../secrets')).toBe('path contains directory traversal (..)');
    expect(validator('./test/../../../etc')).toBe('path contains directory traversal (..)');
  });

  it('should reject paths with null bytes', () => {
    const validator = safePath();

    expect(validator('/tmp\x00/etc/passwd')).toBe('path contains null byte');
    expect(validator('test\x00file')).toBe('path contains null byte');
  });

  it('should accept paths with single dots', () => {
    const validator = safePath();

    expect(validator('./current/directory')).toBe(true);
    expect(validator('test.file.js')).toBe(true);
  });
});

describe('validate', () => {
  it('should return valid result when all validators pass', () => {
    const result = validate('hello', [maxLength(10), minLength(3)], 'greeting');

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should collect all validation errors', () => {
    const result = validate('ab', [maxLength(5), minLength(3), pattern(/^\d+$/, 'numbers only')]);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('must be at least 3 characters');
    expect(result.errors).toContain('must match pattern: numbers only');
  });

  it('should handle single validator', () => {
    const result = validate('test', [maxLength(3)]);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['exceeds maximum length of 3 characters']);
  });

  it('should handle empty validator array', () => {
    const result = validate('anything', []);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should work with different value types', () => {
    const numberResult = validate(50, [range(0, 100)]);
    expect(numberResult.valid).toBe(true);

    const stringResult = validate('test', [oneOf(['test', 'demo'])]);
    expect(stringResult.valid).toBe(true);
  });
});

describe('validateOrThrow', () => {
  it('should return value when validation passes', () => {
    const result = validateOrThrow('hello', [maxLength(10), minLength(3)], 'greeting');

    expect(result).toBe('hello');
  });

  it('should throw ValidationError when validation fails', () => {
    expect(() => {
      validateOrThrow('ab', [minLength(3)], 'text');
    }).toThrow(ValidationError);
  });

  it('should include field name in error', () => {
    expect(() => {
      validateOrThrow('test', [maxLength(2)], 'username');
    }).toThrow(/username/);
  });

  it('should include all errors in thrown error', () => {
    try {
      validateOrThrow('x', [minLength(3), maxLength(0)], 'field');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.errors).toHaveLength(2);
      expect(validationError.field).toBe('field');
    }
  });

  it('should use default field name', () => {
    expect(() => {
      validateOrThrow('test', [maxLength(2)]);
    }).toThrow(/value/);
  });
});

describe('createObjectValidator', () => {
  it('should validate object with all fields passing', () => {
    const validator = createObjectValidator<{ name: string; age: number }>({
      name: [minLength(2), maxLength(50)],
      age: [range(0, 120)],
    });

    const result = validator({ name: 'John', age: 30 });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should collect errors from multiple fields', () => {
    const validator = createObjectValidator<{ name: string; age: number }>({
      name: [minLength(5)],
      age: [range(0, 100)],
    });

    const result = validator({ name: 'Joe', age: 150 });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('name: must be at least 5 characters');
    expect(result.errors).toContain('age: must be between 0 and 100');
  });

  it('should validate complex objects', () => {
    const validator = createObjectValidator<{ email: string; role: string }>({
      email: [pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'valid email')],
      role: [oneOf(['admin', 'user', 'guest'], 'role')],
    });

    const validResult = validator({ email: 'user@example.com', role: 'admin' });
    expect(validResult.valid).toBe(true);

    const invalidResult = validator({ email: 'invalid', role: 'superuser' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toHaveLength(2);
  });

  it('should handle objects with multiple validators per field', () => {
    const validator = createObjectValidator<{ password: string }>({
      password: [minLength(8), maxLength(100), pattern(/[A-Z]/, 'uppercase letter')],
    });

    const result = validator({ password: 'weak' });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('password: must be at least 8 characters');
    expect(result.errors).toContain('password: must match pattern: uppercase letter');
  });

  it('should handle empty schema', () => {
    const validator = createObjectValidator({});

    const result = validator({});

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('validateDirectory', () => {
  it('should return current directory when undefined', () => {
    const result = validateDirectory(undefined);

    expect(result).toBe(process.cwd());
  });

  it('should return valid directory path', () => {
    const validPath = '/usr/local/bin';
    const result = validateDirectory(validPath);

    expect(result).toBe(validPath);
  });

  it('should throw error for path that is too long', () => {
    const longPath = 'a'.repeat(4097);

    expect(() => validateDirectory(longPath)).toThrow(ValidationError);
    expect(() => validateDirectory(longPath)).toThrow(/exceeds maximum length/);
  });

  it('should throw error for path with directory traversal', () => {
    expect(() => validateDirectory('../../etc/passwd')).toThrow(ValidationError);
    expect(() => validateDirectory('../../etc/passwd')).toThrow(/directory traversal/);
  });

  it('should throw error for path with null byte', () => {
    expect(() => validateDirectory('/tmp\x00/etc')).toThrow(ValidationError);
  });

  it('should accept path at max length', () => {
    const maxPath = 'a'.repeat(4096);
    const result = validateDirectory(maxPath);

    expect(result).toBe(maxPath);
  });
});

describe('validateFeatureName', () => {
  it('should return undefined when undefined', () => {
    const result = validateFeatureName(undefined);

    expect(result).toBeUndefined();
  });

  it('should return valid feature name', () => {
    const result = validateFeatureName('user-authentication');

    expect(result).toBe('user-authentication');
  });

  it('should throw error for name that is too long', () => {
    const longName = 'a'.repeat(201);

    expect(() => validateFeatureName(longName)).toThrow(ValidationError);
    expect(() => validateFeatureName(longName)).toThrow(/exceeds maximum length/);
  });

  it('should throw error for name with dangerous characters', () => {
    expect(() => validateFeatureName('<script>alert(1)</script>')).toThrow(ValidationError);
    expect(() => validateFeatureName('test;command')).toThrow(ValidationError);
  });

  it('should accept name at max length', () => {
    const maxName = 'a'.repeat(200);
    const result = validateFeatureName(maxName);

    expect(result).toBe(maxName);
  });

  it('should accept names with safe special characters', () => {
    expect(validateFeatureName('feature-name_123')).toBe('feature-name_123');
    expect(validateFeatureName('test.feature')).toBe('test.feature');
  });
});

describe('validateFormat', () => {
  it('should return default format when undefined', () => {
    const result = validateFormat(undefined);

    expect(result).toBe('json');
  });

  it('should return valid format', () => {
    expect(validateFormat('json')).toBe('json');
    expect(validateFormat('markdown')).toBe('markdown');
  });

  it('should use custom allowed formats', () => {
    const result = validateFormat('yaml', ['yaml', 'toml']);

    expect(result).toBe('yaml');
  });

  it('should throw error for invalid format', () => {
    expect(() => validateFormat('xml')).toThrow(ValidationError);
    expect(() => validateFormat('xml')).toThrow(/format must be one of/);
  });

  it('should use custom default from allowed list', () => {
    const result = validateFormat(undefined, ['yaml', 'toml']);

    expect(result).toBe('yaml');
  });

  it('should throw error for format not in custom allowed list', () => {
    expect(() => validateFormat('json', ['yaml', 'toml'])).toThrow(ValidationError);
  });
});

describe('validateConfidence', () => {
  it('should return default 50 when undefined', () => {
    const result = validateConfidence(undefined);

    expect(result).toBe(50);
  });

  it('should return valid confidence values', () => {
    expect(validateConfidence(0)).toBe(0);
    expect(validateConfidence(50)).toBe(50);
    expect(validateConfidence(100)).toBe(100);
  });

  it('should throw error for confidence below 0', () => {
    expect(() => validateConfidence(-1)).toThrow(ValidationError);
    expect(() => validateConfidence(-1)).toThrow(/must be between 0 and 100/);
  });

  it('should throw error for confidence above 100', () => {
    expect(() => validateConfidence(101)).toThrow(ValidationError);
    expect(() => validateConfidence(101)).toThrow(/must be between 0 and 100/);
  });

  it('should accept decimal values', () => {
    expect(validateConfidence(75.5)).toBe(75.5);
    expect(validateConfidence(99.9)).toBe(99.9);
  });
});

describe('validateArray', () => {
  it('should return empty array when undefined', () => {
    const result = validateArray(undefined, 10);

    expect(result).toEqual([]);
  });

  it('should return valid array', () => {
    const arr = ['a', 'b', 'c'];
    const result = validateArray(arr, 10);

    expect(result).toEqual(arr);
  });

  it('should throw error when exceeding maxItems', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(() => validateArray(arr, 3)).toThrow(ValidationError);
    expect(() => validateArray(arr, 3)).toThrow(/exceeds maximum of 3 items/);
  });

  it('should validate array items with item validator', () => {
    const arr = ['hello', 'world'];
    const result = validateArray(arr, 10, maxLength(10));

    expect(result).toEqual(arr);
  });

  it('should throw error when item validation fails', () => {
    const arr = ['hello', 'x'];

    expect(() => validateArray(arr, 10, minLength(3))).toThrow(ValidationError);
  });

  it('should include item index in error message', () => {
    const arr = ['valid', 'x', 'y'];

    try {
      validateArray(arr, 10, minLength(3), 'items');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.errors).toContain('[1]: must be at least 3 characters');
      expect(validationError.errors).toContain('[2]: must be at least 3 characters');
    }
  });

  it('should use custom field name', () => {
    const arr = [1, 2, 3, 4, 5];

    try {
      validateArray(arr, 3, undefined, 'numbers');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.field).toBe('numbers');
    }
  });

  it('should handle empty array', () => {
    const result = validateArray([], 10);

    expect(result).toEqual([]);
  });

  it('should accept array at max items', () => {
    const arr = [1, 2, 3];
    const result = validateArray(arr, 3);

    expect(result).toEqual(arr);
  });

  it('should validate all items even if multiple fail', () => {
    const arr = ['a', 'bb', 'c', 'dd'];

    try {
      validateArray(arr, 10, minLength(2), 'items');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.errors).toHaveLength(2);
    }
  });
});

describe('sanitizeString', () => {
  it('should remove HTML dangerous characters', () => {
    // Note: forward slashes are NOT removed by sanitizeString
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    expect(sanitizeString('test & value')).toBe('test  value');
    expect(sanitizeString('test > 5')).toBe('test  5');
  });

  it('should remove quotes', () => {
    expect(sanitizeString('test "quoted" text')).toBe('test quoted text');
    expect(sanitizeString("test 'quoted' text")).toBe('test quoted text');
  });

  it('should remove control characters', () => {
    expect(sanitizeString('test\x00null')).toBe('testnull');
    expect(sanitizeString('test\x01\x02\x03')).toBe('test');
    expect(sanitizeString('test\x1fcontrol')).toBe('testcontrol');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  test  ')).toBe('test');
    expect(sanitizeString('\t\ntest\n\t')).toBe('test');
  });

  it('should preserve safe characters', () => {
    expect(sanitizeString('hello world 123')).toBe('hello world 123');
    expect(sanitizeString('test-value_123.txt')).toBe('test-value_123.txt');
  });

  it('should handle empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should handle string with only dangerous characters', () => {
    expect(sanitizeString('<>&"\'')).toBe('');
  });

  it('should handle unicode characters', () => {
    expect(sanitizeString('你好世界')).toBe('你好世界');
    expect(sanitizeString('test 🌍')).toBe('test 🌍');
  });
});

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape less-than signs', () => {
    expect(escapeHtml('5 < 10')).toBe('5 &lt; 10');
  });

  it('should escape greater-than signs', () => {
    expect(escapeHtml('10 > 5')).toBe('10 &gt; 5');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("say 'hello'")).toBe('say &#039;hello&#039;');
  });

  it('should escape HTML tags', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('should escape all special characters together', () => {
    expect(escapeHtml('<div class="test">A & B</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;'
    );
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should preserve safe text', () => {
    expect(escapeHtml('hello world 123')).toBe('hello world 123');
  });

  it('should handle repeated escaping', () => {
    const once = escapeHtml('&');
    expect(once).toBe('&amp;');

    const twice = escapeHtml(once);
    expect(twice).toBe('&amp;amp;');
  });

  it('should handle multiple entities in sequence', () => {
    expect(escapeHtml('&<>"')).toBe('&amp;&lt;&gt;&quot;');
  });

  it('should preserve unicode characters', () => {
    expect(escapeHtml('你好 <world>')).toBe('你好 &lt;world&gt;');
  });
});
