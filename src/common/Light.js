const { Buffer } = require('node:buffer')
const { repeat } = require('./helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { Color } = require('./Color.js')

class Light {
  static readFrom(binary) {
    const data = {
      pos: binary.readVector3(),
      rgb: Color.readFrom(binary, 'rgb'),
      fallstart: binary.readFloat32(),
      fallend: binary.readFloat32(),
      intensity: binary.readFloat32(),
      i: binary.readFloat32(),
      exFlicker: Color.readFrom(binary, 'rgb'),
      exRadius: binary.readFloat32(),
      exFrequency: binary.readFloat32(),
      exSize: binary.readFloat32(),
      exSpeed: binary.readFloat32(),
      exFlareSize: binary.readFloat32(),
    }

    binary.readFloat32Array(24) // fpad

    data.extras = binary.readInt32()

    binary.readInt32Array(31) // lpad

    return data
  }

  static accumulateFrom(light) {
    const buffer = Buffer.alloc(Light.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(light.pos)
    binary.writeBuffer(Color.accumulateFrom(light.rgb, 'rgb'))
    binary.writeFloat32(light.fallstart)
    binary.writeFloat32(light.fallend)
    binary.writeFloat32(light.intensity)
    binary.writeFloat32(light.i)
    binary.writeBuffer(Color.accumulateFrom(light.exFlicker, 'rgb'))
    binary.writeFloat32(light.exRadius)
    binary.writeFloat32(light.exFrequency)
    binary.writeFloat32(light.exSize)
    binary.writeFloat32(light.exSpeed)
    binary.writeFloat32(light.exFlareSize)

    binary.writeFloat32Array(repeat(0, 24))

    binary.writeInt32(light.extras)

    binary.writeInt32Array(repeat(0, 31))

    return buffer
  }

  static sizeOf() {
    return 296
  }
}

module.exports = { Light }
