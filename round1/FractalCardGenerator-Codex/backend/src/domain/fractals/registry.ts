import type {FractalMethod} from '../../shared/types';
import {generateBurningShip} from './burningShip';
import {generateEscapeHeightmap} from './escapeHeightmap';
import {generateFlame} from './flame';
import {generateIfs} from './ifs';
import {generateJulia} from './julia';
import {generateLSystem} from './lSystem';
import {generateLyapunov} from './lyapunov';
import {generateMandelbrot} from './mandelbrot';
import {generateNewton} from './newton';
import {generatePhasePlot} from './phasePlot';
import {generateStrangeAttractor} from './strangeAttractor';
import type {FractalGenerator} from './types';

const FRACTAL_GENERATORS: Record<FractalMethod, FractalGenerator> = {
  mandelbrot: generateMandelbrot,
  julia: generateJulia,
  'burning-ship': generateBurningShip,
  newton: generateNewton,
  lyapunov: generateLyapunov,
  ifs: generateIfs,
  'l-system': generateLSystem,
  'strange-attractor': generateStrangeAttractor,
  'escape-heightmap': generateEscapeHeightmap,
  flame: generateFlame,
  'phase-plot': generatePhasePlot,
};

export function getFractalGenerator(method: FractalMethod): FractalGenerator {
  return FRACTAL_GENERATORS[method];
}
