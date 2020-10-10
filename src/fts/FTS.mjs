import { times, pluck, unnest, compose, map, prop, reject, equals, reduce, has, assoc, dissoc, append } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import SceneHeader from './SceneHeader.mjs'
import UniqueHeader from './UniqueHeader.mjs'
import TextureContainer from './TextureContainer.mjs'
import Cell from './Cell.mjs'
import Anchor from './Anchor.mjs'
import Portal from './Portal.mjs'
import Room from './Room.mjs'
import RoomDistance from './RoomDistance.mjs'
import { roundTo3Decimals, minAll } from '../common/helpers.mjs'

const getPolygons = (cells, sizeX) => {
  return compose(
    unnest,
    pluck('polygons')
  )(cells)
}

const coordToCell = (coord) => {
  return Math.floor(roundTo3Decimals(coord) / 100)
}

const getCellCoordinateFromPolygon = (axis, polygon) => {
  return compose(
    minAll,
    map(coordToCell),
    pluck(axis === 'x' ? 'posX' : 'posZ'),
    reject(equals({
      posY: 0,
      posX: 0,
      posZ: 0,
      texU: 0,
      texV: 0
    })),
    prop('vertices')
  )(polygon)
}

export default class FTS {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfUniqueHeaders, ...header } = Header.readFrom(file)

    const data = {
      meta: {
        type: 'fts',
        numberOfLeftoverBytes: 0
      },
      header: header,
      uniqueHeaders: times(() => UniqueHeader.readFrom(file), numberOfUniqueHeaders)
    }

    const {
      numberOfTextures,
      numberOfAnchors,
      numberOfPortals,
      numberOfRooms,
      ...sceneHeader
    } = SceneHeader.readFrom(file)

    data.sceneHeader = sceneHeader
    data.textureContainers = times(() => TextureContainer.readFrom(file), numberOfTextures)

    const cells = []
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        cells.push(Cell.readFrom(file))
      }
    }
    data.cells = cells.map(dissoc('polygons'))
    data.polygons = getPolygons(cells, sceneHeader.sizeX)

    data.anchors = times(() => Anchor.readFrom(file), numberOfAnchors)
    data.portals = times(() => Portal.readFrom(file), numberOfPortals)
    data.rooms = times(() => Room.readFrom(file), numberOfRooms)
    data.roomDistances = times(() => RoomDistance.readFrom(file), numberOfRooms ** 2)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    // rooms are lookup tables for vertices, so we don't really need it,
    // we can just generate it from the cells > polygons > vertices
    delete data.rooms

    return data
  }

  static save(json) {
    const sizeX = json.sceneHeader.sizeX

    const _cells = reduce((cells, polygon) => {
      const cellX = getCellCoordinateFromPolygon('x', polygon)
      const cellY = getCellCoordinateFromPolygon('z', polygon)

      const polygons = cells[cellY * sizeX + cellX].polygons
      const idx = polygons.length
      cells[cellY * sizeX + cellX].polygons = append({ ...polygon }, polygons)
      polygon.idx = idx // TODO: this is a rather ugly hack for getting the indexes into polygons

      return cells
    }, json.cells.map(assoc('polygons', [])), json.polygons)

    const _rooms = reduce((rooms, polygon) => {
      const roomIdx = parseInt(polygon.room)
      const roomData = {
        px: getCellCoordinateFromPolygon('x', polygon),
        py: getCellCoordinateFromPolygon('z', polygon),
        idx: polygon.idx
      }

      if (!has(roomIdx, rooms)) {
        rooms[roomIdx] = {
          portals: [],
          polygons: []
        }
      }

      rooms[roomIdx].polygons.push(roomData)

      return rooms
    }, [{
      portals: [],
      polygons: []
    }], json.polygons)

    const header = Header.accumulateFrom(json)
    const uniqueHeaders = Buffer.concat(map(UniqueHeader.accumulateFrom.bind(UniqueHeader), json.uniqueHeaders))
    const sceneHeader = SceneHeader.accumulateFrom(json)
    const textureContainers = Buffer.concat(map(TextureContainer.accumulateFrom.bind(TextureContainer), json.textureContainers))

    // TODO: generate cells based on polygons
    const cells = Buffer.concat(map(Cell.accumulateFrom.bind(Cell), _cells))

    const anchors = Buffer.concat(map(Anchor.accumulateFrom.bind(Anchor), json.anchors))
    const portals = Buffer.concat(map(Portal.accumulateFrom.bind(Portal), json.portals))

    const rooms = Buffer.concat(map(Room.accumulateFrom.bind(Room), _rooms))

    const roomDistances = Buffer.concat(map(RoomDistance.accumulateFrom.bind(RoomDistance), json.roomDistances))

    return Buffer.concat([header, uniqueHeaders, sceneHeader, textureContainers, cells, anchors, portals, rooms, roomDistances])
  }
}
