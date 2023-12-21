import * as vscode from 'vscode';

import aiCommitController from './ai-commit-controller';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.ai-commit', async (arg) => {
      await aiCommitController(arg);
    })
  );
}

export function deactivate() {}
