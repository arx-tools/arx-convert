import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { FTS_VERSION } from '../common/constants'
import { repeat } from '../common/helpers'
import { ArxFTS } from './FTS'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L56 */
export type ArxFtsHeader = {
  path: string
  numberOfUniqueHeaders: number
}

export class FtsHeader {
  static readFrom(binary: BinaryIO) {
    const data: ArxFtsHeader = {
      path: binary.readString(256),
      numberOfUniqueHeaders: binary.readInt32(),
    }

    binary.readFloat32() // version - always 0.14100000262260437
    binary.readInt32() // uncompressed size in bytes
    binary.readUint32Array(3) // pad

    return data
  }

  static accumulateFrom(json: ArxFTS, uncompressedSize: number) {
    const buffer = Buffer.alloc(FtsHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(json.header.path, 256)
    binary.writeInt32(json.uniqueHeaders.length)
    binary.writeFloat32(FTS_VERSION)
    binary.writeInt32(uncompressedSize)

    binary.writeUint32Array(repeat(0, 3))

    return buffer
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
