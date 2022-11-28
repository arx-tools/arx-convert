import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxRoom } from './Room'

export type ArxRoomData = {
  numberOfPortals: number
  numberOfPolygons: number
}

export class RoomData {
  static readFrom(binary: BinaryIO): ArxRoomData {
    const data = {
      numberOfPortals: binary.readInt32(),
      numberOfPolygons: binary.readInt32(),
    }

    binary.readInt32Array(6)

    return data
  }

  static accumulateFrom(room: ArxRoom) {
    const buffer = Buffer.alloc(RoomData.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(room.portals.length)
    binary.writeInt32(room.polygons.length)
    binary.writeInt32Array(repeat(0, 6))

    return buffer
  }

  static sizeOf() {
    return 4 + 4 + 6 * 4
  }
}
