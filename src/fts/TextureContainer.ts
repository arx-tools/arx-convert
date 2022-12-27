import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L107
 */
export type ArxTextureContainer = {
  id: number
  filename: string
}

export class TextureContainer {
  static readFrom(binary: BinaryIO): ArxTextureContainer {
    const dataBlock1 = {
      id: binary.readInt32(),
    }

    binary.readInt32() // temp - always 0

    const dataBlock2 = {
      filename: binary.readString(256),
    }

    return {
      ...dataBlock1,
      ...dataBlock2,
    }
  }

  static accumulateFrom(textureContainer: ArxTextureContainer) {
    const buffer = Buffer.alloc(TextureContainer.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(textureContainer.id)
    binary.writeInt32(0) // temp
    binary.writeString(textureContainer.filename, 256)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfString(256)
  }
}
