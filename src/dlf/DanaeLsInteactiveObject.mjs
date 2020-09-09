import { TRUNCATE_ZERO_BYTES } from '../binary/BinaryIO.mjs'
import Vector3 from '../binary/Vector3.mjs'
import Anglef from '../binary/Anglef.mjs'

export default class DanaeLsInteractiveObject {
  constructor() {
    this.name = ''
    this.pos = new Vector3(0, 0, 0)
    this.angle = new Anglef(0, 0, 0)
    this.identifier
    this.flags
    this.pad = new Array(14)
    this.fpad = new Array(16)
  }

  readFrom(binary) {
    this.name = binary.readString(512, TRUNCATE_ZERO_BYTES)
    this.pos = binary.readVector3()
    this.angle = binary.readAnglef()
    this.identifier = binary.readInt32() // could also be a 4 byte string?
    this.flags = binary.readInt32()
    this.pad = binary.readInt32Array(14)
    this.fpad = binary.readFloat32Array(16)
  }

  writeTo(binary) {
    binary.writeString(this.name, 512)
    binary.writeVector3(this.pos)
    binary.writeAnglef(this.angle)
    binary.writeInt32(this.identifier)
    binary.writeInt32(this.flags)
    binary.writeInt32Array(this.pad)
    binary.writeFloat32Array(this.fpad)
  }
}
