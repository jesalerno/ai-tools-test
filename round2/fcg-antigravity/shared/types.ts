export enum FractalMethod {
  Mandelbrot = 'Mandelbrot',
  Julia = 'Julia',
  BurningShip = 'BurningShip',
  Newton = 'Newton',
  Lyapunov = 'Lyapunov',
  IFS = 'IFS',
  LSystem = 'LSystem',
  StrangeAttractor = 'StrangeAttractor',
  Heightmap = 'Heightmap',
  Flame = 'Flame',
  PhasePlot = 'PhasePlot'
}

export enum HarmonyMode {
  PRIMARY = 'PRIMARY',
  SQUARE = 'SQUARE',
  COMPLEMENTARY = 'COMPLEMENTARY',
  TRIAD = 'TRIAD',
  ANALOGOUS = 'ANALOGOUS',
  TETRADIC = 'TETRADIC'
}

export interface FcgRequest {
  method?: FractalMethod;
  seed?: number;
}

export interface FcgResponse {
  imageUri: string;
  method: FractalMethod;
  seed: number;
  metadata: {
    durationMs: number;
    retries: number;
    warnings?: string[];
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
}
