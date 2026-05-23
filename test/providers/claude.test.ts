import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    public messages = { create: createMock };
    constructor(public opts: { apiKey: string }) {}
  }
}));

const { ClaudeProvider } = await import('../../src/providers/claude');
const { ConfigKeys } = await import('../../src/config');

function makeCtx() {
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T => {
        if (key === ConfigKeys.CLAUDE_MODEL) return 'claude-sonnet-4-5' as unknown as T;
        if (key === ConfigKeys.CLAUDE_TEMPERATURE) return 0.5 as unknown as T;
        return defaultValue as T;
      }
    } as never,
    secrets: {
      getApiKey: async () => 'sk-ant-test-key-aaaaaaaaaaaaaaaaaaaaaaaa',
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

describe('ClaudeProvider', () => {
  beforeEach(() => createMock.mockReset());

  it('passes system message as the dedicated `system` parameter', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'feat: add login' }]
    });

    const provider = new ClaudeProvider(makeCtx());
    await provider.generate([
      { role: 'system', content: 'YOU_ARE_COMMIT_BOT' },
      { role: 'user', content: 'diff text' }
    ]);

    expect(createMock).toHaveBeenCalledTimes(1);
    const args = createMock.mock.calls[0]?.[0] as {
      system?: string;
      messages: Array<{ role: string; content: string }>;
    };
    expect(args.system).toBe('YOU_ARE_COMMIT_BOT');
    expect(args.messages).toEqual([{ role: 'user', content: 'diff text' }]);
  });

  it('uses configured model and temperature', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }]
    });
    const provider = new ClaudeProvider(makeCtx());
    await provider.generate([{ role: 'user', content: 'x' }]);
    const args = createMock.mock.calls[0]?.[0] as {
      model: string;
      temperature: number;
    };
    expect(args.model).toBe('claude-sonnet-4-5');
    expect(args.temperature).toBe(0.5);
  });
});
