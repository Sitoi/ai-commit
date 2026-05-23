import simpleGit from 'simple-git';
import * as vscode from 'vscode';
import { Logger } from './logger';

interface GitRepoLike {
  rootUri?: { fsPath: string };
}

/**
 * Retrieves the staged changes from the Git repository.
 */
export async function getDiffStaged(
  repo: GitRepoLike | undefined
): Promise<{ diff: string; error?: string }> {
  try {
    const rootPath =
      repo?.rootUri?.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!rootPath) {
      throw new Error('No workspace folder found');
    }

    const git = simpleGit(rootPath);
    const diff = await git.diff(['--staged']);

    return { diff: diff || 'No changes staged.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error('Error reading Git diff:', err);
    return { diff: '', error: `Failed to read git diff: ${message}` };
  }
}
