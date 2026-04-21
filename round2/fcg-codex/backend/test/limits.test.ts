import { describe, expect, it } from 'vitest';

import { loadEnv } from '../src/infrastructure/utils/env.js';

describe('env defaults', () => {
  it('loads deterministic defaults for runtime budgets', () => {
    const cfg = loadEnv();
    expect(cfg.MAX_GENERATION_MS).toBe(15000);
    expect(cfg.MAX_CANVAS_MEMORY_BYTES).toBe(134217728);
    expect(cfg.RATE_LIMIT_MAX).toBe(60);
  });
});
