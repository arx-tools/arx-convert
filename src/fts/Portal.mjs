import PortalPolygon from './PortalPolygon.mjs'

export default class Portal {
  static readFrom(binary) {
    return {
      polygon: PortalPolygon.readFrom(binary),
      room1: binary.readInt32(), // facing normal
      room2: binary.readInt32(),
      useportal: binary.readInt16(),
      paddy: binary.readInt16()
    }
  }

  static accumulateFrom(portal) {
    const polygon = PortalPolygon.accumulateFrom(portal.polygon)

    const buffer = Buffer.alloc(12, 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(portal.room1)
    binary.writeInt32(portal.room2)
    binary.writeInt16(portal.useportal)
    binary.writeInt16(portal.paddy)

    return Buffer.concat([polygon, buffer])
  }
}
