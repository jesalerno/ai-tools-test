import { createCanvas } from "@napi-rs/canvas";
interface ComplexPoint {
  re: number;
  im: number;
}

import type { FractalMethod } from "../shared/types.js";
import { CORNER_RADIUS_PX, MAX_ITER, QUADRANT_HEIGHT, QUADRANT_WIDTH, WHITE_BORDER_PX } from "./constants.js";
import { buildPalette, darkTint, pickHarmonyMode } from "./palette.js";

export interface RenderResult {
  imageDataUri: string;
  coverage: number;
  harmonyMode: ReturnType<typeof pickHarmonyMode>;
}

const hashSeed = (seed: string): number => {
  let out = 0;
  for (let i = 0; i < seed.length; i += 1) {
    out = (out * 31 + seed.charCodeAt(i)) | 0;
  }
  return out;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const isEscapeMethod = (method: FractalMethod): boolean =>
  method === "MANDELBROT" || method === "JULIA" || method === "BURNING_SHIP" || method === "HEIGHTMAP";

type Viewport = {
  centerRe: number;
  centerIm: number;
  span: number;
};

const pickViewport = (method: FractalMethod, seedBias: number): Viewport => {
  const zoom = 0.55 + ((Math.abs(seedBias) % 1000) / 1000) * 1.35;
  if (method === "MANDELBROT" || method === "BURNING_SHIP" || method === "HEIGHTMAP") {
    const presets = [
      { centerRe: -0.7435669, centerIm: 0.1314023 },
      { centerRe: -1.2505, centerIm: 0.0205 },
      { centerRe: -0.16, centerIm: 1.0405 },
      { centerRe: 0.285, centerIm: 0.01 }
    ];
    const pick = presets[Math.abs(seedBias) % presets.length];
    return { centerRe: pick.centerRe, centerIm: pick.centerIm, span: 2.8 / zoom };
  }
  if (method === "JULIA") {
    return { centerRe: 0, centerIm: 0, span: 3.0 / zoom };
  }
  if (method === "NEWTON" || method === "PHASE_PLOT") {
    return { centerRe: 0, centerIm: 0, span: 2.6 / zoom };
  }
  return { centerRe: -0.5, centerIm: 0, span: 3.0 / zoom };
};

const mapPixelToComplex = (x: number, y: number, viewport: Viewport): ComplexPoint => ({
  re: viewport.centerRe + ((x + 0.5) / QUADRANT_WIDTH - 0.5) * viewport.span,
  im: viewport.centerIm + ((y + 0.5) / QUADRANT_HEIGHT - 0.5) * viewport.span
});

const minMax = (data: Float64Array): { min: number; max: number } => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < data.length; i += 1) {
    const value = data[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
};

const iterateEscape = (method: FractalMethod, c: ComplexPoint, zStart: ComplexPoint): { iter: number; z: ComplexPoint } => {
  let z = { ...zStart };
  for (let i = 0; i < MAX_ITER; i += 1) {
    if (z.re * z.re + z.im * z.im > 16) return { iter: i, z };
    const nextReBase = z.re * z.re - z.im * z.im;
    const nextImBase = 2 * z.re * z.im;
    if (method === "BURNING_SHIP") {
      const absRe = Math.abs(z.re);
      const absIm = Math.abs(z.im);
      z = { re: absRe * absRe - absIm * absIm + c.re, im: 2 * absRe * absIm + c.im };
    } else {
      z = { re: nextReBase + c.re, im: nextImBase + c.im };
    }
  }
  return { iter: MAX_ITER, z };
};

const juliaConstant = (seedBias: number): ComplexPoint => {
  const angle = ((Math.abs(seedBias) % 360) * Math.PI) / 180;
  return { re: -0.8 + 0.6 * Math.cos(angle), im: 0.2 + 0.6 * Math.sin(angle) };
};

const escapeSmoothValue = (method: FractalMethod, c: ComplexPoint, zStart: ComplexPoint): number => {
  const { iter, z } = iterateEscape(method, c, zStart);
  if (iter >= MAX_ITER) {
    const mag2 = z.re * z.re + z.im * z.im;
    return clamp01(0.12 + 0.22 * (1 - 1 / (1 + mag2)));
  }
  const z2 = z.re * z.re + z.im * z.im;
  const logZ = Math.log(Math.max(1e-12, z2)) / 2;
  const nu = Math.log(Math.max(1e-12, logZ)) / Math.log(2);
  return iter + 1 - clamp01(nu);
};

const lyapunovScore = (x: number, y: number, seedBias: number): number => {
  const a = 3.5 + (x / QUADRANT_WIDTH) * 0.5;
  const b = 3.5 + (y / QUADRANT_HEIGHT) * 0.5;
  const seq = [a, b, a, a, b, b];
  let value = 0.5 + (seedBias % 7) * 0.01;
  let total = 0;
  for (let i = 0; i < 80; i += 1) {
    const r = seq[i % seq.length];
    value = r * value * (1 - value);
    const deriv = Math.abs(r * (1 - 2 * value));
    total += Math.log(deriv + 0.00001);
  }
  return total / 80;
};

const hash2 = (x: number, y: number, seedBias: number): number => {
  let h = seedBias ^ 0x9e3779b9;
  h = (h ^ x) * 2654435761;
  h = (h ^ y) * 2246822519;
  return h | 0;
};

const valueNoise = (x: number, y: number, seedBias: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = (hash2(xi, yi, seedBias) & 1023) / 1023;
  const b = (hash2(xi + 1, yi, seedBias) & 1023) / 1023;
  const c = (hash2(xi, yi + 1, seedBias) & 1023) / 1023;
  const d = (hash2(xi + 1, yi + 1, seedBias) & 1023) / 1023;
  const ab = a + (b - a) * u;
  const cd = c + (d - c) * u;
  return ab + (cd - ab) * v;
};

const fractalBrownian = (nx: number, ny: number, seedBias: number): number => {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let octave = 0; octave < 5; octave += 1) {
    sum += amp * valueNoise(nx * freq, ny * freq, seedBias + octave * 9973);
    norm += amp;
    amp *= 0.55;
    freq *= 2.05;
  }
  return sum / norm;
};

const renderIfsDensity = (seedBias: number): Float64Array => {
  const density = new Float64Array(QUADRANT_WIDTH * QUADRANT_HEIGHT);
  const transforms: ReadonlyArray<readonly [number, number, number, number, number, number, number]> = [
    [0, 0, 0, 0.16, 0, 0, 0.01],
    [0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.85],
    [0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.07],
    [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07]
  ];
  const chooseTransform = (sample: number) => {
    let cumulative = 0;
    for (let i = 0; i < transforms.length; i += 1) {
      cumulative += transforms[i]?.[6] ?? 0;
      if (sample < cumulative) return transforms[i] ?? transforms[0]!;
    }
    return transforms[transforms.length - 1] ?? transforms[0]!;
  };

  let x = 0;
  let y = 0;
  const warmup = 32;
  const iterations = 185000;
  for (let i = 0; i < warmup + iterations; i += 1) {
    const r = valueNoise(i * 0.017, i * 0.041, seedBias + 177);
    const t = chooseTransform(r);
    const nx = t[0] * x + t[1] * y + t[4];
    const ny = t[2] * x + t[3] * y + t[5];
    x = nx;
    y = ny;
    if (i < warmup) continue;
    const px = Math.floor(((x + 2.75) / 5.5) * QUADRANT_WIDTH);
    const py = Math.floor((1 - (y + 0.2) / 11.0) * QUADRANT_HEIGHT);
    if (px >= 0 && px < QUADRANT_WIDTH && py >= 0 && py < QUADRANT_HEIGHT) {
      density[py * QUADRANT_WIDTH + px] += 1;
    }
  }
  return density;
};

const densityValue = (method: FractalMethod, x: number, y: number, seedBias: number): number => {
  const nx = x / QUADRANT_WIDTH;
  const ny = y / QUADRANT_HEIGHT;
  if (method === "IFS" || method === "FLAME") {
    const warp = fractalBrownian(nx * 4.3 + 3.1, ny * 4.1 - 2.7, seedBias);
    const wx = nx * 1.7 + (warp - 0.5) * 0.24;
    const wy = ny * 1.7 + (0.5 - warp) * 0.24;
    const base = fractalBrownian(wx * 10.5, wy * 10.5, seedBias + 71);
    const ridge = 1 - Math.abs(2 * base - 1);
    return clamp01(0.45 * base + 0.55 * ridge);
  }
  if (method === "STRANGE_ATTRACTOR") {
    const swirl = Math.sin((nx * 7.5 + ny * 5.2) * Math.PI) * 0.12;
    const wx = nx + swirl;
    const wy = ny - swirl;
    const low = fractalBrownian(wx * 5.8, wy * 5.8, seedBias + 193);
    const high = fractalBrownian(wx * 12.4 + 4.4, wy * 12.4 - 1.9, seedBias + 811);
    return clamp01(0.67 * low + 0.33 * high);
  }
  if (method === "HEIGHTMAP") {
    const base = fractalBrownian(nx * 6.2, ny * 6.2, seedBias);
    const detail = fractalBrownian(nx * 18.5 + 13.1, ny * 18.5 - 9.7, seedBias + 101);
    return clamp01(0.55 * base + 0.45 * detail);
  }
  const base = fractalBrownian(nx * 9.4 + 5.7, ny * 9.4 - 4.3, seedBias + 313);
  return clamp01(0.35 + 0.65 * (1 - Math.abs(2 * base - 1)));
};

const newtonScore = (point: ComplexPoint): number => {
  const roots: ComplexPoint[] = [
    { re: 1, im: 0 },
    { re: -0.5, im: 0.8660254 },
    { re: -0.5, im: -0.8660254 }
  ];
  let z = { ...point };
  let iteration = 0;
  const maxNewtonIterations = 48;
  for (; iteration < maxNewtonIterations; iteration += 1) {
    const z2Re = z.re * z.re - z.im * z.im;
    const z2Im = 2 * z.re * z.im;
    const z3Re = z2Re * z.re - z2Im * z.im;
    const z3Im = z2Re * z.im + z2Im * z.re;
    const fRe = z3Re - 1;
    const fIm = z3Im;
    const fpRe = 3 * z2Re;
    const fpIm = 3 * z2Im;
    const denom = fpRe * fpRe + fpIm * fpIm;
    if (denom < 1e-9) break;
    const divRe = (fRe * fpRe + fIm * fpIm) / denom;
    const divIm = (fIm * fpRe - fRe * fpIm) / denom;
    z = { re: z.re - divRe, im: z.im - divIm };
    if (divRe * divRe + divIm * divIm < 1e-10) break;
  }
  let rootIndex = 0;
  let rootDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < roots.length; i += 1) {
    const dx = z.re - roots[i].re;
    const dy = z.im - roots[i].im;
    const dist = dx * dx + dy * dy;
    if (dist < rootDistance) {
      rootDistance = dist;
      rootIndex = i;
    }
  }
  return rootIndex * 100 + iteration;
};

const computeValue = (method: FractalMethod, x: number, y: number, seedBias: number, viewport: Viewport): number => {
  const point = mapPixelToComplex(x, y, viewport);
  if (method === "MANDELBROT") return escapeSmoothValue(method, point, { re: 0, im: 0 });
  if (method === "JULIA") return escapeSmoothValue(method, juliaConstant(seedBias), point);
  if (method === "BURNING_SHIP") return escapeSmoothValue(method, point, { re: 0, im: 0 });
  if (method === "HEIGHTMAP") {
    const height = fractalBrownian(x / 120, y / 120, seedBias);
    return escapeSmoothValue("MANDELBROT", point, { re: height - 0.55, im: height - 0.45 });
  }
  if (method === "NEWTON") return newtonScore(point);
  if (method === "LYAPUNOV") return lyapunovScore(x, y, seedBias);
  if (method === "L_SYSTEM") return densityValue("HEIGHTMAP", x, y, seedBias);
  return densityValue(method, x, y, seedBias);
};

const mapIntensity = (method: FractalMethod, raw: number, normalized: number): number => {
  if (method === "LYAPUNOV") {
    return raw >= 0 ? 0.12 + normalized * 0.28 : 0.42 + normalized * 0.58;
  }
  if (method === "NEWTON") {
    const iterBand = raw % 100;
    return clamp01(0.2 + iterBand / 120);
  }
  if (isEscapeMethod(method)) {
    return clamp01(Math.log(raw + 1) / Math.log(MAX_ITER + 1));
  }
  const densityMapped = Math.log(1 + normalized * 255) / Math.log(256);
  return clamp01(Math.pow(densityMapped, 0.5));
};

const phasePlotFunction = (z: ComplexPoint, mode: number): ComplexPoint => {
  if (mode === 0) {
    const expRe = Math.exp(z.re) * Math.cos(z.im);
    const expIm = Math.exp(z.re) * Math.sin(z.im);
    return { re: expRe, im: expIm };
  }
  if (mode === 1) {
    return { re: Math.sin(z.re) * Math.cosh(z.im), im: Math.cos(z.re) * Math.sinh(z.im) };
  }
  const z2Re = z.re * z.re - z.im * z.im;
  const z2Im = 2 * z.re * z.im;
  return { re: z2Re, im: z2Im };
};

const phasePlotColor = (z: ComplexPoint, seedBias: number, palette: ReturnType<typeof buildPalette>) => {
  const mode = Math.abs(seedBias) % 2;
  const f = phasePlotFunction(z, mode);
  const magnitude = Math.sqrt(f.re * f.re + f.im * f.im);
  const hue = (Math.atan2(f.im, f.re) + Math.PI) / (2 * Math.PI);
  const hueIndex = Math.floor(hue * 255);
  const hueColor = palette[hueIndex];
  const logMag = Math.log(magnitude + 1);
  const magBand = 0.5 + 0.5 * Math.cos(logMag * 1.2 + hue * Math.PI * 0.35);
  const radial = Math.sqrt(z.re * z.re + z.im * z.im);
  const edgeFade = clamp01(1 - radial / 2.8);
  const spine = Math.exp(-Math.abs(z.re) * 1.45);
  const brightness = clamp01(0.78 + 0.12 * magBand + 0.08 * spine);
  const cyanBlue = {
    r: Math.round(92 + 28 * magBand),
    g: Math.round(188 + 48 * (1 - Math.abs(0.5 - magBand) * 2)),
    b: Math.round(214 + 34 * (1 - magBand))
  };
  const blended = {
    r: Math.round(hueColor.r * 0.28 + cyanBlue.r * 0.72),
    g: Math.round(hueColor.g * 0.28 + cyanBlue.g * 0.72),
    b: Math.round(hueColor.b * 0.28 + cyanBlue.b * 0.72)
  };
  const whiten = clamp01(0.6 + (1 - edgeFade) * 0.3 - spine * 0.14);
  const mix = (channel: number) => Math.round(channel * brightness * (1 - whiten) + 255 * whiten);
  return {
    r: Math.max(1, Math.min(255, mix(blended.r))),
    g: Math.max(1, Math.min(255, mix(blended.g))),
    b: Math.max(1, Math.min(255, mix(blended.b)))
  };
};

type ColorSample = {
  raw: number;
  mapped: number;
};

type ColorContext = {
  method: FractalMethod;
  seedBias: number;
  point: { x: number; y: number };
  viewport: Viewport;
};

type RasterBuffers = {
  method: FractalMethod;
  seedBias: number;
  viewport: Viewport;
  values: Float64Array;
  escapeIters: Float64Array;
  data: Uint8ClampedArray;
  width: number;
  palette: ReturnType<typeof buildPalette>;
};

const pickColor = (sample: ColorSample, palette: ReturnType<typeof buildPalette>, context: ColorContext) => {
  const { method, seedBias, point, viewport } = context;
  const { x, y } = point;
  if (method === "PHASE_PLOT") {
    return phasePlotColor(mapPixelToComplex(x, y, viewport), seedBias, palette);
  }
  if (isEscapeMethod(method)) {
    const smooth = clamp01(Math.log(sample.raw + 1) / Math.log(MAX_ITER + 1));
    const paletteIndex = Math.min(255, Math.floor(smooth * 255));
    return palette[paletteIndex];
  }
  const paletteIndex = Math.floor(clamp01(sample.mapped) * 255);
  const color = palette[paletteIndex];
  if (method === "NEWTON") {
    const rootIndex = Math.floor(sample.raw / 100);
    const iteration = Math.floor(sample.raw % 100);
    const accent = Math.floor(clamp01(sample.mapped) * 29);
    return palette[(rootIndex * 61 + iteration * 3 + accent) % 256];
  }
  if (method === "LYAPUNOV" && sample.raw >= 0) return darkTint(color);
  if (method === "IFS") {
    if (sample.mapped < 0.1) return { r: 252, g: 252, b: 252 };
    const t = clamp01((sample.mapped - 0.1) / 0.9);
    const stemTone = {
      r: Math.round(136 + (92 - 136) * t),
      g: Math.round(120 + (178 - 120) * t),
      b: Math.round(90 + (128 - 90) * t)
    };
    const tipTone = {
      r: Math.round(74 + (98 - 74) * (1 - t)),
      g: Math.round(212 + (186 - 212) * t),
      b: Math.round(198 + (168 - 198) * t)
    };
    const toneMix = clamp01(0.35 + 0.65 * Math.sin(sample.raw * 0.37 + sample.mapped * 8.1) ** 2);
    const base = {
      r: Math.round(stemTone.r * (1 - toneMix) + tipTone.r * toneMix),
      g: Math.round(stemTone.g * (1 - toneMix) + tipTone.g * toneMix),
      b: Math.round(stemTone.b * (1 - toneMix) + tipTone.b * toneMix)
    };
    const shade = clamp01(0.8 + 0.2 * Math.sin((sample.raw + sample.mapped) * 6.4));
    return {
      r: Math.max(1, Math.min(255, Math.round(base.r * shade))),
      g: Math.max(1, Math.min(255, Math.round(base.g * shade))),
      b: Math.max(1, Math.min(255, Math.round(base.b * shade)))
    };
  }
  return color;
};

const writeMirroredPixels = (data: Uint8ClampedArray, width: number, x: number, y: number, color: { r: number; g: number; b: number }) => {
  const points = [
    [x, y],
    [width - 1 - x, y],
    [x, QUADRANT_HEIGHT * 2 - 1 - y],
    [width - 1 - x, QUADRANT_HEIGHT * 2 - 1 - y]
  ];
  for (let p = 0; p < points.length; p += 1) {
    const [px, py] = points[p];
    const offset = (py * width + px) * 4;
    data[offset] = color.r;
    data[offset + 1] = color.g;
    data[offset + 2] = color.b;
    data[offset + 3] = 255;
  }
};

const populateIfsScalars = (seedBias: number, values: Float64Array, escapeIters: Float64Array) => {
  const density = renderIfsDensity(seedBias);
  let maxDensity = 0;
  for (let i = 0; i < density.length; i += 1) {
    if (density[i] > maxDensity) maxDensity = density[i];
  }
  const denom = Math.log(1 + Math.max(1, maxDensity));
  for (let i = 0; i < density.length; i += 1) {
    values[i] = Math.log(1 + density[i]) / denom;
    escapeIters[i] = -1;
  }
};

const scalarForCell = (method: FractalMethod, x: number, y: number, seedBias: number, viewport: Viewport): { value: number; escapeIter: number } => {
  const point = mapPixelToComplex(x, y, viewport);
  if (method === "MANDELBROT") {
    const escape = iterateEscape(method, point, { re: 0, im: 0 });
    return { value: escapeSmoothValue(method, point, { re: 0, im: 0 }), escapeIter: escape.iter };
  }
  if (method === "JULIA") {
    const c = juliaConstant(seedBias);
    const escape = iterateEscape(method, c, point);
    return { value: escapeSmoothValue(method, c, point), escapeIter: escape.iter };
  }
  if (method === "BURNING_SHIP") {
    const escape = iterateEscape(method, point, { re: 0, im: 0 });
    return { value: escapeSmoothValue(method, point, { re: 0, im: 0 }), escapeIter: escape.iter };
  }
  if (method === "HEIGHTMAP") {
    const height = fractalBrownian(x / 120, y / 120, seedBias);
    const cSeed = { re: height - 0.55, im: height - 0.45 };
    const escape = iterateEscape("MANDELBROT", point, cSeed);
    return { value: escapeSmoothValue("MANDELBROT", point, cSeed), escapeIter: escape.iter };
  }
  return { value: computeValue(method, x, y, seedBias, viewport), escapeIter: -1 };
};

const fillQuadrantScalars = (buffers: RasterBuffers) => {
  const { method, seedBias, viewport, values, escapeIters } = buffers;
  if (method === "IFS") {
    populateIfsScalars(seedBias, values, escapeIters);
    return;
  }

  let idx = 0;
  for (let y = 0; y < QUADRANT_HEIGHT; y += 1) {
    for (let x = 0; x < QUADRANT_WIDTH; x += 1) {
      const sample = scalarForCell(method, x, y, seedBias, viewport);
      values[idx] = sample.value;
      escapeIters[idx] = sample.escapeIter;
      idx += 1;
    }
  }
};

const coverageIncrement = (method: FractalMethod, mapped: number, escapeIter: number): number => {
  if (isEscapeMethod(method)) {
    return escapeIter > 6 && escapeIter < MAX_ITER ? 1 : 0;
  }
  if (method === "IFS") return mapped > 0.12 ? 1 : 0;
  return mapped > 0.2 ? 1 : 0.35;
};

const writeQuadrantPixels = (buffers: RasterBuffers): number => {
  const { method, seedBias, viewport, values, escapeIters, data, width, palette } = buffers;
  const { min, max } = minMax(values);
  const denom = max - min;
  const hasVariance = denom > 1e-9;
  let coverageHits = 0;
  let idx = 0;
  for (let y = 0; y < QUADRANT_HEIGHT; y += 1) {
    for (let x = 0; x < QUADRANT_WIDTH; x += 1) {
      const raw = values[idx];
      const normalized = hasVariance ? clamp01((raw - min) / denom) : clamp01(0.5 + 0.35 * Math.sin(x * 0.07) * Math.cos(y * 0.09));
      const mapped = mapIntensity(method, raw, normalized);
      const color = pickColor({ raw, mapped }, palette, { method, seedBias, point: { x, y }, viewport });
      coverageHits += coverageIncrement(method, mapped, escapeIters[idx] ?? -1);
      writeMirroredPixels(data, width, x, y, color);
      idx += 1;
    }
  }
  return coverageHits / values.length;
};

const writeQuadrant = (
  method: FractalMethod,
  seedBias: number,
  data: Uint8ClampedArray,
  width: number,
  palette: ReturnType<typeof buildPalette>
): number => {
  const viewport = pickViewport(method, seedBias);
  const escapeIters = new Float64Array(QUADRANT_WIDTH * QUADRANT_HEIGHT);
  escapeIters.fill(-1);
  const values = new Float64Array(QUADRANT_WIDTH * QUADRANT_HEIGHT);
  const buffers: RasterBuffers = { method, seedBias, viewport, values, escapeIters, data, width, palette };
  fillQuadrantScalars(buffers);
  return writeQuadrantPixels(buffers);
};

export const renderFractalCard = (method: FractalMethod, seed: string): RenderResult => {
  const canvas = createCanvas(750, 1050);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(750, 1050);
  const seedBias = hashSeed(seed);
  const harmonyMode = pickHarmonyMode(seedBias);
  const palette = buildPalette(Math.abs(seedBias) % 360, harmonyMode);
  const coverage = writeQuadrant(method, seedBias, imageData.data, 750, palette);
  ctx.putImageData(imageData, 0, 0);
  let blurPx = 0;
  if (method === "PHASE_PLOT") blurPx = 1.28;
  if (method === "IFS") blurPx = 0.3;
  if (method === "FLAME" || method === "L_SYSTEM") blurPx = 0.65;
  if (method === "STRANGE_ATTRACTOR") blurPx = 0.55;
  if (blurPx > 0) {
    const snapshot = createCanvas(750, 1050);
    const snapshotCtx = snapshot.getContext("2d");
    snapshotCtx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(snapshot, 0, 0);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.roundRect(0, 0, 750, 1050, CORNER_RADIUS_PX);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "white";
  ctx.lineWidth = WHITE_BORDER_PX;
  ctx.strokeRect(WHITE_BORDER_PX / 2, WHITE_BORDER_PX / 2, 750 - WHITE_BORDER_PX, 1050 - WHITE_BORDER_PX);
  return { imageDataUri: `data:image/jpeg;base64,${canvas.toBuffer("image/jpeg").toString("base64")}`, coverage, harmonyMode };
};
