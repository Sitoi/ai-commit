import * as vscode from 'vscode';

export class ProgressHandler {
  static async withProgress<T>(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>,
      token: vscode.CancellationToken
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

/**
 * Bridge a VS Code CancellationToken to an AbortController so SDK calls can
 * react to the user pressing Cancel on the progress notification.
 */
export function createAbortBridge(
  token: vscode.CancellationToken
): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const sub = token.onCancellationRequested(() => controller.abort());
  return {
    signal: controller.signal,
    dispose: () => sub.dispose()
  };
}
