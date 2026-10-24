import { BinaryIO } from '../common/BinaryIO.ts'
import { TextureContainer } from '../fts/TextureContainer.ts'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L97
 */
export type ArxFtlTextureContainer = {
  filename: string
}

export class FtlTextureContainer {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxFtlTextureContainer {
    return {
      filename: TextureContainer.toRelativePath(binary.readString(256)),
    }
  }

  static accumulateFrom(textureContainer: ArxFtlTextureContainer): ArrayBuffer {
    const buffer = new ArrayBuffer(FtlTextureContainer.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(TextureContainer.toAbsolutePath(textureContainer.filename), 256)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfString(256)
  }
}
