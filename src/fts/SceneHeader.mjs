import BinaryIO from '../Binary/BinaryIO.mjs'

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
      numberOfRooms: binary.readInt32() + 1, // no idea why +1, but it's in the code
    }
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(json.sceneHeader.version)
    binary.writeInt32(json.cells[0].length)
    binary.writeInt32(json.cells.length)
    binary.writeInt32(json.textureContainers.length)
    binary.writeInt32(json.sceneHeader.numberOfPolygons)
    binary.writeInt32(json.anchors.length)
    binary.writeVector3(json.sceneHeader.playerPosition)
    binary.writeVector3(json.sceneHeader.mScenePosition)
    binary.writeInt32(json.portals.length)
    binary.writeInt32(json.rooms.length - 1)

    return buffer
  }

  static sizeOf() {
    return 6 * 4 + 2 * 3 * 4 + 2 * 4
  }
}
