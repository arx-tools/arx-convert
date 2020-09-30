import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import SceneHeader from './SceneHeader.mjs'
import UniqueHeader from './UniqueHeader.mjs'

export default class FTS {
  load(decompressedBuffer) {
    const body = new BinaryIO(decompressedBuffer.buffer)

    const header = new Header()
    header.readFrom(body)
    this.header = header

    this.uniqueHeaders = []
    for (let i = 0; i < header.count; i++) {
      const uniqueHeader = new UniqueHeader()
      uniqueHeader.readFrom(body)
      this.uniqueHeaders.push(uniqueHeader)
    }

    const sceneHeader = new SceneHeader()
    sceneHeader.readFrom(body)
    this.sceneHeader = sceneHeader
  }
}
