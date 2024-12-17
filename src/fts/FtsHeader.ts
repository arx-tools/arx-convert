import { BinaryIO } from '@common/BinaryIO.js'
import { VERSION } from '@fts/constants.js'
import { repeat } from '@common/helpers.js'
import { type ArxFTS } from '@fts/FTS.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L56
 */
export type ArxFtsHeader = {
  levelIdx: number
  numberOfUniqueHeaders: number
}

export class FtsHeader {
  static readFrom(binary: BinaryIO): ArxFtsHeader {
    const path = binary.readString(256)

    const data: ArxFtsHeader = {
      levelIdx: FtsHeader.pathToLevelIdx(path),
      numberOfUniqueHeaders: binary.readInt32(),
    }

    binary.readFloat32() // version - always 0.14100000262260437
    binary.readInt32() // uncompressed size in bytes
    binary.readUint32Array(3) // pad - ?

    return data
  }

  static accumulateFrom(json: ArxFTS, uncompressedSize: number): Uint8Array {
    const buffer = new Uint8Array(FtsHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(FtsHeader.levelIdxToPath(json.header.levelIdx), 256)
    binary.writeInt32(json.uniqueHeaders.length)
    binary.writeFloat32(VERSION)
    binary.writeInt32(uncompressedSize)

    binary.writeUint32Array(repeat(0, 3)) // pad

    return buffer
  }

  static pathToLevelIdx(path: string): number {
    return Number.parseInt(path.toLowerCase().replace('c:\\arx\\game\\graph\\levels\\level', '').replace('\\', ''), 10)
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
