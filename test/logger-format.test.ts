import { describe, expect, it, vi } from 'vitest';

const appendLine = vi.fn();

vi.mock('vscode', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('./__mocks__/vscode');
  return {
    ...actual,
    window: {
      ...((actual as { window: Record<string, unknown> }).window),
      createOutputChannel: () => ({
        appendLine,
        show: () => undefined,
        dispose: () => undefined
      })
    }
  };
});

const { Logger } = await import('../src/logger');

describe('Logger format & redact pipeline', () => {
  it('uninitialized logger silently swallows messages', () => {
    appendLine.mockReset();
    Logger.info('test message');
    expect(appendLine).not.toHaveBeenCalled();
  });

  it('initialize() enables Output channel writes', () => {
    appendLine.mockReset();
    Logger.initialize();
    Logger.info('hello world');
    expect(appendLine).toHaveBeenCalledTimes(1);
    expect(appendLine.mock.calls[0]?.[0]).toContain('hello world');
  });

  it('formats Error objects with truncated stack', () => {
    appendLine.mockReset();
    Logger.initialize();
    const err = new Error('boom');
    err.stack = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'].join('\n');
    Logger.error('failed', err);
    const out = appendLine.mock.calls[0]?.[0] as string;
    expect(out).toContain('failed');
    expect(out).toContain('boom');
    // Only 6 stack lines should remain
    expect((out.match(/L\d/g) ?? []).length).toBeLessThanOrEqual(6);
  });

  it('JSON-stringifies object arguments', () => {
    appendLine.mockReset();
    Logger.initialize();
    Logger.info('payload:', { provider: 'openai', model: 'gpt-4o' });
    const out = appendLine.mock.calls[0]?.[0] as string;
    expect(out).toContain('"provider": "openai"');
  });

  it('redacts API keys embedded in messages', () => {
    appendLine.mockReset();
    Logger.initialize();
    Logger.info('using sk-abcdefghijklmnopqrstuvwxyz12');
    const out = appendLine.mock.calls[0]?.[0] as string;
    expect(out).not.toContain('sk-abcdefghijklmnopqrstuvwxyz12');
    expect(out).toContain('***');
  });

  it('warn and error are separate levels', () => {
    appendLine.mockReset();
    Logger.initialize();
    Logger.warn('a warning');
    Logger.error('an error');
    expect(appendLine.mock.calls[0]?.[0]).toContain('[WARN]');
    expect(appendLine.mock.calls[1]?.[0]).toContain('[ERROR]');
  });
});
