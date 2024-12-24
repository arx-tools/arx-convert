import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxVector3 } from '@common/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L130
 */
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

  static accumulateFrom(roomDistance: ArxRoomDistance): ArrayBuffer {
    const buffer = new ArrayBuffer(RoomDistance.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(roomDistance.distance)
    binary.writeVector3(roomDistance.startPosition)
    binary.writeVector3(roomDistance.endPosition)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfFloat32() + BinaryIO.sizeOfVector3Array(2)
  }
}
