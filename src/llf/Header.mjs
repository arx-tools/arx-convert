import BinaryIO from '../Binary/BinaryIO.mjs'
import { repeat } from '../../node_modules/ramda/src/index.mjs'

export default class Header {
  static readFrom(binary) {
    const data = {
      version: binary.readFloat32(),
      identifier: binary.readString(16),
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      numberOfLights: binary.readInt32(),
      numberOfShadowPolygons: binary.readInt32(),
      numberOfIgnoredPolygons: binary.readInt32(),
      numberOfBackgroundPolygons: binary.readInt32()
    }

    binary.readInt32Array(256) // ipad1
    binary.readFloat32Array(256) // fpad
    binary.readString(4096) // cpad
    binary.readInt32Array(256) // ipad2

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(json.header.version)
    binary.writeString(json.header.identifier, 16)
    binary.writeString(json.header.lastUser, 256)
    binary.writeInt32(json.header.time)
    binary.writeInt32(json.header.numberOfLights)
    binary.writeInt32(json.header.numberOfShadowPolygons)
    binary.writeInt32(json.header.numberOfIgnoredPolygons)
    binary.writeInt32(json.header.numberOfBackgroundPolygons)

    binary.writeInt32Array(repeat(0, 256))
    binary.writeFloat32Array(repeat(0, 256))
    binary.writeString('', 4096)
    binary.writeInt32Array(repeat(0, 256))

    return buffer
  }

  static sizeOf() {
    return 4 + 16 + 256 + 5 * 4 + 256 * 4 * 2 + 4096 + 256 * 4
  }
}