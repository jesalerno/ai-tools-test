/**
 * Complex Function Phase Plot Generator
 * Map complex function argument/magnitude to color
 */

import { FractalGenerator, FractalParams, Color, createColorArray, SeededRandom } from '../FractalGenerator';
import { FractalMethod } from '../../shared/types';
import Complex from 'complex.js';

export class ComplexPhaseGenerator implements FractalGenerator {
  getMethod(): FractalMethod {
    return 'complex-phase';
  }

  generate(params: FractalParams): Color[][] {
    const { width, height, seed } = params;
    const random = new SeededRandom(seed);
    const colors = createColorArray(width, height);

    const functionType = random.nextInt(0, 2);
    const zoom = random.nextFloat(0.5, 2.0);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = this.mapToReal(px, width, zoom);
        const y = this.mapToImag(py, height, zoom);

        const z = new Complex(x, y);
        const result = this.applyFunction(z, functionType);

        colors[py][px] = this.complexToColor(result, seed);
      }
    }

    return colors;
  }

  private mapToReal(px: number, width: number, zoom: number): number {
    const range = 4.0 / zoom;
    return ((px / width) - 0.5) * range;
  }

  private mapToImag(py: number, height: number, zoom: number): number {
    const range = 4.0 / zoom;
    return ((py / height) - 0.5) * range;
  }

  private applyFunction(z: Complex, functionType: number): Complex {
    switch (functionType) {
      case 0: // exp(z)
        return z.exp();

      case 1: // sin(z)
        return z.sin();

      case 2: // z²
        return z.mul(z);

      default:
        return z;
    }
  }

  private complexToColor(z: Complex, _seed: number): Color {
    const phase = z.arg();
    const magnitude = z.abs();

    const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
    const saturation = 0.8;
    const value = this.mapMagnitudeToValue(magnitude);

    return this.hsvToRgb(hue, saturation, value);
  }

  private mapMagnitudeToValue(magnitude: number): number {
    const normalized = Math.atan(magnitude) / (Math.PI / 2);
    return 0.3 + normalized * 0.7;
  }

  private hsvToRgb(h: number, s: number, v: number): Color {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.floor((r + m) * 255),
      g: Math.floor((g + m) * 255),
      b: Math.floor((b + m) * 255)
    };
  }
}
