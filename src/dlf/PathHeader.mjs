export default class PathHeader {
  constructor() {}

  readFrom(binary) {
    this.name = binary.readString(64)
    this.idx = binary.readInt16()
    this.flags = binary.readInt16()
    this.initPos = binary.readVector3()
    this.pos = binary.readVector3()
    this.numberOfPathways = binary.readInt32()
    this.rgb = binary.readColor()
    this.farclip = binary.readFloat32()
    this.reverb = binary.readFloat32()
    this.ambianceMaxVolume = binary.readFloat32()
    binary.readFloat32Array(26) // fpad
    this.height = binary.readInt32()
    binary.readInt32Array(31) // lpad
    this.ambiance = binary.readString(128)
    binary.readString(128) // cpad
  }

  writeTo(binary) {}
}
