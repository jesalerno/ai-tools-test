/**
 * AJV validation schemas for the generate endpoint request.
 * Schema-driven validation reduces branching complexity per spec §3 / ARCHITECTUREv2.
 */

import Ajv from 'ajv';
import type { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
import type { FractalMethod, GenerateRequest } from '../../shared/types.js';
import { FRACTAL_METHODS } from '../../shared/types.js';

// Ajv v8 default export is CJS; NodeNext types it as a namespace, not a class constructor.
// We define a minimal interface for the subset of Ajv we need.
interface AjvLike { compile<T>(schema: JSONSchemaType<T>): ValidateFunction<T>; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ajvInstance: AjvLike = new (Ajv as any as new (opts: Record<string, unknown>) => AjvLike)(
  { allErrors: true, strict: true }
);

/** JSON Schema for GenerateRequest. */
const generateRequestSchema: JSONSchemaType<GenerateRequest> = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: FRACTAL_METHODS as unknown as readonly (FractalMethod | undefined)[],
      nullable: true,
    },
    params: {
      type: 'object',
      properties: {
        seed: { type: 'number', minimum: 0, maximum: 2147483647, nullable: true },
        iterations: { type: 'number', minimum: 500, maximum: 2000, nullable: true },
        zoom: { type: 'number', minimum: 0.5, maximum: 4.0, nullable: true },
      },
      additionalProperties: false,
      nullable: true,
    },
  },
  additionalProperties: false,
};

/** Compiled validate function for GenerateRequest. */
export const validateGenerateRequest = ajvInstance.compile<GenerateRequest>(generateRequestSchema);

/** Extract field name from an AJV error object. */
function errorField(err: ErrorObject): string {
  const extra = err.params as Record<string, unknown>;
  const addProp = typeof extra['additionalProperty'] === 'string' ? extra['additionalProperty'] : '';
  return err.instancePath.replace(/^\//, '') || addProp || 'request';
}

/** Format AJV errors into field-specific detail map. */
export function formatValidationErrors(
  errors: ValidateFunction['errors']
): Record<string, string> {
  const details: Record<string, string> = {};
  if (!errors) return details;
  for (const err of errors) {
    details[errorField(err)] = err.message ?? 'invalid value';
  }
  return details;
}
