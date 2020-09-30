export default class UniqueHeader {
  constructor() {
    this.path = ''
    this.count = 0
    this.version = 0
    this.uncompressedSize = 0
    this.pad = new Array(3)
  }

  readFrom(binary) {
    this.path = binary.readString(256)
    this.count = binary.readInt32()
    this.version = binary.readFloat32()
    this.uncompressedSize = binary.readInt32()
    this.pad = binary.readInt8Array(3)
  }

  writeTo(binary) {
    // path should be padded to 256 bytes
  }
}
