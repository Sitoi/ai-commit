import * as vscode from 'vscode';
import { CommandManager } from './commands';
import { ConfigurationManager } from './config';
import { setSecretsManager } from './generate-commit-msg';
import { Logger } from './logger';
import { createProvider } from './providers/factory';
import type { LLMProvider } from './providers/types';
import { SecretsManager } from './secrets';

async function ensureProviderConfigured(
  provider: LLMProvider,
  configManager: ConfigurationManager,
  secrets: SecretsManager
): Promise<void> {
  if (!provider.requiresApiKey) return;

  const fromSecrets = await secrets.getApiKey(provider.id as 'openai' | 'claude' | 'gemini');
  if (fromSecrets) return;

  const fromSettings = configManager.getConfig<string>(provider.apiKeyConfigKey);
  if (fromSettings && fromSettings.trim() !== '') return;

  const result = await vscode.window.showWarningMessage(
    `${provider.displayName} API Key not configured. Configure now?`,
    'Set API Key',
    'Open Settings',
    'No'
  );
  if (result === 'Set API Key') {
    await vscode.commands.executeCommand('ai-commit.setApiKey', provider.id);
  } else if (result === 'Open Settings') {
    await vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'ai-commit'
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  try {
    Logger.initialize();
    Logger.info('Activating AI Commit extension...');

    const configManager = ConfigurationManager.getInstance(context);
    const secrets = new SecretsManager(context);
    configManager.setSecrets(secrets);
    setSecretsManager(secrets);

    await secrets.migrate();

    const commandManager = new CommandManager(context, secrets);
    commandManager.registerCommands();

    context.subscriptions.push({
      dispose: () => {
        configManager.dispose();
        commandManager.dispose();
        Logger.dispose();
      }
    });

    const provider = createProvider({
      config: configManager,
      secrets,
      logger: Logger
    });
    await ensureProviderConfigured(provider, configManager, secrets);
  } catch (error) {
    Logger.error('Failed to activate extension:', error);
    throw error;
  }
}

export function deactivate() {}
