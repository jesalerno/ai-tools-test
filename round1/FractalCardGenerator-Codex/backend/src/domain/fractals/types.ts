import type {FractalMethod} from '../../shared/types';
import type {Palette} from '../models/color';
import type {PixelBuffer} from '../utils/pixels';

export interface FractalContext {
  method: FractalMethod;
  width: number;
  height: number;
  iterations: number;
  zoom: number;
  seed: number;
  palette: Palette;
  assertWithinBudget: () => void;
}

export interface FractalResult {
  buffer: PixelBuffer;
  coverage: number;
}

export type FractalGenerator = (context: FractalContext) => FractalResult;
