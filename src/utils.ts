import * as vscode from 'vscode';

/**
 * Adds progress handling functionality.
 */
export class ProgressHandler {
  static async withProgress<T>(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>
    ) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `[AI Commit] ${title}`,
        cancellable: true
      },
      task
    );
  }
}
