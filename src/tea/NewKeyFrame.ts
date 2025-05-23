import { BinaryIO } from '@common/BinaryIO.js'
import { KEEP_ZERO_BYTES } from '@common/constants.js'
import { type ArxOldKeyFrame, OldKeyFrame } from '@tea/OldKeyFrame.js'
import type { ArxTEA } from '@tea/TEA.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L102
 */
export type ArxNewKeyFrame = ArxOldKeyFrame & {
  info_frame: string
}

export class NewKeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxNewKeyFrame {
    return {
      num_frame: binary.readInt32(),
      flag_frame: binary.readInt32(),
      info_frame: binary.readString(256, KEEP_ZERO_BYTES),
      master_key_frame: binary.readInt32() !== 0,
      key_frame: binary.readInt32() !== 0,
      key_move: binary.readInt32() !== 0, // is there a global translation?
      key_orient: binary.readInt32() !== 0, // is there a global rotation?
      key_morph: binary.readInt32() !== 0, // is there a global morph? (ignored)
      time_frame: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA): ArrayBuffer {
    const buffer = new ArrayBuffer(NewKeyFrame.sizeOf())
    const binary = new BinaryIO(buffer)

    // TODO

    return buffer
  }

  static sizeOf(): number {
    return OldKeyFrame.sizeOf() + BinaryIO.sizeOfString(256)
  }
}
