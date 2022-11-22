const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')

class AnchorData {
  static readFrom(binary) {
    return {
      pos: binary.readVector3(),
      radius: binary.readFloat32(),
      height: binary.readFloat32(),
      numberOfLinkedAnchors: binary.readInt16(),
      flags: binary.readInt16(),
    }
  }

  static accumulateFrom(anchor) {
    const buffer = Buffer.alloc(AnchorData.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(anchor.data.pos)
    binary.writeFloat32(anchor.data.radius)
    binary.writeFloat32(anchor.data.height)
    binary.writeInt16(anchor.linkedAnchors.length)
    binary.writeInt16(anchor.data.flags)

    return buffer
  }

  static sizeOf() {
    return 3 * 4 + 4 + 4 + 2 + 2
  }
}

module.exports = { AnchorData }
