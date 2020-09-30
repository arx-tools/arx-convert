import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import UniqueHeader from './UniqueHeader.mjs'

export default class FTS {
  load(decompressedBuffer) {
    const body = new BinaryIO(decompressedBuffer.buffer)

    this._readHeader(body)
  }

  _readHeader(file) {
    const header = new Header()
    header.readFrom(file)
    this.header = header

    this.uniqueHeaders = []
    for (let i = 0; i < header.count; i++) {
      const uniqueHeader = new UniqueHeader()
      uniqueHeader.readFrom(file)
      this.uniqueHeaders.push(uniqueHeader)
    }
  }
}
