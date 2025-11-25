/**
 * Error Handler Tests
 *
 * Tests for error handling utilities:
 * - StackShiftError class
 * - Error wrapping
 * - Safe execution
 * - Error type detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StackShiftError,
  getErrorMessage,
  wrapError,
  safeExecute,
  tryExecute,
  createToolErrorHandler,
  isFileNotFoundError,
  isPermissionError,
  isDirectoryError,
} from '../error-handler.js';
import { createSilentLogger, createCollectingLogger } from '../logger.js';

describe('Error Handler Tests', () => {
  describe('StackShiftError', () => {
    it('should create error with operation and message', () => {
      const error = new StackShiftError('analyze', 'File not found');

      expect(error.name).toBe('StackShiftError');
      expect(error.operation).toBe('analyze');
      expect(error.message).toBe('analyze failed: File not found');
    });

    it('should include cause when provided', () => {
      const cause = new Error('Original error');
      const error = new StackShiftError('parse', 'Failed to parse', { cause });

      expect(error.cause).toBe(cause);
    });

    it('should include context when provided', () => {
      const context = { file: 'test.ts', line: 42 };
      const error = new StackShiftError('compile', 'Syntax error', { context });

      expect(error.context).toEqual(context);
    });

    it('should be instance of Error', () => {
      const error = new StackShiftError('test', 'test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have proper stack trace', () => {
      const error = new StackShiftError('test', 'test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string errors as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should convert other types to string', () => {
      expect(getErrorMessage(42)).toBe('42');
      expect(getErrorMessage({ code: 'ERR' })).toBe('[object Object]');
      expect(getErrorMessage(null)).toBe('null');
      expect(getErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('wrapError', () => {
    it('should wrap Error instance with operation', () => {
      const original = new Error('Original');
      const wrapped = wrapError('operation', original);

      expect(wrapped).toBeInstanceOf(StackShiftError);
      expect(wrapped.operation).toBe('operation');
      expect(wrapped.cause).toBe(original);
    });

    it('should wrap string error', () => {
      const wrapped = wrapError('operation', 'String error');

      expect(wrapped).toBeInstanceOf(StackShiftError);
      expect(wrapped.message).toContain('String error');
      expect(wrapped.cause).toBeUndefined();
    });

    it('should include context in wrapped error', () => {
      const context = { file: 'test.ts' };
      const wrapped = wrapError('operation', new Error('test'), context);

      expect(wrapped.context).toEqual(context);
    });
  });

  describe('safeExecute', () => {
    it('should return result on success', async () => {
      const result = await safeExecute('test', async () => 'success', {
        logger: createSilentLogger(),
      });

      expect(result).toBe('success');
    });

    it('should wrap and rethrow error by default', async () => {
      await expect(
        safeExecute(
          'failing-op',
          async () => {
            throw new Error('Failure');
          },
          { logger: createSilentLogger() }
        )
      ).rejects.toThrow(StackShiftError);
    });

    it('should include context in error', async () => {
      const context = { input: 'test-input' };

      try {
        await safeExecute(
          'context-op',
          async () => {
            throw new Error('Failure');
          },
          { logger: createSilentLogger(), context }
        );
      } catch (error) {
        expect(error).toBeInstanceOf(StackShiftError);
        expect((error as StackShiftError).context).toEqual(context);
      }
    });

    it('should log errors', async () => {
      const logger = createCollectingLogger();

      try {
        await safeExecute(
          'log-op',
          async () => {
            throw new Error('Log this');
          },
          { logger }
        );
      } catch {
        // Expected to throw
      }

      expect(logger.entries).toHaveLength(1);
      expect(logger.entries[0].level).toBe('error');
    });
  });

  describe('tryExecute', () => {
    it('should return success result on success', async () => {
      const result = await tryExecute('test', async () => 42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should return error result on failure', async () => {
      const result = await tryExecute(
        'test',
        async () => {
          throw new Error('Failed');
        },
        createSilentLogger()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StackShiftError);
      }
    });

    it('should log errors when logger provided', async () => {
      const logger = createCollectingLogger();

      await tryExecute(
        'log-test',
        async () => {
          throw new Error('Error');
        },
        logger
      );

      expect(logger.entries).toHaveLength(1);
      expect(logger.entries[0].level).toBe('error');
    });
  });

  describe('createToolErrorHandler', () => {
    it('should create handler with tool name prefix', () => {
      const handler = createToolErrorHandler('myTool');

      const wrapped = handler.wrap('operation', new Error('test'));
      expect(wrapped.operation).toBe('myTool.operation');
    });

    it('should provide execute method', async () => {
      const handler = createToolErrorHandler('myTool');

      const result = await handler.execute('op', async () => 'result');
      expect(result).toBe('result');
    });

    it('should provide try method', async () => {
      const handler = createToolErrorHandler('myTool');

      const result = await handler.try('op', async () => 'result');
      expect(result.success).toBe(true);
    });

    it('should provide logError method', () => {
      const handler = createToolErrorHandler('myTool');
      // Should not throw
      handler.logError('operation', new Error('test'), { extra: 'context' });
    });

    it('should provide logWarning method', () => {
      const handler = createToolErrorHandler('myTool');
      // Should not throw
      handler.logWarning('operation', 'Warning message', { extra: 'context' });
    });

    it('should include logger in handler', () => {
      const handler = createToolErrorHandler('myTool');
      expect(handler.logger).toBeDefined();
    });
  });

  describe('isFileNotFoundError', () => {
    it('should return true for ENOENT errors', () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      expect(isFileNotFoundError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isFileNotFoundError(new Error('Generic error'))).toBe(false);
      expect(isFileNotFoundError('string error')).toBe(false);
      expect(isFileNotFoundError(null)).toBe(false);
    });

    it('should return false for other error codes', () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';

      expect(isFileNotFoundError(error)).toBe(false);
    });
  });

  describe('isPermissionError', () => {
    it('should return true for EACCES errors', () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';

      expect(isPermissionError(error)).toBe(true);
    });

    it('should return true for EPERM errors', () => {
      const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
      error.code = 'EPERM';

      expect(isPermissionError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isPermissionError(new Error('Generic'))).toBe(false);

      const notFound = new Error() as NodeJS.ErrnoException;
      notFound.code = 'ENOENT';
      expect(isPermissionError(notFound)).toBe(false);
    });
  });

  describe('isDirectoryError', () => {
    it('should return true for EISDIR errors', () => {
      const error = new Error('Is a directory') as NodeJS.ErrnoException;
      error.code = 'EISDIR';

      expect(isDirectoryError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isDirectoryError(new Error('Generic'))).toBe(false);

      const notFound = new Error() as NodeJS.ErrnoException;
      notFound.code = 'ENOENT';
      expect(isDirectoryError(notFound)).toBe(false);
    });
  });
});
