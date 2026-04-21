import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App interactions', () => {
  it('runs generation flow and updates preview metadata', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        imageDataUri: 'data:image/jpeg;base64,abc',
        method: 'FLAME',
        seed: 77,
        effectiveParameters: { iterations: 700, zoom: 1.6, harmony: 'TRIAD' },
        metadata: { durationMs: 33, retries: 1, warnings: [] }
      })
    } as Response);

    render(<App />);
    fireEvent.change(screen.getByLabelText('Fractal Method'), { target: { value: 'JULIA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => {
      expect(screen.getByText(/Method=FLAME/)).toBeInTheDocument();
    });
  });
});
