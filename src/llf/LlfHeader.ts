import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxLLF } from './LLF'

export type ArxLlfHeader = {
  version: number
  identifier: string
  lastUser: string
  time: number
  numberOfLights: number
  numberOfShadowPolygons: number
  numberOfIgnoredPolygons: number
  numberOfBackgroundPolygons: number
}

export class LlfHeader {
  static readFrom(binary: BinaryIO) {
    const data: ArxLlfHeader = {
      version: binary.readFloat32(),
      identifier: binary.readString(16),
      lastUser: binary.readString(256),
      time: binary.readInt32(),
      numberOfLights: binary.readInt32(),
      numberOfShadowPolygons: binary.readInt32(),
      numberOfIgnoredPolygons: binary.readInt32(),
      numberOfBackgroundPolygons: binary.readInt32(),
    }

    binary.readInt32Array(256) // ipad1
    binary.readFloat32Array(256) // fpad
    binary.readString(4096) // cpad
    binary.readInt32Array(256) // ipad2

    return data
  }

  static accumulateFrom(json: ArxLLF) {
    const buffer = Buffer.alloc(LlfHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(json.header.version)
    binary.writeString(json.header.identifier, 16)
    binary.writeString(json.header.lastUser, 256)
    binary.writeInt32(json.header.time)
    binary.writeInt32(json.lights.length)
    binary.writeInt32(json.header.numberOfShadowPolygons)
    binary.writeInt32(json.header.numberOfIgnoredPolygons)
    binary.writeInt32(json.header.numberOfBackgroundPolygons)

    binary.writeInt32Array(repeat(0, 256))
    binary.writeFloat32Array(repeat(0, 256))
    binary.writeString('', 4096)
    binary.writeInt32Array(repeat(0, 256))

    return buffer
  }

  static sizeOf() {
    return 4 + 16 + 256 + 5 * 4 + 256 * 4 * 2 + 4096 + 256 * 4
  }
}
