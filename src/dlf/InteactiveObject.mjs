export default class DanaeLsInteractiveObject {
  readFrom(binary) {
    this.name = binary.readString(512)
    this.pos = binary.readVector3()
    this.angle = binary.readAnglef()
    this.identifier = binary.readInt32() // could also be a 4 byte string?
    this.flags = binary.readInt32()
    binary.readInt32Array(14) // pad
    binary.readFloat32Array(16) // fpad
  }

  writeTo(binary) {}
}
