import { BinaryIO } from '@common/BinaryIO.js'
import { concatUint8Arrays, times } from '@common/helpers.js'
import { type ArxEPData, EPData } from '@fts/EPData.js'
import { RoomData } from '@fts/RoomData.js'

export type ArxRoom = {
  portals: number[]
  polygons: ArxEPData[]
}

export class Room {
  static readFrom(binary: BinaryIO): ArxRoom {
    const { numberOfPortals, numberOfPolygons } = RoomData.readFrom(binary)

    return {
      portals: times(() => {
        return binary.readInt32()
      }, numberOfPortals),
      polygons: times(() => {
        return EPData.readFrom(binary)
      }, numberOfPolygons),
    }
  }

  static accumulateFrom(room: ArxRoom): Uint8Array {
    const roomData = RoomData.accumulateFrom(room)

    const portals = new Uint8Array(room.portals.length * 4)
    const binary = new BinaryIO(portals)

    binary.writeInt32Array(room.portals)

    const polygons = concatUint8Arrays(room.polygons.map(EPData.accumulateFrom))

    return concatUint8Arrays([roomData, portals, polygons])
  }
}
