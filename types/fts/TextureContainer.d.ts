import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'

export type ArxTextureContainer = {
  tc: number
  temp: number
  fic: ''
}

export declare class TextureContainer {
  public static readFrom(binary: BinaryIO): ArxTextureContainer
  public static accumulateFrom(textureContainer: ArxTextureContainer): Buffer
  public static sizeOf(): int
}
