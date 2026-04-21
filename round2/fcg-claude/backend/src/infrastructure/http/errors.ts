// Stable error codes for API responses (FCG-SPECv3 §6.3).

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'GENERATION_TIMEOUT'
  | 'GENERATION_FAILED'
  | 'CANVAS_MEMORY_EXCEEDED'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  public constructor(
    code: ApiErrorCode,
    status: number,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    if (details) this.details = details;
  }
}
