import { useState, useCallback } from 'react';
import { FractalMethod, FcgResponse } from '../../shared/types.js';
import { ErrorBoundary } from './ErrorBoundary.js';

function FractalGenerator() {
  const [method, setMethod] = useState<string>(FractalMethod.Mandelbrot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FcgResponse | null>(null);

  const generate = useCallback(async (isRandom = false) => {
    setLoading(true);
    setError(null);
    try {
      const body = isRandom ? {} : { method };
      const res = await fetch('/api/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate');
      }
      setResult(data);
      if (isRandom) {
        setMethod(data.method);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [method]);

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      <header className="mb-8 text-center max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Fractal Card Generator</h1>
        <p className="text-gray-600">Deterministic procedural card backs.</p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <section className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex flex-col gap-2">
            <label htmlFor="method" className="text-sm font-semibold text-gray-700">Fractal Method</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={loading}
              className="p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.values(FractalMethod).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              onClick={() => generate()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Go'}
            </button>
            <button 
              onClick={() => generate(true)}
              disabled={loading}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Surprise Me
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mt-2 text-sm leading-relaxed">
              <span className="font-semibold block mb-1">Error</span>
              {error}
            </div>
          )}
        </section>

        <section className="flex justify-center items-center bg-gray-100 rounded-2xl p-8 min-h-[500px] border border-gray-200 shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-gray-500 animate-pulse">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p>Computing Iterations...</p>
            </div>
          ) : result ? (
             <div className="flex flex-col items-center gap-4">
               <img src={result.imageUri} alt={`Generated ${result.method} fractal card back`} className="shadow-2xl rounded-[8px]" style={{ width: '300px', height: '420px', objectFit: 'contain' }} />
               <div className="text-sm text-gray-500 font-medium">Seed: {result.seed}</div>
             </div>
          ) : (
            <div className="text-gray-400 text-center">
              <p className="text-lg mb-2">No Generation Yet</p>
              <p className="text-sm">Click generate to render a fractal.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FractalGenerator />
    </ErrorBoundary>
  );
}
