export default class UniqueHeader {
  static readFrom(binary) {
    return {
      path: binary.readString(256),
      check: binary.readUint8Array(512)
    }
  }

  writeTo(binary) {}
}
