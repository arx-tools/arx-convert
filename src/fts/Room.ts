import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxEPData, EPData } from './EPData.ts'
import { RoomData } from './RoomData.ts'

export type ArxRoom = {
  portals: number[]
  polygons: ArxEPData[]
}

export class Room {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxRoom {
    const { numberOfPortals, numberOfPolygons } = RoomData.readFrom(binary)

    return {
      portals: binary.readInt32Array(numberOfPortals),
      polygons: times(() => {
        return EPData.readFrom(binary)
      }, numberOfPolygons),
    }
  }

  static accumulateFrom(room: ArxRoom): ArrayBuffer {
    const roomData = RoomData.accumulateFrom(room)

    const portals = new ArrayBuffer(room.portals.length * 4)
    const binary = new BinaryIO(portals)

    binary.writeInt32Array(room.portals)

    const polygons = concatArrayBuffers(room.polygons.map(EPData.accumulateFrom))

    return concatArrayBuffers([roomData, portals, polygons])
  }
}
