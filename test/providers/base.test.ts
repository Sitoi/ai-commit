import { describe, expect, it } from 'vitest';
import { AbstractLLMProvider } from '../../src/providers/base';

describe('AbstractLLMProvider.cleanThinkTags', () => {
  it('strips <think>...</think> blocks', () => {
    const input = '<think>internal reasoning</think>feat: add feature';
    expect(AbstractLLMProvider.cleanThinkTags(input)).toBe('feat: add feature');
  });

  it('handles multi-line think blocks', () => {
    const input = '<think>\nline1\nline2\n</think>\nfeat: do thing';
    expect(AbstractLLMProvider.cleanThinkTags(input)).toBe('feat: do thing');
  });

  it('strips multiple think blocks', () => {
    const input = '<think>a</think>feat:<think>b</think> work';
    expect(AbstractLLMProvider.cleanThinkTags(input)).toBe('feat: work');
  });

  it('leaves text without think tags untouched', () => {
    const input = 'feat(scope): clean commit';
    expect(AbstractLLMProvider.cleanThinkTags(input)).toBe(input);
  });

  it('returns the original value for empty input', () => {
    expect(AbstractLLMProvider.cleanThinkTags('')).toBe('');
  });
});
