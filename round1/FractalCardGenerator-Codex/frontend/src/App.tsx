import {useEffect, useMemo, useState} from 'react';

import {fetchMethods, generateCard, surpriseCard} from './api/client';
import {
  FRACTAL_METHOD_OPTIONS,
  type CardImageResponse,
  type FractalMethod,
  type FractalMethodOption,
} from './shared/types';
import './App.css';

function methodLabel(methods: ReadonlyArray<FractalMethodOption>, method: FractalMethod): string {
  const match = methods.find(entry => entry.id === method);
  return match ? match.label : method;
}

export default function App(): JSX.Element {
  const [methods, setMethods] = useState<ReadonlyArray<FractalMethodOption>>(FRACTAL_METHOD_OPTIONS);
  const [selectedMethod, setSelectedMethod] = useState<FractalMethod>(FRACTAL_METHOD_OPTIONS[0].id);
  const [card, setCard] = useState<CardImageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMethods()
      .then(payload => {
        setMethods(payload.methods);
        if (payload.methods.length > 0) {
          setSelectedMethod(payload.methods[0].id);
        }
      })
      .catch(loadError => {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load methods.';
        setError(message);
      });
  }, []);

  const statusText = useMemo(() => {
    if (isLoading) {
      return 'Generating card design...';
    }

    if (card) {
      const pct = Math.round(card.coverage * 100);
      return `${methodLabel(methods, card.method)} generated • ${pct}% coverage`;
    }

    return 'Choose a fractal method and generate a print-ready design.';
  }, [isLoading, card, methods]);

  const runGenerate = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const payload = await generateCard({method: selectedMethod});
      setCard(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const runSurprise = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const payload = await surpriseCard({});
      setCard(payload);
      setSelectedMethod(payload.method);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="panel controls">
        <header>
          <p className="eyebrow">Fractal Back Card Generator</p>
          <h1>Print-quality seamless card backs</h1>
          <p className="status">{statusText}</p>
        </header>

        <label htmlFor="method" className="field-label">
          Fractal Method
        </label>
        <select
          id="method"
          value={selectedMethod}
          onChange={event => setSelectedMethod(event.target.value as FractalMethod)}
          disabled={isLoading}
        >
          {methods.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="actions">
          <button type="button" onClick={runGenerate} disabled={isLoading}>
            Go
          </button>
          <button type="button" className="secondary" onClick={runSurprise} disabled={isLoading}>
            Surprise Me
          </button>
        </div>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel preview" aria-live="polite">
        {card ? (
          <>
            <img src={card.imageDataUrl} alt={`${methodLabel(methods, card.method)} generated card back`} />
            <dl>
              <div>
                <dt>Method</dt>
                <dd>{methodLabel(methods, card.method)}</dd>
              </div>
              <div>
                <dt>Seed</dt>
                <dd>{card.seed}</dd>
              </div>
              <div>
                <dt>Iterations</dt>
                <dd>{card.iterations}</dd>
              </div>
              <div>
                <dt>DPI</dt>
                <dd>{card.dpi}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="placeholder">
            <p>Generated card preview will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
