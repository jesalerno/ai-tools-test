// OpenAPI 3.0.3 spec for fcg-claude.
import { FRACTAL_METHODS, COLOR_HARMONY_MODES } from '../../shared/types.js';

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Fractal Card Generator API',
    description: 'Generate print-quality fractal playing-card backs.',
    version: '1.0.0',
    license: { name: 'MIT' },
  },
  servers: [{ url: 'http://localhost:8040', description: 'Local development' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Service readiness probe',
        responses: {
          '200': {
            description: 'Service healthy',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } },
            },
          },
        },
      },
    },
    '/api/cards/generate': {
      post: {
        summary: 'Generate a fractal playing-card back',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GenerateCardRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Card generated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenerateCardResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '504': { $ref: '#/components/responses/Timeout' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    schemas: {
      FractalMethod: { type: 'string', enum: [...FRACTAL_METHODS] },
      ColorHarmonyMode: { type: 'string', enum: [...COLOR_HARMONY_MODES] },
      GenerateCardRequest: {
        type: 'object',
        additionalProperties: false,
        properties: {
          method: { $ref: '#/components/schemas/FractalMethod' },
          seed: { type: 'integer', minimum: 0, maximum: 2_147_483_647 },
          iterations: { type: 'integer', minimum: 500, maximum: 2000 },
          zoom: { type: 'number', minimum: 0.5, maximum: 4.0 },
        },
      },
      GenerateCardMetadata: {
        type: 'object',
        properties: {
          durationMs: { type: 'integer' },
          retries: { type: 'integer' },
          coverage: { type: 'number' },
          warnings: { type: 'array', items: { type: 'string' } },
          correlationId: { type: 'string' },
        },
        required: ['durationMs', 'retries', 'coverage', 'warnings', 'correlationId'],
      },
      GenerateCardResponse: {
        type: 'object',
        properties: {
          image: { type: 'string', description: 'data:image/jpeg;base64 URI' },
          method: { $ref: '#/components/schemas/FractalMethod' },
          seed: { type: 'integer' },
          iterations: { type: 'integer' },
          zoom: { type: 'number' },
          harmony: { $ref: '#/components/schemas/ColorHarmonyMode' },
          baseHue: { type: 'number' },
          metadata: { $ref: '#/components/schemas/GenerateCardMetadata' },
        },
        required: ['image', 'method', 'seed', 'iterations', 'zoom', 'harmony', 'baseHue', 'metadata'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok'] },
          uptimeSeconds: { type: 'integer' },
          version: { type: 'string' },
        },
        required: ['status', 'uptimeSeconds', 'version'],
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object', additionalProperties: true },
        },
        required: ['error', 'message'],
      },
    },
    responses: {
      ValidationError: {
        description: 'Invalid request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } },
      },
      RateLimited: {
        description: 'Too many requests',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } },
      },
      Timeout: {
        description: 'Generation timed out',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } },
      },
      InternalError: {
        description: 'Unhandled server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } },
      },
    },
  },
} as const;
