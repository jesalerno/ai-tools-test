import { useState } from 'react';

import type { FractalMethod, GenerateCardResponse } from './shared/types';

const API_ENDPOINT = '/api/cards/generate';

interface GeneratorState {
  selectedMethod: FractalMethod;
  isLoading: boolean;
  error: string;
  imageDataUri: string;
  metaText: string;
}

interface ApiError {
  message?: string;
}

const DEFAULT_STATE: GeneratorState = {
  selectedMethod: 'MANDELBROT',
  isLoading: false,
  error: '',
  imageDataUri: '',
  metaText: '',
};

export function useCardGenerator() {
  const [state, setState] = useState<GeneratorState>(DEFAULT_STATE);

  const setSelectedMethod = (method: FractalMethod): void => {
    setState((prev) => ({ ...prev, selectedMethod: method }));
  };

  const generate = async (useRandom: boolean): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: '' }));

    try {
      const payload = useRandom ? {} : { method: state.selectedMethod };
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload: ApiError = await response.json() as ApiError;
        throw new Error(errorPayload.message ?? 'Generation failed');
      }

      const data = await response.json() as GenerateCardResponse;
      setState({
        selectedMethod: data.method,
        isLoading: false,
        error: '',
        imageDataUri: data.imageDataUri,
        metaText: `Method=${data.method} | Seed=${data.seed} | Retries=${data.metadata.retries} | Duration=${data.metadata.durationMs}ms`,
      });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unexpected error';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  };

  return {
    ...state,
    setSelectedMethod,
    generate,
  };
}
