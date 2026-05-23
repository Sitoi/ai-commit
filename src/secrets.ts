import * as vscode from 'vscode';
import { Logger } from './logger';

export type SecretProvider = 'openai' | 'claude' | 'gemini' | 'ollama';

const MIGRATED_FLAG = 'ai-commit.secretsMigrated';
const KNOWN_PROVIDERS: SecretProvider[] = ['openai', 'claude', 'gemini'];

export class SecretsManager {
  constructor(private context: vscode.ExtensionContext) {}

  private secretKey(provider: SecretProvider): string {
    return `ai-commit.${provider.toUpperCase()}_API_KEY`;
  }

  async getApiKey(provider: SecretProvider): Promise<string> {
    if (provider === 'ollama') return '';
    return (await this.context.secrets.get(this.secretKey(provider))) ?? '';
  }

  async setApiKey(provider: SecretProvider, value: string): Promise<void> {
    if (provider === 'ollama') return;
    await this.context.secrets.store(this.secretKey(provider), value);
  }

  async deleteApiKey(provider: SecretProvider): Promise<void> {
    if (provider === 'ollama') return;
    await this.context.secrets.delete(this.secretKey(provider));
  }

  /**
   * One-time migration of API keys from settings.json into SecretStorage.
   * Runs idempotently — guarded by globalState flag.
   */
  async migrate(): Promise<void> {
    if (this.context.globalState.get<boolean>(MIGRATED_FLAG)) return;

    const cfg = vscode.workspace.getConfiguration('ai-commit');
    for (const provider of KNOWN_PROVIDERS) {
      const settingKey = `${provider.toUpperCase()}_API_KEY`;
      const value = cfg.get<string>(settingKey);
      if (value && value.trim() !== '') {
        try {
          await this.setApiKey(provider, value.trim());
          await cfg.update(settingKey, '', vscode.ConfigurationTarget.Global);
          Logger.info(`Migrated ${provider} API key from settings to SecretStorage`);
        } catch (err) {
          Logger.warn(`Migration failed for ${provider}; leaving setting in place`, err);
        }
      }
    }
    await this.context.globalState.update(MIGRATED_FLAG, true);
  }
}
