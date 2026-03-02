import type {FractalGenerator} from './types';
import {createBufferWithBase, finishCoverage} from './common';
import {samplePaletteColor} from '../services/paletteService';
import {paintDot} from '../utils/pixels';

interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

function rewrite(axiom: string, iterations: number): string {
  let current = axiom;
  for (let i = 0; i < iterations; i += 1) {
    current = current.replaceAll('F', 'F+F--F+F');
  }
  return current;
}

function drawInstruction(
  command: string,
  turtle: TurtleState,
  stack: TurtleState[],
  length: number,
  turnAngle: number
): {drawn: boolean; x1: number; y1: number; x2: number; y2: number} {
  if (command === 'F') {
    const x1 = turtle.x;
    const y1 = turtle.y;
    turtle.x += Math.cos(turtle.angle) * length;
    turtle.y += Math.sin(turtle.angle) * length;
    return {drawn: true, x1, y1, x2: turtle.x, y2: turtle.y};
  }

  if (command === '+') {
    turtle.angle += turnAngle;
  } else if (command === '-') {
    turtle.angle -= turnAngle;
  } else if (command === '[') {
    stack.push({x: turtle.x, y: turtle.y, angle: turtle.angle});
  } else if (command === ']' && stack.length > 0) {
    const previous = stack.pop();
    if (previous) {
      turtle.x = previous.x;
      turtle.y = previous.y;
      turtle.angle = previous.angle;
    }
  }

  return {drawn: false, x1: 0, y1: 0, x2: 0, y2: 0};
}

function paintLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  drawIndex: number,
  total: number,
  context: Parameters<FractalGenerator>[0],
  buffer: ReturnType<typeof createBufferWithBase>
): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const color = samplePaletteColor((drawIndex / total + t) / 2, context.palette);
    paintDot(buffer, x, y, color, 1.1);
  }
}

export const generateLSystem: FractalGenerator = context => {
  const buffer = createBufferWithBase(context);
  const depth = 4 + (context.seed % 2);
  const instructions = rewrite('F--F--F', depth);
  const turnAngle = Math.PI / 3;
  const turtle: TurtleState = {
    x: context.width * 0.15,
    y: context.height * 0.75,
    angle: 0,
  };
  const stack: TurtleState[] = [];
  const segmentLength = Math.max(2.2, Math.min(context.width, context.height) / (16 + depth * 4));

  let drawIndex = 0;
  for (let i = 0; i < instructions.length; i += 1) {
    if (i % 2000 === 0) {
      context.assertWithinBudget();
    }

    const segment = drawInstruction(instructions[i], turtle, stack, segmentLength, turnAngle);
    if (!segment.drawn) {
      continue;
    }

    drawIndex += 1;
    paintLine(segment.x1, segment.y1, segment.x2, segment.y2, drawIndex, instructions.length, context, buffer);
  }

  return {buffer, coverage: finishCoverage(buffer)};
};
