import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { type Color } from '@common/Color.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L94
 */
export type ArxLightingHeader = {
  numberOfColors: number
}

export class LightingHeader {
  static readFrom(binary: BinaryIO): ArxLightingHeader {
    const numberOfColors = binary.readInt32()

    binary.readInt32() // view mode - unused

    binary.readInt32() // mode light - unused

    binary.readInt32() // lpad - ?

    return {
      numberOfColors,
    }
  }

  static accumulateFrom(colors: Color[]): Buffer {
    const buffer = Buffer.alloc(LightingHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(colors.length)

    binary.writeInt32(0) // view mode

    binary.writeInt32(63) // mode light

    binary.writeInt32(0) // lpad

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32() * 4
  }
}
