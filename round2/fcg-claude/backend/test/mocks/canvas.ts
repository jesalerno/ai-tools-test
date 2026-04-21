// Stub replacement for `@napi-rs/canvas` during Jest runs so tests don't
// require native binaries (FCG-SPECv3 §15; Challenge 1 fallback).

class FakeImageData {
  public readonly data: Uint8ClampedArray;
  public readonly width: number;
  public readonly height: number;
  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }
}

class FakeContext {
  public fillStyle = '';
  public readonly canvas: FakeCanvas;
  constructor(canvas: FakeCanvas) { this.canvas = canvas; }
  fillRect(): void {}
  createImageData(w: number, h: number): FakeImageData { return new FakeImageData(w, h); }
  putImageData(): void {}
  drawImage(): void {}
  save(): void {}
  restore(): void {}
  beginPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  quadraticCurveTo(): void {}
  closePath(): void {}
  clip(): void {}
}

class FakeCanvas {
  public readonly width: number;
  public readonly height: number;
  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
  getContext(_kind: string): FakeContext { return new FakeContext(this); }
  async encode(_fmt: string, _q: number): Promise<Buffer> {
    return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
  }
  toBuffer(): Buffer {
    return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
  }
}

export const createCanvas = (w: number, h: number): FakeCanvas => new FakeCanvas(w, h);
export type SKRSContext2D = FakeContext;
