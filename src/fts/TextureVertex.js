const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')

class TextureVertex {
  static readFrom(binary) {
    return {
      pos: binary.readVector3(),
      rhw: binary.readFloat32(), // portal bounds radius ?
      color: binary.readColorRGBA(),
      specular: binary.readColorRGBA(), // unused btw...
      tu: binary.readFloat32(),
      tv: binary.readFloat32(),
    }
  }

  static accumulateFrom(vertex) {
    const buffer = Buffer.alloc(TextureVertex.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(vertex.pos)
    binary.writeFloat32(vertex.rhw)
    binary.writeColorRGBA(vertex.color)
    binary.writeColorRGBA(vertex.specular)
    binary.writeFloat32(vertex.tu)
    binary.writeFloat32(vertex.tv)

    return buffer
  }

  static sizeOf() {
    return 3 * 4 + 4 + 4 + 4 + 4 + 4
  }
}

module.exports = { TextureVertex }
