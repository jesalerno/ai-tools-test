/**
 * API service for communicating with backend
 */

import { FractalMethod, GenerateCardRequest, GenerateCardResponse, FractalMethodInfo } from '../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Generate a fractal card
 */
export async function generateCard(method: FractalMethod, seed?: number): Promise<GenerateCardResponse> {
  const request: GenerateCardRequest = { method, seed };

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate card');
  }

  return await response.json();
}

/**
 * Get available fractal methods
 */
export async function getMethods(): Promise<FractalMethodInfo[]> {
  const response = await fetch(`${API_BASE_URL}/methods`);

  if (!response.ok) {
    throw new Error('Failed to fetch methods');
  }

  const data = await response.json();
  return data.methods;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
