/**
 * Complex Function Phase Plot Generator
 * Map f(z) argument/magnitude to color (exp, sin, or z²)
 */

import Complex from 'complex.js';
import { FractalParams } from '../../shared/types';
import { IFractalGenerator, PatternData, ColorMapper, validatePatternCoverage } from '../fractal-generator';

export class ComplexFunctionGenerator implements IFractalGenerator {
  generate(params: FractalParams): PatternData {
    return this.generatePattern(params);
  }

  private generatePattern(params: FractalParams): PatternData {
    const { width, height, seed } = params;
    const pixels: number[][][] = [];

    // Select function based on seed
    const functions = ['exp', 'sin', 'square', 'reciprocal'];
    const functionType = functions[seed % functions.length];

    const seedNorm = (seed % 1000) / 1000;
    const zoom = 2.0 + seedNorm * 2.0;

    for (let py = 0; py < height; py++) {
      const row: number[][] = [];
      for (let px = 0; px < width; px++) {
        const x = (px / width - 0.5) * zoom;
        const y = (py / height - 0.5) * zoom;
        
        const z = new Complex(x, y);
        const result = this.applyFunction(z, functionType);
        const color = this.complexToColor(result);
        row.push([color[0], color[1], color[2]]);
      }
      pixels.push(row);
    }

    return { pixels, width, height };
  }

  private applyFunction(z: Complex, type: string): Complex {
    switch (type) {
      case 'exp':
        return z.exp();
      
      case 'sin':
        return z.sin();
      
      case 'square':
        return z.mul(z);
      
      case 'reciprocal':
        if (z.abs() < 0.0001) return new Complex(0, 0);
        return new Complex(1, 0).div(z);
      
      default:
        return z;
    }
  }

  private complexToColor(z: Complex): [number, number, number] {
    const magnitude = z.abs();
    const phase = z.arg();

    // Use phase for hue
    const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
    
    // Use magnitude for saturation/lightness
    const saturation = 0.8;
    const lightness = Math.min(0.5 + Math.log(1 + magnitude) * 0.2, 0.9);

    return ColorMapper.hslToRgb(hue, saturation, lightness);
  }

  validateCoverage(pattern: PatternData) {
    return validatePatternCoverage(pattern);
  }
}
