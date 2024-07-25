import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { DANAE_VERSION } from '@common/constants.js'
import { repeat } from '@common/helpers.js'
import { type ArxRotation, type ArxVector3 } from '@common/types.js'
import { type ArxDLF } from '@dlf/DLF.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L58
 */
export type ArxDlfHeader = {
  lastUser: string
  time: number
  posEdit: ArxVector3
  angleEdit: ArxRotation
  numberOfInteractiveObjects: number
  numberOfFogs: number
  numberOfBackgroundPolygons: number
  numberOfZonesAndPaths: number
}

export class DlfHeader {
  static readFrom(binary: BinaryIO): ArxDlfHeader {
    binary.readFloat32() // version - always 1.44
    binary.readString(16) // identifier - always "DANAE_FILE"

    const dataBlock = {
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      posEdit: binary.readVector3(),
      angleEdit: binary.readRotation(),
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
    const numberOfBackgroundPolygons = binary.readInt32()

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
      numberOfBackgroundPolygons,
      numberOfZonesAndPaths,
    }
  }

  static accumulateFrom(json: ArxDLF): Buffer {
    const buffer = Buffer.alloc(DlfHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(DANAE_VERSION)
    binary.writeString('DANAE_FILE', 16)
    binary.writeString(json.header.lastUser, 256)
    binary.writeInt32(json.header.time)
    binary.writeVector3(json.header.posEdit)
    binary.writeRotation(json.header.angleEdit)
    binary.writeInt32(1) // number of scenes
    binary.writeInt32(json.interactiveObjects.length)
    binary.writeInt32(0) // number of nodes
    binary.writeInt32(12) // number of node links
    binary.writeInt32(0) // number of zones
    binary.writeInt32(0) // lighting
    binary.writeInt32Array(repeat(0, 256))
    binary.writeInt32(0) // number of lights -> stored in LLF
    binary.writeInt32(json.fogs.length)
    binary.writeInt32(json.header.numberOfBackgroundPolygons)
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
