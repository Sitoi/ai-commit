import { describe, expect, it } from 'vitest';
import { redactSecrets } from '../src/logger';

describe('redactSecrets', () => {
  it('redacts OpenAI sk- keys', () => {
    const text = 'API call with key sk-abcd1234567890abcdefghij';
    const out = redactSecrets(text);
    expect(out).not.toContain('abcd1234567890abcd');
    expect(out).toContain('***');
  });

  it('redacts Anthropic sk-ant- keys', () => {
    const text = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz';
    const out = redactSecrets(text);
    expect(out).not.toMatch(/sk-ant-api03-abcdefghijklmnopqrstuvwxyz/);
    expect(out).toContain('***');
  });

  it('redacts Google AIza keys', () => {
    const text = 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const out = redactSecrets(text);
    expect(out).not.toContain('AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  });

  it('redacts Groq gsk_ keys', () => {
    const text = 'gsk_abc123def456ghi789jkl000';
    const out = redactSecrets(text);
    expect(out).toContain('***');
  });

  it('preserves trailing characters for traceability', () => {
    const text = 'sk-abcdefghijklmnopqrstuvxyz9876';
    const out = redactSecrets(text);
    expect(out).toContain('9876');
  });

  it('passes through unmatched text unchanged', () => {
    const text = 'no secret here, just text';
    expect(redactSecrets(text)).toBe(text);
  });
});
