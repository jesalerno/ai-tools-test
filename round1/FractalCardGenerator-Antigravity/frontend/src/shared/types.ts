/**
 * Fractal Method Enums
 */
export enum FractalMethod {
    Mandelbrot = 'Mandelbrot',
    Julia = 'Julia',
    BurningShip = 'BurningShip',
    Newton = 'Newton',
    Lyapunov = 'Lyapunov',
    IFS = 'IFS',
    LSystem = 'LSystem',
    StrangeAttractor = 'StrangeAttractor',
    HeightMap = 'HeightMap',
    Flame = 'Flame',
    PhasePlot = 'PhasePlot',
}

/**
 * Configuration for generating a fractal
 */
export interface FractalConfig {
    method: FractalMethod;
    width: number;
    height: number;
    seed?: number; // Optional seed for randomization
    // Optional specific parameters can be added here as needed
    // specificParams?: Record<string, any>;
}

/**
 * API Response for Fractal Generation
 */
export interface FractalResponse {
    success: boolean;
    message: string;
    imageBase64?: string; // Data URL or base64 string of the generated image
    processingTimeMs?: number;
    paramsUsed?: FractalConfig;
}

/**
 * Error Response
 */
export interface ErrorResponse {
    success: false;
    error: string;
}
