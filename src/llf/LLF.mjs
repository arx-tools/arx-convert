import { times, map } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import Light from '../common/Light.mjs'
import LightingHeader from '../common/LightingHeader.mjs'

export default class LLF {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const {
      numberOfLights,
      ...header
    } = Header.readFrom(file)

    const data = {
      meta: {
        type: 'fts',
        numberOfLeftoverBytes: 0
      },
      header: header
    }

    data.lights = times(() => Light.readFrom(file), numberOfLights)

    const { numberOfLights: numberOfColors, ...lightingHeader } = LightingHeader.readFrom(file)

    data.lighting = {
      header: lightingHeader,
      colors: file.readUint32Array(numberOfColors) // TODO is apparently BGRA if it's in compact mode.
    }

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

    const colors = Buffer.alloc(json.lighting.colors.length * 4, 0)
    const binary = new BinaryIO(colors.buffer)
    binary.writeUint32Array(json.lighting.colors)

    const lighting = Buffer.concat([lightingHeader, colors])

    return Buffer.concat([header, lights, lighting])
  }
}