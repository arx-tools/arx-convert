const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { PortalPolygon } = require('./PortalPolygon.js')

class Portal {
  static readFrom(binary) {
    return {
      polygon: PortalPolygon.readFrom(binary),
      room1: binary.readInt32(), // facing normal
      room2: binary.readInt32(),
      useportal: binary.readInt16(),
      paddy: binary.readInt16(),
    }
  }

  static accumulateFrom(portal) {
    const buffer = Buffer.alloc(Portal.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeBuffer(PortalPolygon.accumulateFrom(portal.polygon))
    binary.writeInt32(portal.room1)
    binary.writeInt32(portal.room2)
    binary.writeInt16(portal.useportal)
    binary.writeInt16(portal.paddy)

    return buffer
  }

  static sizeOf() {
    return 12 + PortalPolygon.sizeOf()
  }
}

module.exports = { Portal }
