import SceneInfo from './SceneInfo.mjs'
import Polygon from './Polygon.mjs'
import { times } from '../../node_modules/ramda/src/index.mjs'

export default class Cell {
  static readFrom(binary) {
    const sceneInfo = SceneInfo.readFrom(binary)

    return {
      polygons: times(() => Polygon.readFrom(binary), sceneInfo.numberOfPolygons),
      anchors: times(() => binary.readInt32(), sceneInfo.numberOfAnchors)
    }
  }
}