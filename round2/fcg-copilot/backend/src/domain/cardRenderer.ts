/**
 * Card renderer: generates a full playing card back (750×1050 px) from a
 * fractal quadrant by mirroring to all four quadrants with border.
 *
 * Physical size: 2.5in × 3.5in at 300 DPI → 750 × 1050 px.
 * Border: 3mm white (≈ 35 px at 300 DPI), rounded corners 8 px radius.
 * Symmetry: horizontal + vertical mirroring.
 */

/** Full card dimensions. */
export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;
/** Quadrant dimensions. */
export const QUAD_WIDTH = Math.floor(CARD_WIDTH / 2);
export const QUAD_HEIGHT = Math.floor(CARD_HEIGHT / 2);
/** Border width in pixels (3 mm at 300 DPI ≈ 35 px). */
const BORDER_PX = 35;
/** Rounded corner radius in pixels. */
const CORNER_RADIUS = 8;

/** Write white border around the card edge. */
function applyBorder(data: Uint8ClampedArray, width: number, height: number): void {
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (isInBorder(px, py, width, height)) {
        const offset = (py * width + px) * 4;
        data[offset] = 255;
        data[offset + 1] = 255;
        data[offset + 2] = 255;
        data[offset + 3] = 255;
      }
    }
  }
}

/** Check if a pixel is within the border region or outside rounded corners. */
function isInBorder(px: number, py: number, width: number, height: number): boolean {
  if (px < BORDER_PX || px >= width - BORDER_PX) return true;
  if (py < BORDER_PX || py >= height - BORDER_PX) return true;
  return isOutsideRoundedCorner(px, py, width, height);
}

/** Check if pixel is outside the rounded corner arc. */
function isOutsideRoundedCorner(
  px: number,
  py: number,
  width: number,
  height: number
): boolean {
  const cx = BORDER_PX + CORNER_RADIUS;
  const cy = BORDER_PX + CORNER_RADIUS;
  const corners: Array<[number, number]> = [
    [cx, cy],
    [width - cx, cy],
    [cx, height - cy],
    [width - cx, height - cy],
  ];

  for (const [ccx, ccy] of corners) {
    if (isPixelNearCorner(px, py, ccx, ccy)) {
      const dx = px - ccx;
      const dy = py - ccy;
      if (dx * dx + dy * dy > CORNER_RADIUS * CORNER_RADIUS) return true;
    }
  }
  return false;
}

/** Check if pixel is within CORNER_RADIUS on each axis of a corner center. */
function isPixelNearCorner(px: number, py: number, ccx: number, ccy: number): boolean {
  return Math.abs(px - ccx) <= CORNER_RADIUS && Math.abs(py - ccy) <= CORNER_RADIUS;
}

/**
 * Mirror a quadrant to all four quadrants to produce the full card image.
 * Horizontal mirror: top-right = flip of top-left.
 * Vertical mirror: bottom-left = flip of top-left, bottom-right = flip of top-right.
 */
export function mirrorQuadrant(
  quadData: Uint8ClampedArray,
  qw: number,
  qh: number
): Uint8ClampedArray {
  const fullW = qw * 2;
  const fullH = qh * 2;
  const full = new Uint8ClampedArray(fullW * fullH * 4);

  for (let qy = 0; qy < qh; qy++) {
    for (let qx = 0; qx < qw; qx++) {
      const srcOffset = (qy * qw + qx) * 4;
      const r = quadData[srcOffset] ?? 255;
      const g = quadData[srcOffset + 1] ?? 255;
      const b = quadData[srcOffset + 2] ?? 255;
      const a = quadData[srcOffset + 3] ?? 255;

      // Top-left (original quadrant)
      writeFullPixel(full, fullW, qx, qy, [r, g, b, a]);
      // Top-right (horizontal mirror)
      writeFullPixel(full, fullW, fullW - 1 - qx, qy, [r, g, b, a]);
      // Bottom-left (vertical mirror)
      writeFullPixel(full, fullW, qx, fullH - 1 - qy, [r, g, b, a]);
      // Bottom-right (both mirrors)
      writeFullPixel(full, fullW, fullW - 1 - qx, fullH - 1 - qy, [r, g, b, a]);
    }
  }

  return full;
}

/** Write a single RGBA pixel into the full card buffer. */
function writeFullPixel(
  data: Uint8ClampedArray,
  fullW: number,
  px: number,
  py: number,
  rgba: readonly [number, number, number, number]
): void {
  const offset = (py * fullW + px) * 4;
  data[offset] = rgba[0];
  data[offset + 1] = rgba[1];
  data[offset + 2] = rgba[2];
  data[offset + 3] = rgba[3];
}

/**
 * Build the complete card pixel buffer from a quadrant.
 * Applies mirroring then white border with rounded corners.
 */
export function buildCardFromQuadrant(
  quadData: Uint8ClampedArray,
  qw: number,
  qh: number
): Uint8ClampedArray {
  const full = mirrorQuadrant(quadData, qw, qh);
  applyBorder(full, qw * 2, qh * 2);
  return full;
}
