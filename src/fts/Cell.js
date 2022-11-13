const { BinaryIO } = require('../binary/BinaryIO.js')
const SceneInfo = require('./SceneInfo.js')
const Polygon = require('./Polygon.js')
const { Buffer } = require('buffer')
const { times } = require('../common/helpers.js')

class Cell {
  static readFrom(binary) {
    const sceneInfo = SceneInfo.readFrom(binary)

    return {
      polygons: times(() => Polygon.readFrom(binary), sceneInfo.numberOfPolygons),
      anchors: times(() => binary.readInt32(), sceneInfo.numberOfAnchors),
    }
  }

  static accumulateFrom(cell) {
    const sceneInfo = SceneInfo.accumulateFrom(cell)

    const polygons = Buffer.concat(cell.polygons.map(Polygon.accumulateFrom))

    const anchors = Buffer.alloc(cell.anchors.length * 4)
    const binary = new BinaryIO(anchors.buffer)
    binary.writeInt32Array(cell.anchors)

    return Buffer.concat([sceneInfo, polygons, anchors])
  }
}

module.exports = Cell
