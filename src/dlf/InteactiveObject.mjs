export default class DanaeLsInteractiveObject {
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

  writeTo(binary) {}
}
