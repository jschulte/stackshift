/**
 * File Writer - Safely writes generated specification files to disk
 *
 * Responsibilities:
 * - Validate output paths for security
 * - Write files atomically (temp + rename)
 * - Create directories as needed
 * - Generate unique feature IDs
 * - Validate content before writing
 *
 * @module file-writer
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Security validator for file paths
 */
class SecurityValidator {
  private static readonly BLOCKED_PATHS = [
    '/etc',
    '/sys',
    '/proc',
    '/dev',
    'node_modules',
    '.git',
  ];

  private static readonly BLOCKED_EXTENSIONS = [
    '.exe',
    '.dll',
    '.so',
    '.dylib',
    '.sh',
    '.bat',
    '.cmd',
  ];

  /**
   * Validate that a path is safe to write to
   * @param filePath - Absolute path to validate
   * @throws Error if path is unsafe
   */
  static validatePath(filePath: string): void {
    // Must be absolute path
    if (!path.isAbsolute(filePath)) {
      throw new Error(`Path must be absolute: ${filePath}`);
    }

    // Resolve to prevent directory traversal
    const resolved = path.resolve(filePath);
    if (resolved !== filePath) {
      throw new Error(`Path contains directory traversal: ${filePath}`);
    }

    // Check against blocked paths
    for (const blocked of this.BLOCKED_PATHS) {
      if (resolved.startsWith(blocked) || resolved.includes(`/${blocked}/`)) {
        throw new Error(`Path is in blocked directory: ${filePath}`);
      }
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (this.BLOCKED_EXTENSIONS.includes(ext)) {
      throw new Error(`File extension not allowed: ${ext}`);
    }

    // Must be markdown file for this tool
    if (ext !== '.md' && ext !== '') {
      throw new Error(`Only .md files allowed, got: ${ext}`);
    }
  }
}

/**
 * Result of file write operation
 */
export interface WriteResult {
  success: boolean;
  filePath: string;
  bytesWritten: number;
  checksum: string;
}

/**
 * Error thrown when file writing fails
 */
export class FileWriteError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'FileWriteError';
  }
}

/**
 * File Writer - Safely writes generated files to disk
 */
export class FileWriter {
  private outputDir: string;

  constructor(outputDir: string = 'production-readiness-specs') {
    this.outputDir = outputDir;
  }

  /**
   * Write a specification file
   * @param featureName - Name of the feature (e.g., "user-authentication")
   * @param content - Markdown content to write
   * @param fileName - Optional custom filename (defaults to "spec.md")
   * @returns Write result with path and checksum
   * @throws FileWriteError if write fails
   */
  async writeSpec(
    featureName: string,
    content: string,
    fileName: string = 'spec.md'
  ): Promise<WriteResult> {
    const featureDir = this.getFeatureDir(featureName);
    const filePath = path.join(featureDir, fileName);

    return this.writeFile(filePath, content);
  }

  /**
   * Write an implementation plan file
   * @param featureName - Name of the feature
   * @param content - Markdown content to write
   * @param fileName - Optional custom filename (defaults to "impl-plan.md")
   * @returns Write result
   */
  async writePlan(
    featureName: string,
    content: string,
    fileName: string = 'impl-plan.md'
  ): Promise<WriteResult> {
    const featureDir = this.getFeatureDir(featureName);
    const filePath = path.join(featureDir, fileName);

    return this.writeFile(filePath, content);
  }

  /**
   * Write constitution file
   * @param content - Markdown content to write
   * @param fileName - Optional custom filename (defaults to "constitution.md")
   * @returns Write result
   */
  async writeConstitution(
    content: string,
    fileName: string = 'constitution.md'
  ): Promise<WriteResult> {
    const filePath = path.join(this.outputDir, fileName);

    return this.writeFile(filePath, content);
  }

  /**
   * Write a file atomically with validation
   * @param filePath - Absolute or relative path
   * @param content - File content
   * @returns Write result
   * @throws FileWriteError if write fails
   */
  async writeFile(filePath: string, content: string): Promise<WriteResult> {
    try {
      // Make path absolute
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);

      // Validate security
      SecurityValidator.validatePath(absolutePath);

      // Validate content
      this.validateContent(content);

      // Create parent directory if needed
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });

      // Write atomically: temp file + rename
      const tempPath = `${absolutePath}.tmp.${Date.now()}`;
      await fs.writeFile(tempPath, content, 'utf-8');

      // Rename to final path (atomic on POSIX)
      await fs.rename(tempPath, absolutePath);

      // Calculate stats
      const stats = await fs.stat(absolutePath);
      const checksum = crypto.createHash('sha256').update(content).digest('hex');

      return {
        success: true,
        filePath: absolutePath,
        bytesWritten: stats.size,
        checksum,
      };
    } catch (error) {
      throw new FileWriteError(
        `Failed to write file: ${error}`,
        filePath,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate unique feature ID
   * @param existingIds - Array of already-used IDs
   * @returns Next available ID (e.g., "F001", "F002")
   */
  generateFeatureId(existingIds: string[]): string {
    // Extract numeric part from existing IDs
    const numbers = existingIds
      .map((id) => {
        const match = id.match(/^F(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    return `F${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Check if a feature directory exists
   * @param featureName - Name of the feature
   * @returns True if directory exists
   */
  async featureExists(featureName: string): Promise<boolean> {
    const featureDir = this.getFeatureDir(featureName);
    try {
      const stats = await fs.stat(featureDir);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * List all existing features
   * @returns Array of feature directory names
   */
  async listFeatures(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.outputDir, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isDirectory() && entry.name.match(/^F\d{3}-/))
        .map((entry) => entry.name);
    } catch (error) {
      // Directory doesn't exist yet
      return [];
    }
  }

  /**
   * Delete a feature directory and all its contents
   * @param featureName - Name of the feature
   */
  async deleteFeature(featureName: string): Promise<void> {
    const featureDir = this.getFeatureDir(featureName);
    await fs.rm(featureDir, { recursive: true, force: true });
  }

  /**
   * Get feature directory path
   * @param featureName - Feature name (e.g., "user-authentication" or "F001-user-authentication")
   * @returns Absolute path to feature directory
   */
  private getFeatureDir(featureName: string): string {
    // If name already starts with F### prefix, use as-is
    // Otherwise, assume it needs to be prefixed
    const dirName = featureName.match(/^F\d{3}-/) ? featureName : featureName;

    return path.resolve(process.cwd(), this.outputDir, dirName);
  }

  /**
   * Validate markdown content
   * @param content - Content to validate
   * @throws Error if content is invalid
   */
  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    if (content.length > 10 * 1024 * 1024) {
      throw new Error('Content too large (max 10MB)');
    }

    // Check for null bytes
    if (content.includes('\0')) {
      throw new Error('Content contains null bytes');
    }
  }

  /**
   * Get the output directory
   */
  getOutputDir(): string {
    return path.resolve(process.cwd(), this.outputDir);
  }

  /**
   * Set the output directory
   */
  setOutputDir(dir: string): void {
    this.outputDir = dir;
  }
}
