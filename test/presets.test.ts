import { describe, expect, it } from 'vitest';
import { OPENAI_COMPATIBLE_PRESETS } from '../src/providers/presets';

describe('OPENAI_COMPATIBLE_PRESETS', () => {
  it('includes all 5 documented presets', () => {
    const ids = OPENAI_COMPATIBLE_PRESETS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(['deepseek', 'zhipu', 'qwen', 'groq', 'openrouter'])
    );
  });

  it('each preset has a https baseURL', () => {
    for (const p of OPENAI_COMPATIBLE_PRESETS) {
      expect(p.baseURL).toMatch(/^https:\/\//);
    }
  });

  it('each preset suggests at least one model', () => {
    for (const p of OPENAI_COMPATIBLE_PRESETS) {
      expect(p.recommendedModels.length).toBeGreaterThan(0);
    }
  });
});
