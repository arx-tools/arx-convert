import { BinaryIO } from '../binary/BinaryIO'
import { Color } from './Color'

export type ArxLightingHeader = {
  numberOfColors: number
}

export class LightingHeader {
  static readFrom(binary: BinaryIO) {
    const data: ArxLightingHeader = {
      numberOfColors: binary.readInt32(),
    }

    binary.readInt32() // viewMode (unused)
    binary.readInt32() // modeLight (unused)
    binary.readInt32() // lpad

    return data
  }

  static accumulateFrom(colors: Color[]) {
    const buffer = Buffer.alloc(LightingHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32Array([colors.length, 0, 63, 0])

    return buffer
  }

  static sizeOf() {
    return 4 * 4
  }
}
