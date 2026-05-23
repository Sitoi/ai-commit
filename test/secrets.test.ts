import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecretsManager } from '../src/secrets';

type FakeStorage = Map<string, string>;
type FakeState = Map<string, unknown>;

interface FakeContext {
  secrets: {
    get: (key: string) => Promise<string | undefined>;
    store: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  globalState: {
    get: <T>(key: string) => T | undefined;
    update: (key: string, value: unknown) => Promise<void>;
  };
}

function makeContext(): { ctx: FakeContext; storage: FakeStorage; state: FakeState } {
  const storage: FakeStorage = new Map();
  const state: FakeState = new Map();
  const ctx: FakeContext = {
    secrets: {
      get: async (k) => storage.get(k),
      store: async (k, v) => {
        storage.set(k, v);
      },
      delete: async (k) => {
        storage.delete(k);
      }
    },
    globalState: {
      get: <T>(k: string) => state.get(k) as T | undefined,
      update: async (k, v) => {
        state.set(k, v);
      }
    }
  };
  return { ctx, storage, state };
}

describe('SecretsManager', () => {
  let mgr: SecretsManager;
  let storage: FakeStorage;
  let state: FakeState;

  beforeEach(() => {
    const made = makeContext();
    storage = made.storage;
    state = made.state;
    mgr = new SecretsManager(made.ctx as never);
  });

  it('round-trips an OpenAI key', async () => {
    await mgr.setApiKey('openai', 'sk-secret');
    expect(await mgr.getApiKey('openai')).toBe('sk-secret');
  });

  it('returns empty string when no key is stored', async () => {
    expect(await mgr.getApiKey('claude')).toBe('');
  });

  it('deletes a key', async () => {
    await mgr.setApiKey('gemini', 'AIza-test');
    await mgr.deleteApiKey('gemini');
    expect(await mgr.getApiKey('gemini')).toBe('');
  });

  it('treats Ollama as keyless: setApiKey is a no-op', async () => {
    await mgr.setApiKey('ollama', 'irrelevant');
    expect(await mgr.getApiKey('ollama')).toBe('');
    expect(storage.size).toBe(0);
  });

  it('migration is idempotent — second migrate() is a no-op', async () => {
    state.set('ai-commit.secretsMigrated', true);
    const storeSpy = vi.spyOn(mgr, 'setApiKey');
    await mgr.migrate();
    expect(storeSpy).not.toHaveBeenCalled();
  });

  it('marks migration complete after running', async () => {
    expect(state.get('ai-commit.secretsMigrated')).toBeUndefined();
    await mgr.migrate();
    expect(state.get('ai-commit.secretsMigrated')).toBe(true);
  });
});
