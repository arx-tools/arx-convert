const BinaryIO = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')

// y before x is not a typo: https://github.com/arx/ArxLibertatis/blob/master/src/graphics/data/FastSceneFormat.h#L73

class Vertex {
  static readFrom(binary) {
    const [y, x, z, u, v] = [
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
    ]

    return {
      posX: x,
      posY: y,
      posZ: z,
      texU: u,
      texV: v,
    }
  }

  static accumulateFrom(vertex) {
    const buffer = Buffer.alloc(Vertex.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(vertex.posY)
    binary.writeFloat32(vertex.posX)
    binary.writeFloat32(vertex.posZ)
    binary.writeFloat32(vertex.texU)
    binary.writeFloat32(vertex.texV)

    return buffer
  }

  static sizeOf() {
    return 5 * 4
  }
}

module.exports = Vertex
