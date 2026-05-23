import type { ConfigurationManager } from '../config';
import type { Logger } from '../logger';
import type { SecretsManager } from '../secrets';
import type { ChatMessage, GenerateOptions } from '../types/messages';

export type ProviderId = 'openai' | 'claude' | 'gemini' | 'ollama';

export interface ProviderContext {
  config: ConfigurationManager;
  secrets: SecretsManager;
  logger: typeof Logger;
}

export interface LLMProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  readonly apiKeyConfigKey: string;
  readonly requiresApiKey: boolean;

  validate(): Promise<void>;
  generate(messages: ChatMessage[], opts?: GenerateOptions): Promise<string>;
  generateStream?(
    messages: ChatMessage[],
    opts?: GenerateOptions
  ): AsyncIterable<string>;
  listModels?(): Promise<string[]>;
}
