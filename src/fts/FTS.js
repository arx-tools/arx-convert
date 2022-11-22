const { Buffer } = require('node:buffer')
const { isZeroVertex, times } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { CoordsThatNeedRoundingUp } = require('../common/constants')
const { Anchor } = require('./Anchor.js')
const { Cell } = require('./Cell.js')
const { FtsHeader } = require('./FtsHeader.js')
const { Portal } = require('./Portal.js')
const { Room } = require('./Room.js')
const { RoomDistance } = require('./RoomDistance.js')
const { SceneHeader } = require('./SceneHeader.js')
const { TextureContainer } = require('./TextureContainer.js')
const { UniqueHeader } = require('./UniqueHeader.js')

const doCoordsNeedToBeRoundedUp = (coords) => {
  const [a, b, c] = coords.sort((a, b) => a - b)
  return CoordsThatNeedRoundingUp.find(([x, y, z]) => a === x && b === y && c === z) !== undefined
}

const addLightIndex = (polygons) => {
  let idx = 0

  return polygons.map((polygon) => {
    const isQuad = !isZeroVertex(polygon.vertices[3])

    polygon.vertices[0].llfColorIdx = idx++
    polygon.vertices[1].llfColorIdx = idx++
    polygon.vertices[2].llfColorIdx = idx++
    polygon.vertices[3].llfColorIdx = isQuad ? idx++ : null

    return polygon
  })
}

const getCellCoords = ([a, b, c]) => {
  const x = (a.x + b.x + c.x) / 3
  const z = (a.z + b.z + c.z) / 3

  let cellX = doCoordsNeedToBeRoundedUp([a.x, b.x, c.x]) ? Math.ceil(x / 100) : Math.floor(x / 100)
  let cellY = doCoordsNeedToBeRoundedUp([a.z, b.z, c.z]) ? Math.ceil(z / 100) : Math.floor(z / 100)

  return [cellX, cellY]
}

class FTS {
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
    data.cells = cells.map(({ polygons, ...cell }) => cell)
    data.polygons = addLightIndex(cells.flatMap(({ polygons }) => polygons))

    data.anchors = times(() => Anchor.readFrom(file), numberOfAnchors)
    data.portals = times(() => Portal.readFrom(file), numberOfPortals)
    data.rooms = times(() => Room.readFrom(file), numberOfRooms)
    data.roomDistances = times(() => RoomDistance.readFrom(file), numberOfRooms ** 2)

    const remainedBytes = file.byteLength - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    return data
  }

  static save(json) {
    const sceneHeader = SceneHeader.accumulateFrom(json)

    const sizeX = json.sceneHeader.sizeX

    json.cells.forEach((cell) => {
      cell.polygons = []
    })

    json.polygons.forEach((polygon) => {
      const [cellX, cellY] = getCellCoords(polygon.vertices)

      const cellIndex = cellY * sizeX + cellX
      json.cells[cellIndex].polygons.push(polygon)
    })

    const textureContainers = Buffer.concat(json.textureContainers.map(TextureContainer.accumulateFrom))
    const cells = Buffer.concat(json.cells.map(Cell.accumulateFrom))
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

    const uncompressedSize = dataWithoutHeader.length

    const header = FtsHeader.accumulateFrom(json, uncompressedSize)
    const uniqueHeaders = Buffer.concat(json.uniqueHeaders.map(UniqueHeader.accumulateFrom))

    return Buffer.concat([header, uniqueHeaders, dataWithoutHeader])
  }
}

module.exports = { FTS }
