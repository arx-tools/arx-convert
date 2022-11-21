const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { repeat } = require('../common/helpers.js')

class Scene {
  static readFrom(binary) {
    const data = {
      name: binary.readString(512),
    }

    binary.readInt32Array(16) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(Scene.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(json.scene.name, 512)
    binary.writeInt32Array(repeat(0, 16))
    binary.writeFloat32Array(repeat(0, 16))

    return buffer
  }

  static sizeOf() {
    return 512 + 4 * 16 + 4 * 16
  }
}

module.exports = Scene
