/**
 * Batch Session State Management
 *
 * Stores answers from initial batch configuration and reuses them
 * across all widgets in the batch session, eliminating repetitive questions.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface BatchSessionAnswers {
  route?: 'greenfield' | 'brownfield' | 'osiris' | 'osiris-module' | 'cms-v9' | 'cms-viewmodel';
  brownfield_mode?: 'standard' | 'upgrade';
  transmission?: 'manual' | 'cruise-control';
  clarifications_strategy?: 'defer' | 'prompt' | 'skip';
  implementation_scope?: 'none' | 'p0' | 'p0_p1' | 'all';
  spec_output_location?: string;
  target_stack?: string;
  build_location?: string;
  build_location_type?: 'subfolder' | 'separate' | 'replace';
}

export interface BatchSessionState {
  sessionId: string;
  startedAt: string;
  totalRepos: number;
  batchSize: number;
  answers: BatchSessionAnswers;
  processedRepos: string[];
}

const BATCH_SESSION_FILE = path.join(os.homedir(), '.claude', 'stackshift-batch-session.json');

/**
 * Create a new batch session with initial answers
 */
export function createBatchSession(
  totalRepos: number,
  batchSize: number,
  answers: BatchSessionAnswers
): BatchSessionState {
  const session: BatchSessionState = {
    sessionId: `batch-${Date.now()}`,
    startedAt: new Date().toISOString(),
    totalRepos,
    batchSize,
    answers,
    processedRepos: []
  };

  ensureDirectoryExists(path.dirname(BATCH_SESSION_FILE));
  fs.writeFileSync(BATCH_SESSION_FILE, JSON.stringify(session, null, 2));

  return session;
}

/**
 * Get current batch session if it exists
 */
export function getBatchSession(): BatchSessionState | null {
  try {
    if (!fs.existsSync(BATCH_SESSION_FILE)) {
      return null;
    }

    const content = fs.readFileSync(BATCH_SESSION_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading batch session:', error);
    return null;
  }
}

/**
 * Check if we're currently in a batch session
 */
export function hasBatchSession(): boolean {
  return fs.existsSync(BATCH_SESSION_FILE);
}

/**
 * Update batch session with processed repo
 */
export function markRepoProcessed(repoName: string): void {
  const session = getBatchSession();
  if (!session) {
    return;
  }

  if (!session.processedRepos.includes(repoName)) {
    session.processedRepos.push(repoName);
  }

  fs.writeFileSync(BATCH_SESSION_FILE, JSON.stringify(session, null, 2));
}

/**
 * Clear batch session (called at end or manually)
 */
export function clearBatchSession(): boolean {
  try {
    if (fs.existsSync(BATCH_SESSION_FILE)) {
      fs.unlinkSync(BATCH_SESSION_FILE);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error clearing batch session:', error);
    return false;
  }
}

/**
 * Get batch session progress
 */
export function getBatchProgress(): string {
  const session = getBatchSession();
  if (!session) {
    return 'No active batch session';
  }

  const processed = session.processedRepos.length;
  const total = session.totalRepos;
  const percentage = Math.round((processed / total) * 100);

  return `Batch Progress: ${processed}/${total} repos (${percentage}%)`;
}

/**
 * Format batch session for display
 */
export function formatBatchSession(session: BatchSessionState): string {
  const duration = Date.now() - new Date(session.startedAt).getTime();
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  return `
📦 Active Batch Session

Session ID: ${session.sessionId}
Started: ${new Date(session.startedAt).toLocaleString()}
Duration: ${hours}h ${minutes}m
Total Repos: ${session.totalRepos}
Batch Size: ${session.batchSize}
Processed: ${session.processedRepos.length}/${session.totalRepos}

Configuration:
  Route: ${session.answers.route || 'not set'}
  Transmission: ${session.answers.transmission || 'not set'}
  Spec Output: ${session.answers.spec_output_location || 'current directory'}
  Build Location: ${session.answers.build_location || 'greenfield/'}
  Target Stack: ${session.answers.target_stack || 'not set'}
`.trim();
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
