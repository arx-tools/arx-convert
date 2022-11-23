import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'

export type ArxTextureContainer = {
  tc: number
  temp: number
  fic: string
}

export class TextureContainer {
  static readFrom(binary: BinaryIO) {
    return {
      tc: binary.readInt32(),
      temp: binary.readInt32(),
      fic: binary.readString(256),
    } as ArxTextureContainer
  }

  static accumulateFrom(textureContainer: ArxTextureContainer) {
    const buffer = Buffer.alloc(TextureContainer.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(textureContainer.tc)
    binary.writeInt32(textureContainer.temp)
    binary.writeString(textureContainer.fic, 256)

    return buffer
  }

  static sizeOf() {
    return 256 + 2 * 4
  }
}
