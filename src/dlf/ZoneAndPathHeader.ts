import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { repeat } from '@common/helpers.js'
import { type ArxVector3 } from '@common/types.js'
import { type ArxPath, type ArxZone } from '@dlf/DLF.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/ai/Paths.h#L65
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/Include/ARX_Paths.h#L128
 */
export enum ArxZoneAndPathFlags {
  None = 0,
  // Loop = 1 << 0, // have been removed from Arx Libertatis, no idea if it was implemented in vanilla Arx
  // level7 "PATH_BLACK" and level8 "PATH1" are the only 2 paths where flag is set to this, but path flags are ignored
  SetAmbience = 1 << 1,
  SetBackgroundColor = 1 << 2,
  SetDrawDistance = 1 << 3,
  // Reverb = 1 << 4, // have been removed from Arx Libertatis, wasn't implemented in vanilla Arx
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L150
 */
export type ArxZoneAndPathHeader = {
  name: string
  flags: ArxZoneAndPathFlags
  pos: ArxVector3
  numberOfPoints: number
  /**
   * known as `rgb` in arx source code
   */
  backgroundColor: ArxColor
  /**
   * known as `farClip` in arx source code
   */
  drawDistance: number
  /**
   * spelled as `ambianceMaxVolume` in arx source code
   */
  ambienceMaxVolume: number
  height: number
  /**
   * spelled as `ambiance` in arx source code
   */
  ambience: string
}

export class ZoneAndPathHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxZoneAndPathHeader {
    const name = binary.readString(64)

    binary.readInt16() // idx - always 0

    const flags = binary.readInt16()

    binary.readVector3() // initPos - the same as pos with only 1 instance of being different on level 6:
    // initPos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.69091796875 }
    //     pos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.6904296875 }

    const dataBlock = {
      pos: binary.readVector3(),
      numberOfPoints: binary.readInt32(),
      backgroundColor: Color.readFrom(binary, 'rgb'),
      drawDistance: binary.readFloat32(),
    }

    binary.readFloat32() // reverb - not implemented, mostly 0, sometimes 1

    const ambienceMaxVolume = binary.readFloat32()

    binary.readFloat32Array(26) // fpad - ?

    const height = binary.readInt32()

    binary.readInt32Array(31) // lpad - ?

    const ambience = binary.readString(128)

    binary.readString(128) // cpad - ?

    return {
      name,
      flags,
      ...dataBlock,
      ambienceMaxVolume,
      height,
      ambience,
    }
  }

  static allocateFrom(zoneOrPath: ArxZone | ArxPath): ArrayBuffer {
    const buffer = new ArrayBuffer(ZoneAndPathHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    const { pos } = zoneOrPath.points[0]

    binary.writeString(zoneOrPath.name, 64)
    binary.writeInt16(0) // idx

    let flags: ArxZoneAndPathFlags = ArxZoneAndPathFlags.None
    if ('backgroundColor' in zoneOrPath && zoneOrPath.backgroundColor !== undefined) {
      flags = flags | ArxZoneAndPathFlags.SetBackgroundColor
    }

    if ('drawDistance' in zoneOrPath && zoneOrPath.drawDistance !== undefined) {
      flags = flags | ArxZoneAndPathFlags.SetDrawDistance
    }

    if (
      'ambience' in zoneOrPath &&
      zoneOrPath.ambience !== undefined &&
      'ambienceMaxVolume' in zoneOrPath &&
      zoneOrPath.ambienceMaxVolume !== undefined
    ) {
      flags = flags | ArxZoneAndPathFlags.SetAmbience
    }

    binary.writeInt16(flags)
    binary.writeVector3(pos) // initPos
    binary.writeVector3(pos)
    binary.writeInt32(zoneOrPath.points.length)

    if ('backgroundColor' in zoneOrPath) {
      binary.writeBuffer(Color.accumulateFrom(zoneOrPath?.backgroundColor ?? Color.black, 'rgb'))
    } else {
      binary.writeBuffer(Color.accumulateFrom(Color.black, 'rgb'))
    }

    // draw distance of paths in the original arx levels is 2800 in 80% of the time, otherwise 0
    if ('drawDistance' in zoneOrPath) {
      binary.writeFloat32(zoneOrPath?.drawDistance ?? 2800)
    } else {
      binary.writeFloat32(2800)
    }

    binary.writeFloat32(0) // reverb

    if ('ambienceMaxVolume' in zoneOrPath) {
      binary.writeFloat32(zoneOrPath?.ambienceMaxVolume ?? 100)
    } else {
      binary.writeFloat32(100)
    }

    binary.writeFloat32Array(repeat(0, 26)) // fpad

    if ('height' in zoneOrPath) {
      binary.writeInt32(zoneOrPath.height)
    } else {
      binary.writeInt32(0)
    }

    binary.writeInt32Array(repeat(0, 31)) // lpad

    if ('ambience' in zoneOrPath) {
      binary.writeString(zoneOrPath?.ambience ?? 'NONE', 128)
    } else {
      binary.writeString('NONE', 128)
    }

    binary.writeString('', 128) // cpad

    return buffer
  }

  static sizeOf(): number {
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
