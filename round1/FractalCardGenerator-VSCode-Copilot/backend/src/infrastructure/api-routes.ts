/**
 * API Routes (Infrastructure Layer)
 * Express routes with validation and error handling
 */

import { Router, Request, Response } from 'express';
import { CardGeneratorService } from '../application/card-generator.service';
import { GenerateCardRequest, GenerateCardResponse, ErrorResponse, FractalMethod } from '../shared/types';

const router = Router();
const cardService = new CardGeneratorService();

/**
 * Validate generate card request
 */
function validateGenerateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const req = body as Record<string, unknown>;

  if (!req.method || typeof req.method !== 'string') {
    return { valid: false, error: 'method field is required and must be a string' };
  }

  const validMethods = Object.values(FractalMethod);
  if (!validMethods.includes(req.method as FractalMethod)) {
    return { valid: false, error: `Invalid method. Must be one of: ${validMethods.join(', ')}` };
  }

  if (req.seed !== undefined) {
    if (typeof req.seed !== 'number' || !Number.isInteger(req.seed)) {
      return { valid: false, error: 'seed must be an integer' };
    }
    if (req.seed < 0 || req.seed > 1000000) {
      return { valid: false, error: 'seed must be between 0 and 1000000' };
    }
  }

  return { valid: true };
}

/**
 * POST /api/generate
 * Generate a fractal card
 */
router.post('/generate', (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = validateGenerateRequest(req.body);
    if (!validation.valid) {
      const errorResponse: ErrorResponse = {
        error: validation.error!,
        code: 'VALIDATION_ERROR'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const request = req.body as GenerateCardRequest;

    // Generate card
    const result = cardService.generateCard(request);

    // Format response
    const response: GenerateCardResponse = {
      imageData: result.imageData,
      mimeType: result.mimeType,
      method: result.method,
      seed: result.seed,
      timestamp: result.timestamp
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating card:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/methods
 * Get list of available fractal methods
 */
router.get('/methods', (_req: Request, res: Response) => {
  const methods = Object.values(FractalMethod);
  res.status(200).json({ methods });
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
