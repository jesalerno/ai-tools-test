// Route handlers for `/api/cards/generate` and `/api/health`.

import type { Request, Response, NextFunction } from 'express';
import { generateCard } from '../../application/usecases/generateCard.js';
import { validateGenerateCard } from '../../application/validation/requestSchemas.js';
import type { AppConfig } from '../config/env.js';
import type { CanvasEncoder } from '../canvas/encoder.js';
import {
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  MAX_CANVAS_MEMORY_GUARD,
} from './canvasGuards.js';
import { ApiError } from './errors.js';
import type { HealthResponse } from '../../shared/types.js';

const NO_STORE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const setNoStore = (res: Response): void => {
  for (const [k, v] of Object.entries(NO_STORE_HEADERS)) res.setHeader(k, v);
};

export const healthHandler = (start: number) => (_req: Request, res: Response): void => {
  setNoStore(res);
  const body: HealthResponse = {
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - start) / 1000),
    version: '1.0.0',
  };
  res.status(200).json(body);
};

export const generateHandler = (cfg: AppConfig, encoder: CanvasEncoder) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = validateGenerateCard(req.body);
    if (!validation.ok || !validation.value) {
      next(new ApiError('VALIDATION_ERROR', 400, 'Invalid request body', {
        issues: validation.errors.map((e) => ({ path: e.instancePath, message: e.message })),
      }));
      return;
    }
    MAX_CANVAS_MEMORY_GUARD(cfg, CARD_WIDTH_PX, CARD_HEIGHT_PX);

    const correlation =
      (req as unknown as { correlationId?: string }).correlationId ?? 'unknown';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), cfg.maxGenerationMs);

    generateCard(validation.value, {
      encoder,
      correlationId: correlation,
      abortSignal: controller.signal,
    })
      .then((payload) => {
        clearTimeout(timeout);
        setNoStore(res);
        res.status(200).json(payload);
      })
      .catch((err: unknown) => {
        clearTimeout(timeout);
        if (controller.signal.aborted) {
          next(new ApiError('GENERATION_TIMEOUT', 504, 'Generation exceeded time budget'));
          return;
        }
        next(err);
      });
  };
};
