import { FractalConfig, FractalResponse } from '../shared/types';
import { generateFractalImage } from '../core/fractal-engine';

export class FractalService {
  public async generate(config: FractalConfig): Promise<string> {
    // In a real scenario, this might involve queueing, caching, etc.
    // For now, it directly calls the engine.

    // Ensure seed is set
    const seed = config.seed || Math.floor(Math.random() * 1000000);

    const base64Image = await generateFractalImage({ ...config, seed });
    return base64Image;
  }
}
