// Request validation schemas driven by Ajv (ARCHITECTUREv2 §3 — schema-
// driven to keep branching complexity low in validators).

import { createRequire } from 'node:module';
import { Ajv } from 'ajv';
import type { ErrorObject, JSONSchemaType } from 'ajv';

import type { GenerateCardRequest } from '../../shared/types.js';
import { FRACTAL_METHODS } from '../../shared/types.js';
import {
  MAX_ITERATIONS,
  MIN_ITERATIONS,
  MIN_ZOOM,
  MAX_ZOOM,
} from '../../domain/constants.js';

// ajv-formats uses `module.exports = formatsPlugin` (CJS); under NodeNext
// ESM the default-import/namespace types do not reliably resolve to the
// callable plugin. Bridge via createRequire + an explicit function-signature
// cast to keep the boundary type-safe.
type AddFormatsFn = (ajv: Ajv, opts?: unknown) => Ajv;
const nodeRequire = createRequire(import.meta.url);
const addFormats = nodeRequire('ajv-formats') as unknown as AddFormatsFn;

const ajv = new Ajv({ allErrors: true, strict: true, useDefaults: false });
addFormats(ajv);

const generateCardSchema: JSONSchemaType<GenerateCardRequest> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    method: { type: 'string', enum: [...FRACTAL_METHODS], nullable: true },
    seed: { type: 'integer', minimum: 0, maximum: 2_147_483_647, nullable: true },
    iterations: {
      type: 'integer',
      minimum: MIN_ITERATIONS,
      maximum: MAX_ITERATIONS,
      nullable: true,
    },
    zoom: { type: 'number', minimum: MIN_ZOOM, maximum: MAX_ZOOM, nullable: true },
  },
};

const compiledGenerateCard = ajv.compile(generateCardSchema);

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly ErrorObject[];
  readonly value?: GenerateCardRequest;
}

export const validateGenerateCard = (input: unknown): ValidationResult => {
  const body = (input ?? {}) as Record<string, unknown>;
  if (compiledGenerateCard(body)) {
    return { ok: true, errors: [], value: body };
  }
  return { ok: false, errors: compiledGenerateCard.errors ?? [] };
};
