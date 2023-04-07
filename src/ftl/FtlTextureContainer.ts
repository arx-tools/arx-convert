import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { TextureContainer } from '@fts/TextureContainer'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L97 */
export type ArxFtlTextureContainer = {
  filename: string
}

export class FtlTextureContainer {
  static readFrom(binary: BinaryIO): ArxFtlTextureContainer {
    return {
      filename: TextureContainer.toRelativePath(binary.readString(256)),
    }
  }

  static accumulateFrom(textureContainer: ArxFtlTextureContainer) {
    const buffer = Buffer.alloc(FtlTextureContainer.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(TextureContainer.toAbsolutePath(textureContainer.filename), 256)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfString(256)
  }
}
