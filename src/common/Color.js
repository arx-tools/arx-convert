const BinaryIO = require('../binary/BinaryIO.js')
const { getLowestByte } = require('./helpers.js')
const { Buffer } = require('buffer')

class Color {
  static readFrom(binary, isCompact) {
    const data = {}

    if (isCompact) {
      data.b = binary.readUint8()
      data.g = binary.readUint8()
      data.r = binary.readUint8()
      data.a = binary.readUint8()
    } else {
      data.r = getLowestByte(binary.readInt32())
      data.g = getLowestByte(binary.readInt32())
      data.b = getLowestByte(binary.readInt32())
      data.a = 1
    }

    return data
  }

  static accumulateFrom(color, isCompact) {
    const buffer = Buffer.alloc(isCompact ? 4 : 3 * 4, 0)
    const binary = new BinaryIO(buffer.buffer)

    if (isCompact) {
      binary.writeUint8(color.b)
      binary.writeUint8(color.g)
      binary.writeUint8(color.r)
      binary.writeUint8(color.a)
    } else {
      binary.writeInt32(color.r)
      binary.writeInt32(color.g)
      binary.writeInt32(color.b)
    }

    return buffer
  }
}

module.exports = Color
