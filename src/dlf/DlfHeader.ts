import { BinaryIO } from '@common/BinaryIO.js'
import { DANAE_VERSION } from '@common/constants.js'
import { repeat } from '@common/helpers.js'
import type { ArxRotation, ArxVector3 } from '@common/types.js'
import type { ArxDLF } from '@dlf/DLF.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L58
 */
export type ArxDlfHeader = {
  lastModifiedBy: string
  /**
   * unix timestamp in seconds
   */
  lastModifiedAt: number
  player: {
    /**
     * Position of the player where it gets teleported to upon entering the level when no entity is specified as teleport target
     */
    position: ArxVector3
    /**
     * The orientation of the player upon entering a level, specified in degrees. Only "b" is used which turns the player around its Y axis as all other rotations on other axis gets reset by the player animations.
     */
    orientation: ArxRotation
  }
  numberOfInteractiveObjects: number
  numberOfFogs: number
  numberOfPolygonsInFTS: number
  numberOfZonesAndPaths: number
}

export class DlfHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxDlfHeader {
    binary.readFloat32() // version - always DANAE_VERSION
    binary.readString(16) // identifier - always "DANAE_FILE"

    const dataBlock = {
      lastModifiedBy: binary.readString(256),
      lastModifiedAt: binary.readInt32(),
      player: {
        position: binary.readVector3(),
        orientation: binary.readRotation(),
      },
    }

    binary.readInt32() // number of scenes - always 1

    const numberOfInteractiveObjects = binary.readInt32()

    binary.readInt32() // number of nodes - always 0
    binary.readInt32() // number of node links - always 12
    binary.readInt32() // number of zones - always 0, zones are merged with paths, so we get this via numberOfZonesAndPaths
    binary.readInt32() // lighting - we don't parse it as it's 0 in all the levels
    binary.readInt32Array(256) // Bpad - ?
    binary.readInt32() // number of lights - always 0 as lights are stored in LLF files

    const numberOfFogs = binary.readInt32()
    const numberOfPolygonsInFTS = binary.readInt32()

    binary.readInt32() // number of ignored polygons - always 0
    binary.readInt32() // number of child polygons - always 0

    const numberOfZonesAndPaths = binary.readInt32()

    binary.readInt32Array(250) // pad - ?
    binary.readVector3() // offset - always Vector3(0, 0, 0)
    binary.readFloat32Array(253) // fpad - ?
    binary.readString(4096) // cpad - ?
    binary.readInt32Array(256) // bpad - ?

    return {
      ...dataBlock,
      numberOfInteractiveObjects,
      numberOfFogs,
      numberOfPolygonsInFTS,
      numberOfZonesAndPaths,
    }
  }

  static accumulateFrom(json: ArxDLF): ArrayBuffer {
    const buffer = new ArrayBuffer(DlfHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(DANAE_VERSION)
    binary.writeString('DANAE_FILE', 16)
    binary.writeString(json.header.lastModifiedBy, 256)
    binary.writeInt32(json.header.lastModifiedAt)
    binary.writeVector3(json.header.player.position)
    binary.writeRotation(json.header.player.orientation)
    binary.writeInt32(1) // number of scenes
    binary.writeInt32(json.interactiveObjects.length)
    binary.writeInt32(0) // number of nodes
    binary.writeInt32(12) // number of node links
    binary.writeInt32(0) // number of zones
    binary.writeInt32(0) // lighting
    binary.writeInt32Array(repeat(0, 256))
    binary.writeInt32(0) // number of lights -> stored in LLF
    binary.writeInt32(json.fogs.length)
    binary.writeInt32(json.header.numberOfPolygonsInFTS)
    binary.writeInt32(0) // number of ignored polygons
    binary.writeInt32(0) // number of child polygons
    binary.writeInt32(json.paths.length + json.zones.length)
    binary.writeInt32Array(repeat(0, 250)) // pad
    binary.writeVector3({ x: 0, y: 0, z: 0 }) // offset
    binary.writeFloat32Array(repeat(0, 253)) // fpad
    binary.writeString('', 4096) // cpad
    binary.writeInt32Array(repeat(0, 256)) // bpad

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfString(16 + 256) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfRotation() +
      BinaryIO.sizeOfInt32Array(6 + 256 + 6 + 250) +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfFloat32Array(253) +
      BinaryIO.sizeOfString(4096) +
      BinaryIO.sizeOfInt32Array(256)
    )
  }
}
