const { BinaryIO } = require('../binary/BinaryIO.js')
const FtsHeader = require('./FtsHeader.js')
const SceneHeader = require('./SceneHeader.js')
const UniqueHeader = require('./UniqueHeader.js')
const TextureContainer = require('./TextureContainer.js')
const Cell = require('./Cell.js')
const Anchor = require('./Anchor.js')
const Portal = require('./Portal.js')
const Room = require('./Room.js')
const RoomDistance = require('./RoomDistance.js')
const { roundTo3Decimals, minAll, isZeroVertex, times } = require('../common/helpers.js')
const { Buffer } = require('buffer')

const addIndexToVertices = (polygons) => {
  let idx = 0

  return polygons.map((polygon) => {
    polygon.vertices = polygon.vertices.map((vertex) => {
      if (isZeroVertex(vertex)) {
        vertex.llfColorIdx = null
      } else {
        vertex.llfColorIdx = idx
        idx++
      }
      return vertex
    })
    return polygon
  })
}

const coordToCell = (coord) => {
  return Math.floor(roundTo3Decimals(coord) / 100)
}

class FTS {
  static getPolygons(cells) {
    return addIndexToVertices(cells.flatMap(({ polygons }) => polygons))
  }

  static getCellCoordinateFromPolygon(axis, polygon) {
    const nonZeroVertices = polygon.vertices.filter((vertex) => {
      return !isZeroVertex(vertex)
    })
    const coords = nonZeroVertices.map(({ x, z }) => {
      return roundTo3Decimals(axis === 'x' ? x : z)
    })

    return coordToCell(minAll(coords))
  }

  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfUniqueHeaders, ...header } = FtsHeader.readFrom(file)

    const data = {
      meta: {
        type: 'fts',
        numberOfLeftoverBytes: 0,
      },
      header: header,
      uniqueHeaders: times(() => UniqueHeader.readFrom(file), numberOfUniqueHeaders),
    }

    const { numberOfTextures, numberOfAnchors, numberOfPortals, numberOfRooms, ...sceneHeader } =
      SceneHeader.readFrom(file)

    data.sceneHeader = sceneHeader
    data.textureContainers = times(() => TextureContainer.readFrom(file), numberOfTextures)

    const cells = []
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        cells.push(Cell.readFrom(file))
      }
    }
    data.cells = cells.map(({ polygons, ...cell }) => {
      return cell
    })

    data.polygons = FTS.getPolygons(cells)

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
    // TODO: rooms hold portal information!!

    return data
  }

  static save(json) {
    const sizeX = json.sceneHeader.sizeX

    const _cells = json.polygons.reduce(
      (cells, polygon) => {
        const cellX = FTS.getCellCoordinateFromPolygon('x', polygon)
        const cellY = FTS.getCellCoordinateFromPolygon('z', polygon)

        const polygons = cells[cellY * sizeX + cellX].polygons
        const idx = polygons.length
        cells[cellY * sizeX + cellX].polygons.push({ ...polygon })
        polygon.idx = idx // TODO: this is a rather ugly hack for getting the indices into polygons

        return cells
      },
      json.cells.map((cell) => {
        cell.polygons = []
        return cell
      }),
    )

    const _rooms = json.polygons.reduce(
      (rooms, polygon) => {
        const roomIdx = parseInt(polygon.room)
        const roomData = {
          px: FTS.getCellCoordinateFromPolygon('x', polygon),
          py: FTS.getCellCoordinateFromPolygon('z', polygon),
          idx: polygon.idx,
        }

        if (typeof rooms[roomIdx] === 'undefined') {
          rooms[roomIdx] = {
            portals: [],
            polygons: [],
          }
        }

        // TODO: room[roomIdx].portals ?

        rooms[roomIdx].polygons.push(roomData)

        return rooms
      },
      [
        {
          portals: [],
          polygons: [],
        },
      ],
    )

    const sceneHeader = SceneHeader.accumulateFrom(json)

    const textureContainers = Buffer.concat(
      json.textureContainers.map(TextureContainer.accumulateFrom.bind(TextureContainer)),
    )

    // TODO: generate cells based on polygons
    const cells = Buffer.concat(_cells.map(Cell.accumulateFrom))

    const anchors = Buffer.concat(json.anchors.map(Anchor.accumulateFrom))

    const portals = Buffer.concat(json.portals.map(Portal.accumulateFrom))

    const rooms = Buffer.concat(_rooms.filter((x) => x).map(Room.accumulateFrom))

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
    const uncompressedSize = dataWithoutHeader.length

    const header = FtsHeader.accumulateFrom(json, uncompressedSize)
    const uniqueHeaders = Buffer.concat(json.uniqueHeaders.map(UniqueHeader.accumulateFrom.bind(UniqueHeader)))

    return Buffer.concat([header, uniqueHeaders, dataWithoutHeader])
  }
}

module.exports = FTS
