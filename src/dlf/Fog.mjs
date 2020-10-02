export default class Fog {
  static readFrom(binary) {
    const data = {
      pos: binary.readVector3(),
      rgb: binary.readColor(),
      size: binary.readFloat32(),
      special: binary.readInt32(),
      scale: binary.readFloat32(),
      move: binary.readVector3(),
      angle: binary.readAnglef(),
      speed: binary.readFloat32(),
      rotatespeed: binary.readFloat32(),
      tolive: binary.readInt32(),
      blend: binary.readInt32(),
      frequency: binary.readFloat32()
    }

    binary.readFloat32Array(32) // fpad
    binary.readInt32Array(32) // lpad
    binary.readString(256) // cpad

    return data
  }

  writeTo(binary) {}
}
