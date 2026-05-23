import { beforeEach, describe, expect, it, vi } from 'vitest';

const diffMock = vi.fn();

vi.mock('simple-git', () => ({
  default: () => ({ diff: diffMock })
}));

const { getDiffStaged } = await import('../src/git-utils');

describe('getDiffStaged', () => {
  beforeEach(() => diffMock.mockReset());

  it('passes --staged to git diff and returns the diff string', async () => {
    diffMock.mockResolvedValue('diff --git a/x b/x\n+hello');
    const result = await getDiffStaged({ rootUri: { fsPath: '/tmp/repo' } });
    expect(diffMock).toHaveBeenCalledWith(['--staged']);
    expect(result.diff).toContain('hello');
    expect(result.error).toBeUndefined();
  });

  it('returns the sentinel string when diff is empty', async () => {
    diffMock.mockResolvedValue('');
    const result = await getDiffStaged({ rootUri: { fsPath: '/tmp/repo' } });
    expect(result.diff).toBe('No changes staged.');
  });

  it('wraps git failures into structured error', async () => {
    diffMock.mockImplementationOnce(() =>
      Promise.reject(new Error('not a git repo'))
    );
    const result = await getDiffStaged({ rootUri: { fsPath: '/tmp/repo' } });
    expect(result.diff).toBe('');
    expect(result.error).toMatch(/Failed to read git diff/);
    expect(result.error).toContain('not a git repo');
  });

  it('throws when no repo and no workspace folder is available', async () => {
    const result = await getDiffStaged(undefined);
    expect(result.diff).toBe('');
    expect(result.error).toMatch(/No workspace folder found/);
  });
});
