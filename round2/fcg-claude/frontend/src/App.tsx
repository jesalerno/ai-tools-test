// Top-level screen: method dropdown + Go / Surprise Me buttons + card display.

import { useCallback, useState } from 'react';
import type { JSX } from 'react';
import type { FractalMethod, GenerateCardResponse } from './shared/types';
import { ApiError, generateCard } from './api/client';
import { MethodSelect } from './components/MethodSelect';
import { CardDisplay } from './components/CardDisplay';
import { ErrorBoundary } from './components/ErrorBoundary';

const DEFAULT_METHOD: FractalMethod = 'MANDELBROT';

// Spec §3.3: non-background coverage target for each generated card.
const COVERAGE_THRESHOLD = 0.8;

interface CoverageBadgeProps {
  readonly coverage: number;
}

const CoverageBadge = ({ coverage }: CoverageBadgeProps): JSX.Element => {
  const pct = (coverage * 100).toFixed(1);
  const meets = coverage >= COVERAGE_THRESHOLD;
  const tone = meets
    ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30'
    : 'bg-amber-500/15 text-amber-200 ring-amber-400/30';
  return (
    <span
      data-testid="coverage-badge"
      data-meets-threshold={meets ? 'true' : 'false'}
      title={`Target ≥ ${(COVERAGE_THRESHOLD * 100).toFixed(0)}% (spec §3.3)`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${tone}`}
    >
      <span aria-hidden>{meets ? '✓' : '⚠'}</span>
      {pct}%
      <span className="text-white/40">/ ≥{(COVERAGE_THRESHOLD * 100).toFixed(0)}%</span>
    </span>
  );
};

interface UiError {
  readonly code: string;
  readonly message: string;
}

const toUiError = (err: unknown): UiError => {
  if (err instanceof ApiError) return { code: err.code, message: err.message };
  if (err instanceof Error) return { code: 'UNEXPECTED', message: err.message };
  return { code: 'UNEXPECTED', message: 'Unexpected error' };
};

const useGenerate = () => {
  const [method, setMethod] = useState<FractalMethod>(DEFAULT_METHOD);
  const [card, setCard] = useState<GenerateCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const run = useCallback(async (useMethod: FractalMethod | null): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateCard(useMethod);
      setCard(res);
      // "Surprise Me" contract: sync dropdown to the server's chosen method.
      setMethod(res.method);
    } catch (err) {
      setError(toUiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { method, setMethod, card, loading, error, run };
};

const AppInner = (): JSX.Element => {
  const { method, setMethod, card, loading, error, run } = useGenerate();
  const onGo = (): void => {
    void run(method);
  };
  const onSurprise = (): void => {
    void run(null);
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 text-white">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">fcg-claude</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Fractal Card Generator</h1>
        <p className="max-w-lg text-sm text-white/70">
          Generate print-quality fractal card backs. Pick a method and hit Go, or let the
          server surprise you.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <form
          className="flex flex-col gap-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col gap-2 text-sm text-white/80" htmlFor="method">
            Fractal method
            <MethodSelect value={method} onChange={setMethod} disabled={loading} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              data-testid="go-button"
              onClick={onGo}
              disabled={loading}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium shadow hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/60 disabled:opacity-60"
            >
              Go
            </button>
            <button
              type="button"
              data-testid="surprise-button"
              onClick={onSurprise}
              disabled={loading}
              className="rounded-lg bg-white/10 px-5 py-2.5 font-medium ring-1 ring-white/15 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
            >
              Surprise Me
            </button>
          </div>
          {error && (
            <p
              role="alert"
              data-testid="error-message"
              className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/30"
            >
              <span className="font-mono text-xs text-red-300/80">{error.code}</span>{' '}
              — {error.message}
            </p>
          )}
          {card && (
            <dl
              data-testid="card-metadata"
              className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60"
            >
              <dt>Seed</dt>
              <dd data-testid="card-seed">{card.seed}</dd>
              <dt>Harmony</dt>
              <dd>{card.harmony}</dd>
              <dt>Base hue</dt>
              <dd>{card.baseHue}°</dd>
              <dt>Duration</dt>
              <dd>{card.metadata.durationMs} ms</dd>
              <dt>Coverage</dt>
              <dd data-testid="card-coverage">
                <CoverageBadge coverage={card.metadata.coverage} />
              </dd>
            </dl>
          )}
        </form>
        <CardDisplay loading={loading} card={card} />
      </div>
    </main>
  );
};

export const App = (): JSX.Element => (
  <ErrorBoundary>
    <AppInner />
  </ErrorBoundary>
);
