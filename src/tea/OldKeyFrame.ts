import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { ArxTEA } from '@tea/TEA.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L91
 */
export type ArxOldKeyFrame = {
  num_frame: number
  flag_frame: number
  master_key_frame: boolean
  key_frame: boolean
  key_move: boolean
  key_orient: boolean
  key_morph: boolean
  time_frame: number
}

export class OldKeyFrame {
  static readFrom(binary: BinaryIO): ArxOldKeyFrame {
    return {
      num_frame: binary.readInt32(),
      flag_frame: binary.readInt32(),
      master_key_frame: binary.readInt32() !== 0,
      key_frame: binary.readInt32() !== 0,
      key_move: binary.readInt32() !== 0,
      key_orient: binary.readInt32() !== 0,
      key_morph: binary.readInt32() !== 0,
      time_frame: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA) {
    const buffer = Buffer.alloc(OldKeyFrame.sizeOf())
    const binary = new BinaryIO(buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfInt32Array(8)
  }
}
