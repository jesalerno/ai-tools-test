import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MethodSelector } from '../components/MethodSelector';
import { CardDisplay } from '../components/CardDisplay';
import type { GenerateResponse } from '../shared/types';

describe('MethodSelector', () => {
  it('renders the label and 11 options (no random option)', () => {
    render(
      <MethodSelector value="mandelbrot" onChange={vi.fn()} isDisabled={false} />
    );
    expect(screen.getByLabelText('Select fractal method')).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(11);
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
      <MethodSelector value="mandelbrot" onChange={vi.fn()} isDisabled={true} />
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

  it('shows coverage chip with passing state when coverage >= 80%', () => {
    const result: GenerateResponse = {
      image: 'data:image/jpeg;base64,abc123',
      method: 'mandelbrot',
      params: { iterations: 500, zoom: 1, seed: 42, colorMode: 'PRIMARY', baseHue: 180 },
      metadata: { durationMs: 200, retries: 0, warnings: [], coverage: 0.9 },
    };
    render(<CardDisplay isLoading={false} result={result} />);
    const chip = screen.getByLabelText(/coverage 90\.0 percent/i);
    expect(chip).toHaveAccessibleName(/meets the 80 percent threshold/i);
  });

  it('shows coverage chip with failing state when coverage < 80%', () => {
    const result: GenerateResponse = {
      image: 'data:image/jpeg;base64,abc',
      method: 'julia',
      params: { iterations: 500, zoom: 1, seed: 1, colorMode: 'TRIAD', baseHue: 90 },
      metadata: { durationMs: 100, retries: 3, warnings: ['Coverage below threshold'], coverage: 0.7 },
    };
    render(<CardDisplay isLoading={false} result={result} />);
    const chip = screen.getByLabelText(/coverage 70\.0 percent/i);
    expect(chip).toHaveAccessibleName(/below the 80 percent threshold/i);
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
