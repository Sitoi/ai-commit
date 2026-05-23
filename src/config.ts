import * as vscode from 'vscode';
import { Logger } from './logger';
import { createOpenAIClient } from './providers/openai';
import type { SecretsManager } from './secrets';

export enum ConfigKeys {
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  OPENAI_BASE_URL = 'OPENAI_BASE_URL',
  OPENAI_MODEL = 'OPENAI_MODEL',
  AZURE_API_VERSION = 'AZURE_API_VERSION',
  AI_COMMIT_LANGUAGE = 'AI_COMMIT_LANGUAGE',
  SYSTEM_PROMPT = 'AI_COMMIT_SYSTEM_PROMPT',
  OPENAI_TEMPERATURE = 'OPENAI_TEMPERATURE',

  GEMINI_API_KEY = 'GEMINI_API_KEY',
  GEMINI_MODEL = 'GEMINI_MODEL',
  GEMINI_TEMPERATURE = 'GEMINI_TEMPERATURE',
  AI_PROVIDER = 'AI_PROVIDER',

  CLAUDE_API_KEY = 'CLAUDE_API_KEY',
  CLAUDE_MODEL = 'CLAUDE_MODEL',
  CLAUDE_TEMPERATURE = 'CLAUDE_TEMPERATURE',

  OPENAI_API_TYPE = 'OPENAI_API_TYPE',
  OPENAI_REASONING_EFFORT = 'OPENAI_REASONING_EFFORT',
  OPENAI_TEXT_VERBOSITY = 'OPENAI_TEXT_VERBOSITY',

  OLLAMA_BASE_URL = 'OLLAMA_BASE_URL',
  OLLAMA_MODEL = 'OLLAMA_MODEL',
  OLLAMA_TEMPERATURE = 'OLLAMA_TEMPERATURE',

  DIFF_MAX_TOKENS = 'DIFF_MAX_TOKENS',
  DIFF_EXCLUDE_PATTERNS = 'DIFF_EXCLUDE_PATTERNS',
  DIFF_INCLUDE_DEFAULT_EXCLUDES = 'DIFF_INCLUDE_DEFAULT_EXCLUDES',

  STREAMING_ENABLED = 'STREAMING_ENABLED'
}

/**
 * Manages the configuration for the AI commit extension.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private configCache: Map<string, unknown> = new Map();
  private disposable: vscode.Disposable;
  private context: vscode.ExtensionContext;
  private secrets?: SecretsManager;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ai-commit')) {
        this.configCache.clear();

        if (event.affectsConfiguration('ai-commit.OPENAI_BASE_URL')) {
          void this.updateOpenAIModelList();
        }
      }
    });
  }

  static getInstance(context?: vscode.ExtensionContext): ConfigurationManager {
    if (!this.instance && context) {
      this.instance = new ConfigurationManager(context);
    }
    return this.instance;
  }

  setSecrets(secrets: SecretsManager) {
    this.secrets = secrets;
  }

  getConfig<T>(key: string, defaultValue?: T): T {
    if (!this.configCache.has(key)) {
      const config = vscode.workspace.getConfiguration('ai-commit');
      this.configCache.set(key, config.get<T>(key, defaultValue as T));
    }
    return this.configCache.get(key) as T;
  }

  dispose() {
    this.disposable.dispose();
  }

  private async updateOpenAIModelList() {
    if (!this.secrets) return;
    try {
      const openai = await createOpenAIClient({
        config: this,
        secrets: this.secrets,
        logger: Logger
      });
      const models = await openai.models.list();
      const availableModels = models.data.map((m) => m.id);
      await this.context.globalState.update('availableOpenAIModels', availableModels);

      const config = vscode.workspace.getConfiguration('ai-commit');
      const currentModel = config.get<string>('OPENAI_MODEL');
      if (currentModel && !availableModels.includes(currentModel)) {
        await config.update(
          'OPENAI_MODEL',
          availableModels[0] ?? 'gpt-4o',
          vscode.ConfigurationTarget.Global
        );
      }
    } catch (error) {
      Logger.error('Failed to fetch OpenAI models:', error);
    }
  }

  public async getAvailableOpenAIModels(): Promise<string[]> {
    if (!this.context.globalState.get<string[]>('availableOpenAIModels')) {
      await this.updateOpenAIModelList();
    }
    return this.context.globalState.get<string[]>('availableOpenAIModels', []);
  }
}
