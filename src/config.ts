import * as vscode from 'vscode';

export const ConfigKeys = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_BASE_URL: 'OPENAI_BASE_URL',
  OPENAI_MODEL: 'OPENAI_MODEL',
  AZURE_API_VERSION: 'AZURE_API_VERSION',
  AI_COMMIT_LANGUAGE: 'AI_COMMIT_LANGUAGE',
  EMOJI_ENABLED: 'EMOJI_ENABLED',
  FULL_GITMOJI_SPEC: 'FULL_GITMOJI_SPEC'
};

export function getConfig<T>(key: string): T {
  const config = vscode.workspace.getConfiguration('ai-commit');
  return config.get<T>(key, null as unknown as T);
}
