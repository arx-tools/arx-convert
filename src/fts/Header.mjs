export default class Header {
  static readFrom(binary) {
    const data = {
      path: binary.readString(256),
      count: binary.readInt32(),
      version: binary.readFloat32(),
      uncompressedSize: binary.readInt32()
    }

    binary.readUint32Array(3) // pad

    return data
  }

  writeTo(binary) {}
}
