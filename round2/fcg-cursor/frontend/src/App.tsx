import { useState } from "react";
import { generateCard } from "./api";
import { FRACTAL_METHODS, type FractalMethod, type GenerateCardResponse } from "./shared/types";
import "./styles.css";

const METHOD_LABELS: Record<FractalMethod, string> = {
  MANDELBROT: "Mandelbrot Set",
  JULIA: "Julia Sets",
  BURNING_SHIP: "Burning Ship Fractal",
  NEWTON: "Newton Fractals",
  LYAPUNOV: "Lyapunov Fractals",
  IFS: "Iterated Function Systems",
  L_SYSTEM: "L-System Fractals",
  STRANGE_ATTRACTOR: "Strange Attractors",
  HEIGHTMAP: "Escape-Time Heightmaps",
  FLAME: "Flame Fractals",
  PHASE_PLOT: "Complex Function Phase Plots"
};

export const App = () => {
  const [method, setMethod] = useState<FractalMethod>("MANDELBROT");
  const [result, setResult] = useState<GenerateCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGeneration = async (payload: { method?: FractalMethod }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateCard(payload);
      setResult(response);
      setMethod(response.selectedMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Fractal Card Studio</p>
        <h1>Generate print-ready card backs</h1>
        <p className="subtitle">Pick a method or use surprise mode to create symmetric fractal card backs optimized for front-end preview and local testing.</p>
      </header>

      <div className="content-grid">
        <section className="panel controls-panel">
          <h2>Controls</h2>
          <label htmlFor="method">Fractal method</label>
          <select id="method" value={method} onChange={(event) => setMethod(event.target.value as FractalMethod)} disabled={loading}>
            {FRACTAL_METHODS.map((value) => (
              <option key={value} value={value}>
                {METHOD_LABELS[value]}
              </option>
            ))}
          </select>
          <div className="buttons">
            <button className="primary" onClick={() => void runGeneration({ method })} disabled={loading}>
              {loading ? "Generating..." : "Go"}
            </button>
            <button className="ghost" onClick={() => void runGeneration({})} disabled={loading}>
              Surprise Me
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="panel result-panel">
          <h2>Preview</h2>
          {result ? (
            <>
              <div className="card-scan">
                <img src={result.imageDataUri} alt="Generated fractal card back" />
              </div>
              <div className="meta-row">
                <span className="chip">{METHOD_LABELS[result.selectedMethod]}</span>
                <span className="chip">Coverage {Math.round(result.metadata.coverage * 100)}%</span>
                <span className="chip">{result.metadata.harmonyMode}</span>
              </div>
            </>
          ) : (
            <p className="placeholder">Generate a card to preview it here.</p>
          )}
        </section>
      </div>

      {result?.metadata.warnings.length ? (
        <section className="panel warnings">
          <h2>Warnings</h2>
          <ul>
            {result.metadata.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
};
