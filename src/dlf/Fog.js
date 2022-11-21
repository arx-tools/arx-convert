const { Buffer } = require('node:buffer')
const { repeat } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')

class Fog {
  static readFrom(binary) {
    const data = {
      pos: binary.readVector3(),
      rgb: binary.readColor3(),
      size: binary.readFloat32(),
      special: binary.readInt32(),
      scale: binary.readFloat32(),
      move: binary.readVector3(),
      angle: binary.readRotation(),
      speed: binary.readFloat32(),
      rotateSpeed: binary.readFloat32(),
      toLive: binary.readInt32(),
      blend: binary.readInt32(),
      frequency: binary.readFloat32(),
    }

    binary.readFloat32Array(32) // fpad
    binary.readInt32Array(32) // lpad
    binary.readString(256) // cpad

    return data
  }

  static accumulateFrom(fog) {
    const buffer = Buffer.alloc(Fog.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(fog.pos)
    binary.writeColor3(fog.rgb)
    binary.writeFloat32(fog.size)
    binary.writeInt32(fog.special)
    binary.writeFloat32(fog.scale)
    binary.writeVector3(fog.move)
    binary.writeRotation(fog.angle)
    binary.writeFloat32(fog.speed)
    binary.writeFloat32(fog.rotateSpeed)
    binary.writeInt32(fog.toLive)
    binary.writeInt32(fog.blend)
    binary.writeFloat32(fog.frequency)

    binary.writeFloat32Array(repeat(0, 32))
    binary.writeInt32Array(repeat(0, 32))
    binary.writeString('', 256)

    return buffer
  }

  static sizeOf() {
    return 3 * 4 + 3 * 4 + 4 + 4 + 4 + 3 * 4 + 3 * 4 + 4 + 4 + 4 + 4 + 4 + 32 * 4 + 32 * 4 + 256
  }
}

module.exports = { Fog }
