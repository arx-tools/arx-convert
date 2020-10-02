export default class Fog {
  readFrom(binary) {
    this.pos = binary.readVector3()
    this.rgb = binary.readColor()
    this.size = binary.readFloat32()
    this.special = binary.readInt32()
    this.scale = binary.readFloat32()
    this.move = binary.readVector3()
    this.angle = binary.readAnglef()
    this.speed = binary.readFloat32()
    this.rotatespeed = binary.readFloat32()
    this.tolive = binary.readInt32()
    this.blend = binary.readInt32()
    this.frequency = binary.readFloat32()
    binary.readFloat32Array(32) // fpad
    binary.readInt32Array(32) // lpad
    binary.readString(256) // cpad
  }

  writeTo(binary) {}
}
