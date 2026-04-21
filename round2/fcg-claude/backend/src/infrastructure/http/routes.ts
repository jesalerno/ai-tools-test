// Route wiring: /api/health, /api/cards/generate, OpenAPI/Swagger at /api/docs.
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import type { AppConfig } from '../config/env.js';
import type { CanvasEncoder } from '../canvas/encoder.js';
import { healthHandler, generateHandler } from './handlers.js';
import { openApiDocument } from '../config/openapi.js';

export const buildRouter = (cfg: AppConfig, encoder: CanvasEncoder, startedAt: number): Router => {
  const router = Router();
  router.get('/health', healthHandler(startedAt));
  router.post('/cards/generate', generateHandler(cfg, encoder));
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  router.get('/openapi.json', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(openApiDocument);
  });
  return router;
};
