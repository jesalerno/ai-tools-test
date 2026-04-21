import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import type { GenerateCardResponse } from '../shared/types';

const mockCard: GenerateCardResponse = {
  image: 'data:image/jpeg;base64,AAAA',
  method: 'JULIA',
  seed: 1234,
  iterations: 1200,
  zoom: 1.6,
  harmony: 'TRIAD',
  baseHue: 120.5,
  metadata: {
    durationMs: 250,
    retries: 0,
    coverage: 0.9,
    warnings: [],
    correlationId: 'cid-test',
  },
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockSuccess = (body: GenerateCardResponse): void => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response);
};

describe('App — generate flow', () => {
  it('renders the title and both action buttons', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Fractal Card Generator/i })).toBeInTheDocument();
    expect(screen.getByTestId('go-button')).toBeInTheDocument();
    expect(screen.getByTestId('surprise-button')).toBeInTheDocument();
  });

  it('Go button requests the currently selected method and shows the card', async () => {
    mockSuccess({ ...mockCard, method: 'MANDELBROT' });
    render(<App />);
    await userEvent.click(screen.getByTestId('go-button'));
    await waitFor(() => {
      expect(screen.getByTestId('card-image')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ method: 'MANDELBROT' });
    expect(screen.getByTestId('card-seed')).toHaveTextContent('1234');
  });

  it('coverage badge reads pass when coverage ≥ 0.8', async () => {
    mockSuccess({ ...mockCard, metadata: { ...mockCard.metadata, coverage: 0.9 } });
    render(<App />);
    await userEvent.click(screen.getByTestId('go-button'));
    await waitFor(() => {
      expect(screen.getByTestId('coverage-badge')).toBeInTheDocument();
    });
    const badge = screen.getByTestId('coverage-badge');
    expect(badge).toHaveAttribute('data-meets-threshold', 'true');
    expect(badge).toHaveTextContent('90.0%');
  });

  it('coverage badge reads warn when coverage < 0.8', async () => {
    mockSuccess({ ...mockCard, metadata: { ...mockCard.metadata, coverage: 0.42 } });
    render(<App />);
    await userEvent.click(screen.getByTestId('go-button'));
    await waitFor(() => {
      expect(screen.getByTestId('coverage-badge')).toBeInTheDocument();
    });
    const badge = screen.getByTestId('coverage-badge');
    expect(badge).toHaveAttribute('data-meets-threshold', 'false');
    expect(badge).toHaveTextContent('42.0%');
  });

  it('Surprise Me sends no method and syncs the dropdown to the server-chosen method', async () => {
    mockSuccess({ ...mockCard, method: 'FLAME' });
    render(<App />);
    await userEvent.click(screen.getByTestId('surprise-button'));
    await waitFor(() => {
      expect(screen.getByTestId('card-image')).toBeInTheDocument();
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({});
    // Dropdown trigger should now show the FLAME label.
    expect(screen.getByTestId('method-select-trigger')).toHaveTextContent(/Flame/i);
  });

  it('shows an inline error message on API failure and recovers on next click', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'INTERNAL_ERROR', message: 'boom' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCard,
      } as unknown as Response);
    render(<App />);
    await userEvent.click(screen.getByTestId('go-button'));
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/INTERNAL_ERROR/);
    });
    // Click Go again; error clears and card renders.
    await userEvent.click(screen.getByTestId('go-button'));
    await waitFor(() => {
      expect(screen.getByTestId('card-image')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    let resolveFn: (r: Response) => void = () => undefined;
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFn = resolve;
      }),
    );
    render(<App />);
    await userEvent.click(screen.getByTestId('go-button'));
    expect(screen.getByTestId('card-loading')).toBeInTheDocument();
    resolveFn({
      ok: true,
      status: 200,
      json: async () => mockCard,
    } as unknown as Response);
    await waitFor(() => {
      expect(screen.queryByTestId('card-loading')).not.toBeInTheDocument();
    });
  });
});
