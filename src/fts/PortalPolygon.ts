import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxVector3, QuadrupleOf } from '../common/types'
import { ArxTextureVertex, TextureVertex } from './TextureVertex'

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
  unused: number[] // array holds 32*4 bytes of some data, but no idea what it is
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
    return {
      type: binary.readInt32(),
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      v: times(() => TextureVertex.readFrom(binary), 4) as QuadrupleOf<ArxTextureVertex>,
      unused: binary.readUint8Array(32 * 4),
      nrml: binary.readVector3Array(4) as QuadrupleOf<ArxVector3>,
      tex: binary.readInt32(),
      center: binary.readVector3(),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      room: binary.readInt16(),
      misc: binary.readInt16(),
    }
  }

  static accumulateFrom(portalPolygon: ArxPortalPolygon) {
    const buffer = Buffer.alloc(PortalPolygon.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(portalPolygon.type)
    binary.writeVector3(portalPolygon.min)
    binary.writeVector3(portalPolygon.max)
    binary.writeVector3(portalPolygon.norm)
    binary.writeVector3(portalPolygon.norm2)
    binary.writeBuffer(Buffer.concat(portalPolygon.v.map(TextureVertex.accumulateFrom)))
    binary.writeUint8Array(portalPolygon.unused)
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
