// Coverage = fraction of non-background pixels in the quadrant.
// FCG-SPECv3 §3.3 requires ≥ 0.80; renderers retry with adjusted params
// below that threshold.

const BG_TOLERANCE = 12;

export const computeCoverage = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  bg: { r: number; g: number; b: number },
): number => {
  const total = width * height;
  if (total === 0) return 0;
  let nonBg = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const r = pixels[o] ?? 0;
    const g = pixels[o + 1] ?? 0;
    const b = pixels[o + 2] ?? 0;
    const dr = Math.abs(r - bg.r);
    const dg = Math.abs(g - bg.g);
    const db = Math.abs(b - bg.b);
    if (dr > BG_TOLERANCE || dg > BG_TOLERANCE || db > BG_TOLERANCE) nonBg++;
  }
  return nonBg / total;
};
