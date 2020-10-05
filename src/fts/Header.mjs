import BinaryIO from '../Binary/BinaryIO.mjs'
import { repeat } from '../../node_modules/ramda/src/index.mjs'

export default class Header {
  static readFrom(binary) {
    const data = {
      path: binary.readString(256),
      numberOfUniqueHeaders: binary.readInt32(),
      version: binary.readFloat32(),
      uncompressedSize: binary.readInt32()
    }

    binary.readUint32Array(3) // pad

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(json.header.path, 256)
    binary.writeInt32(json.uniqueHeaders.length)
    binary.writeFloat32(json.header.version)
    binary.writeInt32(json.header.uncompressedSize)

    binary.writeUint32Array(repeat(0, 3))

    return buffer
  }

  static sizeOf() {
    return 280
  }
}
