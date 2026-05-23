import { beforeEach, describe, expect, it, vi } from 'vitest';

const chatCreate = vi.fn();
const responsesCreate = vi.fn();
const messagesStreamMock = vi.fn();

vi.mock('openai', () => ({
  default: class {
    public chat = { completions: { create: chatCreate } };
    public responses = { create: responsesCreate };
    public models = { list: async () => ({ data: [{ id: 'gpt-4o' }] }) };
    constructor(public opts: unknown) {}
  }
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    public messages = { stream: messagesStreamMock };
    constructor(public opts: { apiKey: string }) {}
  }
}));

const { OpenAIProvider } = await import('../../src/providers/openai');
const { ClaudeProvider } = await import('../../src/providers/claude');
const { ConfigKeys } = await import('../../src/config');

function openaiCtx(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    [ConfigKeys.OPENAI_MODEL]: 'gpt-4o',
    [ConfigKeys.OPENAI_TEMPERATURE]: 0.7,
    [ConfigKeys.OPENAI_API_TYPE]: 'completion',
    ...overrides
  };
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T =>
        (values[key] as T) ?? (defaultValue as T)
    } as never,
    secrets: {
      getApiKey: async () => 'sk-test-aaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

function claudeCtx() {
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T => {
        if (key === ConfigKeys.CLAUDE_MODEL) {
          return 'claude-sonnet-4-5' as unknown as T;
        }
        if (key === ConfigKeys.CLAUDE_TEMPERATURE) {
          return 0.5 as unknown as T;
        }
        return defaultValue as T;
      }
    } as never,
    secrets: {
      getApiKey: async () => 'sk-ant-test',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

async function collect(stream: AsyncIterable<string>): Promise<string> {
  let out = '';
  for await (const chunk of stream) out += chunk;
  return out;
}

describe('OpenAIProvider.generateStream (chat completions)', () => {
  beforeEach(() => {
    chatCreate.mockReset();
    responsesCreate.mockReset();
  });

  it('yields delta content from each chunk', async () => {
    const chunks = [
      { choices: [{ delta: { content: 'feat: ' } }] },
      { choices: [{ delta: { content: 'add ' } }] },
      { choices: [{ delta: { content: 'login' } }] }
    ];
    chatCreate.mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        for (const c of chunks) yield c;
      }
    });

    const provider = new OpenAIProvider(openaiCtx());
    const text = await collect(
      provider.generateStream([{ role: 'user', content: 'diff' }])
    );
    expect(text).toBe('feat: add login');
    const opts = chatCreate.mock.calls[0]?.[0] as { stream: boolean };
    expect(opts.stream).toBe(true);
  });
});

describe('OpenAIProvider.generateStream (responses API)', () => {
  beforeEach(() => {
    chatCreate.mockReset();
    responsesCreate.mockReset();
  });

  it('yields response.output_text.delta events', async () => {
    const events = [
      { type: 'response.output_text.delta', delta: 'fix: ' },
      { type: 'response.output_text.delta', delta: 'bug' },
      { type: 'response.completed' }
    ];
    responsesCreate.mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        for (const e of events) yield e;
      }
    });

    const provider = new OpenAIProvider(
      openaiCtx({ [ConfigKeys.OPENAI_API_TYPE]: 'response' })
    );
    const text = await collect(
      provider.generateStream([{ role: 'user', content: 'diff' }])
    );
    expect(text).toBe('fix: bug');
  });
});

describe('ClaudeProvider.generateStream', () => {
  beforeEach(() => messagesStreamMock.mockReset());

  it('yields content_block_delta text events', async () => {
    const events = [
      { type: 'message_start' },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'feat: ' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hello' } },
      { type: 'message_stop' }
    ];
    messagesStreamMock.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        for (const e of events) yield e;
      }
    });

    const provider = new ClaudeProvider(claudeCtx());
    const text = await collect(
      provider.generateStream([
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'diff' }
      ])
    );
    expect(text).toBe('feat: hello');
  });
});
