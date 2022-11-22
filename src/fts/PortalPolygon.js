const { Buffer } = require('node:buffer')
const { times } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { TextureVertex } = require('./TextureVertex.js')

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

module.exports = { PortalPolygon }
