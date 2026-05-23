import { describe, expect, it } from 'vitest';
import { ClaudeProvider } from '../../src/providers/claude';
import { createProvider } from '../../src/providers/factory';
import { GeminiProvider } from '../../src/providers/gemini';
import { OllamaProvider } from '../../src/providers/ollama';
import { OpenAIProvider } from '../../src/providers/openai';
import type { ProviderContext, ProviderId } from '../../src/providers/types';

function makeContext(providerId: ProviderId): ProviderContext {
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T =>
        (key === 'AI_PROVIDER' ? (providerId as unknown as T) : (defaultValue as T))
    } as ProviderContext['config'],
    secrets: {
      getApiKey: async () => '',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as unknown as ProviderContext['secrets'],
    logger: {} as ProviderContext['logger']
  };
}

describe('createProvider', () => {
  it('returns OpenAIProvider for "openai"', () => {
    expect(createProvider(makeContext('openai'))).toBeInstanceOf(OpenAIProvider);
  });

  it('returns ClaudeProvider for "claude"', () => {
    expect(createProvider(makeContext('claude'))).toBeInstanceOf(ClaudeProvider);
  });

  it('returns GeminiProvider for "gemini"', () => {
    expect(createProvider(makeContext('gemini'))).toBeInstanceOf(GeminiProvider);
  });

  it('returns OllamaProvider for "ollama"', () => {
    expect(createProvider(makeContext('ollama'))).toBeInstanceOf(OllamaProvider);
  });

  it('defaults to OpenAIProvider for unknown ids', () => {
    expect(createProvider(makeContext('unknown' as ProviderId))).toBeInstanceOf(
      OpenAIProvider
    );
  });

  it('marks Ollama as not requiring an API key', () => {
    const provider = createProvider(makeContext('ollama'));
    expect(provider.requiresApiKey).toBe(false);
  });
});
