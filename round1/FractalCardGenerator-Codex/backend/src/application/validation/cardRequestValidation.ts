import type {GenerateCardRequest, SurpriseCardRequest} from '../../shared/types';
import {FRACTAL_METHODS, type FractalMethod} from '../../shared/types';
import {MAX_ITERATIONS, MAX_ZOOM, MIN_ITERATIONS, MIN_ZOOM} from '../../domain/models/cardSpec';
import {ValidationError} from '../errors/httpError';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFractalMethod(value: string): value is FractalMethod {
  return FRACTAL_METHODS.some(method => method === value);
}

function parseOptionalNumber(fieldName: string, value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a finite number when provided.`);
  }

  return value;
}

function parseIterations(value: unknown): number | undefined {
  const parsed = parseOptionalNumber('iterations', value);
  if (parsed === undefined) {
    return undefined;
  }

  if (parsed < MIN_ITERATIONS || parsed > MAX_ITERATIONS) {
    throw new ValidationError(`iterations must be between ${MIN_ITERATIONS} and ${MAX_ITERATIONS}.`);
  }

  return Math.floor(parsed);
}

function parseZoom(value: unknown): number | undefined {
  const parsed = parseOptionalNumber('zoom', value);
  if (parsed === undefined) {
    return undefined;
  }

  if (parsed < MIN_ZOOM || parsed > MAX_ZOOM) {
    throw new ValidationError(`zoom must be between ${MIN_ZOOM} and ${MAX_ZOOM}.`);
  }

  return parsed;
}

function parseSeed(value: unknown): number | undefined {
  const parsed = parseOptionalNumber('seed', value);
  if (parsed === undefined) {
    return undefined;
  }

  if (parsed < 0 || parsed > Number.MAX_SAFE_INTEGER) {
    throw new ValidationError('seed must be between 0 and Number.MAX_SAFE_INTEGER.');
  }

  return Math.floor(parsed);
}

export function validateGenerateCardRequest(payload: unknown): GenerateCardRequest {
  if (!isRecord(payload)) {
    throw new ValidationError('Request body must be a JSON object.');
  }

  const method = payload.method;
  if (typeof method !== 'string' || !isFractalMethod(method)) {
    throw new ValidationError('method must be one of the supported fractal methods.');
  }

  return {
    method,
    seed: parseSeed(payload.seed),
    iterations: parseIterations(payload.iterations),
    zoom: parseZoom(payload.zoom),
  };
}

export function validateSurpriseCardRequest(payload: unknown): SurpriseCardRequest {
  if (payload === undefined) {
    return {};
  }

  if (!isRecord(payload)) {
    throw new ValidationError('Request body must be a JSON object when provided.');
  }

  return {
    seed: parseSeed(payload.seed),
    iterations: parseIterations(payload.iterations),
    zoom: parseZoom(payload.zoom),
  };
}
