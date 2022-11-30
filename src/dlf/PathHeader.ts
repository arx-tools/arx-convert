import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxVector3 } from '../types'
import { ArxPath } from './DLF'

export type ArxPathHeader = {
  name: string
  idx: number
  flags: number
  initPos: ArxVector3
  pos: ArxVector3
  numberOfPathways: number
  rgb: ArxColor
  farClip: number
  reverb: number
  ambienceMaxVolume: number
  height: number
  ambience: string
}

export class PathHeader {
  static readFrom(binary: BinaryIO): ArxPathHeader {
    const dataBlock1 = {
      name: binary.readString(64),
      idx: binary.readInt16(),
      flags: binary.readInt16(),
      initPos: binary.readVector3(),
      pos: binary.readVector3(),
      numberOfPathways: binary.readInt32(),
      rgb: Color.readFrom(binary, 'rgb'),
      farClip: binary.readFloat32(),
      reverb: binary.readFloat32(),
      ambienceMaxVolume: binary.readFloat32(),
    }

    binary.readFloat32Array(26) // fpad

    const dataBlock2 = {
      height: binary.readInt32(),
    }

    binary.readInt32Array(31) // lpad

    const dataBlock3 = {
      ambience: binary.readString(128),
    }

    binary.readString(128) // cpad

    return {
      ...dataBlock1,
      ...dataBlock2,
      ...dataBlock3,
    }
  }

  static allocateFrom(path: ArxPath) {
    const buffer = Buffer.alloc(PathHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(path.header.name, 64)
    binary.writeInt16(path.header.idx)
    binary.writeInt16(path.header.flags)
    binary.writeVector3(path.header.initPos)
    binary.writeVector3(path.header.pos)
    binary.writeInt32(path.pathways.length)
    binary.writeBuffer(Color.accumulateFrom(path.header.rgb, 'rgb'))
    binary.writeFloat32(path.header.farClip)
    binary.writeFloat32(path.header.reverb)
    binary.writeFloat32(path.header.ambienceMaxVolume)

    binary.writeFloat32Array(repeat(0, 26))

    binary.writeInt32(path.header.height)

    binary.writeInt32Array(repeat(0, 31))

    binary.writeString(path.header.ambience, 128)

    binary.writeString('', 128)

    return buffer
  }

  static sizeOf() {
    return 64 + 2 + 2 + 3 * 4 + 3 * 4 + 4 + 3 * 4 + 4 + 4 + 4 + 26 * 4 + 4 + 31 * 4 + 128 + 128
  }
}
