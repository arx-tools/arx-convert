export default class SceneInfo {
  static readFrom(binary) {
    return {
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32()
    }
  }
}
