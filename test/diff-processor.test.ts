import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXCLUDE_PATTERNS,
  processDiff
} from '../src/diff-processor';

const sampleDiff = (path: string, body = 'line1\nline2') =>
  `diff --git a/${path} b/${path}\nindex 1234567..abcdefg 100644\n--- a/${path}\n+++ b/${path}\n@@ -1,2 +1,2 @@\n${body}\n`;

describe('processDiff', () => {
  it('returns empty result for empty diff', () => {
    const result = processDiff('', {
      maxTokens: 1000,
      excludePatterns: []
    });
    expect(result.diff).toBe('');
    expect(result.truncated).toBe(false);
    expect(result.excludedFiles).toEqual([]);
  });

  it('excludes lock files by default', () => {
    const raw = sampleDiff('pnpm-lock.yaml') + sampleDiff('src/app.ts');
    const result = processDiff(raw, {
      maxTokens: 10000,
      excludePatterns: DEFAULT_EXCLUDE_PATTERNS
    });
    expect(result.excludedFiles).toContain('pnpm-lock.yaml');
    expect(result.diff).toContain('src/app.ts');
    expect(result.diff).not.toContain('pnpm-lock.yaml');
  });

  it('excludes generated output directories', () => {
    const raw = sampleDiff('dist/bundle.js') + sampleDiff('src/index.ts');
    const result = processDiff(raw, {
      maxTokens: 10000,
      excludePatterns: DEFAULT_EXCLUDE_PATTERNS
    });
    expect(result.excludedFiles).toContain('dist/bundle.js');
    expect(result.diff).toContain('src/index.ts');
  });

  it('excludes .min files', () => {
    const raw =
      sampleDiff('public/jquery.min.js') + sampleDiff('public/styles.min.css');
    const result = processDiff(raw, {
      maxTokens: 10000,
      excludePatterns: DEFAULT_EXCLUDE_PATTERNS
    });
    expect(result.excludedFiles).toEqual(
      expect.arrayContaining(['public/jquery.min.js', 'public/styles.min.css'])
    );
    expect(result.diff.trim()).toBe('');
  });

  it('respects custom exclude patterns', () => {
    const raw = sampleDiff('src/secrets.ts') + sampleDiff('src/main.ts');
    const result = processDiff(raw, {
      maxTokens: 10000,
      excludePatterns: [/secrets\.ts$/]
    });
    expect(result.excludedFiles).toContain('src/secrets.ts');
    expect(result.diff).toContain('src/main.ts');
  });

  it('truncates when total token estimate exceeds maxTokens', () => {
    const bigBody = 'x'.repeat(40000);
    const raw = sampleDiff('a.ts', bigBody) + sampleDiff('b.ts', 'small body');
    const result = processDiff(raw, {
      maxTokens: 2000,
      excludePatterns: []
    });
    expect(result.truncated).toBe(true);
    expect(result.diff).toContain('truncated due to size limit');
  });

  it('keeps all chunks when under token budget', () => {
    const raw = sampleDiff('a.ts') + sampleDiff('b.ts');
    const result = processDiff(raw, {
      maxTokens: 10000,
      excludePatterns: []
    });
    expect(result.truncated).toBe(false);
    expect(result.diff).toContain('a.ts');
    expect(result.diff).toContain('b.ts');
  });
});
