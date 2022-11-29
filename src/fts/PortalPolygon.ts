import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { times } from '../common/helpers'
import { ArxVector3 } from '../common/types'
import { ArxTextureVertex, TextureVertex } from './TextureVertex'

export type ArxPortalPolygon = {
  type: number
  min: ArxVector3
  max: ArxVector3
  norm: ArxVector3
  norm2: ArxVector3
  v: [ArxTextureVertex, ArxTextureVertex, ArxTextureVertex, ArxTextureVertex]
  unused: number[] // array holds 32*4 bytes of some data, but no idea what is it for
  nrml: [ArxVector3, ArxVector3, ArxVector3, ArxVector3]
  tex: number
  center: ArxVector3
  transval: number
  area: number
  room: number
  misc: number
}

export class PortalPolygon {
  static readFrom(binary: BinaryIO): ArxPortalPolygon {
    return {
      type: binary.readInt32(),
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      v: times(() => TextureVertex.readFrom(binary), 4) as [
        ArxTextureVertex,
        ArxTextureVertex,
        ArxTextureVertex,
        ArxTextureVertex,
      ],
      unused: binary.readUint8Array(32 * 4),
      nrml: binary.readVector3Array(4) as [ArxVector3, ArxVector3, ArxVector3, ArxVector3],
      tex: binary.readInt32(),
      center: binary.readVector3(),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      room: binary.readInt16(),
      misc: binary.readInt16(),
    }
  }

  static accumulateFrom(polygon: ArxPortalPolygon) {
    const buffer = Buffer.alloc(PortalPolygon.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(polygon.type)
    binary.writeVector3(polygon.min)
    binary.writeVector3(polygon.max)
    binary.writeVector3(polygon.norm)
    binary.writeVector3(polygon.norm2)
    binary.writeBuffer(Buffer.concat(polygon.v.map(TextureVertex.accumulateFrom)))
    binary.writeUint8Array(polygon.unused)
    binary.writeVector3Array(polygon.nrml)
    binary.writeInt32(polygon.tex)
    binary.writeVector3(polygon.center)
    binary.writeFloat32(polygon.transval)
    binary.writeFloat32(polygon.area)
    binary.writeInt16(polygon.room)
    binary.writeInt16(polygon.misc)

    return buffer
  }

  static sizeOf() {
    return 52 + TextureVertex.sizeOf() * 4 + 204
  }
}
