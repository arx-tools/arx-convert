import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'

export type ArxTextureContainer = {
  tc: number
  temp: number
  fic: string
}

export class TextureContainer {
  static readFrom(binary: BinaryIO): ArxTextureContainer {
    return {
      tc: binary.readInt32(),
      temp: binary.readInt32(),
      fic: binary.readString(256),
    }
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
    return BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfString(256)
  }
}
