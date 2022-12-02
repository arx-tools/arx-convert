import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { addLightIndex, getCellCoords, times } from '../common/helpers'
import { ArxFormat } from '../types'
import { Anchor, ArxAnchor } from './Anchor'
import { ArxCell, Cell } from './Cell'
import { ArxFtsHeader, FtsHeader } from './FtsHeader'
import { ArxPolygon } from './Polygon'
import { ArxPortal, Portal } from './Portal'
import { ArxRoom, Room } from './Room'
import { ArxRoomDistance, RoomDistance } from './RoomDistance'
import { ArxSceneHeader, SceneHeader } from './SceneHeader'
import { ArxTextureContainer, TextureContainer } from './TextureContainer'
import { ArxUniqueHeader, UniqueHeader } from './UniqueHeader'

export type ArxFTS = ArxFormat & {
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
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfUniqueHeaders, ...header } = FtsHeader.readFrom(file)

    const uniqueHeaders = times(() => UniqueHeader.readFrom(file), numberOfUniqueHeaders)

    const { numberOfTextures, numberOfAnchors, numberOfPortals, numberOfRooms, ...sceneHeader } =
      SceneHeader.readFrom(file)

    const textureContainers = times(() => TextureContainer.readFrom(file), numberOfTextures)

    const combinedCells: ArxCell[] = []
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        combinedCells.push(Cell.readFrom(file))
      }
    }

    const data: ArxFTS = {
      meta: {
        type: 'fts',
        numberOfLeftoverBytes: 0,
      },
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

    data.meta.numberOfLeftoverBytes = file.byteLength - file.position

    return data
  }

  static save(json: ArxFTS) {
    const sceneHeader = SceneHeader.accumulateFrom(json)

    const sizeX = json.sceneHeader.sizeX

    const recominedCells = json.cells.map((cell): ArxCell => {
      return {
        ...cell,
        polygons: [],
      }
    })

    json.polygons.forEach((polygon) => {
      const [cellX, cellY] = getCellCoords(polygon.vertices)

      const cellIndex = cellY * sizeX + cellX
      recominedCells[cellIndex].polygons.push(polygon)
    })

    const textureContainers = Buffer.concat(json.textureContainers.map(TextureContainer.accumulateFrom))
    const cells = Buffer.concat(recominedCells.map(Cell.accumulateFrom))
    const anchors = Buffer.concat(json.anchors.map(Anchor.accumulateFrom))
    const portals = Buffer.concat(json.portals.map(Portal.accumulateFrom))
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
