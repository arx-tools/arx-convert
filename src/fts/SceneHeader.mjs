export default class SceneHeader {
  readFrom(binary) {
    this.version = binary.readFloat32()
    this.sizeX = binary.readInt32()
    this.sizeZ = binary.readInt32()
    this.numberOfTextures = binary.readInt32()
    this.numberOfPolygons = binary.readInt32()
    this.numberOfAnchors = binary.readInt32()
    this.playerPosition = binary.readVector3()
    this.mScenePosition = binary.readVector3()
    this.numberOfPortals = binary.readInt32()
    this.numberOfRooms = binary.readInt32()
  }

  writeTo(binary) {}
}
