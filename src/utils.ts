import * as vscode from 'vscode';

/**
 * Waits for a specified amount of time before resolving the promise.
 * 
 * @param {number} timeMs - The time in milliseconds to wait before resolving the promise.
 * @returns {Promise<number>} - A promise that resolves after the specified time.
 */
export async function wait(timeMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(1), timeMs));
}

/**
 * Displays an information message in the VS Code window.
 * 
 * @param {string} message - The message to display.
 */
export async function infoMsg(message: string) {
  vscode.window.showInformationMessage(`[ai-commit] ${message}`);
}

/**
 * Displays an error message in the VS Code window.
 * 
 * @param {string} msg - The error message.
 * @param {any} err - The error object.
 */
export async function errMsg(msg: string, err: any) {
  vscode.window.showErrorMessage(`[ai-commit] ${msg}, Error: ${err.message}`);
}

/**
 * Removes conventional commit words from a message.
 * 
 * @param {string} message - The message to modify.
 * @returns {string} - The modified message.
 */
export function removeConventionalCommitWord(message: string): string {
  return message.replace(/^(fix|feat)\((.+?)\):/, '($2):');
}
