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
    this.fpadd = binary.readFloat32Array(26)
    this.height = binary.readInt32()
    this.lpadd = binary.readInt32Array(31)
    this.ambiance = binary.readString(128)
    this.cpadd = binary.readString(128)
  }

  writeTo(binary) {}
}
