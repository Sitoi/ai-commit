import * as vscode from 'vscode';
import { ConfigurationManager } from './config';
import { generateCommitMsg } from './generate-commit-msg';
import { Logger } from './logger';
import { OPENAI_COMPATIBLE_PRESETS } from './providers/presets';
import type { SecretProvider } from './secrets';
import { SecretsManager } from './secrets';

const RETRY_LIMIT = 3;

const PROVIDER_OPTIONS: { id: SecretProvider; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'claude', label: 'Claude (Anthropic)' },
  { id: 'gemini', label: 'Gemini (Google)' }
];

export class CommandManager {
  private disposables: vscode.Disposable[] = [];
  private retryCounts = new Map<string, number>();

  constructor(
    private context: vscode.ExtensionContext,
    private secrets: SecretsManager
  ) {}

  registerCommands() {
    this.registerCommand('extension.ai-commit', generateCommitMsg);
    this.registerCommand('extension.configure-ai-commit', async () => {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'ai-commit'
      );
    });

    this.registerCommand('ai-commit.showAvailableModels', async () => {
      const configManager = ConfigurationManager.getInstance();
      const models = await configManager.getAvailableOpenAIModels();
      const selected = await vscode.window.showQuickPick(models, {
        placeHolder: 'Please select a model'
      });
      if (selected) {
        const config = vscode.workspace.getConfiguration('ai-commit');
        await config.update(
          'OPENAI_MODEL',
          selected,
          vscode.ConfigurationTarget.Global
        );
      }
    });

    this.registerCommand('ai-commit.setApiKey', async (...args) => {
      let providerId: SecretProvider | undefined =
        typeof args[0] === 'string'
          ? (args[0] as SecretProvider)
          : undefined;
      if (!providerId) {
        const picked = await vscode.window.showQuickPick(
          PROVIDER_OPTIONS.map((p) => ({ label: p.label, id: p.id })),
          { placeHolder: 'Select provider to configure' }
        );
        if (!picked) return;
        providerId = picked.id;
      }
      const value = await vscode.window.showInputBox({
        password: true,
        ignoreFocusOut: true,
        placeHolder: `Enter ${providerId} API key`,
        prompt: `The key is stored in VS Code SecretStorage, not settings.json.`
      });
      if (!value) return;
      await this.secrets.setApiKey(providerId, value.trim());
      void vscode.window.showInformationMessage(`${providerId} API key saved securely.`);
    });

    this.registerCommand('ai-commit.useOpenAIPreset', async () => {
      const picked = await vscode.window.showQuickPick(
        OPENAI_COMPATIBLE_PRESETS.map((p) => ({
          label: p.displayName,
          detail: p.baseURL,
          description: p.recommendedModels[0] ?? '',
          presetId: p.id
        })),
        { placeHolder: 'Select an OpenAI-compatible provider preset' }
      );
      if (!picked) return;
      const preset = OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === picked.presetId);
      if (!preset) return;

      const cfg = vscode.workspace.getConfiguration('ai-commit');
      await cfg.update('AI_PROVIDER', 'openai', vscode.ConfigurationTarget.Global);
      await cfg.update(
        'OPENAI_BASE_URL',
        preset.baseURL,
        vscode.ConfigurationTarget.Global
      );
      if (preset.recommendedModels[0]) {
        await cfg.update(
          'OPENAI_MODEL',
          preset.recommendedModels[0],
          vscode.ConfigurationTarget.Global
        );
      }

      void vscode.window.showInformationMessage(
        `Configured ${preset.displayName}. Now setting API key...`
      );
      await vscode.commands.executeCommand('ai-commit.setApiKey', 'openai');
    });
  }

  private registerCommand(
    command: string,
    handler: (...args: unknown[]) => unknown | Promise<unknown>
  ) {
    const disposable = vscode.commands.registerCommand(
      command,
      async (...args: unknown[]) => {
        try {
          Logger.info(`Executing command: ${command}`);
          await handler(...args);
          this.retryCounts.delete(command);
        } catch (error) {
          Logger.error(`Command '${command}' failed:`, error);
          const message =
            error instanceof Error ? error.message : String(error);

          const tries = this.retryCounts.get(command) ?? 0;
          const actions: string[] = [];
          if (tries < RETRY_LIMIT) actions.push('Retry');
          actions.push('Set API Key', 'Open Settings');

          const result = await vscode.window.showErrorMessage(
            `Failed: ${message}`,
            ...actions
          );

          if (result === 'Retry') {
            this.retryCounts.set(command, tries + 1);
            await vscode.commands.executeCommand(command, ...args);
          } else if (result === 'Set API Key') {
            this.retryCounts.delete(command);
            await vscode.commands.executeCommand('ai-commit.setApiKey');
          } else if (result === 'Open Settings') {
            this.retryCounts.delete(command);
            await vscode.commands.executeCommand(
              'workbench.action.openSettings',
              'ai-commit'
            );
          }
        }
      }
    );

    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
