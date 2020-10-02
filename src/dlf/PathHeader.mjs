export default class PathHeader {
  static readFrom(binary) {
    const data = {
      name: binary.readString(64),
      idx: binary.readInt16(),
      flags: binary.readInt16(),
      initPos: binary.readVector3(),
      pos: binary.readVector3(),
      numberOfPathways: binary.readInt32(),
      rgb: binary.readColor(),
      farclip: binary.readFloat32(),
      reverb: binary.readFloat32(),
      ambianceMaxVolume: binary.readFloat32()
    }

    binary.readFloat32Array(26) // fpad

    data.height = binary.readInt32()

    binary.readInt32Array(31) // lpad

    data.ambiance = binary.readString(128)

    binary.readString(128) // cpad

    return data
  }

  writeTo(binary) {}
}
