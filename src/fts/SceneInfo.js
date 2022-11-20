const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')

class SceneInfo {
  static readFrom(binary) {
    return {
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32(),
    }
  }

  static accumulateFrom(cell) {
    const buffer = Buffer.alloc(SceneInfo.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(cell.polygons.length)
    binary.writeInt32(cell.anchors.length)

    return buffer
  }

  static sizeOf() {
    return 2 * 4
  }
}

module.exports = { SceneInfo }
