export default class Header {
  constructor() {}

  readFrom(binary) {
    this.path = binary.readString(256)
    this.count = binary.readInt32()
    this.version = binary.readFloat32()
    this.uncompressedSize = binary.readInt32()
    binary.readUint32Array(3) // pad
  }

  writeTo(binary) {
    // path should be padded to 256 bytes
  }
}
