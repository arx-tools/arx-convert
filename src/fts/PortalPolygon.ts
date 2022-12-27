import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxVector3, QuadrupleOf } from '../common/types'
import { ArxTextureVertex, TextureVertex } from './TextureVertex'

// found in levels below 10
// prettier-ignore
const UNUSED_DATA_TYPE1 = [
   56, 242,  22,   1,    40,  22, 105,   0,   231, 255, 255, 255,     0,   0,   0,   0,
  159, 199,  92,   0,   172, 141, 105,   0,    25,   0,   0,   0,   100, 242,  22,   1,
   56, 242,  22,   1,     0,   0,   0,   0,   255, 255, 255, 255,   184, 255, 165,   0,
  255, 255, 255, 255,   144, 242,  22,   1,   126, 200,  92,   0,    92,   0,   0,   0,
  168, 242,  22,   1,   124, 242,  22,   1,    40,  22, 105,   0,   236, 255, 255, 255,
    0,   0,   0,   0,   159, 199,  92,   0,   172,  30, 166,   0,    20,   0,   0,   0,
  168, 242,  22,   1,   124, 242,  22,   1,   253, 243,  22,   1,   193,  30, 166,   0,
  160,  74, 244,   0,     0,   0,   0,   0,     0,   0,   0,   0,     0,   0,   0,   0,
]

// found in levels at or above 10
const UNUSED_DATA_TYPE2 = UNUSED_DATA_TYPE1.slice(0)
UNUSED_DATA_TYPE2[0x4c] -= 1
UNUSED_DATA_TYPE2[0x5c] += 1
UNUSED_DATA_TYPE2[0x68] += 1
UNUSED_DATA_TYPE2[0x6c] += 1

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L136
 */
export type ArxPortalPolygon = {
  type: number
  min: ArxVector3
  max: ArxVector3
  norm: ArxVector3
  norm2: ArxVector3
  v: QuadrupleOf<ArxTextureVertex>
  nrml: QuadrupleOf<ArxVector3>
  tex: number
  center: ArxVector3
  transval: number
  area: number
  room: number
  misc: number
}

export class PortalPolygon {
  static readFrom(binary: BinaryIO): ArxPortalPolygon {
    const dataBlock1 = {
      type: binary.readInt32(),
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      v: times(() => TextureVertex.readFrom(binary), 4) as QuadrupleOf<ArxTextureVertex>,
    }

    binary.readUint8Array(32 * 4) // unused

    const dataBlock2 = {
      nrml: binary.readVector3Array(4) as QuadrupleOf<ArxVector3>,
      tex: binary.readInt32(),
      center: binary.readVector3(),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      room: binary.readInt16(),
      misc: binary.readInt16(),
    }

    return {
      ...dataBlock1,
      ...dataBlock2,
    }
  }

  static accumulateFrom(portalPolygon: ArxPortalPolygon, levelIdx: number) {
    const buffer = Buffer.alloc(PortalPolygon.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(portalPolygon.type)
    binary.writeVector3(portalPolygon.min)
    binary.writeVector3(portalPolygon.max)
    binary.writeVector3(portalPolygon.norm)
    binary.writeVector3(portalPolygon.norm2)
    binary.writeBuffer(Buffer.concat(portalPolygon.v.map(TextureVertex.accumulateFrom)))

    binary.writeUint8Array(levelIdx < 10 ? UNUSED_DATA_TYPE1 : UNUSED_DATA_TYPE2)

    binary.writeVector3Array(portalPolygon.nrml)
    binary.writeInt32(portalPolygon.tex)
    binary.writeVector3(portalPolygon.center)
    binary.writeFloat32(portalPolygon.transval)
    binary.writeFloat32(portalPolygon.area)
    binary.writeInt16(portalPolygon.room)
    binary.writeInt16(portalPolygon.misc)

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3Array(4) +
      TextureVertex.sizeOf() * 4 +
      BinaryIO.sizeOfUint8Array(32 * 4) +
      BinaryIO.sizeOfVector3Array(4) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfFloat32Array(2) +
      BinaryIO.sizeOfInt16Array(2)
    )
  }
}
