export default class SceneHeader {
  static readFrom(binary) {
    return {
      version: binary.readFloat32(),
      sizeX: binary.readInt32(),
      sizeZ: binary.readInt32(),
      numberOfTextures: binary.readInt32(),
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32(),
      playerPosition: binary.readVector3(),
      mScenePosition: binary.readVector3(),
      numberOfPortals: binary.readInt32(),
      numberOfRooms: binary.readInt32(),
    }
  }

  writeTo(binary) {}
}
