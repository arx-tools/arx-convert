import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxFTS } from './FTS'

export type ArxFtsHeader = {
  path: string
  numberOfUniqueHeaders: number
  version: number
}

export class FtsHeader {
  static readFrom(binary: BinaryIO) {
    const data = {
      path: binary.readString(256),
      numberOfUniqueHeaders: binary.readInt32(),
      version: binary.readFloat32(),
    } as ArxFtsHeader

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
    return 280
  }
}
