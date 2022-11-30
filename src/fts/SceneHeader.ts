import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { maxAll, uniq } from '../common/helpers'
import { ArxVector3 } from '../types'
import { ArxFTS } from './FTS'

export type ArxSceneHeader = {
  version: number
  sizeX: number
  sizeZ: number
  numberOfTextures: number
  numberOfPolygons: number
  numberOfAnchors: number
  playerPosition: ArxVector3
  mScenePosition: ArxVector3
  numberOfPortals: number
  numberOfRooms: number
}

export class SceneHeader {
  static readFrom(binary: BinaryIO): ArxSceneHeader {
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
      numberOfRooms: binary.readInt32() + 1, // rooms are 1 indexed, because an empty room is reserved for room #0
    }
  }

  static accumulateFrom(json: ArxFTS) {
    const numberOfRooms = maxAll(uniq(json.polygons.map(({ room }) => room)))

    const buffer = Buffer.alloc(SceneHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

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
