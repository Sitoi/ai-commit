import { beforeEach, describe, expect, it, vi } from 'vitest';

const chatCreate = vi.fn();
const responsesCreate = vi.fn();

vi.mock('openai', () => ({
  default: class {
    public chat = { completions: { create: chatCreate } };
    public responses = { create: responsesCreate };
    public models = { list: async () => ({ data: [{ id: 'gpt-4o' }] }) };
    constructor(public opts: unknown) {}
  }
}));

const { OpenAIProvider } = await import('../../src/providers/openai');
const { ConfigKeys } = await import('../../src/config');

function makeCtx(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    [ConfigKeys.OPENAI_MODEL]: 'gpt-4o',
    [ConfigKeys.OPENAI_TEMPERATURE]: 0.3,
    [ConfigKeys.OPENAI_API_TYPE]: 'completion',
    ...overrides
  };
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T =>
        (values[key] as T) ?? (defaultValue as T)
    } as never,
    secrets: {
      getApiKey: async () => 'sk-test-key-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

describe('OpenAIProvider', () => {
  beforeEach(() => {
    chatCreate.mockReset();
    responsesCreate.mockReset();
  });

  it('calls chat.completions.create by default', async () => {
    chatCreate.mockResolvedValue({
      choices: [{ message: { content: 'feat: hello' } }]
    });
    const provider = new OpenAIProvider(makeCtx());
    const text = await provider.generate([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'diff' }
    ]);
    expect(text).toBe('feat: hello');
    expect(chatCreate).toHaveBeenCalledTimes(1);
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it('switches to responses.create when OPENAI_API_TYPE=response', async () => {
    responsesCreate.mockResolvedValue({ output_text: 'fix: bug' });
    const provider = new OpenAIProvider(
      makeCtx({ [ConfigKeys.OPENAI_API_TYPE]: 'response' })
    );
    const text = await provider.generate([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'diff' }
    ]);
    expect(text).toBe('fix: bug');
    expect(responsesCreate).toHaveBeenCalledTimes(1);
    expect(chatCreate).not.toHaveBeenCalled();
  });

  it('forwards AbortSignal in request options', async () => {
    chatCreate.mockResolvedValue({
      choices: [{ message: { content: 'ok' } }]
    });
    const controller = new AbortController();
    const provider = new OpenAIProvider(makeCtx());
    await provider.generate([{ role: 'user', content: 'x' }], {
      signal: controller.signal
    });
    const opts = chatCreate.mock.calls[0]?.[1] as { signal?: AbortSignal };
    expect(opts?.signal).toBe(controller.signal);
  });

  it('maps HTTP 401 to a friendly auth error', async () => {
    chatCreate.mockRejectedValue({ status: 401, message: 'Unauthorized' });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/Invalid OpenAI API key/);
  });

  it('maps HTTP 429 to a rate-limit error', async () => {
    chatCreate.mockRejectedValue({ status: 429 });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/Rate limit exceeded/);
  });

  it('maps HTTP 500 to a server-error message', async () => {
    chatCreate.mockRejectedValue({ status: 500 });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/OpenAI server error/);
  });

  it('maps HTTP 503 to service-unavailable', async () => {
    chatCreate.mockRejectedValue({ status: 503 });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/temporarily unavailable/);
  });

  it('extracts status from err.response.status (legacy shape)', async () => {
    chatCreate.mockRejectedValue({ response: { status: 401 } });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/Invalid OpenAI API key/);
  });

  it('rejects on empty response', async () => {
    chatCreate.mockResolvedValue({ choices: [{ message: { content: '' } }] });
    const provider = new OpenAIProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/empty response/);
  });

  it('listModels returns model ids from the API', async () => {
    const provider = new OpenAIProvider(makeCtx());
    const models = await provider.listModels();
    expect(models).toEqual(['gpt-4o']);
  });

  it('Responses API path also propagates 401 errors', async () => {
    responsesCreate.mockRejectedValue({ status: 401 });
    const provider = new OpenAIProvider(
      makeCtx({ [ConfigKeys.OPENAI_API_TYPE]: 'response' })
    );
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/Invalid OpenAI API key/);
  });

  it('Responses API rejects on empty output_text', async () => {
    responsesCreate.mockResolvedValue({ output_text: '' });
    const provider = new OpenAIProvider(
      makeCtx({ [ConfigKeys.OPENAI_API_TYPE]: 'response' })
    );
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/empty response/);
  });
});
