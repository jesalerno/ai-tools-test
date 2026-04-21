import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/errors.js';

export function notFoundMiddleware(_request: Request, response: Response): void {
  response.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route not found',
  });
}

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  void next;

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.code, message: error.message });
    return;
  }

  response.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
  });
}
