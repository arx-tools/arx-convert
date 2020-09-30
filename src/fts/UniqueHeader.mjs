export default class UniqueHeader {
  constructor() {
    this.path = ''
    this.check = []
  }

  readFrom(binary) {
    this.path = binary.readString(256)
    this.pad = binary.readInt8Array(512)
  }

  writeTo(binary) {
    // path should be padded to 256 bytes
  }
}
