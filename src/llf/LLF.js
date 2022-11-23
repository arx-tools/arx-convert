const { Buffer } = require('node:buffer')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { LlfHeader } = require('./LlfHeader.js')
const { Light } = require('../common/Light.js')
const { LightingHeader } = require('../common/LightingHeader.js')
const { Color } = require('../common/Color.js')
const { times } = require('../common/helpers.js')

class LLF {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfLights, ...header } = LlfHeader.readFrom(file)

    const data = {
      meta: {
        type: 'llf',
        numberOfLeftoverBytes: 0,
      },
      header: header,
    }

    data.lights = times(() => Light.readFrom(file), numberOfLights)

    const { numberOfColors } = LightingHeader.readFrom(file)

    data.colors = times(() => Color.readFrom(file, header.version > 1.001 ? 'bgra' : 'rgb'), numberOfColors)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    return data
  }

  static save(json) {
    const header = LlfHeader.accumulateFrom(json)

    const lights = Buffer.concat(json.lights.map(Light.accumulateFrom))

    const lightingHeader = LightingHeader.accumulateFrom(json.colors)

    const colors = Buffer.concat(
      json.colors.map((color) => {
        return Color.accumulateFrom(color, json.header.version > 1.001 ? 'bgra' : 'rgb')
      }),
    )

    return Buffer.concat([header, lights, lightingHeader, colors])
  }
}

module.exports = { LLF }
