import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';

export class CanvasRenderer {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getBuffer(): Buffer {
    return this.canvas.toBuffer('image/jpeg', { quality: 0.95 });
  }

  public toBase64(): string {
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  public clear(color = 'black'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Method to ensure seamless mirroring (4-quadrant symmetry)
  // The generator function should draw into the top-left quadrant (0,0 to width/2, height/2)
  // This function will then mirror it to the other 3 quadrants.
  public mirrorQuadrants(): void {
    const w = this.width;
    const h = this.height;
    const midX = Math.floor(w / 2);
    const midY = Math.floor(h / 2);

    // Get Top-Left Quadrant
    // Note: This approach assumes the drawing logic ALREADY filled the top-left quadrant.
    // However, some fractal algos might fill the whole thing.
    // The spec says: "Generate pattern in one quadrant, mirror to other 3 quadrants"

    // We capture the top-left quadrant
    // args: sx, sy, sw, sh, dx, dy, dw, dh
    // We can use drawImage with the canvas itself as the source

    // 1. Mirror Horizontally (Top-Left -> Top-Right)
    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.canvas, 0, 0, midX, midY, 0, 0, midX, midY); // Draw TL to TR
    // Wait, if we flip the whole canvas, we flip the source too?
    // It's safer to not rely on self-drawing if possible, but canvas allows it.
    // Let's try a safer approach: standard pixel manipulation or just drawing the specific region.

    // Better approach:
    // We assume the generator draws to the defined quadrant bounds.
    // Actually, simpler:
    // Let's just take the top-left image data and put it in the other places.
    this.ctx.restore();

    // Let's stick to the transform approach, it is standard for symmetries.
    // Top-Right = Flip Top-Left Horizontally
    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.canvas, 0, 0, midX, midY, midX, 0, midX, midY); // This matches the destination coordinates in the transformed space?
    // Tricky. Let's do it explicitly.
    // Destination: (midX, 0)
    // Transformed Destination:
    // If I scale(-1, 1), x becomes -x.
    // I want to draw at +x (right side).
    // If I translate(w, 0) then scale(-1, 1):
    // (x, y) -> (w - x, y).
    // So if I draw at x=0 (left), it ends up at w (right).
    // Ideally we want 0 -> w, and midX -> midX.

    // Let's keep it simple.
    // 1. Top-Left is the source.
    // 2. Draw Top-Right
    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.canvas, 0, 0, midX, midY, 0, 0, midX, midY);
    // Wait, source region is 0,0,midX,midY.
    // Dest region in transformed space:
    // If we draw to 0,0, it maps to w,0 (top right corner, moving left).
    // We want it to be mirrored.
    // Image at 0,0 should appear at w,0. Image at midX,0 should appear at midX,0 (center).
    this.ctx.restore();

    // 3. Draw Bottom-Left (Flip Top-Left Vertically)
    this.ctx.save();
    this.ctx.translate(0, h);
    this.ctx.scale(1, -1);
    this.ctx.drawImage(this.canvas, 0, 0, midX, midY, 0, 0, midX, midY);
    this.ctx.restore();

    // 4. Draw Bottom-Right (Flip Top-Left Both)
    this.ctx.save();
    this.ctx.translate(w, h);
    this.ctx.scale(-1, -1);
    this.ctx.drawImage(this.canvas, 0, 0, midX, midY, 0, 0, midX, midY);
    this.ctx.restore();
  }

  // Revised Mirroring Logic for clear 4-way symmetry
  public applySymmetry(): void {
    const midpointX = this.width / 2;
    const midpointY = this.height / 2;

    // 1. Top-Left to Top-Right (Horizontal Mirror)
    this.ctx.save();
    this.ctx.translate(this.width, 0);
    this.ctx.scale(-1, 1);
    // Draw the top-left quadrant into the top-right position
    // Source: 0, 0, midX, midY
    // Dest (in transformed space): 0, 0, midX, midY -> maps to (width, 0) to (midX, midY)
    this.ctx.drawImage(
      this.canvas,
      0,
      0,
      midpointX,
      midpointY,
      0,
      0,
      midpointX,
      midpointY,
    );
    this.ctx.restore();

    // 2. Top-Half to Bottom-Half (Vertical Mirror)
    // Now that we have the full top strip (Left + Right), mirror it down.
    this.ctx.save();
    this.ctx.translate(0, this.height);
    this.ctx.scale(1, -1);
    this.ctx.drawImage(
      this.canvas,
      0,
      0,
      this.width,
      midpointY,
      0,
      0,
      this.width,
      midpointY,
    );
    this.ctx.restore();
  }
}
