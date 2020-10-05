import BinaryIO from '../Binary/BinaryIO.mjs'
import SceneInfo from './SceneInfo.mjs'
import Polygon from './Polygon.mjs'
import { times, map } from '../../node_modules/ramda/src/index.mjs'

export default class Cell {
  static readFrom(binary) {
    const sceneInfo = SceneInfo.readFrom(binary)

    return {
      polygons: times(() => Polygon.readFrom(binary), sceneInfo.numberOfPolygons),
      anchors: times(() => binary.readInt32(), sceneInfo.numberOfAnchors)
    }
  }

  static accumulateFrom(cell) {
    const sceneInfo = SceneInfo.accumulateFrom(cell)

    const polygons = Buffer.concat(map(Polygon.accumulateFrom.bind(Polygon), cell.polygons))

    const anchors = Buffer.alloc(4 * cell.anchors.length)
    const binary = new BinaryIO(anchors.buffer)
    binary.writeInt32Array(cell.anchors)

    return Buffer.concat([sceneInfo, polygons, anchors])
  }
}