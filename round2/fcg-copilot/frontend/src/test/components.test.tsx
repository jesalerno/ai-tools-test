import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MethodSelector } from '../components/MethodSelector';
import { CardDisplay } from '../components/CardDisplay';
import type { GenerateResponse } from '../shared/types';

describe('MethodSelector', () => {
  it('renders the label and 12 options (11 methods + random)', () => {
    render(
      <MethodSelector value={null} onChange={vi.fn()} isDisabled={false} />
    );
    expect(screen.getByLabelText('Select fractal method')).toBeInTheDocument();
    // 1 random + 11 methods
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(12);
  });

  it('shows selected value when provided', () => {
    render(
      <MethodSelector value="mandelbrot" onChange={vi.fn()} isDisabled={false} />
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('mandelbrot');
  });

  it('is disabled when isDisabled=true', () => {
    render(
      <MethodSelector value={null} onChange={vi.fn()} isDisabled={true} />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('CardDisplay', () => {
  it('renders placeholder when no result and not loading', () => {
    render(<CardDisplay isLoading={false} result={null} />);
    expect(screen.getByText(/will appear here/i)).toBeInTheDocument();
  });

  it('renders spinner when loading', () => {
    render(<CardDisplay isLoading={true} result={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Generating/i)).toBeInTheDocument();
  });

  it('renders image when result is provided', () => {
    const result: GenerateResponse = {
      image: 'data:image/jpeg;base64,abc123',
      method: 'mandelbrot',
      params: { iterations: 500, zoom: 1, seed: 42, colorMode: 'PRIMARY', baseHue: 180 },
      metadata: { durationMs: 200, retries: 0, warnings: [], coverage: 0.9 },
    };
    render(<CardDisplay isLoading={false} result={result} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toContain('data:image/jpeg');
    expect(img.alt).toContain('Mandelbrot Set');
  });

  it('shows warning when metadata.warnings is non-empty', () => {
    const result: GenerateResponse = {
      image: 'data:image/jpeg;base64,abc',
      method: 'julia',
      params: { iterations: 500, zoom: 1, seed: 1, colorMode: 'TRIAD', baseHue: 90 },
      metadata: { durationMs: 100, retries: 3, warnings: ['Coverage below threshold'], coverage: 0.7 },
    };
    render(<CardDisplay isLoading={false} result={result} />);
    expect(screen.getByRole('note')).toHaveTextContent('Coverage below threshold');
  });
});
