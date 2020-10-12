import { times, map } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../binary/BinaryIO.mjs'
import Header from './Header.mjs'
import Light from '../common/Light.mjs'
import LightingHeader from '../common/LightingHeader.mjs'
import Color from '../common/Color.mjs'

export default class LLF {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const {
      numberOfLights,
      ...header
    } = Header.readFrom(file)

    const data = {
      meta: {
        type: 'llf',
        numberOfLeftoverBytes: 0
      },
      header: header
    }

    data.lights = times(() => Light.readFrom(file), numberOfLights)

    const { numberOfColors } = LightingHeader.readFrom(file)

    data.colors = times(() => Color.readFrom(file, header.version > 1.001), numberOfColors)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    return data
  }

  static save(json) {
    const header = Header.accumulateFrom(json)

    const lights = Buffer.concat(map(Light.accumulateFrom.bind(Light), json.lights))

    const lightingHeader = LightingHeader.accumulateFrom(json)

    const colors = Buffer.concat(map(color => Color.accumulateFrom(color, json.header.version > 1.001), json.colors))

    const lighting = Buffer.concat([lightingHeader, colors])

    return Buffer.concat([header, lights, lighting])
  }
}
