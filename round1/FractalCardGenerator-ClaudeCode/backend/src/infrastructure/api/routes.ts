/**
 * Express API routes for fractal card generation
 */

import { Router, Request, Response } from 'express';
import { CardGenerator } from '../../application/CardGenerator';
import { CanvasRenderer } from '../CanvasRenderer';
import { GenerateCardRequest, GenerateCardResponse, FRACTAL_METHODS } from '../../shared/types';
import { validateGenerateCardRequest } from './validation';

const router = Router();
const cardGenerator = new CardGenerator();
const canvasRenderer = new CanvasRenderer();

/**
 * GET /api/methods
 * Get list of available fractal methods
 */
router.get('/methods', (_req: Request, res: Response) => {
  res.json({
    success: true,
    methods: FRACTAL_METHODS
  });
});

/**
 * POST /api/generate
 * Generate a fractal card
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const validation = validateGenerateCardRequest(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        statusCode: 400
      });
    }

    const request = validation.data as GenerateCardRequest;

    const seed = request.seed ?? CardGenerator.generateSeed();
    const method = request.method;

    const card = cardGenerator.generate({ method, seed });

    const imageBuffer = canvasRenderer.render(card.colors);

    const base64Image = imageBuffer.toString('base64');

    const response: GenerateCardResponse = {
      success: true,
      imageData: base64Image,
      method: card.method,
      seed: card.seed
    };

    return res.json(response);
  } catch (error) {
    console.error('Error generating card:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      statusCode: 500
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
