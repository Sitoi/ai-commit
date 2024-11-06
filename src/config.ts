import * as vscode from 'vscode';

/**
 * Configuration keys used in the AI commit extension.
 * @constant {Object}
 * @property {string} OPENAI_API_KEY - The key for OpenAI API.
 * @property {string} OPENAI_BASE_URL - The base URL for OpenAI API.
 * @property {string} OPENAI_MODEL - The model used for OpenAI.
 * @property {string} AZURE_API_VERSION - The version of Azure API.
 * @property {string} AI_COMMIT_LANGUAGE - The language for AI commit messages.
 * @property {string} EMOJI_ENABLED - Flag to enable emoji in commit messages.
 * @property {string} FULL_GITMOJI_SPEC - The full specification for Gitmoji.
 */
export const ConfigKeys = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_BASE_URL: 'OPENAI_BASE_URL',
  OPENAI_MODEL: 'OPENAI_MODEL',
  AZURE_API_VERSION: 'AZURE_API_VERSION',
  AI_COMMIT_LANGUAGE: 'AI_COMMIT_LANGUAGE',
  EMOJI_ENABLED: 'EMOJI_ENABLED',
  FULL_GITMOJI_SPEC: 'FULL_GITMOJI_SPEC'
};

/**
 * Retrieves the configuration value for a given key.
 * 
 * @param {string} key - The configuration key to retrieve.
 * @returns {T} - The value associated with the configuration key, or null if not found.
 */
export function getConfig<T>(key: string): T {
  const config = vscode.workspace.getConfiguration('ai-commit');
  return config.get<T>(key, null as unknown as T);
}
