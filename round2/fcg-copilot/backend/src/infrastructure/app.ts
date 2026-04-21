/**
 * Express application factory.
 * Wires middleware, routes, and error handlers per spec §8 and ENVIRONMENT_SETUP §8.
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { AppConfig } from './config/env.js';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { handleGenerate, handleHealth, configureGenerateHandler } from './routes/cardRoutes.js';
import type { CanvasAdapter } from '../application/usecases/generateCard.js';

/** Create and configure the Express application. */
export function createApp(config: AppConfig, canvas: CanvasAdapter): express.Application {
  const app = express();

  // Disable x-powered-by per ENVIRONMENT_SETUP §8
  app.disable('x-powered-by');

  // Security headers per spec §4.4
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'");
    next();
  });

  // CORS with explicit origin allowlist per spec §8
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS: origin not allowed'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-Correlation-Id'],
  }));

  // Rate limiting per spec §8.1
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'RATE_LIMITED', message: 'Too many requests; please try again later' },
  }));

  // Body parsing with size limit per spec §8.1
  app.use(express.json({ limit: `${config.bodySizeLimitMb}mb` }));
  app.use(correlationMiddleware);

  // Configure route handler with dependencies
  configureGenerateHandler(canvas, config.maxGenerationMs);

  // Routes
  app.get('/api/health', handleHealth);
  app.post('/api/cards/generate', handleGenerate);

  // 404 then error handler per ENVIRONMENT_SETUP §8
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
