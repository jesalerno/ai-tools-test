/**
 * Card generation route handler.
 * Enforces timeout, validates request, and delegates to generate use case.
 */

import type { Request, Response, NextFunction } from 'express';
import type { GenerateRequest } from '../../shared/types.js';
import { generateCard } from '../../application/usecases/generateCard.js';
import {
  validateGenerateRequest,
  formatValidationErrors,
} from '../../application/validation/schemas.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

/** Canvas adapter injected at server startup. */
import type { CanvasAdapter } from '../../application/usecases/generateCard.js';

let canvasAdapter: CanvasAdapter | null = null;
let maxGenerationMs = 15000;

/** Configure the route handler with runtime dependencies. */
export function configureGenerateHandler(
  adapter: CanvasAdapter,
  timeoutMs: number
): void {
  canvasAdapter = adapter;
  maxGenerationMs = timeoutMs;
}

/** POST /api/cards/generate handler. */
export async function handleGenerate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!canvasAdapter) throw new Error('Canvas adapter not configured');

    // Validate request body
    const body = req.body as Record<string, unknown>;
    const valid = validateGenerateRequest(body);
    if (!valid) {
      const details = formatValidationErrors(validateGenerateRequest.errors);
      throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid request parameters', details);
    }

    const cid = req.correlationId;
    logger.info('Generating card', { correlationId: cid, method: typeof body['method'] === 'string' ? body['method'] : 'random' });

    // Timeout guard per spec §8.1
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new HttpError(503, 'TIMEOUT', 'Generation timed out')), maxGenerationMs)
    );

    const result = await Promise.race([
      generateCard(body as GenerateRequest, canvasAdapter),
      timeoutPromise,
    ]);

    logger.info('Card generated', { correlationId: cid, method: result.method, durationMs: result.metadata.durationMs });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** GET /api/health handler. */
export function handleHealth(_req: Request, res: Response): void {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
