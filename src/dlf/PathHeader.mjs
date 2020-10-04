import BinaryIO from '../Binary/BinaryIO.mjs'
import { repeat } from '../../node_modules/ramda/src/index.mjs'

export default class PathHeader {
  static readFrom(binary) {
    const data = {
      name: binary.readString(64),
      idx: binary.readInt16(),
      flags: binary.readInt16(),
      initPos: binary.readVector3(),
      pos: binary.readVector3(),
      numberOfPathways: binary.readInt32(),
      rgb: binary.readColor(),
      farClip: binary.readFloat32(),
      reverb: binary.readFloat32(),
      ambianceMaxVolume: binary.readFloat32()
    }

    binary.readFloat32Array(26) // fpad

    data.height = binary.readInt32()

    binary.readInt32Array(31) // lpad

    data.ambiance = binary.readString(128)

    binary.readString(128) // cpad

    return data
  }

  static allocateFrom(path) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(path.header.name, 64)
    binary.writeInt16(path.header.idx)
    binary.writeInt16(path.header.flags)
    binary.writeVector3(path.header.initPos)
    binary.writeVector3(path.header.pos)
    binary.writeInt32(path.pathways.length)
    binary.writeColor(path.header.rgb)
    binary.writeFloat32(path.header.farClip)
    binary.writeFloat32(path.header.reverb)
    binary.writeFloat32(path.header.ambianceMaxVolume)

    binary.writeFloat32Array(repeat(0, 26))

    binary.writeInt32(path.header.height)

    binary.writeInt32Array(repeat(0, 31))

    binary.writeString(path.header.ambiance, 128)

    binary.writeString('', 128)

    return buffer
  }

  static sizeOf() {
    return 64 + 2 + 2 + 3 * 4 + 3 * 4 + 4 + 3 * 4 + 4 + 4 + 4 + 26 * 4 + 4 + 31 * 4 + 128 + 128
  }
}
