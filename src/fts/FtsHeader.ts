import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { FTS_VERSION } from '@common/constants'
import { repeat } from '@common/helpers'
import { ArxFTS } from '@fts/FTS'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L56
 */
export type ArxFtsHeader = {
  levelIdx: number
  numberOfUniqueHeaders: number
}

export class FtsHeader {
  static readFrom(binary: BinaryIO) {
    const path = binary.readString(256)

    const data: ArxFtsHeader = {
      levelIdx: FtsHeader.pathToLevelIdx(path),
      numberOfUniqueHeaders: binary.readInt32(),
    }

    binary.readFloat32() // version - always 0.14100000262260437

    binary.readInt32() // uncompressed size in bytes
    // TODO: future Arx Libertatis feature: setting uncompressed size in bytes to 0 will be
    // interpreted as the file being uncompressed
    // (source: https://arx-libertatis.org/irclogs/2023/%23arx.2023-01-01.log)

    binary.readUint32Array(3) // pad - ?

    return data
  }

  static accumulateFrom(json: ArxFTS, uncompressedSize: number) {
    const buffer = Buffer.alloc(FtsHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(FtsHeader.levelIdxToPath(json.header.levelIdx), 256)
    binary.writeInt32(json.uniqueHeaders.length)
    binary.writeFloat32(FTS_VERSION)
    binary.writeInt32(uncompressedSize)

    binary.writeUint32Array(repeat(0, 3)) // pad

    return buffer
  }

  static pathToLevelIdx(path: string) {
    return parseInt(path.toLowerCase().replace('c:\\arx\\game\\graph\\levels\\level', '').replace('\\', ''))
  }

  static levelIdxToPath(levelIdx: number) {
    return `C:\\ARX\\Game\\Graph\\Levels\\level${levelIdx}\\`
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(256) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfUint32Array(3)
    )
  }
}
