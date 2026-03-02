import Ajv from 'ajv';

import type {
  CardImageResponse,
  GenerateCardRequest,
  MethodCatalogResponse,
  SurpriseCardRequest,
} from '../shared/types';

const ajv = new Ajv({allErrors: true, strict: false});

const cardImageSchema = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: [
        'mandelbrot',
        'julia',
        'burning-ship',
        'newton',
        'lyapunov',
        'ifs',
        'l-system',
        'strange-attractor',
        'escape-heightmap',
        'flame',
        'phase-plot',
      ],
    },
    seed: {type: 'number'},
    iterations: {type: 'number'},
    zoom: {type: 'number'},
    coverage: {type: 'number'},
    widthPx: {type: 'number'},
    heightPx: {type: 'number'},
    dpi: {type: 'number'},
    borderPx: {type: 'number'},
    mimeType: {type: 'string', const: 'image/jpeg'},
    imageBase64: {type: 'string'},
    imageDataUrl: {type: 'string'},
    generatedAt: {type: 'string'},
  },
  required: [
    'method',
    'seed',
    'iterations',
    'zoom',
    'coverage',
    'widthPx',
    'heightPx',
    'dpi',
    'borderPx',
    'mimeType',
    'imageBase64',
    'imageDataUrl',
    'generatedAt',
  ],
  additionalProperties: false,
} as const;

const methodsSchema = {
  type: 'object',
  properties: {
    methods: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            enum: [
              'mandelbrot',
              'julia',
              'burning-ship',
              'newton',
              'lyapunov',
              'ifs',
              'l-system',
              'strange-attractor',
              'escape-heightmap',
              'flame',
              'phase-plot',
            ],
          },
          label: {type: 'string'},
          description: {type: 'string'},
        },
        required: ['id', 'label', 'description'],
        additionalProperties: false,
      },
    },
  },
  required: ['methods'],
  additionalProperties: false,
} as const;

const validateCardImage = ajv.compile<CardImageResponse>(cardImageSchema);
const validateMethods = ajv.compile<MethodCatalogResponse>(methodsSchema);

const API_BASE = process.env.REACT_APP_API_BASE ?? '/api';

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as unknown;
  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Request failed.';
    throw new Error(message);
  }

  return body as T;
}

export async function fetchMethods(): Promise<MethodCatalogResponse> {
  const response = await fetch(`${API_BASE}/cards/methods`);
  const body = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error('Unable to load fractal methods.');
  }

  if (!validateMethods(body)) {
    throw new Error('Received invalid methods payload from API.');
  }

  return body;
}

export async function generateCard(payload: GenerateCardRequest): Promise<CardImageResponse> {
  const body = await postJson<CardImageResponse>('/cards/generate', payload);

  if (!validateCardImage(body)) {
    throw new Error('Received invalid card payload from API.');
  }

  return body;
}

export async function surpriseCard(payload: SurpriseCardRequest = {}): Promise<CardImageResponse> {
  const body = await postJson<CardImageResponse>('/cards/surprise', payload);

  if (!validateCardImage(body)) {
    throw new Error('Received invalid card payload from API.');
  }

  return body;
}
