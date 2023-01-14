import { BinaryIO } from '@common/BinaryIO'
import { Color } from '@common/Color'

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

  static accumulateFrom(colors: Color[]) {
    const buffer = Buffer.alloc(LightingHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(colors.length)

    binary.writeInt32(0) // view mode

    binary.writeInt32(63) // mode light

    binary.writeInt32(0) // lpad

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfInt32() * 4
  }
}
