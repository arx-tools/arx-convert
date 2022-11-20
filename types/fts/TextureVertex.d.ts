import { Buffer } from 'node:buffer'
import { ArxColorRGBA, ArxVector3, BinaryIO } from '../binary/BinaryIO'

type ArxTextureVertex = {
  pos: ArxVector3
  rhw: number
  color: ArxColorRGBA
  specular: ArxColorRGBA
  tu: number
  tv: number
}

export declare class TextureVertex {
  public static readFrom(binary: BinaryIO): ArxTextureVertex
  public static accumulateFrom(textureVertex: ArxTextureVertex): Buffer
  public static sizeOf(): int
}
