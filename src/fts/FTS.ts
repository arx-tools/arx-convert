import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '@common/constants.js'
import { times } from '@common/helpers.js'
import { Anchor, ArxAnchor } from '@fts/Anchor.js'
import { ArxCell, Cell } from '@fts/Cell.js'
import { ArxFtsHeader, FtsHeader } from '@fts/FtsHeader.js'
import { ArxPolygon } from '@fts/Polygon.js'
import { ArxPortal, Portal } from '@fts/Portal.js'
import { ArxRoom, Room } from '@fts/Room.js'
import { ArxRoomDistance, RoomDistance } from '@fts/RoomDistance.js'
import { ArxSceneHeader, SceneHeader } from '@fts/SceneHeader.js'
import { ArxTextureContainer, TextureContainer } from '@fts/TextureContainer.js'
import { ArxUniqueHeader, UniqueHeader } from '@fts/UniqueHeader.js'
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

export class FTS {
  static load(decompressedFile: Buffer): ArxFTS {
    const file = new BinaryIO(decompressedFile)

    const { numberOfUniqueHeaders, ...header } = FtsHeader.readFrom(file)

    const uniqueHeaders = times(() => UniqueHeader.readFrom(file), numberOfUniqueHeaders)

    const { numberOfTextures, numberOfAnchors, numberOfPortals, numberOfRooms, ...sceneHeader } =
      SceneHeader.readFrom(file)

    const textureContainers = times(() => TextureContainer.readFrom(file), numberOfTextures)

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
      cells: combinedCells.map(({ polygons, ...cell }) => cell),
      polygons: addLightIndex(combinedCells.flatMap(({ polygons }) => polygons)),
      anchors: times(() => Anchor.readFrom(file), numberOfAnchors),
      portals: times(() => Portal.readFrom(file), numberOfPortals),
      rooms: times(() => Room.readFrom(file), numberOfRooms),
      roomDistances: times(() => RoomDistance.readFrom(file), numberOfRooms ** 2),
    }
  }

  static save(json: ArxFTS) {
    const levelIdx = json.header.levelIdx

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

    const textureContainers = Buffer.concat(json.textureContainers.map(TextureContainer.accumulateFrom))
    const cells = Buffer.concat(recombinedCells.map(Cell.accumulateFrom))
    const anchors = Buffer.concat(json.anchors.map(Anchor.accumulateFrom))
    const portals = Buffer.concat(json.portals.map(Portal.accumulateFrom, levelIdx))
    const rooms = Buffer.concat(json.rooms.map(Room.accumulateFrom))
    const roomDistances = Buffer.concat(json.roomDistances.map(RoomDistance.accumulateFrom))

    const dataWithoutHeader = Buffer.concat([
      sceneHeader,
      textureContainers,
      cells,
      anchors,
      portals,
      rooms,
      roomDistances,
    ])

    const header = FtsHeader.accumulateFrom(json, dataWithoutHeader.length)
    const uniqueHeaders = Buffer.concat(json.uniqueHeaders.map(UniqueHeader.accumulateFrom))

    return Buffer.concat([header, uniqueHeaders, dataWithoutHeader])
  }
}
