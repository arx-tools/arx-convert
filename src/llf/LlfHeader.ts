import { BinaryIO } from '@common/BinaryIO.js'
import { DANAE_VERSION } from '@common/constants.js'
import { repeat } from '@common/helpers.js'
import type { ArxLLF } from '@llf/LLF.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L178
 */
export type ArxLlfHeader = {
  lastUser: string
  time: number
  numberOfLights: number
  numberOfBackgroundPolygons: number
}

export class LlfHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxLlfHeader {
    binary.readFloat32() // version - always 1.44
    binary.readString(16) // identifier - always "DANAE_LLH_FILE"

    const dataBlock = {
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      numberOfLights: binary.readInt32(),
    }

    binary.readInt32() // number of shadow polygons - always 0
    binary.readInt32() // number of ignored polygons - always 0

    const numberOfBackgroundPolygons = binary.readInt32()

    binary.readInt32Array(256) // pad - ?
    binary.readFloat32Array(256) // fpad - ?
    binary.readString(4096) // cpad - ?
    binary.readInt32Array(256) // bpad - ?

    return {
      ...dataBlock,
      numberOfBackgroundPolygons,
    }
  }

  static accumulateFrom(json: ArxLLF): ArrayBuffer {
    const buffer = new ArrayBuffer(LlfHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(DANAE_VERSION)
    binary.writeString('DANAE_LLH_FILE', 16)
    binary.writeString(json.header.lastUser, 256)
    binary.writeInt32(json.header.time)
    binary.writeInt32(json.lights.length)
    binary.writeInt32(0) // number of shadow polygons
    binary.writeInt32(0) // number of ignored polygons
    binary.writeInt32(json.header.numberOfBackgroundPolygons)

    binary.writeInt32Array(repeat(0, 256)) // pad
    binary.writeFloat32Array(repeat(0, 256)) // fpad
    binary.writeString('', 4096) // cpad
    binary.writeInt32Array(repeat(0, 256)) // bpad

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfString(16 + 256) +
      BinaryIO.sizeOfInt32Array(5 + 256) +
      BinaryIO.sizeOfFloat32Array(256) +
      BinaryIO.sizeOfString(4096) +
      BinaryIO.sizeOfInt32Array(256)
    )
  }
}
