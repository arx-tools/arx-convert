export default class Header {
  static readFrom(binary) {
    const data = {
      version: binary.readFloat32(),
      identifier: binary.readString(16),
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      posEdit: binary.readVector3(),
      angleEdit: binary.readAnglef(),
      numberOfScenes: binary.readInt32(),
      numberOfInteractiveObjects: binary.readInt32(),
      numberOfNodes: binary.readInt32(),
      numberOfNodeLinks: binary.readInt32(),
      numberOfZones: binary.readInt32(),
      lighting: binary.readInt32()
    }

    binary.readInt32Array(256) // Bpad

    data.numberOfLights = binary.readInt32()
    data.numberOfFogs = binary.readInt32()
    data.numberOfBackgroundPolygons = binary.readInt32()
    data.numberOfIgnoredPolygons = binary.readInt32()
    data.numberOfChildPolygons = binary.readInt32()
    data.numberOfPaths = binary.readInt32()

    binary.readInt32Array(250) // pad

    data.offset = binary.readVector3()

    binary.readFloat32Array(253) // fpad
    binary.readString(4096) // cpad
    binary.readInt32Array(256) // bpad

    return data
  }

  writeTo(binary) {}

  static sizeOf() {
    return 8520 // calculated manually
  }
}
