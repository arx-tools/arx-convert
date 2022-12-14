import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L107
 */
export type ArxTextureContainer = {
  id: number
  temp: number
  filename: string
}

export class TextureContainer {
  static readFrom(binary: BinaryIO): ArxTextureContainer {
    return {
      id: binary.readInt32(),
      temp: binary.readInt32(),
      filename: binary.readString(256),
    }
  }

  static accumulateFrom(textureContainer: ArxTextureContainer) {
    const buffer = Buffer.alloc(TextureContainer.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(textureContainer.id)
    binary.writeInt32(textureContainer.temp)
    binary.writeString(textureContainer.filename, 256)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfString(256)
  }
}
