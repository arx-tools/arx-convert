import { times } from '../../node_modules/ramda/src/index.mjs'
import RoomData from './RoomData.mjs'
import EPData from './EPData.mjs'

export default class Room {
  static readFrom(binary) {
    const { numberOfPortals, numberOfPolygons } = RoomData.readFrom(binary)

    return {
      portals: times(() => binary.ReadInt32(), numberOfPortals),
      polygons: times(() => EPData.readFrom(binary), numberOfPolygons)
    }
  }
}
