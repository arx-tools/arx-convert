import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxFTS } from './FTS'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L56 */
export type ArxFtsHeader = {
  path: string
  numberOfUniqueHeaders: number
  version: number
}

export class FtsHeader {
  static readFrom(binary: BinaryIO) {
    const data: ArxFtsHeader = {
      path: binary.readString(256),
      numberOfUniqueHeaders: binary.readInt32(),
      version: binary.readFloat32(),
    }

    binary.readInt32() // uncompressed size in bytes
    binary.readUint32Array(3) // pad

    return data
  }

  static accumulateFrom(json: ArxFTS, uncompressedSize: number) {
    const buffer = Buffer.alloc(FtsHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(json.header.path, 256)
    binary.writeInt32(json.uniqueHeaders.length)
    binary.writeFloat32(json.header.version)
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
