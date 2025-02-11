import * as vscode from 'vscode';
import { createOpenAIApi } from './openai-utils';
import { createGeminiAPIClient } from './gemini-utils';

/**
 * Configuration keys used in the AI commit extension.
 * @constant {Object}
 * @property {string} OPENAI_API_KEY - The key for OpenAI API.
 * @property {string} OPENAI_BASE_URL - The base URL for OpenAI API.
 * @property {string} OPENAI_MODEL - The model used for OpenAI.
 * @property {string} AZURE_API_VERSION - The version of Azure API.
 * @property {string} AI_COMMIT_LANGUAGE - The language for AI commit messages.
 * @property {string} SYSTEM_PROMPT - The system prompt for generating commit messages.
 * @property {string} OPENAI_TEMPERATURE - The temperature setting for OpenAI API.
 */
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
}

/**
 * Manages the configuration for the AI commit extension.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private configCache: Map<string, any> = new Map();
  private disposable: vscode.Disposable;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ai-commit')) {
        this.configCache.clear();

        if (event.affectsConfiguration('ai-commit.OPENAI_BASE_URL') ||
          event.affectsConfiguration('ai-commit.OPENAI_API_KEY')) {
          this.updateOpenAIModelList();
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

  /**
   * Updates the list of available OpenAI models.
   */
  private async updateOpenAIModelList() {
    try {
      const openai = createOpenAIApi();
      const models = await openai.models.list();

      // Save available models to extension state
      await this.context.globalState.update('availableOpenAIModels', models.data.map(model => model.id));

      // Get the current selected model
      const config = vscode.workspace.getConfiguration('ai-commit');
      const currentModel = config.get<string>('OPENAI_MODEL');

      // If the current selected model is not in the available list, set it to the default value
      const availableModels = models.data.map(model => model.id);
      if (!availableModels.includes(currentModel)) {
        await config.update('OPENAI_MODEL', 'gpt-4', vscode.ConfigurationTarget.Global);
      }
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error);
    }
  }

  /**
   * Retrieves the list of available OpenAI models.
   * @returns {Promise<string[]>} The list of available OpenAI models.
   */
  public async getAvailableOpenAIModels(): Promise<string[]> {
    if (!this.context.globalState.get<string[]>('availableOpenAIModels')) {
      await this.updateOpenAIModelList();
    }
    return this.context.globalState.get<string[]>('availableOpenAIModels', []);
  }

  /**
   * @deprecated
   * This function is deprecated because Gemini API does not currently support listing models via API.
   * We have to wait for this feature to be updated to the gemini library at some point, or find another way.
   * 
   * Updates the list of available Gemini models.
   */
  /*
  private async updateGeminiModelList() {
    try {
      const geminiAPI = createGeminiAPIClient();
      const modelListResponse = await geminiAPI.listModels(); // Gemini API does not currently have a function to get a list of models
      const availableModels = modelListResponse.models.map(model => model.name);

      // Save available Gemini models to extension global state
      await this.context.globalState.update('availableGeminiModels', availableModels);

      // Get the currently selected Gemini model
      const config = vscode.workspace.getConfiguration('ai-commit');
      const currentModel = config.get<string>('GEMINI_MODEL');

      // If the current selected Gemini model is not in the available list, set it to a default value
      if (currentModel && !availableModels.includes(currentModel)) {
        await config.update('GEMINI_MODEL', 'gemini-2.0-flash-001', vscode.ConfigurationTarget.Global);
      }

    } catch (error) {
      console.error('Failed to fetch Gemini models:', error);
    }
  }
  */

  /**
   * @deprecated
   * This function is deprecated because Gemini API does not currently support listing models via API.
   * 
   * Retrieves the list of available Gemini models.
   * @returns {Promise<string[]>} The list of available Gemini models.
   */
  /*
  public async getAvailableGeminiModels(): Promise<string[]> {
    if (!this.context.globalState.get<string[]>('availableGeminiModels')) {
      await this.updateGeminiModelList();
    }
    return this.context.globalState.get<string[]>('availableGeminiModels', []);
  }
  */
}
