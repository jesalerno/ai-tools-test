import assert from 'node:assert/strict';
import net from 'node:net';
import {before, test, type TestContext} from 'node:test';

import request from 'supertest';

import {createApp} from '../../src/app';
import type {CardRendererPort} from '../../src/application/services/cardRendererPort';

interface MethodsBody {
  methods: unknown[];
}

interface GenerateBody {
  method: string;
  imageBase64: string;
}

interface ErrorBody {
  error: string;
}

class MockRenderer implements CardRendererPort {
  renderJpegBase64(): Promise<string> {
    return Promise.resolve('aW1hZ2UtYmFzZTY0');
  }
}

const app = createApp({renderer: new MockRenderer()});

let canBindSocket = true;

function probeSocketBinding(): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.listen(0, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

function skipWhenSocketsBlocked(context: TestContext): boolean {
  if (canBindSocket) {
    return false;
  }

  context.skip('Socket binding is blocked in this environment.');
  return true;
}

before(async () => {
  canBindSocket = await probeSocketBinding();
});

test('cards API (mock): returns supported methods', async context => {
  if (skipWhenSocketsBlocked(context)) {
    return;
  }

  const response = await request(app).get('/api/cards/methods');
  const body = response.body as MethodsBody;

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body.methods), true);
  assert.equal(body.methods.length, 11);
});

test('cards API (mock): generates card from selected method', async context => {
  if (skipWhenSocketsBlocked(context)) {
    return;
  }

  const response = await request(app)
    .post('/api/cards/generate')
    .send({method: 'julia', seed: 12, iterations: 550, zoom: 1.3});
  const body = response.body as GenerateBody;

  assert.equal(response.status, 200);
  assert.equal(body.method, 'julia');
  assert.equal(body.imageBase64, 'aW1hZ2UtYmFzZTY0');
});

test('cards API (mock): rejects invalid method', async context => {
  if (skipWhenSocketsBlocked(context)) {
    return;
  }

  const response = await request(app).post('/api/cards/generate').send({method: 'invalid'});
  const body = response.body as ErrorBody;

  assert.equal(response.status, 400);
  assert.match(String(body.error), /method/i);
});
