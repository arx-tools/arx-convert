import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxVector3 } from '../common/types'

export type ArxRoomDistance = {
  distance: number
  startPosition: ArxVector3
  endPosition: ArxVector3
}

export class RoomDistance {
  static readFrom(binary: BinaryIO): ArxRoomDistance {
    return {
      distance: binary.readFloat32(), // -1 means use truedist
      startPosition: binary.readVector3(),
      endPosition: binary.readVector3(),
    }
  }

  static accumulateFrom(roomDistance: ArxRoomDistance) {
    const buffer = Buffer.alloc(RoomDistance.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(roomDistance.distance)
    binary.writeVector3(roomDistance.startPosition)
    binary.writeVector3(roomDistance.endPosition)

    return buffer
  }

  static sizeOf() {
    return 4 + 3 * 4 + 3 * 4
  }
}
