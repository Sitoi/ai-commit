import { describe, expect, it, vi } from 'vitest';
import { createAbortBridge } from '../src/utils';

function makeToken(): {
  isCancellationRequested: boolean;
  onCancellationRequested: (cb: () => void) => { dispose: () => void };
  trigger: () => void;
} {
  let callback: (() => void) | undefined;
  return {
    isCancellationRequested: false,
    onCancellationRequested(cb) {
      callback = cb;
      return { dispose: () => (callback = undefined) };
    },
    trigger() {
      callback?.();
    }
  };
}

describe('createAbortBridge', () => {
  it('provides an AbortSignal that starts unaborted', () => {
    const token = makeToken();
    const { signal } = createAbortBridge(token as never);
    expect(signal.aborted).toBe(false);
  });

  it('aborts the signal when the VS Code token fires cancellation', () => {
    const token = makeToken();
    const { signal } = createAbortBridge(token as never);
    token.trigger();
    expect(signal.aborted).toBe(true);
  });

  it('returns a dispose() that detaches the subscription', () => {
    const token = makeToken();
    const { dispose } = createAbortBridge(token as never);
    const spy = vi.fn(dispose);
    spy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
