import { BinaryIO } from '@common/BinaryIO.js'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '@common/constants.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import { Anchor, type ArxAnchor } from '@fts/Anchor.js'
import { type ArxCell, Cell } from '@fts/Cell.js'
import { type ArxFtsHeader, FtsHeader } from '@fts/FtsHeader.js'
import type { ArxPolygon } from '@fts/Polygon.js'
import { type ArxPortal, Portal } from '@fts/Portal.js'
import { type ArxRoom, Room } from '@fts/Room.js'
import { type ArxRoomDistance, RoomDistance } from '@fts/RoomDistance.js'
import { type ArxSceneHeader, SceneHeader } from '@fts/SceneHeader.js'
import { type ArxTextureContainer, TextureContainer } from '@fts/TextureContainer.js'
import { type ArxUniqueHeader, UniqueHeader } from '@fts/UniqueHeader.js'
import { addLightIndex, getCellCoords } from '@fts/helpers.js'

export type ArxFTS = {
  header: Omit<ArxFtsHeader, 'numberOfUniqueHeaders'>
  uniqueHeaders: ArxUniqueHeader[]
  sceneHeader: Omit<ArxSceneHeader, 'numberOfTextures' | 'numberOfAnchors' | 'numberOfPortals' | 'numberOfRooms'>
  textureContainers: ArxTextureContainer[]
  cells: Omit<ArxCell, 'polygons'>[]
  polygons: ArxPolygon[]
  anchors: ArxAnchor[]
  portals: ArxPortal[]
  rooms: ArxRoom[]
  roomDistances: ArxRoomDistance[]
}

/**
 * Arx Libertatis feature: setting the uncompressed bytes' size in the header to 0 gets
 * interpreted as the file being uncompressed
 *
 * source of discussion: https://arx-libertatis.org/irclogs/2022/%23arx.2022-09-06.log
 * and https://arx-libertatis.org/irclogs/2022/%23arx.2022-09-07.log
 *
 * implemented in: https://github.com/arx/ArxLibertatis/commit/2d2226929780b6202f54982bacc79ddf75dbec53
 *
 * available in Arx Libertatis 1.3 snapshots that came after `2022-09-17` in https://arx-libertatis.org/files/snapshots/
 */
const IS_AN_UNCOMPRESSED_FTS = 0

export class FTS {
  static load(decompressedFile: ArrayBufferLike): ArxFTS {
    const file = new BinaryIO(decompressedFile)

    const { numberOfUniqueHeaders, ...header } = FtsHeader.readFrom(file)

    const uniqueHeaders = times(() => {
      return UniqueHeader.readFrom(file)
    }, numberOfUniqueHeaders)

    const { numberOfTextures, numberOfAnchors, numberOfPortals, numberOfRooms, ...sceneHeader } =
      SceneHeader.readFrom(file)

    const textureContainers = times(() => {
      return TextureContainer.readFrom(file)
    }, numberOfTextures)

    const combinedCells: ArxCell[] = []
    for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
      for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
        combinedCells.push(Cell.readFrom(file))
      }
    }

    return {
      header,
      uniqueHeaders,
      sceneHeader,
      textureContainers,
      cells: combinedCells.map(({ polygons, ...cell }) => {
        return cell
      }),
      polygons: addLightIndex(
        combinedCells.flatMap(({ polygons }) => {
          return polygons
        }),
      ),
      anchors: times(() => {
        return Anchor.readFrom(file)
      }, numberOfAnchors),
      portals: times(() => {
        return Portal.readFrom(file)
      }, numberOfPortals),
      rooms: times(() => {
        return Room.readFrom(file)
      }, numberOfRooms),
      roomDistances: times(() => {
        return RoomDistance.readFrom(file)
      }, numberOfRooms ** 2),
    }
  }

  static save(json: ArxFTS, isCompressed = true): ArrayBuffer {
    const { levelIdx } = json.header

    const sceneHeader = SceneHeader.accumulateFrom(json)

    const recombinedCells = json.cells.map((cell): ArxCell => {
      return {
        ...cell,
        polygons: [],
      }
    })

    json.polygons.forEach((polygon) => {
      const [cellX, cellY] = getCellCoords(polygon.vertices)

      const cellIndex = cellY * MAP_WIDTH_IN_CELLS + cellX
      recombinedCells[cellIndex].polygons.push(polygon)
    })

    const textureContainers = concatArrayBuffers(json.textureContainers.map(TextureContainer.accumulateFrom))
    const cells = concatArrayBuffers(recombinedCells.map(Cell.accumulateFrom))
    const anchors = concatArrayBuffers(json.anchors.map(Anchor.accumulateFrom))
    const portals = concatArrayBuffers(
      json.portals.map((portal) => {
        return Portal.accumulateFrom(portal, levelIdx)
      }),
    )
    const rooms = concatArrayBuffers(json.rooms.map(Room.accumulateFrom))
    const roomDistances = concatArrayBuffers(json.roomDistances.map(RoomDistance.accumulateFrom))

    const dataWithoutHeader = concatArrayBuffers([
      sceneHeader,
      textureContainers,
      cells,
      anchors,
      portals,
      rooms,
      roomDistances,
    ])

    let header: ArrayBuffer
    if (isCompressed) {
      header = FtsHeader.accumulateFrom(json, dataWithoutHeader.byteLength)
    } else {
      header = FtsHeader.accumulateFrom(json, IS_AN_UNCOMPRESSED_FTS)
    }

    const uniqueHeaders = concatArrayBuffers(json.uniqueHeaders.map(UniqueHeader.accumulateFrom))

    return concatArrayBuffers([header, uniqueHeaders, dataWithoutHeader])
  }
}
