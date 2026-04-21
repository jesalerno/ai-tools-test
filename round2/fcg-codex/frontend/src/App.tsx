import { FRACTAL_METHODS, type FractalMethod } from './shared/types';
import { useCardGenerator } from './useCardGenerator';
import './styles.css';

export function App(): JSX.Element {
  const state = useCardGenerator();

  return (
    <main className="app-shell">
      <section className="control-panel">
        <h1>Fractal Card Back Generator</h1>
        <p>Generate deterministic 300-DPI playing-card backs with mirrored fractal symmetry.</p>
        <label htmlFor="method-select">Fractal Method</label>
        <select
          id="method-select"
          value={state.selectedMethod}
          onChange={(event) => state.setSelectedMethod(event.target.value as FractalMethod)}
          disabled={state.isLoading}
        >
          {FRACTAL_METHODS.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
        <div className="button-row">
          <button type="button" onClick={() => void state.generate(false)} disabled={state.isLoading}>Go</button>
          <button type="button" onClick={() => void state.generate(true)} disabled={state.isLoading}>Surprise Me</button>
        </div>
        {state.isLoading ? <p aria-live="polite">Generating...</p> : null}
        {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      </section>

      <section className="preview-panel" aria-live="polite">
        {state.imageDataUri ? <img src={state.imageDataUri} alt="Generated fractal playing card back" /> : <p>No card generated yet.</p>}
        {state.metaText ? <p className="meta">{state.metaText}</p> : null}
      </section>
    </main>
  );
}
