// Express middleware factory: CORS, rate limit, correlation ID,
// centralized error handler, 404 fallback.

import type { ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuid } from 'uuid';

import type { AppConfig } from '../config/env.js';
import { ApiError } from './errors.js';
import { logger } from '../logging/logger.js';

export const corsMiddleware = (cfg: AppConfig): RequestHandler =>
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (cfg.corsOrigins.includes(origin)) return cb(null, true);
      cb(new ApiError('METHOD_NOT_ALLOWED', 403, `Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    credentials: false,
  });

export const rateLimitMiddleware = (cfg: AppConfig): RequestHandler =>
  rateLimit({
    windowMs: cfg.rateLimitWindowMs,
    max: cfg.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'RATE_LIMITED', message: 'Too many requests. Slow down.' },
  });

export const correlationId: RequestHandler = (req, res, next) => {
  const id = (req.header('x-correlation-id') ?? uuid()) as string;
  res.setHeader('x-correlation-id', id);
  (req as unknown as { correlationId: string }).correlationId = id;
  next();
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new ApiError('NOT_FOUND', 404, `Route not found: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      path: req.originalUrl,
    }),
  );
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const correlation = (req as unknown as { correlationId?: string }).correlationId;
  if (err instanceof ApiError) {
    logger.warn(
      {
        code: err.code,
        correlationId: correlation,
        method: req.method,
        path: req.originalUrl,
        details: err.details,
      },
      err.message,
    );
    res.status(err.status).json({ error: err.code, message: err.message, details: err.details });
    return;
  }
  logger.error({ err, correlationId: correlation, method: req.method, path: req.originalUrl }, 'Unhandled error');
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
};
