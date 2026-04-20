// Flame Fractal renderer
import { buildLogPalette, mapColor, logDensityT } from '../palette.js';
const FLAME_ITERS = 1500000;
const WARM_UP = 30;
/** Simple seeded PRNG */
function prng(seed) {
    let s = (seed ^ 0xdeadbeef) >>> 0;
    return () => {
        s = Math.imul(s ^ (s >>> 15), s | 1);
        s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
        return ((s ^ (s >>> 14)) >>> 0) / 0xffffffff;
    };
}
/**
 * Generate seed-based affine transforms with expansive linear parts so that
 * the sin() application creates chaotic (space-filling) rather than periodic dynamics.
 */
function generateXForms(rand, count) {
    return Array.from({ length: count }, () => ({
        a: 1.2 + rand() * 1.4, // expansive [1.2 – 2.6] → drives chaos in sin
        b: (rand() - 0.5) * 0.7, // small coupling term
        c: (rand() - 0.5) * Math.PI, // phase shift
        d: (rand() - 0.5) * 0.7,
        e: 1.2 + rand() * 1.4,
        f: (rand() - 0.5) * Math.PI,
    }));
}
/** Accumulate flame density using proper chaos game with random transform selection */
function accumulateFlame(density, width, height, seed) {
    const rand = prng(seed);
    const xforms = generateXForms(rand, 3);
    let x = rand() * 2 - 1, y = rand() * 2 - 1;
    // Warm up — let the orbit settle onto the attractor before plotting
    for (let i = 0; i < WARM_UP; i++) {
        const xf = xforms[Math.floor(rand() * xforms.length)];
        const ax = xf.a * x + xf.b * y + xf.c;
        const ay = xf.d * x + xf.e * y + xf.f;
        x = Math.sin(ax);
        y = Math.sin(ay);
    }
    // Accumulate: sin() keeps the state in [−1, 1]² so mapping is straightforward
    for (let i = 0; i < FLAME_ITERS; i++) {
        const xf = xforms[Math.floor(rand() * xforms.length)];
        const ax = xf.a * x + xf.b * y + xf.c;
        const ay = xf.d * x + xf.e * y + xf.f;
        x = Math.sin(ax);
        y = Math.sin(ay);
        const px = Math.floor(((x + 1) / 2) * width);
        const py = Math.floor(((y + 1) / 2) * height);
        if (px >= 0 && px < width && py >= 0 && py < height) {
            density[py * width + px] += 1;
        }
    }
}
/** Color flame density into pixel buffer */
function colorFlame(buf, density, palette) {
    let maxD = 0;
    for (let i = 0; i < density.length; i++) {
        if (density[i] > maxD)
            maxD = density[i];
    }
    for (let i = 0; i < density.length; i++) {
        const t = logDensityT(density[i], maxD);
        const idx = i * 4;
        if (t > 0) {
            const c = mapColor(t, palette);
            buf[idx] = c.r;
            buf[idx + 1] = c.g;
            buf[idx + 2] = c.b;
            buf[idx + 3] = 255;
        }
        else {
            buf[idx] = 10;
            buf[idx + 1] = 5;
            buf[idx + 2] = 20;
            buf[idx + 3] = 255;
        }
    }
}
/** Render flame fractal */
export function renderFlame(buf, width, height, opts) {
    const { seed, harmony } = opts;
    const palette = buildLogPalette((seed * 31.4) % 360, harmony, 256);
    const density = new Float32Array(width * height);
    accumulateFlame(density, width, height, seed);
    colorFlame(buf, density, palette);
}
//# sourceMappingURL=flame.js.map