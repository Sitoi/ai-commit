import { beforeEach, describe, expect, it } from 'vitest';
import { __testHelpers } from './__mocks__/vscode';

const { ConfigurationManager } = await import('../src/config');
const { getMainCommitPrompt } = await import('../src/prompts');

describe('getMainCommitPrompt', () => {
  beforeEach(() => {
    __testHelpers.clearConfig();
    // Force a fresh singleton each test by clearing private static via cast
    (ConfigurationManager as unknown as { instance: unknown }).instance = undefined;
    ConfigurationManager.getInstance({
      // minimum context for ConfigurationManager constructor
      secrets: { get: async () => undefined, store: async () => undefined, delete: async () => undefined },
      globalState: { get: () => undefined, update: async () => undefined },
      subscriptions: []
    } as never);
  });

  it('returns exactly one system message by default', async () => {
    __testHelpers.setConfig('AI_COMMIT_LANGUAGE', 'English');
    const messages = await getMainCommitPrompt();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.role).toBe('system');
  });

  it('interpolates the configured language into the prompt body', async () => {
    __testHelpers.setConfig('AI_COMMIT_LANGUAGE', 'Simplified Chinese');
    const messages = await getMainCommitPrompt();
    expect(messages[0]?.content).toContain('Simplified Chinese');
  });

  it('uses custom system prompt when AI_COMMIT_SYSTEM_PROMPT is set', async () => {
    __testHelpers.setConfig('AI_COMMIT_LANGUAGE', 'English');
    __testHelpers.setConfig('AI_COMMIT_SYSTEM_PROMPT', 'CUSTOM_PROMPT_BODY_XYZ');
    const messages = await getMainCommitPrompt();
    expect(messages[0]?.content).toBe('CUSTOM_PROMPT_BODY_XYZ');
  });

  it('falls back to the built-in template when custom prompt is empty', async () => {
    __testHelpers.setConfig('AI_COMMIT_LANGUAGE', 'English');
    __testHelpers.setConfig('AI_COMMIT_SYSTEM_PROMPT', '');
    const messages = await getMainCommitPrompt();
    expect(messages[0]?.content).toContain('Git Commit Message Guide');
    expect(messages[0]?.content).toContain('feat');
  });
});
