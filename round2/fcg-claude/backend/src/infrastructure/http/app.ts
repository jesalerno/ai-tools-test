// Express app factory. Server composition: helmet-equivalent hardening,
// CORS, body limit, rate limit, routes, 404, error handler.

import express from 'express';
import type { Express } from 'express';

import type { AppConfig } from '../config/env.js';
import { createCanvasEncoder } from '../canvas/encoder.js';
import { buildRouter } from './routes.js';
import {
  corsMiddleware,
  correlationId,
  errorHandler,
  notFoundHandler,
  rateLimitMiddleware,
} from './middleware.js';

export const createApp = (cfg: AppConfig): Express => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(correlationId);
  app.use(corsMiddleware(cfg));
  app.use(express.json({ limit: `${cfg.bodySizeLimitMb}mb` }));
  app.use('/api/', rateLimitMiddleware(cfg));
  const startedAt = Date.now();
  app.use('/api', buildRouter(cfg, createCanvasEncoder(), startedAt));

  // Friendly root redirect — prevents the "Route not found" confusion when a
  // curious user hits http://localhost:8040/ directly.
  app.get('/', (_req, res) => {
    res.redirect(302, '/api/docs');
  });
  app.get('/api', (_req, res) => {
    res.redirect(302, '/api/docs');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
