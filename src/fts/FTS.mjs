import { times, map } from '../../node_modules/ramda/src/index.mjs'
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

export default class FTS {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfUniqueHeaders, ...header } = Header.readFrom(file)

    const data = {
      meta: {
        type: 'fts'
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

    data.cells = []
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        data.cells.push(Cell.readFrom(file))
      }
    }

    data.anchors = times(() => Anchor.readFrom(file), numberOfAnchors)
    data.portals = times(() => Portal.readFrom(file), numberOfPortals)
    data.rooms = times(() => Room.readFrom(file), numberOfRooms)
    data.roomDistances = times(() => RoomDistance.readFrom(file), numberOfRooms ** 2)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      console.log(`FTS: ignoring remained ${remainedBytes} bytes`)
    }

    return data
  }

  static save(json) {
    const header = Header.accumulateFrom(json)
    const uniqueHeaders = Buffer.concat(map(UniqueHeader.accumulateFrom.bind(UniqueHeader), json.uniqueHeaders))
    const sceneHeader = SceneHeader.accumulateFrom(json)
    const textureContainers = Buffer.concat(map(TextureContainer.accumulateFrom.bind(TextureContainer), json.textureContainers))

    const cells = Buffer.concat(map(Cell.accumulateFrom.bind(Cell), json.cells))

    const anchors = Buffer.concat(map(Anchor.accumulateFrom.bind(Anchor), json.anchors))
    const portals = Buffer.concat(map(Portal.accumulateFrom.bind(Portal), json.portals))

    const rooms = Buffer.concat(map(Room.accumulateFrom.bind(Room), json.rooms))

    const roomDistances = Buffer.concat(map(RoomDistance.accumulateFrom.bind(RoomDistance), json.roomDistances))

    return Buffer.concat([header, uniqueHeaders, sceneHeader, textureContainers, cells, anchors, portals, rooms, roomDistances])
  }
}
