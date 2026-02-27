import React, { useState } from 'react';
import { FractalMethod, FRACTAL_METHODS, FractalGenerationResponse } from './shared/types';
import './App.css';

// Use relative URL in production (nginx proxies /api to backend)
// Use absolute URL in development
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');

function App() {
  const [selectedMethod, setSelectedMethod] = useState<FractalMethod>('mandelbrot');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCard = async (method: FractalMethod) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate card: ${response.statusText}`);
      }

      const data: FractalGenerationResponse = await response.json();
      setCardImage(data.imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error generating card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGo = () => {
    generateCard(selectedMethod);
  };

  const handleSurpriseMe = () => {
    const randomMethod = FRACTAL_METHODS[
      Math.floor(Math.random() * FRACTAL_METHODS.length)
    ].value;
    generateCard(randomMethod);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fractal Card Generator</h1>
        <p className="subtitle">
          Generate beautiful fractal designs for playing card backs
        </p>
      </header>

      <main className="App-main">
        <div className="controls">
          <div className="control-group">
            <label htmlFor="fractal-method">Fractal Method:</label>
            <select
              id="fractal-method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as FractalMethod)}
              disabled={loading}
            >
              {FRACTAL_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              className="button button-primary"
              onClick={handleGo}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Go'}
            </button>
            <button
              className="button button-secondary"
              onClick={handleSurpriseMe}
              disabled={loading}
            >
              Surprise Me
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        <div className="card-display">
          {cardImage ? (
            <img
              src={cardImage}
              alt="Generated fractal card"
              className="card-image"
            />
          ) : (
            <p className="card-placeholder">
              Click "Go" or "Surprise Me" to generate a card
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
