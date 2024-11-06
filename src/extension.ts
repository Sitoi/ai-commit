import * as vscode from 'vscode';

import aiCommitController from './ai-commit-controller';

/**
 * Activates the extension and registers commands.
 * 
 * @param {vscode.ExtensionContext} context - The context for the extension, providing access to extension-related functionality.
 */
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.ai-commit', async (arg) => {
      await aiCommitController(arg);
    })
  );
}

/**
 * Deactivates the extension.
 * This function is called when the extension is deactivated.
 */
export function deactivate() {}
