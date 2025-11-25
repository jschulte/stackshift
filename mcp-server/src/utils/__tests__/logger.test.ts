/**
 * Logger Module Tests
 *
 * Tests for structured logging:
 * - Logger creation
 * - Log levels
 * - Formatting (JSON/pretty)
 * - Silent mode
 * - Collecting logger for testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  createSilentLogger,
  createCollectingLogger,
  logger,
  type Logger,
  type LogLevel,
  type LogEntry,
} from '../logger.js';

describe('Logger Module Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Default to test environment with logging disabled
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with all log methods', () => {
      const logger = createLogger('test-component');

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should create child logger with component prefix', () => {
      const parent = createLogger('parent');
      const child = parent.child('child');

      // Child logger should exist and have all methods
      expect(typeof child.debug).toBe('function');
      expect(typeof child.info).toBe('function');
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.STACKSHIFT_LOG_SILENT = 'false';
    });

    it('should respect minimum log level', () => {
      process.env.STACKSHIFT_LOG_LEVEL = 'warn';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.debug('Debug message');
      logger.info('Info message');

      // Debug and info should be filtered out when min level is warn
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log at warn level and above when set', () => {
      process.env.STACKSHIFT_LOG_LEVEL = 'warn';

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('test');

      logger.warn('Warning');
      logger.error('Error');

      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should default to info in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.STACKSHIFT_LOG_LEVEL;
      process.env.STACKSHIFT_LOG_SILENT = 'false';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.debug('Debug - should be filtered');
      logger.info('Info - should log');

      // In production, only info and above should log
      // Debug should be filtered
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('JSON Output', () => {
    it('should output JSON in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.STACKSHIFT_LOG_LEVEL = 'info';
      process.env.STACKSHIFT_LOG_SILENT = 'false';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('level', 'info');
      expect(parsed).toHaveProperty('component', 'test');
      expect(parsed).toHaveProperty('message', 'Test message');
      expect(parsed).toHaveProperty('context');

      consoleSpy.mockRestore();
    });

    it('should output JSON when STACKSHIFT_LOG_FORMAT=json', () => {
      process.env.NODE_ENV = 'development';
      process.env.STACKSHIFT_LOG_FORMAT = 'json';
      process.env.STACKSHIFT_LOG_LEVEL = 'info';
      process.env.STACKSHIFT_LOG_SILENT = 'false';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Message');

      const output = consoleSpy.mock.calls[0][0];
      expect(() => JSON.parse(output)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should output JSON in CI', () => {
      process.env.CI = 'true';
      process.env.NODE_ENV = 'development';
      process.env.STACKSHIFT_LOG_LEVEL = 'info';
      process.env.STACKSHIFT_LOG_SILENT = 'false';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('CI message');

      const output = consoleSpy.mock.calls[0][0];
      expect(() => JSON.parse(output)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Silent Mode', () => {
    it('should not log when STACKSHIFT_LOG_SILENT=true', () => {
      process.env.STACKSHIFT_LOG_SILENT = 'true';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('test');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should be silent by default in test environment', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.STACKSHIFT_LOG_LEVEL;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Test message');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('createSilentLogger', () => {
    it('should create a logger that does nothing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const silent = createSilentLogger();

      silent.debug('Debug');
      silent.info('Info');
      silent.warn('Warn');
      silent.error('Error');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should create silent child loggers', () => {
      const silent = createSilentLogger();
      const child = silent.child('child');

      // Child should also be silent
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      child.info('Should not log');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createCollectingLogger', () => {
    it('should collect log entries', () => {
      const collecting = createCollectingLogger();

      collecting.debug('Debug message', { key: 'value' });
      collecting.info('Info message');
      collecting.warn('Warning message');
      collecting.error('Error message');

      expect(collecting.entries).toHaveLength(4);
    });

    it('should include level in entries', () => {
      const collecting = createCollectingLogger();

      collecting.debug('Debug');
      collecting.info('Info');
      collecting.warn('Warn');
      collecting.error('Error');

      expect(collecting.entries[0].level).toBe('debug');
      expect(collecting.entries[1].level).toBe('info');
      expect(collecting.entries[2].level).toBe('warn');
      expect(collecting.entries[3].level).toBe('error');
    });

    it('should include message in entries', () => {
      const collecting = createCollectingLogger();

      collecting.info('Test message');

      expect(collecting.entries[0].message).toBe('Test message');
    });

    it('should include context in entries', () => {
      const collecting = createCollectingLogger();

      collecting.info('Message', { key: 'value', count: 42 });

      expect(collecting.entries[0].context).toEqual({ key: 'value', count: 42 });
    });

    it('should include timestamp in entries', () => {
      const collecting = createCollectingLogger();

      collecting.info('Message');

      expect(collecting.entries[0].timestamp).toBeDefined();
      expect(new Date(collecting.entries[0].timestamp).getTime()).not.toBeNaN();
    });

    it('should create separate collecting child loggers', () => {
      const collecting = createCollectingLogger();
      const child = collecting.child('child');

      child.info('Child message');

      // Child creates its own collecting logger
      expect('entries' in child).toBe(true);
    });
  });

  describe('Default Logger Export', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('Context Handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.STACKSHIFT_LOG_SILENT = 'false';
      process.env.STACKSHIFT_LOG_LEVEL = 'debug';
    });

    it('should handle undefined context', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Message without context');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle empty context object', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Message', {});

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle nested context objects', () => {
      process.env.STACKSHIFT_LOG_FORMAT = 'json';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.info('Message', {
        nested: { deep: { value: 'test' } },
      });

      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.context.nested.deep.value).toBe('test');

      consoleSpy.mockRestore();
    });
  });

  describe('Console Method Selection', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.STACKSHIFT_LOG_SILENT = 'false';
      process.env.STACKSHIFT_LOG_LEVEL = 'debug';
    });

    it('should use console.error for error level', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.error('Error message');

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should use console.warn for warn level', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.warn('Warning message');

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should use console.log for info and debug levels', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger('test');

      logger.debug('Debug');
      logger.info('Info');

      expect(logSpy).toHaveBeenCalledTimes(2);
      logSpy.mockRestore();
    });
  });
});
