/**
 * API client for the fractal card generator backend.
 * All API calls are strongly typed using the shared contract.
 */

import type { GenerateRequest, GenerateResponse } from '../shared/types';

/** Base URL for API calls — uses relative path for both dev and prod. */
const API_BASE = '/api';

/** Custom error for API failures. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Generate a fractal card. */
export async function generateCard(request: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/cards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
    throw new ApiError(
      body.error ?? 'UNKNOWN_ERROR',
      body.message ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return response.json() as Promise<GenerateResponse>;
}
