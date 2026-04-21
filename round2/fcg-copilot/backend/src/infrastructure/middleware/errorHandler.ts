/**
 * Centralized error handling middleware.
 * Returns consistent error envelopes per spec §6.3.
 * Does not expose stack traces, paths, or internal details per spec §8.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import type { ErrorResponse } from '../../shared/types.js';

/** HTTP error class with a status code. */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Centralized error handler middleware. Must be registered last. */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const cid = req.correlationId ?? 'unknown';

  if (err instanceof HttpError) {
    logger.warn('HTTP error', { correlationId: cid, code: err.code, status: err.statusCode });
    const body: ErrorResponse = { error: err.code, message: err.message };
    if (err.details) body.details = err.details;
    res.status(err.statusCode).json(body);
    return;
  }

  // Body-parser sends a SyntaxError with type 'entity.parse.failed' for malformed JSON
  if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    logger.warn('Malformed JSON body', { correlationId: cid });
    const body: ErrorResponse = { error: 'BAD_REQUEST', message: 'Malformed JSON body' };
    res.status(400).json(body);
    return;
  }

  // Unknown error: log details server-side but return opaque response to client
  logger.error('Unhandled error', { correlationId: cid, error: String(err) });
  const body: ErrorResponse = {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again.',
  };
  res.status(500).json(body);
}

/** 404 middleware for unmatched routes. */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorResponse = {
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(body);
}
