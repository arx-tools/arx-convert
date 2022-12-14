import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { FTS_VERSION, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '../common/constants'
import { maxAll, uniq } from '../common/helpers'
import { ArxVector3 } from '../common/types'
import { ArxFTS } from './FTS'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L94
 */
export type ArxSceneHeader = {
  numberOfTextures: number
  numberOfAnchors: number
  playerPosition: ArxVector3
  mScenePosition: ArxVector3
  numberOfPortals: number
  numberOfRooms: number
}

export class SceneHeader {
  static readFrom(binary: BinaryIO): ArxSceneHeader {
    binary.readFloat32() // version - always 0.14100000262260437
    binary.readInt32() // sizeX - always 160
    binary.readInt32() // sizeZ - always 160

    const numberOfTextures = binary.readInt32()

    binary.readInt32() // numberOfPolygons - we calculate that from cells

    return {
      numberOfTextures,
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

    binary.writeFloat32(FTS_VERSION)
    binary.writeInt32(MAP_WIDTH_IN_CELLS)
    binary.writeInt32(MAP_DEPTH_IN_CELLS)
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
    return BinaryIO.sizeOfFloat32() + BinaryIO.sizeOfInt32Array(5 + 2) + BinaryIO.sizeOfVector3Array(2)
  }
}
