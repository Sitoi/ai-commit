import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';

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
    return diff;
  } catch (error) {
    console.error(`Error reading Git diff for staged :`, error);
    throw error;
  }
}
