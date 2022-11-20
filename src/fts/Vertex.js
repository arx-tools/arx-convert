const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')

// y before x is not a typo:
// https://github.com/arx/ArxLibertatis/blob/master/src/graphics/data/FastSceneFormat.h#L73

class Vertex {
  static readFrom(binary) {
    const [y, x, z, u, v] = [
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
      binary.readFloat32(),
    ]

    return { x, y, z, u, v }
  }

  static accumulateFrom({ x, y, z, u, v }) {
    const buffer = Buffer.alloc(Vertex.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(y)
    binary.writeFloat32(x)
    binary.writeFloat32(z)
    binary.writeFloat32(u)
    binary.writeFloat32(v)

    return buffer
  }

  static sizeOf() {
    return 5 * 4
  }
}

module.exports = { Vertex }
