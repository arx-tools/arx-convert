import BinaryIO from '../Binary/BinaryIO.mjs'
import { repeat } from '../../node_modules/ramda/src/index.mjs'

export default class LightingHeader {
  static readFrom(binary) {
    const data = {
      numberOfLights: binary.readInt32(),
      viewMode: binary.readInt32(), // unused
      modeLight: binary.readInt32() // unused
    }

    binary.readInt32() // lpad

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(json.lighting.colors.length)
    binary.writeInt32(json.lighting.header.viewMode)
    binary.writeInt32(json.lighting.header.modeLight)

    binary.writeInt32(0)

    return buffer
  }

  static sizeOf() {
    return 4 * 4
  }
}