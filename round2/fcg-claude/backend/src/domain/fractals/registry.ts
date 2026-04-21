// Registry-map dispatch for fractal methods (FCG-SPECv3 §10, ARCHITECTUREv2 §5).
// Avoids large switch factories; CCN stays near 1 for method selection.

import type { FractalMethod } from '../../shared/types.js';
import { FRACTAL_METHODS } from '../../shared/types.js';
import type { Renderer } from './types.js';
import { mandelbrot } from './mandelbrot.js';
import { julia } from './julia.js';
import { burningShip } from './burningShip.js';
import { newton } from './newton.js';
import { lyapunov } from './lyapunov.js';
import { ifs } from './ifs.js';
import { lSystem } from './lSystem.js';
import { strangeAttractor } from './strangeAttractor.js';
import { heightmap } from './heightmap.js';
import { flame } from './flame.js';
import { phasePlot } from './phasePlot.js';
import type { Rng } from '../rng.js';

export const RENDERERS: Readonly<Record<FractalMethod, Renderer>> = {
  MANDELBROT: mandelbrot,
  JULIA: julia,
  BURNING_SHIP: burningShip,
  NEWTON: newton,
  LYAPUNOV: lyapunov,
  IFS: ifs,
  L_SYSTEM: lSystem,
  STRANGE_ATTRACTOR: strangeAttractor,
  HEIGHTMAP: heightmap,
  FLAME: flame,
  PHASE_PLOT: phasePlot,
};

export const getRenderer = (method: FractalMethod): Renderer => {
  const r = RENDERERS[method];
  if (!r) throw new Error(`Unknown fractal method: ${String(method)}`);
  return r;
};

export const pickRandomMethod = (rng: Rng): FractalMethod => {
  const idx = Math.floor(rng() * FRACTAL_METHODS.length);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return FRACTAL_METHODS[idx]!;
};
