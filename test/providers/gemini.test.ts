import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture what gets passed into getGenerativeModel — this is the key
// regression test: system messages MUST be passed as systemInstruction,
// not flattened into sendMessage(). Previously the bug discarded them.

const getGenerativeModelMock = vi.fn();
const startChatMock = vi.fn();
const sendMessageMock = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor(public apiKey: string) {}
    getGenerativeModel(opts: unknown) {
      getGenerativeModelMock(opts);
      return {
        startChat: (chatOpts: unknown) => {
          startChatMock(chatOpts);
          return {
            sendMessage: async (msg: unknown) => {
              sendMessageMock(msg);
              return { response: { text: () => 'feat: hello' } };
            }
          };
        }
      };
    }
  }
}));

const { GeminiProvider } = await import('../../src/providers/gemini');
const { ConfigKeys } = await import('../../src/config');

function makeCtx(secretKey = 'AIza-test-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
  return {
    config: {
      getConfig: <T,>(key: string, defaultValue?: T): T => {
        if (key === ConfigKeys.GEMINI_MODEL) return 'gemini-2.0-flash-001' as unknown as T;
        if (key === ConfigKeys.GEMINI_TEMPERATURE) return 0.7 as unknown as T;
        return defaultValue as T;
      }
    } as never,
    secrets: {
      getApiKey: async () => secretKey,
      setApiKey: async () => undefined,
      deleteApiKey: async () => undefined,
      migrate: async () => undefined
    } as never,
    logger: {} as never
  };
}

describe('GeminiProvider', () => {
  beforeEach(() => {
    getGenerativeModelMock.mockClear();
    startChatMock.mockClear();
    sendMessageMock.mockClear();
  });

  it('passes system message as systemInstruction (regression for old bug)', async () => {
    const provider = new GeminiProvider(makeCtx());
    await provider.generate([
      { role: 'system', content: 'You are a commit message generator.' },
      { role: 'user', content: 'diff --git ...' }
    ]);

    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1);
    const callArg = getGenerativeModelMock.mock.calls[0]?.[0] as {
      systemInstruction?: { parts: Array<{ text: string }> };
    };
    expect(callArg.systemInstruction).toBeDefined();
    expect(callArg.systemInstruction?.parts?.[0]?.text).toBe(
      'You are a commit message generator.'
    );
  });

  it('does not include system content in sendMessage payload', async () => {
    const provider = new GeminiProvider(makeCtx());
    await provider.generate([
      { role: 'system', content: 'SYSTEM_PROMPT' },
      { role: 'user', content: 'USER_DIFF' }
    ]);
    const payload = sendMessageMock.mock.calls[0]?.[0] as string[];
    expect(payload).not.toContain('SYSTEM_PROMPT');
    expect(payload).toContain('USER_DIFF');
  });

  it('omits systemInstruction when no system message is present', async () => {
    const provider = new GeminiProvider(makeCtx());
    await provider.generate([{ role: 'user', content: 'just user' }]);
    const callArg = getGenerativeModelMock.mock.calls[0]?.[0] as {
      systemInstruction?: unknown;
    };
    expect(callArg.systemInstruction).toBeUndefined();
  });

  it('wraps Gemini errors with a "Gemini API error" prefix', async () => {
    sendMessageMock.mockImplementationOnce(() => {
      throw new Error('quota exceeded');
    });
    const provider = new GeminiProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }])
    ).rejects.toThrow(/Gemini API error: quota exceeded/);
  });

  it('aborts immediately when the signal is already aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    const provider = new GeminiProvider(makeCtx());
    await expect(
      provider.generate([{ role: 'user', content: 'x' }], { signal: ctrl.signal })
    ).rejects.toThrow(/Gemini API error: Aborted/);
  });
});
