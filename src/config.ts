import * as vscode from 'vscode';

/**
 * Configuration keys used in the AI commit extension.
 * @constant {Object}
 * @property {string} OPENAI_API_KEY - The key for OpenAI API.
 * @property {string} OPENAI_BASE_URL - The base URL for OpenAI API.
 * @property {string} OPENAI_MODEL - The model used for OpenAI.
 * @property {string} AZURE_API_VERSION - The version of Azure API.
 * @property {string} AI_COMMIT_LANGUAGE - The language for AI commit messages.
 * @property {string} SYSTEM_PROMPT - The system prompt for generating commit messages.
 */
export enum ConfigKeys {
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  OPENAI_BASE_URL = 'OPENAI_BASE_URL',
  OPENAI_MODEL = 'OPENAI_MODEL',
  AZURE_API_VERSION = 'AZURE_API_VERSION',
  AI_COMMIT_LANGUAGE = 'AI_COMMIT_LANGUAGE',
  SYSTEM_PROMPT = 'AI_COMMIT_SYSTEM_PROMPT'
}

/**
 * Manages the configuration for the AI commit extension.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private configCache: Map<string, any> = new Map();
  private disposable: vscode.Disposable;

  private constructor() {
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ai-commit')) {
        this.configCache.clear();
      }
    });
  }

  static getInstance(): ConfigurationManager {
    if (!this.instance) {
      this.instance = new ConfigurationManager();
    }
    return this.instance;
  }

  getConfig<T>(key: string, defaultValue?: T): T {
    if (!this.configCache.has(key)) {
      const config = vscode.workspace.getConfiguration('ai-commit');
      this.configCache.set(key, config.get<T>(key, defaultValue));
    }
    return this.configCache.get(key);
  }

  dispose() {
    this.disposable.dispose();
  }
}
