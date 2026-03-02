import {
  BORDER_PX,
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  CORNER_RADIUS_PX,
  INNER_HEIGHT_PX,
  INNER_WIDTH_PX,
  JPEG_QUALITY,
  MAX_CANVAS_MEMORY_BYTES,
} from '../../domain/models/cardSpec';
import type {PixelBuffer} from '../../domain/utils/pixels';
import {DependencyError} from '../../application/errors/httpError';
import type {CardRendererPort, RenderCardInput} from '../../application/services/cardRendererPort';

interface CanvasContextLike {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  arcTo: (x1: number, y1: number, x2: number, y2: number, radius: number) => void;
  closePath: () => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  fillStyle: string;
  fill: () => void;
  save: () => void;
  clip: () => void;
  drawImage: (image: unknown, x: number, y: number) => void;
  restore: () => void;
  createImageData: (width: number, height: number) => {data: Uint8ClampedArray};
  putImageData: (imageData: {data: Uint8ClampedArray}, x: number, y: number) => void;
}

interface CanvasLike {
  getContext: (contextId: '2d') => CanvasContextLike;
  toBuffer: (mimeType: string, options: {quality: number}) => Buffer;
}

interface CanvasModuleLike {
  createCanvas: (width: number, height: number) => CanvasLike;
}

function assertMemoryBudget(quadrant: PixelBuffer): void {
  const bytes = CARD_WIDTH_PX * CARD_HEIGHT_PX * 4 + quadrant.width * quadrant.height * 4;
  if (bytes > MAX_CANVAS_MEMORY_BYTES) {
    throw new Error(`Requested canvas memory exceeds ${MAX_CANVAS_MEMORY_BYTES} bytes.`);
  }
}

function drawRoundedRectPath(
  context: CanvasContextLike,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.arcTo(x + width, y, x + width, y + r, r);
  context.lineTo(x + width, y + height - r);
  context.arcTo(x + width, y + height, x + width - r, y + height, r);
  context.lineTo(x + r, y + height);
  context.arcTo(x, y + height, x, y + height - r, r);
  context.lineTo(x, y + r);
  context.arcTo(x, y, x + r, y, r);
  context.closePath();
}

function createSymmetricData(quadrant: PixelBuffer): Uint8ClampedArray {
  const innerData = new Uint8ClampedArray(INNER_WIDTH_PX * INNER_HEIGHT_PX * 4);

  for (let y = 0; y < INNER_HEIGHT_PX; y += 1) {
    const sourceY = y < quadrant.height ? y : INNER_HEIGHT_PX - 1 - y;

    for (let x = 0; x < INNER_WIDTH_PX; x += 1) {
      const sourceX = x < quadrant.width ? x : INNER_WIDTH_PX - 1 - x;
      const sourceIndex = (sourceY * quadrant.width + sourceX) * 4;
      const targetIndex = (y * INNER_WIDTH_PX + x) * 4;

      innerData[targetIndex] = quadrant.data[sourceIndex];
      innerData[targetIndex + 1] = quadrant.data[sourceIndex + 1];
      innerData[targetIndex + 2] = quadrant.data[sourceIndex + 2];
      innerData[targetIndex + 3] = 255;
    }
  }

  return innerData;
}

export class CanvasCardRenderer implements CardRendererPort {
  async renderJpegBase64(input: RenderCardInput): Promise<string> {
    assertMemoryBudget(input.quadrant);

    let canvasModule: CanvasModuleLike | undefined;
    try {
      const moduleName = '@napi-rs/canvas';
      canvasModule = (await import(moduleName)) as CanvasModuleLike;
    } catch {
      try {
        const moduleName = 'canvas';
        canvasModule = (await import(moduleName)) as CanvasModuleLike;
      } catch {
        canvasModule = undefined;
      }
    }

    if (!canvasModule) {
      throw new DependencyError(
        'Canvas dependency is unavailable. Install @napi-rs/canvas or node-canvas runtime libraries.'
      );
    }

    const {createCanvas} = canvasModule;
    const cardCanvas = createCanvas(CARD_WIDTH_PX, CARD_HEIGHT_PX);
    const cardContext = cardCanvas.getContext('2d');

    cardContext.clearRect(0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX);
    cardContext.fillStyle = '#ffffff';
    drawRoundedRectPath(cardContext, 0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX, CORNER_RADIUS_PX);
    cardContext.fill();

    const innerCanvas = createCanvas(INNER_WIDTH_PX, INNER_HEIGHT_PX);
    const innerContext = innerCanvas.getContext('2d');
    const innerData = createSymmetricData(input.quadrant);
    const imageData = innerContext.createImageData(INNER_WIDTH_PX, INNER_HEIGHT_PX);
    imageData.data.set(innerData);
    innerContext.putImageData(imageData, 0, 0);

    const innerRadius = Math.max(0, CORNER_RADIUS_PX - BORDER_PX);
    cardContext.save();
    drawRoundedRectPath(cardContext, BORDER_PX, BORDER_PX, INNER_WIDTH_PX, INNER_HEIGHT_PX, innerRadius);
    cardContext.clip();
    cardContext.drawImage(innerCanvas, BORDER_PX, BORDER_PX);
    cardContext.restore();

    const output = cardCanvas.toBuffer('image/jpeg', {quality: JPEG_QUALITY});
    return output.toString('base64');
  }
}
