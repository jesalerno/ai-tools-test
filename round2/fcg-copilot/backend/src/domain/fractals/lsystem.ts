/**
 * L-System Fractal generator (Dragon Curve / Koch Curve).
 * String rewriting with turtle graphics; scales to fill quadrant area.
 */

import { buildPalette } from '../color/harmony.js';
import type { FractalGenerator, RenderParams, RenderResult } from './types.js';
import { computeCoverage, createPrng } from './types.js';

/** Maximum L-system expansion iterations. Named constant per spec §3.4. */
const MAX_LSYSTEM_ITERS = 12;

/** L-System definition. */
interface LSystemDef {
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  iterations: number;
}

/** Dragon Curve L-System. */
const DRAGON_CURVE: LSystemDef = {
  axiom: 'FX',
  rules: { X: 'X+YF+', Y: '-FX-Y' },
  angle: 90,
  iterations: 11,
};

/** Koch Snowflake L-System. */
const KOCH_CURVE: LSystemDef = {
  axiom: 'F++F++F',
  rules: { F: 'F-F++F-F' },
  angle: 60,
  iterations: 5,
};

/** Expand L-System axiom to a string of commands. */
function expand(def: LSystemDef): string {
  let current = def.axiom;
  for (let i = 0; i < Math.min(def.iterations, MAX_LSYSTEM_ITERS); i++) {
    let next = '';
    for (let j = 0; j < current.length; j++) {
      const ch = current[j] ?? '';
      next += def.rules[ch] ?? ch;
    }
    current = next;
    // Avoid excessively long strings
    if (current.length > 2_000_000) break;
  }
  return current;
}

/** Mutable turtle state for turtle graphics. */
interface TurtleState {
  x: number; y: number; angle: number;
  stack: Array<[number, number, number]>;
}

/** Process a single turtle graphics command, mutating state. */
function processCommand(
  state: TurtleState,
  segs: Array<[number, number, number, number]>,
  cmd: string,
  angleStep: number
): void {
  if (cmd === 'F' || cmd === 'f') {
    const nx = state.x + Math.cos(state.angle * Math.PI / 180);
    const ny = state.y + Math.sin(state.angle * Math.PI / 180);
    if (cmd === 'F') segs.push([state.x, state.y, nx, ny]);
    state.x = nx; state.y = ny;
  } else if (cmd === '+') {
    state.angle += angleStep;
  } else if (cmd === '-') {
    state.angle -= angleStep;
  } else if (cmd === '[') {
    state.stack.push([state.x, state.y, state.angle]);
  } else if (cmd === ']') {
    const frame = state.stack.pop();
    if (frame) { [state.x, state.y, state.angle] = frame; }
  }
}

/** Turtle graphics: collect line segments from an L-System string. */
function turtleDraw(commands: string, angleStep: number, startAngle = 0): Array<[number, number, number, number]> {
  const segs: Array<[number, number, number, number]> = [];
  const state: TurtleState = { x: 0, y: 0, angle: startAngle, stack: [] };

  for (let i = 0; i < commands.length; i++) {
    processCommand(state, segs, commands[i] ?? '', angleStep);
  }
  return segs;
}

/** Scale and translate segments to fit within [0, width] × [0, height]. */
function fitSegments(
  segs: Array<[number, number, number, number]>,
  width: number,
  height: number,
  margin: number
): Array<[number, number, number, number]> {
  if (segs.length === 0) return [];
  const bounds = computeBounds(segs);
  const rangeX = bounds.maxX - bounds.minX || 1;
  const rangeY = bounds.maxY - bounds.minY || 1;
  const scale = Math.min((width - 2 * margin) / rangeX, (height - 2 * margin) / rangeY);

  return segs.map(([x1, y1, x2, y2]) => [
    margin + (x1 - bounds.minX) * scale,
    margin + (y1 - bounds.minY) * scale,
    margin + (x2 - bounds.minX) * scale,
    margin + (y2 - bounds.minY) * scale,
  ]);
}

/** Compute bounding box of segments. */
function computeBounds(segs: Array<[number, number, number, number]>): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity; let maxY = -Infinity;
  for (const [x1, y1, x2, y2] of segs) {
    if (x1 < minX) minX = x1; if (x1 > maxX) maxX = x1;
    if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
    if (y1 < minY) minY = y1; if (y1 > maxY) maxY = y1;
    if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
  }
  return { minX, maxX, minY, maxY };
}

/** Context for pixel drawing operations. */
interface DrawContext { data: Uint8ClampedArray; width: number; height: number }

/** Plot a single pixel if within canvas bounds. */
function plotPixel(ctx: DrawContext, px: number, py: number, color: { r: number; g: number; b: number }): void {
  if (px >= 0 && px < ctx.width && py >= 0 && py < ctx.height) {
    const off = (py * ctx.width + px) * 4;
    ctx.data[off] = color.r; ctx.data[off + 1] = color.g;
    ctx.data[off + 2] = color.b; ctx.data[off + 3] = 255;
  }
}

/** Draw a line segment into pixel data (Bresenham's algorithm). */
function drawLine(
  ctx: DrawContext,
  seg: readonly [number, number, number, number],
  color: { r: number; g: number; b: number }
): void {
  let px1 = Math.round(seg[0]); let py1 = Math.round(seg[1]);
  const px2 = Math.round(seg[2]); const py2 = Math.round(seg[3]);
  const dx = Math.abs(px2 - px1); const dy = Math.abs(py2 - py1);
  const sx = px1 < px2 ? 1 : -1; const sy = py1 < py2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    plotPixel(ctx, px1, py1, color);
    if (px1 === px2 && py1 === py2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; px1 += sx; }
    if (e2 < dx) { err += dx; py1 += sy; }
  }
}

/** L-System Fractal generator. */
export class LSystemGenerator implements FractalGenerator {
  render(params: RenderParams): RenderResult {
    const { width, height, seed, baseHue, colorMode } = params;
    const palette = buildPalette(baseHue, colorMode);
    const data = new Uint8ClampedArray(width * height * 4);
    // Fill white background
    data.fill(255);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;

    const prng = createPrng(seed);
    const def = prng() > 0.5 ? DRAGON_CURVE : KOCH_CURVE;
    const initialAngle = Math.floor(prng() * 360);
    const commands = expand(def);
    const rawSegs = turtleDraw(commands, def.angle, initialAngle);
    const segs = fitSegments(rawSegs, width, height, 10);

    // Draw each segment with a palette color based on segment position
    const drawCtx: DrawContext = { data, width, height };
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (!seg) continue;
      const t = i / segs.length;
      const idx = Math.floor(t * (palette.length - 1));
      const color = palette[idx] ?? { r: 50, g: 50, b: 100 };
      drawLine(drawCtx, seg, color);
    }

    return { data, coverage: computeCoverage(data, width, height) };
  }
}
