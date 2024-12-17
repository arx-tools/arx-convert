import { BinaryIO } from '@common/BinaryIO.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L107
 */
export type ArxTextureContainer = {
  id: number
  filename: string
}

export class TextureContainer {
  static readFrom(binary: BinaryIO): ArxTextureContainer {
    const id = binary.readInt32()

    binary.readInt32() // temp - always 0

    const filename = TextureContainer.toRelativePath(binary.readString(256))

    return {
      id,
      filename,
    }
  }

  static accumulateFrom(textureContainer: ArxTextureContainer): Uint8Array {
    const buffer = new Uint8Array(TextureContainer.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(textureContainer.id)
    binary.writeInt32(0) // temp
    binary.writeString(TextureContainer.toAbsolutePath(textureContainer.filename), 256)

    return buffer
  }

  /**
   * from: GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_GROUND_WET.BMP
   *   to: [stone]_human_ground_wet.bmp
   */
  static toRelativePath(filename: string): string {
    return filename.toLowerCase().replace('graph\\obj3d\\textures\\', '')
  }

  /**
   * from: [stone]_human_ground_wet.bmp
   *   to: graph\\obj3d\\textures\\[stone]_human_ground_wet.bmp
   */
  static toAbsolutePath(filename: string): string {
    return 'graph\\obj3d\\textures\\' + filename.toLowerCase()
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfString(256)
  }
}
