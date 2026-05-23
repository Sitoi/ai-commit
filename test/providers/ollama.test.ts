import { beforeEach, describe, expect, it, vi } from 'vitest';

const chatCreate = vi.fn();

vi.mock('openai', () => ({
  default: class {
    public chat = { completions: { create: chatCreate } };
    constructor(public opts: { apiKey: string; baseURL: string }) {}
  }
}));

const { OllamaProvider } = await import('../../src/providers/ollama');
const { ConfigKeys } = await import('../../src/config');

function makeCtx(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    [ConfigKeys.OLLAMA_MODEL]: 'llama3.2',
    [ConfigKeys.OLLAMA_TEMPERATURE]: 0.7,
    [ConfigKeys.OLLAMA_BASE_URL]: 'http://localhost:11434/v1',
    ...overrides
  };
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T =>
        (values[key] as T) ?? (defaultValue as T)
    } as never,
    secrets: {
      getApiKey: async () => '',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

describe('OllamaProvider', () => {
  beforeEach(() => chatCreate.mockReset());

  it('does not require an API key', () => {
    const provider = new OllamaProvider(makeCtx());
    expect(provider.requiresApiKey).toBe(false);
  });

  it('uses configured model name', async () => {
    chatCreate.mockResolvedValue({
      choices: [{ message: { content: 'feat: add login' } }]
    });
    const provider = new OllamaProvider(
      makeCtx({ [ConfigKeys.OLLAMA_MODEL]: 'qwen2.5' })
    );
    await provider.generate([{ role: 'user', content: 'diff' }]);
    const args = chatCreate.mock.calls[0]?.[0] as { model: string };
    expect(args.model).toBe('qwen2.5');
  });

  it('forwards AbortSignal in request options', async () => {
    chatCreate.mockResolvedValue({
      choices: [{ message: { content: 'ok' } }]
    });
    const controller = new AbortController();
    const provider = new OllamaProvider(makeCtx());
    await provider.generate([{ role: 'user', content: 'x' }], {
      signal: controller.signal
    });
    const opts = chatCreate.mock.calls[0]?.[1] as { signal?: AbortSignal };
    expect(opts?.signal).toBe(controller.signal);
  });

  it('throws when Ollama returns an empty response', async () => {
    chatCreate.mockResolvedValue({ choices: [{ message: { content: '' } }] });
    const provider = new OllamaProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/empty response/);
  });
});

describe('OllamaProvider.validate', () => {
  beforeEach(() => {
    chatCreate.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('rejects when Ollama is unreachable', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('ECONNREFUSED')
    );
    const provider = new OllamaProvider(makeCtx());
    await expect(provider.validate()).rejects.toThrow(/Cannot reach Ollama/);
  });

  it('accepts when /api/tags returns OK', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200
    });
    const provider = new OllamaProvider(makeCtx());
    await expect(provider.validate()).resolves.toBeUndefined();
  });

  it('listModels returns the names from /api/tags', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: 'llama3.2' }, { name: 'qwen2.5' }]
      })
    });
    const provider = new OllamaProvider(makeCtx());
    const models = await provider.listModels();
    expect(models).toEqual(['llama3.2', 'qwen2.5']);
  });
});
