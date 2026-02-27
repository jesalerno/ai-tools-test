/**
 * Main App Component
 */

import { useState } from 'react';
import { FractalMethod } from './shared/types';
import { apiClient, ApiError } from './services/api-client';
import './App.css';

const FRACTAL_METHOD_LABELS: Record<FractalMethod, string> = {
  [FractalMethod.MANDELBROT]: 'Mandelbrot Set',
  [FractalMethod.JULIA]: 'Julia Set',
  [FractalMethod.BURNING_SHIP]: 'Burning Ship',
  [FractalMethod.NEWTON]: 'Newton Fractal',
  [FractalMethod.LYAPUNOV]: 'Lyapunov Fractal',
  [FractalMethod.IFS]: 'Iterated Function System',
  [FractalMethod.L_SYSTEM]: 'L-System',
  [FractalMethod.STRANGE_ATTRACTOR]: 'Strange Attractor',
  [FractalMethod.HEIGHTMAP]: 'Heightmap',
  [FractalMethod.FLAME]: 'Flame Fractal',
  [FractalMethod.COMPLEX_FUNCTION]: 'Complex Function'
};

function App() {
  const [selectedMethod, setSelectedMethod] = useState<FractalMethod>(FractalMethod.MANDELBROT);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSeed, setLastSeed] = useState<number | null>(null);

  const handleGenerate = async (surpriseMe: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const method = surpriseMe ? getRandomMethod() : selectedMethod;
      const response = await apiClient.generateCard(method);
      
      setImageData(response.imageData);
      setLastSeed(response.seed);
      
      if (surpriseMe) {
        setSelectedMethod(response.method);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRandomMethod = (): FractalMethod => {
    const methods = Object.values(FractalMethod);
    const randomIndex = Math.floor(Math.random() * methods.length);
    return methods[randomIndex];
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fractal Card Generator</h1>
        <p className="subtitle">Create beautiful fractal-based playing card designs</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <div className="control-group">
            <label htmlFor="fractal-method">Fractal Method:</label>
            <select
              id="fractal-method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as FractalMethod)}
              disabled={loading}
            >
              {Object.entries(FRACTAL_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Generating...' : 'Go'}
            </button>
            
            <button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              className="btn btn-secondary"
            >
              Surprise Me
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {imageData && !error && (
          <div className="card-display">
            <img
              src={`data:image/jpeg;base64,${imageData}`}
              alt="Generated fractal card"
              className="card-image"
            />
            <div className="card-info">
              <p><strong>Method:</strong> {FRACTAL_METHOD_LABELS[selectedMethod]}</p>
              {lastSeed !== null && <p><strong>Seed:</strong> {lastSeed}</p>}
            </div>
          </div>
        )}

        {!imageData && !loading && !error && (
          <div className="placeholder">
            <p>Select a fractal method and click "Go" to generate a card</p>
            <p>Or click "Surprise Me" for a random design!</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Fractal Card Generator &copy; 2026 | MIT License</p>
      </footer>
    </div>
  );
}

export default App;
