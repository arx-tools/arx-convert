const { Buffer } = require('node:buffer')
const { uniq, maxAll } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')

class SceneHeader {
  static readFrom(binary) {
    const data = {
      version: binary.readFloat32(),
      sizeX: binary.readInt32(),
      sizeZ: binary.readInt32(),
      numberOfTextures: binary.readInt32(),
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32(),
      playerPosition: binary.readVector3(),
      mScenePosition: binary.readVector3(),
      numberOfPortals: binary.readInt32(),
      numberOfRooms: binary.readInt32() + 1, // rooms are 1 indexed, but an empty room is reserved for room #0
    }
    delete data.numberOfPolygons // we can calculate this elsewhere
    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(SceneHeader.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    const numberOfRooms = maxAll(uniq(json.polygons.map(({ room }) => room)))

    binary.writeFloat32(json.sceneHeader.version)
    binary.writeInt32(json.sceneHeader.sizeX)
    binary.writeInt32(json.sceneHeader.sizeZ)
    binary.writeInt32(json.textureContainers.length)
    binary.writeInt32(json.polygons.length)
    binary.writeInt32(json.anchors.length)
    binary.writeVector3(json.sceneHeader.playerPosition)
    binary.writeVector3(json.sceneHeader.mScenePosition)
    binary.writeInt32(json.portals.length)
    binary.writeInt32(numberOfRooms)

    return buffer
  }

  static sizeOf() {
    return 6 * 4 + 2 * 3 * 4 + 2 * 4
  }
}

module.exports = { SceneHeader }
