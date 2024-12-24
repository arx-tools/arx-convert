import { BinaryIO } from '@common/BinaryIO.js'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '@common/constants.js'
import { maxAll, uniq } from '@common/helpers.js'
import { type ArxVector3 } from '@common/types.js'
import { type ArxFTS } from '@fts/FTS.js'
import { VERSION } from '@fts/constants.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L94
 */
export type ArxSceneHeader = {
  numberOfTextures: number
  numberOfAnchors: number
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

    binary.readInt32() // number of polygons - we calculate that by summing cell.numberOfPolygon values

    const numberOfAnchors = binary.readInt32()

    binary.readVector3() // player position - overwritten by dlf.header.posEdit + fts.sceneHeader.mScenePosition since arx 1.21

    return {
      numberOfTextures,
      numberOfAnchors,
      mScenePosition: binary.readVector3(),
      numberOfPortals: binary.readInt32(),
      numberOfRooms: binary.readInt32() + 1, // rooms are 1 indexed, because an empty room is reserved for room #0
    }
  }

  static accumulateFrom(json: ArxFTS): ArrayBuffer {
    const roomIds = json.polygons.map(({ room }) => {
      return room
    })

    const numberOfRooms = maxAll(uniq(roomIds))

    const buffer = new ArrayBuffer(SceneHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(VERSION)
    binary.writeInt32(MAP_WIDTH_IN_CELLS)
    binary.writeInt32(MAP_DEPTH_IN_CELLS)
    binary.writeInt32(json.textureContainers.length)
    binary.writeInt32(json.polygons.length)
    binary.writeInt32(json.anchors.length)
    binary.writeVector3({ x: 0, y: 0, z: 0 }) // player position (should be dlf.header.posEdit + fts.sceneHeader.mScenePosition)
    binary.writeVector3(json.sceneHeader.mScenePosition)
    binary.writeInt32(json.portals.length)
    binary.writeInt32(numberOfRooms)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfFloat32() + BinaryIO.sizeOfInt32Array(5 + 2) + BinaryIO.sizeOfVector3Array(2)
  }
}
