import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L148 */
export type ArxSelection = {
  name: string
  selected: number[]
}

export class Selection {
  static readFrom(binary: BinaryIO): ArxSelection & { numberOfSelected: number } {
    const data = {
      name: binary.readString(64),
      numberOfSelected: binary.readInt32(),
      selected: [], // will get filled separately
    }

    binary.readInt32() // selected - ignored by Arx

    return data
  }

  static accumulateFrom(selection: ArxSelection) {
    const buffer = Buffer.alloc(Selection.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(selection.name, 64)
    binary.writeInt32(selection.selected.length)
    binary.writeInt32(0) // selected

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfString(64) + 2 * BinaryIO.sizeOfInt32()
  }
}
