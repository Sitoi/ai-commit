import type { SecretProvider } from '../secrets';
import type { ChatMessage, GenerateOptions } from '../types/messages';
import type { LLMProvider, ProviderContext, ProviderId } from './types';

export abstract class AbstractLLMProvider implements LLMProvider {
  abstract readonly id: ProviderId;
  abstract readonly displayName: string;
  abstract readonly apiKeyConfigKey: string;
  readonly requiresApiKey: boolean = true;

  constructor(protected readonly ctx: ProviderContext) {}

  async validate(): Promise<void> {
    if (!this.requiresApiKey) return;
    await this.resolveApiKey();
  }

  async generate(messages: ChatMessage[], opts: GenerateOptions = {}): Promise<string> {
    const raw = await this.doGenerate(messages, opts);
    return AbstractLLMProvider.cleanThinkTags(raw);
  }

  protected abstract doGenerate(
    messages: ChatMessage[],
    opts: GenerateOptions
  ): Promise<string>;

  protected async resolveApiKey(): Promise<string> {
    if (!this.requiresApiKey) return '';
    const fromSecrets = await this.ctx.secrets.getApiKey(this.id as SecretProvider);
    if (fromSecrets) return fromSecrets;
    const fromSettings = this.ctx.config.getConfig<string>(this.apiKeyConfigKey);
    if (fromSettings && fromSettings.trim() !== '') {
      return fromSettings.trim();
    }
    throw new Error(`${this.displayName} API Key not configured`);
  }

  static cleanThinkTags(text: string): string {
    if (!text) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }
}
