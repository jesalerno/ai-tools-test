import { Router } from 'express';
import { generateFractal } from '../controllers/fractal.controller';

export const fractalRouter = Router();

fractalRouter.post('/generate', generateFractal);
