/**
 * Input validation for API requests
 */

import { FractalMethod, GenerateCardRequest, FRACTAL_METHODS } from '../../shared/types';

interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: GenerateCardRequest;
}

const MAX_SEED = 1000000000;
const MIN_SEED = 0;

/**
 * Validate generate card request
 */
export function validateGenerateCardRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: 'Request body must be a JSON object'
    };
  }

  const req = body as Record<string, unknown>;

  if (!req.method || typeof req.method !== 'string') {
    return {
      valid: false,
      error: 'Missing or invalid "method" field'
    };
  }

  const validMethods = FRACTAL_METHODS.map(m => m.id);
  if (!validMethods.includes(req.method as FractalMethod)) {
    return {
      valid: false,
      error: `Invalid method. Must be one of: ${validMethods.join(', ')}`
    };
  }

  if (req.seed !== undefined) {
    if (typeof req.seed !== 'number') {
      return {
        valid: false,
        error: 'Seed must be a number'
      };
    }

    if (!Number.isInteger(req.seed)) {
      return {
        valid: false,
        error: 'Seed must be an integer'
      };
    }

    if (req.seed < MIN_SEED || req.seed > MAX_SEED) {
      return {
        valid: false,
        error: `Seed must be between ${MIN_SEED} and ${MAX_SEED}`
      };
    }
  }

  return {
    valid: true,
    data: {
      method: req.method as FractalMethod,
      seed: req.seed as number | undefined
    }
  };
}
