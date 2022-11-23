import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { times } from '../common/helpers'
import { ArxLight, Light } from '../common/Light'
import { LightingHeader } from '../common/LightingHeader'
import { ArxLlfHeader, LlfHeader } from './LlfHeader'

export type ArxLLF = {
  meta: {
    type: 'llf'
    numberOfLeftoverBytes: number
  }
  header: Omit<ArxLlfHeader, 'numberOfLights'>
  lights: ArxLight[]
  colors: ArxColor[]
}

class LLF {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfLights, ...header } = LlfHeader.readFrom(file)

    const data: ArxLLF = {
      meta: {
        type: 'llf',
        numberOfLeftoverBytes: 0,
      },
      header: header,
      lights: times(() => Light.readFrom(file), numberOfLights),
      colors: [],
    }

    const { numberOfColors } = LightingHeader.readFrom(file)

    data.colors = times(() => Color.readFrom(file, header.version > 1.001 ? 'bgra' : 'rgb'), numberOfColors)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    return data
  }

  static save(json: ArxLLF) {
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
