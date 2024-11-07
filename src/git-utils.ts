import simpleGit from 'simple-git';
import * as vscode from 'vscode';

/**
 * Retrieves the staged changes from the Git repository.
 */
export async function getDiffStaged(
  repo: any
): Promise<{ diff: string; error?: string }> {
  try {
    const rootPath =
      repo?.rootUri?.fsPath || vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!rootPath) {
      throw new Error('No workspace folder found');
    }

    const git = simpleGit(rootPath);
    const diff = await git.diff(['--staged']);

    return {
      diff: diff || 'No changes staged.',
      error: null
    };
  } catch (error) {
    console.error('Error reading Git diff:', error);
    return { diff: '', error: error.message };
  }
}
