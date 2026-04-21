import type { GenerateCardRequest, GenerateCardResponse } from '../shared/types.js';
import { generateCard } from '../domain/fractals/generate-card.js';

export function generateCardUseCase(request: GenerateCardRequest): GenerateCardResponse {
  return generateCard({
    method: request.method,
    seed: request.seed,
    iterations: request.iterations,
    zoom: request.zoom,
  });
}
