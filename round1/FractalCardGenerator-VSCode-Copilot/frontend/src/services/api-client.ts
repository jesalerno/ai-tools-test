/**
 * API Client for communicating with backend
 */

import { FractalMethod, GenerateCardRequest, GenerateCardResponse, ErrorResponse } from '../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  /**
   * Generate a fractal card
   * @param method Fractal method to use
   * @param seed Optional seed for reproducibility
   * @returns Generated card response
   */
  async generateCard(method: FractalMethod, seed?: number): Promise<GenerateCardResponse> {
    const request: GenerateCardRequest = { method };
    if (seed !== undefined) {
      request.seed = seed;
    }

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new ApiError(errorData.error, errorData.code, response.status);
    }

    return response.json();
  }

  /**
   * Get list of available fractal methods
   * @returns Array of fractal methods
   */
  async getMethods(): Promise<FractalMethod[]> {
    const response = await fetch(`${API_BASE_URL}/methods`);

    if (!response.ok) {
      throw new ApiError('Failed to fetch methods', undefined, response.status);
    }

    const data = await response.json();
    return data.methods;
  }

  /**
   * Check API health
   * @returns Health status
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new ApiError('Health check failed', undefined, response.status);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
