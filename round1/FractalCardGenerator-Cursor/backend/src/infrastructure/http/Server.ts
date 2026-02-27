/**
 * Infrastructure layer: HTTP server setup
 * Handles external communication concerns
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { CardGeneratorService } from '../../application/CardGeneratorService';
import { FractalMethod, FRACTAL_METHODS } from '../../shared/types';

export class Server {
  private app: Express;
  private cardService: CardGeneratorService;

  constructor() {
    this.app = express();
    this.cardService = new CardGeneratorService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  public getApp(): Express {
    return this.app;
  }

  private setupMiddleware(): void {
    // CORS configuration - in production, specify allowed origins
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || false
        : true, // Allow all origins in development
    };
    this.app.use(cors(corsOptions));
    
    // Request size limit (1MB) to prevent memory exhaustion
    this.app.use(express.json({ limit: '1mb' }));
    
    // Rate limiting to prevent DoS attacks
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });

    // Get available fractal methods
    this.app.get('/api/methods', (_req: Request, res: Response) => {
      res.json(FRACTAL_METHODS);
    });

    // Generate card
    this.app.post('/api/generate', async (req: Request, res: Response) => {
      try {
        const { method, seed } = req.body;

        // Input validation: method is required and must be a string
        if (!method || typeof method !== 'string') {
          return res.status(400).json({ error: 'Method is required and must be a string' });
        }

        // Input validation: method must be valid
        if (!this.isValidMethod(method)) {
          return res.status(400).json({ error: 'Invalid fractal method' });
        }

        // Input validation: sanitize seed parameter
        let sanitizedSeed: number | undefined;
        if (seed !== undefined) {
          if (typeof seed !== 'number') {
            return res.status(400).json({ error: 'Seed must be a number' });
          }
          // Ensure seed is within safe range (prevent overflow)
          if (!Number.isFinite(seed) || seed < -Number.MAX_SAFE_INTEGER || seed > Number.MAX_SAFE_INTEGER) {
            return res.status(400).json({ error: 'Seed must be a finite number within safe range' });
          }
          sanitizedSeed = Math.floor(seed); // Use integer seed
        }

        const cardData = await this.cardService.generateCard({
          method: method as FractalMethod,
          seed: sanitizedSeed,
        });

        // Return base64 encoded image
        const base64Image = cardData.buffer.toString('base64');
        res.json({
          imageData: `data:${cardData.mimeType};base64,${base64Image}`,
          method,
          seed: sanitizedSeed,
        });
      } catch (error) {
        // Log full error details server-side
        console.error('Error generating card:', error);
        
        // Return generic error message to client (don't expose internal details)
        res.status(500).json({
          error: 'Failed to generate card',
        });
      }
    });
  }

  private isValidMethod(method: string): method is FractalMethod {
    return FRACTAL_METHODS.some((m: { value: string }) => m.value === method);
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}
