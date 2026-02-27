/**
 * Main App component
 */

import React, { useState } from 'react';
import './App.css';
import { FractalMethod, FRACTAL_METHODS } from './shared/types';
import { generateCard } from './api/cardApi';

interface AppState {
  selectedMethod: FractalMethod;
  imageData: string | null;
  loading: boolean;
  error: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    selectedMethod: 'mandelbrot',
    imageData: null,
    loading: false,
    error: null
  });

  const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({
      ...prev,
      selectedMethod: event.target.value as FractalMethod
    }));
  };

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await generateCard(state.selectedMethod);

      if (response.success && response.imageData) {
        setState(prev => ({
          ...prev,
          imageData: response.imageData || null,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to generate card',
          loading: false
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        loading: false
      }));
    }
  };

  const handleSurpriseMe = async () => {
    const randomMethod = FRACTAL_METHODS[Math.floor(Math.random() * FRACTAL_METHODS.length)];

    setState(prev => ({
      ...prev,
      selectedMethod: randomMethod.id,
      loading: true,
      error: null
    }));

    try {
      const response = await generateCard(randomMethod.id);

      if (response.success && response.imageData) {
        setState(prev => ({
          ...prev,
          imageData: response.imageData || null,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to generate card',
          loading: false
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        loading: false
      }));
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Fractal Card Generator</h1>
          <p className="subtitle">Generate beautiful fractal playing card back designs</p>
        </header>

        <div className="controls">
          <div className="control-group">
            <label htmlFor="fractal-method" className="label">
              Fractal Method
            </label>
            <select
              id="fractal-method"
              className="select"
              value={state.selectedMethod}
              onChange={handleMethodChange}
              disabled={state.loading}
            >
              {FRACTAL_METHODS.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
            <p className="description">
              {FRACTAL_METHODS.find(m => m.id === state.selectedMethod)?.description}
            </p>
          </div>

          <div className="button-group">
            <button
              className="button button-primary"
              onClick={handleGenerate}
              disabled={state.loading}
            >
              {state.loading ? 'Generating...' : 'Go'}
            </button>
            <button
              className="button button-secondary"
              onClick={handleSurpriseMe}
              disabled={state.loading}
            >
              Surprise Me
            </button>
          </div>
        </div>

        {state.error && (
          <div className="error">
            <p>{state.error}</p>
          </div>
        )}

        {state.imageData && (
          <div className="image-container">
            <img
              src={`data:image/jpeg;base64,${state.imageData}`}
              alt="Generated fractal card"
              className="card-image"
            />
          </div>
        )}

        {!state.imageData && !state.loading && !state.error && (
          <div className="placeholder">
            <p>Select a fractal method and click "Go" to generate a card</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
