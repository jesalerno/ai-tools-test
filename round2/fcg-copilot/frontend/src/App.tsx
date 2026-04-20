import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { GeneratorControls } from './components/GeneratorControls.js';
import { FractalCard } from './components/FractalCard.js';
import { generateCard } from './api/client.js';
import type { FractalMethod, GenerateResponse } from './shared/types.js';
import './App.css';

interface AppState {
  loading: boolean;
  result: GenerateResponse | null;
  error: string | null;
}

export function App() {
  const [method, setMethod] = useState<FractalMethod>('mandelbrot');
  const [state, setState] = useState<AppState>({ loading: false, result: null, error: null });

  const handleGenerate = async (selectedMethod?: FractalMethod) => {
    setState({ loading: true, result: null, error: null });
    try {
      const result = await generateCard({ method: selectedMethod });
      // Sync dropdown to whichever method was actually used (important for Surprise Me)
      setMethod(result.method);
      setState({ loading: false, result, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setState({ loading: false, result: null, error: msg });
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Fractal Card Generator</h1>
          <p className="app-subtitle">Generate unique playing card backs using fractal algorithms</p>
        </header>
        <main className="app-main">
          <GeneratorControls
            selectedMethod={method}
            onMethodChange={setMethod}
            onGo={() => { void handleGenerate(method); }}
            onSurpriseMe={() => { void handleGenerate(undefined); }}
            loading={state.loading}
          />
          {state.error && (
            <div role="alert" className="error-message">
              <strong>Error:</strong> {state.error}
              <button
                className="btn-retry"
                onClick={() => setState({ loading: false, result: null, error: null })}
              >
                Dismiss
              </button>
            </div>
          )}
          {state.loading && (
            <div role="status" className="loading-indicator">
              <div className="spinner" aria-label="Generating fractal card..." />
              <p>Generating your fractal card…</p>
            </div>
          )}
          {state.result && (
            <FractalCard
              imageSrc={state.result.image}
              method={state.result.method}
              seed={state.result.seed}
              durationMs={state.result.durationMs}
              warnings={state.result.warnings}
            />
          )}
        </main>
        <footer className="app-footer">
          <p>Fractal Card Generator — MIT License</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
