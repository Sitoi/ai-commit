import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';

const rootPath = vscode.workspace.workspaceFolders
  ? vscode.workspace.workspaceFolders[0].uri.fsPath
  : null;

const git: SimpleGit = simpleGit(rootPath);

export async function getDiffStaged(): Promise<string> {
  try {
    const diff = await git.diff(['--staged']);
    return diff;
  } catch (error) {
    console.error(`Error reading Git diff for staged :`, error);
    throw error;
  }
}
