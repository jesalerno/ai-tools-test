/**
 * Custom hook for fractal card generation.
 * Manages loading, error, and result state.
 */

import { useState, useCallback } from 'react';
import type { FractalMethod, GenerateResponse } from '../shared/types';
import { generateCard, ApiError } from '../lib/api';

/** State for the generation hook. */
export interface UseGenerateState {
  isLoading: boolean;
  result: GenerateResponse | null;
  errorMessage: string | null;
  selectedMethod: FractalMethod | null;
}

/** Return type for the useGenerate hook. */
export interface UseGenerateReturn extends UseGenerateState {
  generate: (method: FractalMethod | null) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing fractal card generation flow.
 * On "Surprise Me", updates selectedMethod with the server's actual choice.
 */
export function useGenerate(): UseGenerateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<FractalMethod | null>(null);

  const generate = useCallback(async (method: FractalMethod | null) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await generateCard(method ? { method } : {});
      setResult(response);
      // Sync dropdown to actual method used (important for Surprise Me)
      setSelectedMethod(response.method);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  return { isLoading, result, errorMessage, selectedMethod, generate, clearError };
}
