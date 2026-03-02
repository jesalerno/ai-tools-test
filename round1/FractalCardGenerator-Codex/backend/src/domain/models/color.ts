export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface Palette {
  background: RgbColor;
  stops: readonly RgbColor[];
  harmony: string;
}
