import { BinaryIO } from '@common/BinaryIO.js'
import { repeat } from '@common/helpers.js'
import type { ArxVector3 } from '@common/types.js'

/**
 * These are not bitwise flags, they cannot be combined
 */
export enum ArxZoneAndPathPointType {
  Standard = 0,
  Bezier = 1,
  BezierControlPoint = 2,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L168
 */
export type ArxZoneAndPathPoint = {
  position: ArxVector3
  type: ArxZoneAndPathPointType
  /** milliseconds */
  time: number
}

export class ZoneAndPathPoint {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, position: ArxVector3): ArxZoneAndPathPoint {
    // TODO: what is r in rpos/rPosition? real?
    const rPosition = binary.readVector3()

    const data = {
      position: {
        x: rPosition.x + position.x,
        y: rPosition.y + position.y,
        z: rPosition.z + position.z,
      },
      type: binary.readInt32(),
      time: binary.readUint32(),
    }

    binary.readFloat32Array(2) // fpad - ?
    binary.readInt32Array(2) // lpad - ?
    binary.readUint8Array(32) // cpad - ?

    return data
  }

  static allocateFrom(point: ArxZoneAndPathPoint, position: ArxVector3): ArrayBuffer {
    const buffer = new ArrayBuffer(ZoneAndPathPoint.sizeOf())
    const binary = new BinaryIO(buffer)

    // TODO: what is r in rpos/rPosition? real?
    const rPosition = {
      x: point.position.x - position.x,
      y: point.position.y - position.y,
      z: point.position.z - position.z,
    }

    binary.writeVector3(rPosition)
    binary.writeInt32(point.type)
    binary.writeUint32(point.time)

    binary.writeFloat32Array(repeat(0, 2))
    binary.writeInt32Array(repeat(0, 2))
    binary.writeUint8Array(repeat(0, 32))

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfUint32() +
      BinaryIO.sizeOfFloat32Array(2) +
      BinaryIO.sizeOfInt32Array(2) +
      BinaryIO.sizeOfUint8Array(32)
    )
  }
}
