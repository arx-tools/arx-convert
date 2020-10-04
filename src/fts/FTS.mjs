import { times } from '../../node_modules/ramda/src/index.mjs'
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
      header: header,
      uniqueHeaders: times(() => UniqueHeader.readFrom(file), numberOfUniqueHeaders)
    }

    const {
      numberOfTextures,
      sizeZ,
      sizeX,
      numberOfAnchors,
      numberOfPortals,
      numberOfRooms,
      ...sceneHeader
    } = SceneHeader.readFrom(file)

    data.sceneHeader = sceneHeader
    data.textureContainers = times(() => TextureContainer.readFrom(file), numberOfTextures)

    // TODO: need to flatten cells! check the original code, they are in sequential order
    data.cells = times(() => {
      return times(() => {
        return Cell.readFrom(file)
      }, sizeX)
    }, sizeZ)

    data.anchors = times(() => Anchor.readFrom(file), numberOfAnchors)
    data.portals = times(() => Portal.readFrom(file), numberOfPortals)
    data.rooms = times(() => Room.readFrom(file), numberOfRooms + 1) // no idea why +1, but it's in the code
    data.roomDistances = times(() => RoomDistance.readFrom(file), (numberOfRooms + 1) ** 2)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      console.log(`FTS: ignoring remained ${remainedBytes} bytes`)
    }

    return data
  }

  static save(json) {
    return Buffer.from([])
  }
}
