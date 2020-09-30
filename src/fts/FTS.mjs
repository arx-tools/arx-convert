import BinaryIO from '../Binary/BinaryIO.mjs'
import UniqueHeader from './UniqueHeader.mjs'

export default class FTS {
  load(decompressedBuffer) {
    const body = new BinaryIO(decompressedBuffer.buffer)

    this._readHeader(body)
  }

  _readHeader(file) {
    const header = new UniqueHeader()
    header.readFrom(file)
    this.header = header
  }
}
