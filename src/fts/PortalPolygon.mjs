import { times } from '../../node_modules/ramda/src/index.mjs'
import TextureVertex from './TextureVertex.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'

export default class PortalPolygon {
  static readFrom(binary) {
    return {
      type: binary.readInt32().toString(2).padStart(28, '0'),
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      v: times(() => TextureVertex.readFrom(binary), 4),
      unused: binary.readUint8Array(32 * 4), //TODO: apparently this does hold data, question is what kind of data...
      nrml: binary.readVector3Array(4),
      tex: binary.readInt32(),
      center: binary.readVector3(),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      room: binary.readInt16(),
      misc: binary.readInt16(),
    }
  }

  static accumulateFrom(polygon) {
    const buffer1 = Buffer.alloc(this.sizeOf(), 0)
    const binary1 = new BinaryIO(buffer1.buffer)

    binary1.writeInt32(parseInt(polygon.type, 2))
    binary1.writeVector3(polygon.min)
    binary1.writeVector3(polygon.max)
    binary1.writeVector3(polygon.norm)
    binary1.writeVector3(polygon.norm2)

    const textureVertex = Buffer.concat(map(TextureVertex.accumulateFrom.bind(TextureVertex), polygon.v))

    const buffer2 = Buffer.alloc(this.sizeOf(), 0)
    const binary2 = new BinaryIO(buffer2.buffer)

    binary2.writeUint8Array(polygon.unused)
    binary2.writeVector3Array(polygon.nrml)
    binary2.writeInt32(polygon.tex)
    binary2.writeVector3(polygon.center)
    binary2.writeFloat32(polygon.transval)
    binary2.writeFloat32(polygon.area)
    binary2.writeInt16(polygon.room)
    binary2.writeInt16(polygon.misc)

    return Buffer.concat([buffer1, textureVertex, buffer2])
  }

  static sizeOf() {
    return 4 + 4 * 3 * 4 + TextureVertex.sizeOf() * 4 + 32 * 4 + 4 * 3 * 4 + 4 + 3 * 4 + 4 + 4 + 2 + 2
  }
}
