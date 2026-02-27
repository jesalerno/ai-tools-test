import { FractalGenerator } from './FractalGenerator';
import { MandelbrotGenerator } from './MandelbrotGenerator';
import { JuliaGenerator } from './JuliaGenerator';
import { BurningShipGenerator } from './BurningShipGenerator';
import { NewtonGenerator } from './NewtonGenerator';
import { LyapunovGenerator } from './LyapunovGenerator';
import { IFSGenerator } from './IFSGenerator';
import { LSystemGenerator } from './LSystemGenerator';
import { StrangeAttractorGenerator } from './StrangeAttractorGenerator';
import { HeightmapGenerator } from './HeightmapGenerator';
import { FlameGenerator } from './FlameGenerator';
import { PhasePlotGenerator } from './PhasePlotGenerator';
import { FractalMethod } from '../../shared/types';

/**
 * Factory for creating fractal generators
 * Follows Factory pattern for clean instantiation
 */
export class FractalFactory {
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
      case 'phase-plot':
        return new PhasePlotGenerator();
      default:
        throw new Error(`Unknown fractal method: ${method}`);
    }
  }
}
