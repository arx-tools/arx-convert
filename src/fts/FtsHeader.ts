import { BinaryIO } from '../common/BinaryIO.ts'
import { levelIdxFromPath, repeat } from '../common/helpers.ts'
import type { ArxFTS } from './FTS.ts'
import { FTS_VERSION } from './constants.ts'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L56
 */
export type ArxFtsHeader = {
  levelIdx: number
  numberOfUniqueHeaders: number
}

/**
 * The header of an FTS file, with the layout the file was written in.
 */
export type FtsHeaderRead = ArxFtsHeader & {
  /**
   * Whether the file is of the format before 0.141 (the demo is 0.139): its header is 16 bytes shorter and its vertices
   * are 12 bytes wide instead of 20.
   */
  readonly isLegacy: boolean
}

export class FtsHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): FtsHeaderRead {
    const path = binary.readString(256)
    const levelIdx = FtsHeader.pathToLevelIdx(path)
    const numberOfUniqueHeaders = binary.readInt32()
    const version = binary.readFloat32()
    // 0.141 added the uncompressed size and the padding to the header: the unique headers of an older file start right
    // after the version, 16 bytes earlier
    const isLegacy = version < FTS_VERSION

    if (!isLegacy) {
      binary.readInt32() // uncompressed size in bytes
      binary.readUint32Array(3) // pad - ?
    }

    return { levelIdx, numberOfUniqueHeaders, isLegacy }
  }

  static accumulateFrom(json: ArxFTS, uncompressedSize: number): ArrayBuffer {
    const buffer = new ArrayBuffer(FtsHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(FtsHeader.levelIdxToPath(json.header.levelIdx), 256)
    binary.writeInt32((json.uniqueHeaders ?? []).length)
    binary.writeFloat32(FTS_VERSION)
    binary.writeInt32(uncompressedSize)

    binary.writeUint32Array(repeat(0, 3)) // pad

    return buffer
  }

  static pathToLevelIdx(path: string): number {
    return levelIdxFromPath(path)
  }

  static levelIdxToPath(levelIdx: number): string {
    return `C:\\ARX\\Game\\Graph\\Levels\\level${levelIdx}\\`
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfString(256) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfUint32Array(3)
    )
  }
}
