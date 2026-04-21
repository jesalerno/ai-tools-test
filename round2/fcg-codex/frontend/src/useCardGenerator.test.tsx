import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCardGenerator } from './useCardGenerator';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCardGenerator', () => {
  it('updates state from successful generation', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        imageDataUri: 'data:image/jpeg;base64,abc',
        method: 'JULIA',
        seed: 42,
        effectiveParameters: { iterations: 500, zoom: 1.5, harmony: 'PRIMARY' },
        metadata: { durationMs: 10, retries: 1, warnings: [] }
      })
    } as Response);

    const { result } = renderHook(() => useCardGenerator());
    await act(async () => {
      await result.current.generate(true);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.selectedMethod).toBe('JULIA');
    expect(result.current.imageDataUri).toContain('data:image/jpeg;base64');
  });

  it('stores error text when request fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Bad payload' })
    } as Response);

    const { result } = renderHook(() => useCardGenerator());
    await act(async () => {
      await result.current.generate(false);
    });

    expect(result.current.error).toBe('Bad payload');
  });
});
