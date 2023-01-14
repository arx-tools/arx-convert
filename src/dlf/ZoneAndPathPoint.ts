import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { repeat } from '@common/helpers'
import { ArxVector3 } from '@common/types'

export enum ArxZoneAndPathPointType {
  Standard = 0,
  Bezier = 1,
  BezierControlPoint = 2,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L168
 */
export type ArxZoneAndPathPoint = {
  pos: ArxVector3
  type: ArxZoneAndPathPointType
  /** milliseconds */
  time: number
}

export class ZoneAndPathPoint {
  static readFrom(binary: BinaryIO, pos: ArxVector3): ArxZoneAndPathPoint {
    const rpos = binary.readVector3()
    const data = {
      pos: {
        x: rpos.x + pos.x,
        y: rpos.y + pos.y,
        z: rpos.z + pos.z,
      },
      type: binary.readInt32(),
      time: binary.readUint32(),
    }

    binary.readFloat32Array(2) // fpad - ?
    binary.readInt32Array(2) // lpad - ?
    binary.readUint8Array(32) // cpad - ?

    return data
  }

  static allocateFrom(point: ArxZoneAndPathPoint, pos: ArxVector3) {
    const buffer = Buffer.alloc(ZoneAndPathPoint.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    const rpos = {
      x: point.pos.x - pos.x,
      y: point.pos.y - pos.y,
      z: point.pos.z - pos.z,
    }

    binary.writeVector3(rpos)
    binary.writeInt32(point.type)
    binary.writeUint32(point.time)

    binary.writeFloat32Array(repeat(0, 2))
    binary.writeInt32Array(repeat(0, 2))
    binary.writeUint8Array(repeat(0, 32))

    return buffer
  }

  static sizeOf() {
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
