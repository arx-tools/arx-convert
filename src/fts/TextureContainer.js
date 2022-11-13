const BinaryIO = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')

class TextureContainer {
  static readFrom(binary) {
    return {
      tc: binary.readInt32(),
      temp: binary.readInt32(),
      fic: binary.readString(256),
    }
  }

  static accumulateFrom(textureContainer) {
    const buffer = Buffer.alloc(TextureContainer.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(textureContainer.tc)
    binary.writeInt32(textureContainer.temp)
    binary.writeString(textureContainer.fic, 256)

    return buffer
  }

  static sizeOf() {
    return 256 + 2 * 4
  }
}

module.exports = TextureContainer
