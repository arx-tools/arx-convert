import { times } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import SceneHeader from './SceneHeader.mjs'
import UniqueHeader from './UniqueHeader.mjs'

export default class FTS {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const header = Header.readFrom(file)

    const data = {
      header: header,
      uniqueHeaders: times(() => UniqueHeader.readFrom(file), header.count),
      sceneHeader: SceneHeader.readFrom(file)
    }

    delete data.header.count

    return data
  }
}
