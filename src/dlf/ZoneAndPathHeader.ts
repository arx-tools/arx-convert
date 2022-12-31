import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxVector3 } from '../common/types'
import { ArxPath, ArxZone } from './DLF'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/ai/Paths.h#L65
 */
export enum ArxZoneAndPathFlags {
  None = 0,
  Ambiance = 1 << 1,
  Rgb = 1 << 2,
  FarClip = 1 << 3,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L150
 */
export type ArxZoneAndPathHeader = {
  name: string
  flags: ArxZoneAndPathFlags
  pos: ArxVector3
  numberOfPoints: number
  color: ArxColor
  farClip: number
  /** either 0.0 or 1.0 - ? */
  reverb: number
  ambianceMaxVolume: number
  height: number
  ambiance: string
}

export class ZoneAndPathHeader {
  static readFrom(binary: BinaryIO): ArxZoneAndPathHeader {
    const name = binary.readString(64)

    binary.readInt16() // idx - always 0

    const flags = binary.readInt16()

    binary.readVector3() // initPos - the same as pos with only 1 instance of being different on level 6:
    // initPos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.69091796875 }
    //     pos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.6904296875 }

    const dataBlock = {
      pos: binary.readVector3(),
      numberOfPoints: binary.readInt32(),
      color: Color.readFrom(binary, 'rgb'),
      farClip: binary.readFloat32(),
      reverb: binary.readFloat32(),
      ambianceMaxVolume: binary.readFloat32(),
    }

    binary.readFloat32Array(26) // fpad - ?

    const height = binary.readInt32()

    binary.readInt32Array(31) // lpad - ?

    const ambiance = binary.readString(128)

    binary.readString(128) // cpad - ?

    return {
      name,
      flags,
      ...dataBlock,
      height,
      ambiance,
    }
  }

  static allocateFrom(zone: ArxZone | ArxPath) {
    const buffer = Buffer.alloc(ZoneAndPathHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    const pos = zone.points[0].pos

    binary.writeString(zone.name, 64)
    binary.writeInt16(0) // idx
    binary.writeInt16(zone.flags)
    binary.writeVector3(pos) // initPos
    binary.writeVector3(pos)
    binary.writeInt32(zone.points.length)
    binary.writeBuffer(Color.accumulateFrom(zone.color, 'rgb'))
    binary.writeFloat32(zone.farClip)
    binary.writeFloat32(zone.reverb)
    binary.writeFloat32(zone.ambianceMaxVolume)

    binary.writeFloat32Array(repeat(0, 26)) // fpad

    binary.writeInt32('height' in zone ? zone.height : 0)

    binary.writeInt32Array(repeat(0, 31)) // lpad

    binary.writeString(zone.ambiance, 128)

    binary.writeString('', 128) // cpad

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(64) +
      BinaryIO.sizeOfInt16Array(2) +
      BinaryIO.sizeOfVector3Array(2) +
      BinaryIO.sizeOfInt32() +
      Color.sizeOf('rgb') +
      BinaryIO.sizeOfFloat32Array(3 + 26) +
      BinaryIO.sizeOfInt32Array(1 + 31) +
      BinaryIO.sizeOfString(256)
    )
  }
}
