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
}
