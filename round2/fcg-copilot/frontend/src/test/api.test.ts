import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCard, ApiError } from '../lib/api';

describe('generateCard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns response when fetch succeeds', async () => {
    const mockResponse = {
      image: 'data:image/jpeg;base64,abc',
      method: 'mandelbrot',
      params: { iterations: 500, zoom: 1, seed: 42, colorMode: 'PRIMARY', baseHue: 180 },
      metadata: { durationMs: 200, retries: 0, warnings: [], coverage: 0.9 },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generateCard({ method: 'mandelbrot' });
    expect(result.method).toBe('mandelbrot');
    expect(result.image).toContain('data:image/jpeg');
  });

  it('throws ApiError on 400', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'VALIDATION_ERROR', message: 'Bad method' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(generateCard({ method: 'mandelbrot' })).rejects.toThrow(ApiError);
  });

  it('sends empty body for Surprise Me (no method)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        image: 'data:image/jpeg;base64,x',
        method: 'julia',
        params: { iterations: 500, zoom: 1, seed: 1, colorMode: 'TRIAD', baseHue: 90 },
        metadata: { durationMs: 100, retries: 0, warnings: [], coverage: 0.95 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await generateCard({});
    const [, init] = (fetchMock.mock.calls[0] ?? []) as [string, RequestInit];
    const body = JSON.parse((init?.body as string) ?? '{}') as Record<string, unknown>;
    expect(body).not.toHaveProperty('method');
  });
});
