export default class RoomData {
  static readFrom(binary) {
    const data = {
      numberOfPortals: binary.readInt32(),
      numberOfPolygons: binary.readInt32()
    }

    binary.readInt32Array(6)

    return data
  }
}