// Quadrant → full card mirroring (FCG-SPECv3 §3.2).
// Renders one quadrant then reflects into the other three so the image is
// D2-symmetric: coherent horizontally, vertically, and upside-down.

export interface RgbBuffer {
  readonly pixels: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface MirrorCtx {
  readonly out: Uint8ClampedArray;
  readonly src: Uint8ClampedArray;
  readonly qw: number;
  readonly qh: number;
  readonly outW: number;
}

export const mirrorQuadrantToCard = (quadrant: RgbBuffer): RgbBuffer => {
  const qw = quadrant.width;
  const qh = quadrant.height;
  const outW = qw * 2;
  const outH = qh * 2;
  const out = new Uint8ClampedArray(outW * outH * 4);
  const ctx: MirrorCtx = { out, src: quadrant.pixels, qw, qh, outW };
  for (let y = 0; y < qh; y++) {
    for (let x = 0; x < qw; x++) {
      blitMirrored(ctx, x, y);
    }
  }
  return { pixels: out, width: outW, height: outH };
};

const blitMirrored = (ctx: MirrorCtx, x: number, y: number): void => {
  const srcIdx = (y * ctx.qw + x) * 4;
  const r = ctx.src[srcIdx] ?? 0;
  const g = ctx.src[srcIdx + 1] ?? 0;
  const b = ctx.src[srcIdx + 2] ?? 0;
  const a = ctx.src[srcIdx + 3] ?? 255;
  const pix = { r, g, b, a };
  writePixel(ctx.out, ctx.outW, ctx.qw - 1 - x, ctx.qh - 1 - y, pix);
  writePixel(ctx.out, ctx.outW, ctx.qw + x, ctx.qh - 1 - y, pix);
  writePixel(ctx.out, ctx.outW, ctx.qw - 1 - x, ctx.qh + y, pix);
  writePixel(ctx.out, ctx.outW, ctx.qw + x, ctx.qh + y, pix);
};

interface PixelRgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const writePixel = (
  buf: Uint8ClampedArray,
  stride: number,
  x: number,
  y: number,
  p: PixelRgba,
): void => {
  const o = (y * stride + x) * 4;
  buf[o] = p.r;
  buf[o + 1] = p.g;
  buf[o + 2] = p.b;
  buf[o + 3] = p.a;
};
