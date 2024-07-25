import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { repeat } from '@common/helpers.js'
import { type ArxRoom } from '@fts/Room.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L178
 */
export type ArxRoomData = {
  numberOfPortals: number
  numberOfPolygons: number
}

export class RoomData {
  static readFrom(binary: BinaryIO): ArxRoomData {
    const data: ArxRoomData = {
      numberOfPortals: binary.readInt32(),
      numberOfPolygons: binary.readInt32(),
    }

    binary.readInt32Array(6) // padd - ?

    return data
  }

  static accumulateFrom(room: ArxRoom): Buffer {
    const buffer = Buffer.alloc(RoomData.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(room.portals.length)
    binary.writeInt32(room.polygons.length)
    binary.writeInt32Array(repeat(0, 6)) // padd

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32Array(1 + 1 + 6)
  }
}
