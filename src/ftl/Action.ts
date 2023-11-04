import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L132 */
export type ArxAction = {
  name: string
  vertexIdx: number
  action: number
  sfx: number
}

export class Action {
  static readFrom(binary: BinaryIO): ArxAction {
    return {
      name: binary.readString(256),
      vertexIdx: binary.readInt32(),
      action: binary.readInt32(),
      sfx: binary.readInt32(),
    }
  }

  static accumulateFrom(action: ArxAction) {
    const buffer = Buffer.alloc(Action.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(action.name, 256)
    binary.writeInt32(action.vertexIdx)
    binary.writeInt32(action.action)
    binary.writeInt32(action.sfx)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfString(256) + 3 * BinaryIO.sizeOfInt32()
  }
}
