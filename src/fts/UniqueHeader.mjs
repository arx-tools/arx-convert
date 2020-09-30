export default class UniqueHeader {
  constructor() {}

  readFrom(binary) {
    this.path = binary.readString(256)
    this.check = binary.readUint8Array(512)
  }

  writeTo(binary) {
    // path should be padded to 256 bytes
  }
}
