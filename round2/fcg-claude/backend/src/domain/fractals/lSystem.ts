// L-System fractals (Dragon Curve / Koch Curve class) with turtle graphics.
// Path must occupy usable quadrant area (FCG-SPECv3 §5.2).
import type { RenderContext, Renderer } from './types.js';
import { fillBackground, writeRgb } from './types.js';
import { L_SYSTEM_MAX_DEPTH } from '../constants.js';

interface LSystemRule {
  readonly axiom: string;
  readonly rules: Readonly<Record<string, string>>;
  readonly angle: number;
  readonly iterations: number;
}

const DRAGON: LSystemRule = {
  axiom: 'FX',
  rules: { X: 'X+YF+', Y: '-FX-Y' },
  angle: Math.PI / 2,
  iterations: 12,
};

const KOCH: LSystemRule = {
  axiom: 'F',
  rules: { F: 'F+F-F-F+F' },
  angle: Math.PI / 2,
  iterations: 4,
};

const LEVY: LSystemRule = {
  axiom: 'F',
  rules: { F: '+F--F+' },
  angle: Math.PI / 4,
  iterations: 12,
};

const SYSTEMS: readonly LSystemRule[] = [DRAGON, KOCH, LEVY];

export const lSystem: Renderer = {
  id: 'L_SYSTEM',
  render: (ctx: RenderContext): Uint8ClampedArray => {
    const { width, height, rng, palette, background } = ctx;
    const out = new Uint8ClampedArray(width * height * 4);
    fillBackground(out, width, height, background);
    const pick = SYSTEMS[Math.floor(rng() * SYSTEMS.length)] ?? SYSTEMS[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sys = pick!;
    const depth = Math.min(sys.iterations, L_SYSTEM_MAX_DEPTH);
    const expanded = expand(sys.axiom, sys.rules, depth);
    drawTurtle({
      canvas: { buf: out, w: width, h: height },
      commands: expanded,
      turnAngle: sys.angle,
      palette,
    });
    return out;
  },
};

const expand = (axiom: string, rules: Readonly<Record<string, string>>, depth: number): string => {
  let s = axiom;
  for (let i = 0; i < depth; i++) s = rewrite(s, rules);
  return s;
};

const rewrite = (s: string, rules: Readonly<Record<string, string>>): string => {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i] ?? '';
    out += rules[ch] ?? ch;
  }
  return out;
};

interface CanvasRef {
  readonly buf: Uint8ClampedArray;
  readonly w: number;
  readonly h: number;
}

interface TurtleArgs {
  readonly canvas: CanvasRef;
  readonly commands: string;
  readonly turnAngle: number;
  readonly palette: { sample: (t: number) => { r: number; g: number; b: number } };
}

const drawTurtle = (args: TurtleArgs): void => {
  const { canvas, commands, turnAngle, palette } = args;
  const path = traceTurtle(commands, turnAngle);
  if (path.length < 2) return;
  const bounds = pathBounds(path);
  const scale = 0.86 * Math.min(canvas.w / (bounds.w || 1), canvas.h / (bounds.h || 1));
  const offX = (canvas.w - bounds.w * scale) / 2 - bounds.minX * scale;
  const offY = (canvas.h - bounds.h * scale) / 2 - bounds.minY * scale;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!a || !b) continue;
    const color = palette.sample(0.2 + 0.8 * (i / path.length));
    drawLine(canvas, {
      x0: a[0] * scale + offX,
      y0: a[1] * scale + offY,
      x1: b[0] * scale + offX,
      y1: b[1] * scale + offY,
      color,
    });
  }
};

const traceTurtle = (commands: string, turnAngle: number): readonly (readonly [number, number])[] => {
  const pts: [number, number][] = [[0, 0]];
  let x = 0;
  let y = 0;
  let theta = 0;
  for (let i = 0; i < commands.length; i++) {
    const ch = commands[i];
    if (ch === 'F' || ch === 'X' || ch === 'Y') {
      if (ch === 'F') {
        x += Math.cos(theta);
        y += Math.sin(theta);
        pts.push([x, y]);
      }
    } else if (ch === '+') theta += turnAngle;
    else if (ch === '-') theta -= turnAngle;
  }
  return pts;
};

interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly w: number;
  readonly h: number;
}

const pathBounds = (path: readonly (readonly [number, number])[]): Bounds => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (!p) continue;
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY };
};

interface LineSpec {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly color: { r: number; g: number; b: number };
}

const drawLine = (canvas: CanvasRef, line: LineSpec): void => {
  const { x0, y0, x1, y1, color } = line;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = Math.floor(x0);
  let y = Math.floor(y0);
  const xEnd = Math.floor(x1);
  const yEnd = Math.floor(y1);
  for (let step = 0; step < 4096; step++) {
    plot(canvas, x, y, color);
    if (x === xEnd && y === yEnd) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
};

const plot = (
  canvas: CanvasRef,
  x: number,
  y: number,
  c: { r: number; g: number; b: number },
): void => {
  if (x < 0 || x >= canvas.w || y < 0 || y >= canvas.h) return;
  writeRgb(canvas.buf, y * canvas.w + x, c);
};
