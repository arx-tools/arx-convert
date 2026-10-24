import type { Simplify } from 'type-fest'
import { BinaryIO } from '../common/BinaryIO.ts'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '../common/constants.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { Anchor, type ArxAnchor } from './Anchor.ts'
import { type ArxCell, Cell } from './Cell.ts'
import { type ArxFtsHeader, FtsHeader } from './FtsHeader.ts'
import { type ArxPolygon, Polygon } from './Polygon.ts'
import { type ArxPortal, Portal } from './Portal.ts'
import { type ArxRoom, Room } from './Room.ts'
import { type ArxRoomDistance, RoomDistance } from './RoomDistance.ts'
import { type ArxSceneHeader, SceneHeader } from './SceneHeader.ts'
import { type ArxTextureContainer, TextureContainer } from './TextureContainer.ts'
import { type ArxUniqueHeader, UniqueHeader } from './UniqueHeader.ts'
import { addLightIndex, getCellCoords } from './helpers.ts'

export type ArxFTS = {
  $schema?: string
  header: Simplify<
    Omit<ArxFtsHeader, 'numberOfUniqueHeaders'> &
      Omit<ArxSceneHeader, 'numberOfTextures' | 'numberOfAnchors' | 'numberOfPortals' | 'numberOfRooms'>
  >
  uniqueHeaders?: ArxUniqueHeader[]
  textureContainers: ArxTextureContainer[]
  cells: Array<Simplify<Omit<ArxCell, 'polygons'>>>
  polygons: ArxPolygon[]
  anchors: ArxAnchor[]
  portals: ArxPortal[]
  rooms: ArxRoom[]
  roomDistances: ArxRoomDistance[]
}

/**
 * Arx Libertatis feature: setting the uncompressed bytes' size in the header to 0 gets
 * interpreted as the file being uncompressed.
 *
 * Source of discussion: https://arx-libertatis.org/irclogs/2022/%23arx.2022-09-06.log
 * and https://arx-libertatis.org/irclogs/2022/%23arx.2022-09-07.log.
 *
 * Implemented in: https://github.com/arx/ArxLibertatis/commit/2d2226929780b6202f54982bacc79ddf75dbec53.
 *
 * Available in Arx Libertatis 1.3 snapshots that came after `2022-09-17` in https://arx-libertatis.org/files/snapshots/.
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
      $schema: 'https://arx-tools.github.io/schemas/fts.schema.json',
      header: {
        ...header,
        ...sceneHeader,
      },
      uniqueHeaders,
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

  /**
   * Serializes the scene into the bytes of an FTS file.
   *
   * @param json The scene to write.
   * @param isCompressed When set to `true` (which is the default value) then the FTS will
   * need to get partially compressed with {@link https://github.com/arx-tools/node-pkware | node-pkware}.
   * `arx-libertatis-1.3-dev-2022-12-31` and later {@link https://arx-libertatis.org/files/snapshots/ | Arx Libertatis 1.3 snapshots }
   * all support uncompressed FTS files, when targeting those versions isCompressed can be set to `false`.
   */
  static save(json: ArxFTS, isCompressed = true): ArrayBuffer {
    const { levelIdx } = json.header

    const sceneHeader = SceneHeader.accumulateFrom(json)

    const recombinedCells = json.cells.map((cell): ArxCell => {
      return {
        ...cell,
        polygons: [],
      }
    })

    for (const polygon of json.polygons) {
      const [cellX, cellY] = getCellCoords(polygon.vertices)

      const cellIndex = cellY * MAP_WIDTH_IN_CELLS + cellX
      recombinedCells[cellIndex].polygons.push(polygon)
    }

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

    const uniqueHeaders = concatArrayBuffers((json.uniqueHeaders ?? []).map(UniqueHeader.accumulateFrom))

    return concatArrayBuffers([header, uniqueHeaders, dataWithoutHeader])
  }

  /**
   * Mutates the `.polygon` property by removing all polygons that are out of bounds
   * and returns the list of removed polygons.
   *
   * A polygon is considered out of bounds when any of its vertices are not 0 <= x < 16_000 or 0 <= z < 16_000.
   */
  static removeOutOfBoundsPolygons(json: ArxFTS): ArxPolygon[] {
    const inBounds: ArxPolygon[] = []
    const outOfBounds: ArxPolygon[] = []

    for (const polygon of json.polygons) {
      if (Polygon.isOutOfBounds(polygon)) {
        outOfBounds.push(polygon)
      } else {
        inBounds.push(polygon)
      }
    }

    json.polygons = inBounds

    return outOfBounds
  }
}
