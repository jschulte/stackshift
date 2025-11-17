/**
 * Tests for FileWriter
 */

import { FileWriter, FileWriteError } from '../file-writer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('FileWriter', () => {
  let writer: FileWriter;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filewriter-test-'));
    writer = new FileWriter(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('writeFile', () => {
    it('should write a file successfully', async () => {
      const filePath = path.join(testDir, 'test.md');
      const content = '# Test Content\n\nThis is a test.';

      const result = await writer.writeFile(filePath, content);

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.bytesWritten).toBeGreaterThan(0);
      expect(result.checksum).toBeTruthy();

      // Verify file was written
      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should create parent directories if needed', async () => {
      const filePath = path.join(testDir, 'subdir', 'nested', 'test.md');
      const content = '# Nested File';

      const result = await writer.writeFile(filePath, content);

      expect(result.success).toBe(true);
      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should throw error for empty content', async () => {
      const filePath = path.join(testDir, 'empty.md');

      await expect(writer.writeFile(filePath, '')).rejects.toThrow(FileWriteError);
      await expect(writer.writeFile(filePath, '   ')).rejects.toThrow('Content cannot be empty');
    });

    it('should throw error for content with null bytes', async () => {
      const filePath = path.join(testDir, 'null.md');
      const content = 'Test\0Content';

      await expect(writer.writeFile(filePath, content)).rejects.toThrow('null bytes');
    });

    it('should throw error for blocked extensions', async () => {
      const filePath = path.join(testDir, 'script.sh');
      const content = '#!/bin/bash\necho "test"';

      await expect(writer.writeFile(filePath, content)).rejects.toThrow('not allowed');
    });

    it('should overwrite existing files', async () => {
      const filePath = path.join(testDir, 'overwrite.md');
      const content1 = '# First Version';
      const content2 = '# Second Version';

      await writer.writeFile(filePath, content1);
      const result = await writer.writeFile(filePath, content2);

      expect(result.success).toBe(true);
      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content2);
    });
  });

  describe('writeSpec', () => {
    it('should write spec file to feature directory', async () => {
      const featureName = 'F001-user-authentication';
      const content = '# Feature Specification\n\nUser auth feature.';

      const result = await writer.writeSpec(featureName, content);

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('F001-user-authentication');
      expect(result.filePath).toContain('spec.md');

      const written = await fs.readFile(result.filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should write spec with custom filename', async () => {
      const featureName = 'F001-test-feature';
      const content = '# Custom Spec';

      const result = await writer.writeSpec(featureName, content, 'custom-spec.md');

      expect(result.filePath).toContain('custom-spec.md');
    });
  });

  describe('writePlan', () => {
    it('should write plan file to feature directory', async () => {
      const featureName = 'F001-user-authentication';
      const content = '# Implementation Plan\n\nPlan details.';

      const result = await writer.writePlan(featureName, content);

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('F001-user-authentication');
      expect(result.filePath).toContain('impl-plan.md');
    });
  });

  describe('writeConstitution', () => {
    it('should write constitution to output directory root', async () => {
      const content = '# Constitution\n\nCore values and principles.';

      const result = await writer.writeConstitution(content);

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('constitution.md');
      expect(result.filePath).toContain(testDir);
    });
  });

  describe('generateFeatureId', () => {
    it('should generate F001 for empty list', () => {
      const id = writer.generateFeatureId([]);
      expect(id).toBe('F001');
    });

    it('should generate next sequential ID', () => {
      const existingIds = ['F001', 'F002', 'F003'];
      const id = writer.generateFeatureId(existingIds);
      expect(id).toBe('F004');
    });

    it('should handle non-sequential IDs', () => {
      const existingIds = ['F001', 'F005', 'F003'];
      const id = writer.generateFeatureId(existingIds);
      expect(id).toBe('F006'); // Max + 1
    });

    it('should ignore invalid IDs', () => {
      const existingIds = ['F001', 'invalid', 'F002', 'also-invalid'];
      const id = writer.generateFeatureId(existingIds);
      expect(id).toBe('F003');
    });
  });

  describe('featureExists', () => {
    it('should return false for non-existent feature', async () => {
      const exists = await writer.featureExists('F001-non-existent');
      expect(exists).toBe(false);
    });

    it('should return true for existing feature', async () => {
      const featureName = 'F001-test-feature';
      await writer.writeSpec(featureName, '# Test');

      const exists = await writer.featureExists(featureName);
      expect(exists).toBe(true);
    });
  });

  describe('listFeatures', () => {
    it('should return empty array when no features exist', async () => {
      const features = await writer.listFeatures();
      expect(features).toEqual([]);
    });

    it('should list all feature directories', async () => {
      await writer.writeSpec('F001-feature-one', '# One');
      await writer.writeSpec('F002-feature-two', '# Two');
      await writer.writeSpec('F003-feature-three', '# Three');

      const features = await writer.listFeatures();
      expect(features).toHaveLength(3);
      expect(features).toContain('F001-feature-one');
      expect(features).toContain('F002-feature-two');
      expect(features).toContain('F003-feature-three');
    });

    it('should not list files, only directories', async () => {
      await writer.writeSpec('F001-feature', '# Feature');
      await writer.writeConstitution('# Constitution');

      const features = await writer.listFeatures();
      expect(features).toHaveLength(1);
      expect(features[0]).toBe('F001-feature');
    });
  });

  describe('deleteFeature', () => {
    it('should delete feature directory and contents', async () => {
      const featureName = 'F001-to-delete';
      await writer.writeSpec(featureName, '# Spec');
      await writer.writePlan(featureName, '# Plan');

      expect(await writer.featureExists(featureName)).toBe(true);

      await writer.deleteFeature(featureName);

      expect(await writer.featureExists(featureName)).toBe(false);
    });

    it('should not throw if feature does not exist', async () => {
      await expect(writer.deleteFeature('F999-non-existent')).resolves.not.toThrow();
    });
  });

  describe('getOutputDir / setOutputDir', () => {
    it('should get output directory', () => {
      const dir = writer.getOutputDir();
      expect(dir).toContain(testDir);
    });

    it('should set output directory', () => {
      const newDir = '/tmp/new-output';
      writer.setOutputDir(newDir);
      expect(writer.getOutputDir()).toContain('new-output');
    });
  });
});
