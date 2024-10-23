import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';

/**
 * Retrieves the diff of staged changes in the specified Git repository.
 * 
 * @param {object} repo - The repository object containing the root URI.
 * @returns {Promise<string>} - A promise that resolves to the diff string of staged changes.
 * @throws {Error} - Throws an error if unable to read the Git diff.
 */
export async function getDiffStaged(repo): Promise<string> {
  let rootPath = null;
  if (typeof repo === 'object' && repo.rootUri) {
    rootPath = repo.rootUri.fsPath;
  } else {
    rootPath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : null;
  }
  const git: SimpleGit = simpleGit(rootPath);
  try {
    const diff = await git.diff(['--staged']);
    if (!diff) {
      console.warn('No changes staged for commit.');
      return 'No changes staged.';
    }
    return diff;
  } catch (error) {
    console.error(`Error reading Git diff for staged:`, error);
    throw error;
  }
}
