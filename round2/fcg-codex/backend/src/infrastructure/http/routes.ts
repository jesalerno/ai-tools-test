import AjvImport from 'ajv';
import type { Request, Response, Router } from 'express';
import express from 'express';

import { generateCardUseCase } from '../../application/generate-card-usecase.js';
import { FRACTAL_METHODS, type GenerateCardRequest } from '../../shared/types.js';
import { AppError } from '../utils/errors.js';

type AjvInstance = {
  compile: (schema: object) => (data: unknown) => boolean;
};

type AjvCtor = new (options: { allErrors: boolean }) => AjvInstance;
const Ajv = AjvImport as unknown as AjvCtor;

const ajv = new Ajv({ allErrors: true });
const validateRequest = ajv.compile({
  type: 'object',
  properties: {
    method: { type: 'string', enum: [...FRACTAL_METHODS], nullable: true },
    seed: { type: 'integer', nullable: true },
    iterations: { type: 'integer', minimum: 500, maximum: 2000, nullable: true },
    zoom: { type: 'number', minimum: 0.5, maximum: 4.0, nullable: true },
  },
  required: [],
  additionalProperties: false,
});

export function createRouter(): Router {
  const router = express.Router();

  router.get('/api/health', (_request: Request, response: Response) => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.post('/api/cards/generate', (request: Request, response: Response) => {
    const payload = (request.body ?? {}) as GenerateCardRequest;
    if (!validateRequest(payload)) {
      throw new AppError('VALIDATION_ERROR', 'Invalid request payload', 400);
    }

    const output = generateCardUseCase(payload);
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.status(200).json(output);
  });

  return router;
}
