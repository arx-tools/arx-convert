import { TRUNCATE_ZERO_BYTES } from '../Binary/BinaryIO.mjs'

export default class DanaeLsScene {
  constructor() {
    this.name = ''
    this.pad = new Array(16)
    this.fpad = new Array(16)
  }

  readFrom(binary) {
    this.name = binary.readString(512, TRUNCATE_ZERO_BYTES)
    this.pad = binary.readInt32Array(16)
    this.fpad = binary.readFloat32Array(16)
  }

  writeTo(binary) {
    binary.writeString(this.name, 512)
    binary.writeInt32Array(this.pad)
    binary.writeFloat32Array(this.fpad)
  }
}
