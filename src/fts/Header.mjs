export default class Header {
  constructor() {}

  readFrom(binary) {
    this.path = binary.readString(256)
    this.count = binary.readInt32()
    this.version = binary.readFloat32()
    this.uncompressedSize = binary.readInt32()
    this.pad = binary.readUint32Array(3)
  }

  writeTo(binary) {
    // path should be padded to 256 bytes
  }
}
