import * as vscode from 'vscode';
import { generateCommitMsg } from './generate-commit-msg';
import { ConfigurationManager } from './config';

/**
 * Manages the registration and disposal of commands.
 */
export class CommandManager {
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  registerCommands() {
    this.registerCommand('extension.ai-commit', generateCommitMsg);
    this.registerCommand('extension.configure-ai-commit', () =>
      vscode.commands.executeCommand('workbench.action.openSettings', 'ai-commit')
    );

    // Show available OpenAI models
    this.registerCommand('ai-commit.showAvailableModels', async () => {
      const configManager = ConfigurationManager.getInstance();
      const models = await configManager.getAvailableOpenAIModels();
      const selected = await vscode.window.showQuickPick(models, {
        placeHolder: 'Please select a model'
      });
      
      if (selected) {
        const config = vscode.workspace.getConfiguration('ai-commit');
        await config.update('OPENAI_MODEL', selected, vscode.ConfigurationTarget.Global);
      }
    });

    /**
     * @deprecated
     * This function is deprecated because Gemini API does not currently support listing models via API.
     * 
     * Show available Gemini models
     */
    /*
    this.registerCommand('ai-commit.showAvailableGeminiModels', async () => {
      const configManager = ConfigurationManager.getInstance();
      const models = await configManager.getAvailableGeminiModels(); // Use the updated function
      const selected = await vscode.window.showQuickPick(models, {
        placeHolder: 'Please select a Gemini model'
      });

      if (selected) {
        const config = vscode.workspace.getConfiguration('ai-commit');
        await config.update('GEMINI_MODEL', selected, vscode.ConfigurationTarget.Global);
      }
    });
    */
  }

  private registerCommand(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        const result = await vscode.window.showErrorMessage(
          `Failed: ${error.message}`,
          'Retry',
          'Configure'
        );

        if (result === 'Retry') {
          await handler(...args);
        } else if (result === 'Configure') {
          await vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'ai-commit'
          );
        }
      }
    });

    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
