import type {NextFunction, Request, Response} from 'express';

import {HttpError, ValidationError} from '../application/errors/httpError';
import {logger} from '../infrastructure/logging/logger';

function isBodyParserSyntaxError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) {
    return false;
  }

  const withStatus = err as SyntaxError & {status?: number};
  return withStatus.status === 400;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = String(res.getHeader('x-request-id') ?? 'unknown');
  const normalizedError = isBodyParserSyntaxError(err)
    ? new ValidationError('Malformed JSON body.')
    : err;

  if (normalizedError instanceof HttpError) {
    logger.error('Request failed', {
      requestId,
      statusCode: normalizedError.statusCode,
      message: normalizedError.message,
      path: req.path,
    });

    res.status(normalizedError.statusCode).json({
      error: normalizedError.expose ? normalizedError.message : 'Internal Server Error',
      requestId,
    });
    return;
  }

  logger.error('Unhandled error', {
    requestId,
    path: req.path,
    message: err instanceof Error ? err.message : 'Unknown error',
  });

  res.status(500).json({
    error: 'Internal Server Error',
    requestId,
  });
}
