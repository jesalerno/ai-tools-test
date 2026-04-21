/**
 * Registry-map dispatch for fractal generator selection.
 * Uses map dispatch to keep CCN near 1 per spec §18 Challenge 5.
 */

import type { FractalMethod } from '../../shared/types.js';
import type { FractalGenerator } from './types.js';
import { MandelbrotGenerator } from './mandelbrot.js';
import { JuliaGenerator } from './julia.js';
import { BurningShipGenerator } from './burningShip.js';
import { NewtonGenerator } from './newton.js';
import { LyapunovGenerator } from './lyapunov.js';
import { IfsGenerator } from './ifs.js';
import { LSystemGenerator } from './lsystem.js';
import { StrangeAttractorGenerator } from './strangeAttractor.js';
import { HeightmapGenerator } from './heightmap.js';
import { FlameGenerator } from './flame.js';
import { PhasePlotGenerator } from './phasePlot.js';

/** Registry map: method key → generator instance. */
const GENERATOR_REGISTRY: Readonly<Record<FractalMethod, FractalGenerator>> = {
  mandelbrot: new MandelbrotGenerator(),
  julia: new JuliaGenerator(),
  burningShip: new BurningShipGenerator(),
  newton: new NewtonGenerator(),
  lyapunov: new LyapunovGenerator(),
  ifs: new IfsGenerator(),
  lsystem: new LSystemGenerator(),
  strangeAttractor: new StrangeAttractorGenerator(),
  heightmap: new HeightmapGenerator(),
  flame: new FlameGenerator(),
  phasePlot: new PhasePlotGenerator(),
};

/** Look up a generator by method key. Throws if not found. */
export function getGenerator(method: FractalMethod): FractalGenerator {
  const generator = GENERATOR_REGISTRY[method];
  if (!generator) throw new Error(`Unknown fractal method: ${method}`);
  return generator;
}

/** Return all registered method keys. */
export function getAllMethods(): FractalMethod[] {
  return Object.keys(GENERATOR_REGISTRY) as FractalMethod[];
}
