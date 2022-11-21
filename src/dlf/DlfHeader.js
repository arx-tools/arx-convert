const { Buffer } = require('node:buffer')
const { repeat } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')

class DlfHeader {
  static readFrom(binary) {
    const data = {
      version: binary.readFloat32(),
      identifier: binary.readString(16),
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      posEdit: binary.readVector3(),
      angleEdit: binary.readRotation(),
      numberOfScenes: binary.readInt32(),
      numberOfInteractiveObjects: binary.readInt32(),
      numberOfNodes: binary.readInt32(),
      numberOfNodeLinks: binary.readInt32(),
      numberOfZones: binary.readInt32(),
      lighting: binary.readInt32(),
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

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(DlfHeader.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(json.header.version)
    binary.writeString(json.header.identifier, 16)
    binary.writeString(json.header.lastUser, 256)
    binary.writeInt32(json.header.time)
    binary.writeVector3(json.header.posEdit)
    binary.writeRotation(json.header.angleEdit)
    binary.writeInt32(1)
    binary.writeInt32(json.interactiveObjects.length)
    binary.writeInt32(json.numberOfNodes)

    binary.writeInt32(json.header.numberOfNodeLinks)
    binary.writeInt32(json.header.numberOfZones)
    binary.writeInt32(json.header.lighting)

    binary.writeInt32Array(repeat(0, 256))

    binary.writeInt32(json.lights.length)
    binary.writeInt32(json.fogs.length)
    binary.writeInt32(json.header.numberOfBackgroundPolygons)
    binary.writeInt32(json.header.numberOfIgnoredPolygons)
    binary.writeInt32(json.header.numberOfChildPolygons)
    binary.writeInt32(json.paths.length)

    binary.writeInt32Array(repeat(0, 250))

    binary.writeVector3(json.header.offset)

    binary.writeFloat32Array(repeat(0, 253))
    binary.writeString('', 4096)
    binary.writeInt32Array(repeat(0, 256))

    return buffer
  }

  static sizeOf() {
    return 8520
  }
}

module.exports = { DlfHeader }
