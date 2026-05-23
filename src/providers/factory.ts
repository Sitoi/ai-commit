import { ConfigKeys } from '../config';
import { ClaudeProvider } from './claude';
import { GeminiProvider } from './gemini';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';
import type { LLMProvider, ProviderContext, ProviderId } from './types';

export function createProvider(ctx: ProviderContext): LLMProvider {
  const id = ctx.config.getConfig<ProviderId>(ConfigKeys.AI_PROVIDER, 'openai');
  switch (id) {
    case 'gemini':
      return new GeminiProvider(ctx);
    case 'claude':
      return new ClaudeProvider(ctx);
    case 'ollama':
      return new OllamaProvider(ctx);
    case 'openai':
    default:
      return new OpenAIProvider(ctx);
  }
}
