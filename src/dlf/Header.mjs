export default class Header {
  constructor() {}

  readFrom(binary) {
    this.version = binary.readFloat32()
    this.identifier = binary.readString(16)
    this.lastUser = binary.readString(256)
    this.time = binary.readInt32()
    this.posEdit = binary.readVector3()
    this.angleEdit = binary.readAnglef()
    this.numberOfScenes = binary.readInt32()
    this.numberOfInteractiveObjects = binary.readInt32()
    this.numberOfNodes = binary.readInt32()
    this.numberOfNodeLinks = binary.readInt32()
    this.numberOfZones = binary.readInt32()
    this.lighting = binary.readInt32()
    this.Bpad = binary.readInt32Array(256)
    this.numberOfLights = binary.readInt32()
    this.numberOfFogs = binary.readInt32()
    this.numberOfBackgroundPolygons = binary.readInt32()
    this.numberOfIgnoredPolygons = binary.readInt32()
    this.numberOfChildPolygons = binary.readInt32()
    this.numberOfPaths = binary.readInt32()
    this.pad = binary.readInt32Array(250)
    this.offset = binary.readVector3()
    this.fpad = binary.readFloat32Array(253)
    this.cpad = binary.readString(4096)
    this.bpad = binary.readInt32Array(256)
  }

  writeTo(binary) {}

  static sizeOf() {
    return 8520 // calculated manually
  }
}
