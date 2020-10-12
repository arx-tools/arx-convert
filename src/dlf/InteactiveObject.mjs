import BinaryIO from '../binary/BinaryIO.mjs'
import { repeat } from '../../node_modules/ramda/src/index.mjs'

export default class InteractiveObject {
  static readFrom(binary) {
    const data = {
      name: binary.readString(512),
      pos: binary.readVector3(),
      angle: binary.readAnglef(),
      identifier: binary.readInt32(), // could also be a 4 byte string?
      flags: binary.readInt32(),
    }

    binary.readInt32Array(14) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  static accumulateFrom(interactiveObject) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(interactiveObject.name, 512)
    binary.writeVector3(interactiveObject.pos)
    binary.writeAnglef(interactiveObject.angle)
    binary.writeInt32(interactiveObject.identifier)
    binary.writeInt32(interactiveObject.flags)

    binary.writeInt32Array(repeat(0, 14))
    binary.writeFloat32Array(repeat(0, 16))

    return buffer
  }

  static sizeOf() {
    return 512 + 3 * 4 + 3 * 4 + 4 + 4 + 14 * 4 + 16 * 4
  }
}
