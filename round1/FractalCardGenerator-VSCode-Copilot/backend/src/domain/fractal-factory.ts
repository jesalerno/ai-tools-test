/**
 * Fractal Factory
 * Creates fractal generator instances based on method type
 */

import { FractalMethod } from '../shared/types';
import { IFractalGenerator } from './fractal-generator';
import { MandelbrotGenerator } from './generators/mandelbrot';
import { JuliaGenerator } from './generators/julia';
import { BurningShipGenerator } from './generators/burning-ship';
import { NewtonGenerator } from './generators/newton';
import { LyapunovGenerator } from './generators/lyapunov';
import { IFSGenerator } from './generators/ifs';
import { LSystemGenerator } from './generators/l-system';
import { StrangeAttractorGenerator } from './generators/strange-attractor';
import { HeightmapGenerator } from './generators/heightmap';
import { FlameGenerator } from './generators/flame';
import { ComplexFunctionGenerator } from './generators/complex-function';

export class FractalFactory {
  /**
   * Create a fractal generator for the specified method
   * @param method Fractal method type
   * @returns Fractal generator instance
   */
  static createGenerator(method: FractalMethod): IFractalGenerator {
    switch (method) {
      case FractalMethod.MANDELBROT:
        return new MandelbrotGenerator();
      
      case FractalMethod.JULIA:
        return new JuliaGenerator();
      
      case FractalMethod.BURNING_SHIP:
        return new BurningShipGenerator();
      
      case FractalMethod.NEWTON:
        return new NewtonGenerator();
      
      case FractalMethod.LYAPUNOV:
        return new LyapunovGenerator();
      
      case FractalMethod.IFS:
        return new IFSGenerator();
      
      case FractalMethod.L_SYSTEM:
        return new LSystemGenerator();
      
      case FractalMethod.STRANGE_ATTRACTOR:
        return new StrangeAttractorGenerator();
      
      case FractalMethod.HEIGHTMAP:
        return new HeightmapGenerator();
      
      case FractalMethod.FLAME:
        return new FlameGenerator();
      
      case FractalMethod.COMPLEX_FUNCTION:
        return new ComplexFunctionGenerator();
      
      default:
        throw new Error(`Unknown fractal method: ${method}`);
    }
  }

  /**
   * Get all available fractal methods
   * @returns Array of fractal method enum values
   */
  static getAllMethods(): FractalMethod[] {
    return Object.values(FractalMethod);
  }
}
