import { Request, Response, NextFunction } from 'express';
import { FractalMethod, FractalConfig, FractalResponse } from '../shared/types';
import { FractalService } from '../services/fractal.service';

const fractalService = new FractalService();

export const generateFractal = async (
  req: Request<{}, {}, FractalConfig>, // Typed Request Body
  res: Response<FractalResponse>,
  next: NextFunction,
) => {
  try {
    const { method, width, height, seed } = req.body;

    // Basic Validation
    if (!method || !Object.values(FractalMethod).includes(method)) {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing fractal method.',
      });
      return;
    }

    if (!width || !height || width <= 0 || height <= 0) {
      res.status(400).json({
        success: false,
        message:
          'Invalid dimensions. Width and height must be positive numbers.',
      });
      return;
    }

    // Call Service
    const startTime = Date.now();
    const imageBase64 = await fractalService.generate({
      method,
      width,
      height,
      seed,
    });
    const processingTimeMs = Date.now() - startTime;

    res.status(200).json({
      success: true,
      message: 'Fractal generated successfully.',
      imageBase64,
      processingTimeMs,
      paramsUsed: { method, width, height, seed },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Pass to global error handler, but can perform custom logic here if needed
      next(error);
    } else {
      next(new Error('Unknown error occurred'));
    }
  }
};
