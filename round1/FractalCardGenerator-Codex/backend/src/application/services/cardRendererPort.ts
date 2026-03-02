import type {PixelBuffer} from '../../domain/utils/pixels';

export interface RenderCardInput {
  quadrant: PixelBuffer;
}

export interface CardRendererPort {
  renderJpegBase64(input: RenderCardInput): Promise<string>;
}
