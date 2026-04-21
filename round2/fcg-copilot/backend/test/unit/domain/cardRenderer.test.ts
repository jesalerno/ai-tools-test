/**
 * Unit tests for card renderer (quadrant mirroring and border).
 */

import { mirrorQuadrant, buildCardFromQuadrant, CARD_WIDTH, CARD_HEIGHT, QUAD_WIDTH, QUAD_HEIGHT } from '../../../src/domain/cardRenderer.js';

describe('mirrorQuadrant', () => {
  it('should produce a full card 2x the quadrant dimensions', () => {
    const qw = 4; const qh = 4;
    const quadData = new Uint8ClampedArray(qw * qh * 4).fill(128);
    const full = mirrorQuadrant(quadData, qw, qh);
    expect(full.length).toBe(qw * 2 * qh * 2 * 4);
  });

  it('should mirror pixels horizontally', () => {
    const qw = 2; const qh = 2;
    const quadData = new Uint8ClampedArray(qw * qh * 4);
    // Set top-left pixel to red
    quadData[0] = 255; quadData[1] = 0; quadData[2] = 0; quadData[3] = 255;
    const full = mirrorQuadrant(quadData, qw, qh);
    // Top-right mirror pixel should also be red (px = fullW-1 = 3, py = 0)
    const fullW = qw * 2;
    const mirrorOffset = (0 * fullW + (fullW - 1)) * 4;
    expect(full[mirrorOffset]).toBe(255);
    expect(full[mirrorOffset + 1]).toBe(0);
    expect(full[mirrorOffset + 2]).toBe(0);
  });

  it('should mirror pixels vertically', () => {
    const qw = 2; const qh = 2;
    const quadData = new Uint8ClampedArray(qw * qh * 4);
    quadData[0] = 0; quadData[1] = 255; quadData[2] = 0; quadData[3] = 255;
    const full = mirrorQuadrant(quadData, qw, qh);
    const fullW = qw * 2;
    const fullH = qh * 2;
    const mirrorOffset = ((fullH - 1) * fullW + 0) * 4;
    expect(full[mirrorOffset + 1]).toBe(255);
  });
});

describe('buildCardFromQuadrant', () => {
  it('should produce correct card dimensions', () => {
    const quadData = new Uint8ClampedArray(QUAD_WIDTH * QUAD_HEIGHT * 4).fill(100);
    const full = buildCardFromQuadrant(quadData, QUAD_WIDTH, QUAD_HEIGHT);
    expect(full.length).toBe(CARD_WIDTH * CARD_HEIGHT * 4);
  });

  it('should apply white border at edges', () => {
    const quadData = new Uint8ClampedArray(QUAD_WIDTH * QUAD_HEIGHT * 4).fill(50);
    const full = buildCardFromQuadrant(quadData, QUAD_WIDTH, QUAD_HEIGHT);
    // Top-left corner should be white (border region)
    expect(full[0]).toBe(255);
    expect(full[1]).toBe(255);
    expect(full[2]).toBe(255);
  });
});
