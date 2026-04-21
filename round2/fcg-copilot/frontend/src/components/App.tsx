/**
 * Main application component.
 * Orchestrates the fractal card generator UI per spec §2.2.
 */

import { useState } from 'react';
import type { FractalMethod } from '../shared/types';
import { useGenerate } from '../hooks/useGenerate';
import { MethodSelector } from './MethodSelector';
import { CardDisplay } from './CardDisplay';
import { ErrorBoundary } from './ErrorBoundary';

/** Root application component. */
function AppContent() {
  const { isLoading, result, errorMessage, selectedMethod, generate, clearError } = useGenerate();
  const [dropdownMethod, setDropdownMethod] = useState<FractalMethod | null>(null);

  const handleMethodChange = (method: FractalMethod | null) => {
    setDropdownMethod(method);
    clearError();
  };

  const handleGo = async () => {
    // Use dropdown value as method; null means Surprise Me
    await generate(dropdownMethod);
  };

  const handleSurpriseMe = async () => {
    // Surprise Me always uses null (server picks random)
    await generate(null);
  };

  // Sync dropdown when Surprise Me updates the selected method
  if (selectedMethod !== null && dropdownMethod !== selectedMethod && !isLoading) {
    setDropdownMethod(selectedMethod);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Fractal Card Generator</h1>
        <p className="app-subtitle">Generate a unique playing card back using fractal algorithms.</p>
      </header>

      <section className="controls" aria-label="Generation controls">
        <MethodSelector
          value={dropdownMethod}
          onChange={handleMethodChange}
          isDisabled={isLoading}
        />
        <div className="button-row">
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => { void handleGo(); }}
            disabled={isLoading}
            aria-label="Generate card with selected method"
          >
            {isLoading ? 'Generating…' : 'Go'}
          </button>
          <button
            className="btn btn--secondary"
            type="button"
            onClick={() => { void handleSurpriseMe(); }}
            disabled={isLoading}
            aria-label="Generate card with random fractal method"
          >
            Surprise Me
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="error-banner" role="alert" aria-live="polite">
          <span className="error-message">{errorMessage}</span>
          <button
            className="error-dismiss"
            type="button"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <section className="display-section" aria-label="Generated card">
        <CardDisplay isLoading={isLoading} result={result} />
      </section>
    </main>
  );
}

/** App wrapped in error boundary per spec §2.2 / §8. */
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
