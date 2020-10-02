import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import SceneHeader from './SceneHeader.mjs'
import UniqueHeader from './UniqueHeader.mjs'

export default class FTS {
  load(decompressedBuffer) {
    const file = new BinaryIO(decompressedBuffer.buffer)

    const header = new Header()
    header.readFrom(file)
    this.header = header

    this.uniqueHeaders = []
    for (let i = 0; i < header.count; i++) {
      const uniqueHeader = new UniqueHeader()
      uniqueHeader.readFrom(file)
      this.uniqueHeaders.push(uniqueHeader)
    }

    const sceneHeader = new SceneHeader()
    sceneHeader.readFrom(file)
    this.sceneHeader = sceneHeader
  }
}
