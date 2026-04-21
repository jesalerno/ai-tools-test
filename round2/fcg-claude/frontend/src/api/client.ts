// Thin fetch client against the backend. Never touches `console.log` in
// production paths; surfaces errors as typed exceptions the UI can render.

import type {
  ApiErrorResponse,
  FractalMethod,
  GenerateCardRequest,
  GenerateCardResponse,
} from '../shared/types';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Readonly<Record<string, unknown>>;
  public constructor(res: ApiErrorResponse, status: number) {
    super(res.message);
    this.name = 'ApiError';
    this.code = res.error;
    this.status = status;
    if (res.details) this.details = res.details;
  }
}

const API_BASE = (import.meta.env['VITE_API_BASE'] as string | undefined) ?? '/api';

const parseError = async (res: Response): Promise<ApiError> => {
  try {
    const body = (await res.json()) as ApiErrorResponse;
    return new ApiError(body, res.status);
  } catch {
    return new ApiError(
      { error: 'NETWORK_ERROR', message: `Request failed with status ${res.status}` },
      res.status,
    );
  }
};

export const generateCard = async (
  method: FractalMethod | null,
  signal?: AbortSignal,
): Promise<GenerateCardResponse> => {
  const body: GenerateCardRequest = method ? { method } : {};
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  };
  if (signal) init.signal = signal;
  const res = await fetch(`${API_BASE}/cards/generate`, init);
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as GenerateCardResponse;
};

export const getHealth = async (): Promise<{ status: string; uptimeSeconds: number }> => {
  const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { status: string; uptimeSeconds: number };
};
