import type {NextFunction, Request, Response} from 'express';

import {FRACTAL_METHOD_OPTIONS} from '../shared/types';
import type {CardGenerationService} from '../application/services/cardGenerationService';
import {
  validateGenerateCardRequest,
  validateSurpriseCardRequest,
} from '../application/validation/cardRequestValidation';

export interface CardController {
  listMethods: (req: Request, res: Response) => void;
  generate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  surprise: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export function createCardController(service: CardGenerationService): CardController {
  return {
    listMethods(_req, res) {
      res.status(200).json({methods: FRACTAL_METHOD_OPTIONS});
    },

    async generate(req, res, next) {
      try {
        const validated = validateGenerateCardRequest(req.body);
        const payload = await service.generate(validated);
        res.status(200).json(payload);
      } catch (error) {
        next(error);
      }
    },

    async surprise(req, res, next) {
      try {
        const validated = validateSurpriseCardRequest(req.body);
        const payload = await service.surprise(validated);
        res.status(200).json(payload);
      } catch (error) {
        next(error);
      }
    },
  };
}
