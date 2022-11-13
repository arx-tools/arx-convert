const TextureVertex = require('./TextureVertex.js')
const BinaryIO = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')
const { times } = require('../common/helpers.js')

class PortalPolygon {
  static readFrom(binary) {
    return {
      type: binary.readInt32(),
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
    const buffer1 = Buffer.alloc(PortalPolygon.sizeOf(), 0)
    const binary1 = new BinaryIO(buffer1.buffer)

    binary1.writeInt32(polygon.type)
    binary1.writeVector3(polygon.min)
    binary1.writeVector3(polygon.max)
    binary1.writeVector3(polygon.norm)
    binary1.writeVector3(polygon.norm2)

    const textureVertex = Buffer.concat(polygon.v.map(TextureVertex.accumulateFrom))

    const buffer2 = Buffer.alloc(PortalPolygon.sizeOf(), 0)
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

module.exports = PortalPolygon
