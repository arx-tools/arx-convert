import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { repeat } from '@common/helpers.js'
import type { ArxVector3 } from '@common/types.js'
import type { ArxPath, ArxZone } from '@dlf/DLF.js'
import { DEFAULT_DRAW_DISTANCE } from '@dlf/constants.js'

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
   * A floating point number between 0 and 100.
   *
   * Spelled as `amb_max_vol` in arx source code
   */
  ambienceMaxVolume: number
  height: number
  /**
   * The filename of an amb file in `sfx/ambiance/` folder, for example "ambient_gob_jail_main", or "NONE" for no ambience.
   *
   * Spelled as `ambiance` in arx source code
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

    const isZone = ZoneAndPathHeader.isZone(zoneOrPath)

    binary.writeString(zoneOrPath.name, 64)
    binary.writeInt16(0) // idx

    binary.writeInt16(ZoneAndPathHeader.setFlags(zoneOrPath))

    binary.writeVector3(zoneOrPath.points[0].pos) // initPos
    binary.writeVector3(zoneOrPath.points[0].pos) // pos

    binary.writeInt32(zoneOrPath.points.length)

    if (isZone && zoneOrPath.backgroundColor !== undefined) {
      binary.writeBuffer(Color.accumulateFrom(zoneOrPath.backgroundColor, 'rgb'))
    } else {
      binary.writeBuffer(Color.accumulateFrom(Color.black, 'rgb'))
    }

    if (isZone && zoneOrPath.drawDistance !== undefined) {
      binary.writeFloat32(zoneOrPath.drawDistance)
    } else {
      binary.writeFloat32(DEFAULT_DRAW_DISTANCE)
    }

    binary.writeFloat32(0) // reverb

    if (isZone && zoneOrPath.ambienceMaxVolume !== undefined) {
      binary.writeFloat32(zoneOrPath.ambienceMaxVolume)
    } else {
      binary.writeFloat32(100)
    }

    binary.writeFloat32Array(repeat(0, 26)) // fpad

    if (isZone) {
      binary.writeInt32(zoneOrPath.height)
    } else {
      binary.writeInt32(0)
    }

    binary.writeInt32Array(repeat(0, 31)) // lpad

    if (isZone && zoneOrPath.ambience !== undefined) {
      binary.writeString(zoneOrPath.ambience, 128)
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

  static isZone(zoneOrPath: ArxZone | ArxPath): zoneOrPath is ArxZone {
    return 'height' in zoneOrPath
  }

  static setFlags(zoneOrPath: ArxZone | ArxPath): ArxZoneAndPathFlags {
    if (!ZoneAndPathHeader.isZone(zoneOrPath)) {
      return ArxZoneAndPathFlags.None
    }

    let flags: ArxZoneAndPathFlags = ArxZoneAndPathFlags.None

    if (zoneOrPath.backgroundColor !== undefined) {
      flags = flags | ArxZoneAndPathFlags.SetBackgroundColor
    }

    if (zoneOrPath.drawDistance !== undefined) {
      flags = flags | ArxZoneAndPathFlags.SetDrawDistance
    }

    if (zoneOrPath.ambience !== undefined && zoneOrPath.ambienceMaxVolume !== undefined) {
      flags = flags | ArxZoneAndPathFlags.SetAmbience
    }

    return flags
  }
}
