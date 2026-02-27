/**
 * Factory for creating fractal generators
 */

import { FractalMethod } from '../shared/types';
import { FractalGenerator } from './FractalGenerator';
import { MandelbrotGenerator } from './generators/MandelbrotGenerator';
import { JuliaGenerator } from './generators/JuliaGenerator';
import { BurningShipGenerator } from './generators/BurningShipGenerator';
import { NewtonGenerator } from './generators/NewtonGenerator';
import { LyapunovGenerator } from './generators/LyapunovGenerator';
import { IFSGenerator } from './generators/IFSGenerator';
import { LSystemGenerator } from './generators/LSystemGenerator';
import { StrangeAttractorGenerator } from './generators/StrangeAttractorGenerator';
import { HeightmapGenerator } from './generators/HeightmapGenerator';
import { FlameGenerator } from './generators/FlameGenerator';
import { ComplexPhaseGenerator } from './generators/ComplexPhaseGenerator';

export class FractalGeneratorFactory {
  /**
   * Create a fractal generator for the specified method
   */
  static create(method: FractalMethod): FractalGenerator {
    switch (method) {
      case 'mandelbrot':
        return new MandelbrotGenerator();
      case 'julia':
        return new JuliaGenerator();
      case 'burning-ship':
        return new BurningShipGenerator();
      case 'newton':
        return new NewtonGenerator();
      case 'lyapunov':
        return new LyapunovGenerator();
      case 'ifs':
        return new IFSGenerator();
      case 'l-system':
        return new LSystemGenerator();
      case 'strange-attractor':
        return new StrangeAttractorGenerator();
      case 'heightmap':
        return new HeightmapGenerator();
      case 'flame':
        return new FlameGenerator();
      case 'complex-phase':
        return new ComplexPhaseGenerator();
      default:
        throw new Error(`Unknown fractal method: ${method}`);
    }
  }

  /**
   * Get all available fractal methods
   */
  static getAllMethods(): FractalMethod[] {
    return [
      'mandelbrot',
      'julia',
      'burning-ship',
      'newton',
      'lyapunov',
      'ifs',
      'l-system',
      'strange-attractor',
      'heightmap',
      'flame',
      'complex-phase'
    ];
  }
}
