import * as vscode from 'vscode';

export async function wait(timeMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(1), timeMs));
}

export async function infoMsg(message: string) {
  vscode.window.showInformationMessage(`[ai-commit] ${message}`);
}

export async function errMsg(msg: string, err: any) {
  vscode.window.showErrorMessage(`[ai-commit] ${msg}, Error: ${err.message}`);
}

export function removeConventionalCommitWord(message: string): string {
  return message.replace(/^(fix|feat)\((.+?)\):/, '($2):');
}
