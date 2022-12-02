import { KEEP_ZERO_BYTES } from '../common/constants'
import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxTEA } from './TEA'
import { ArxOldKeyFrame, OldKeyFrame } from './OldKeyFrame'

export type ArxNewKeyFrame = ArxOldKeyFrame & {
  info_frame: string
}

export class NewKeyFrame {
  static readFrom(binary: BinaryIO): ArxNewKeyFrame {
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

  static accumulateFrom(json: ArxTEA) {
    const buffer = Buffer.alloc(NewKeyFrame.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return OldKeyFrame.sizeOf() + BinaryIO.sizeOfString(256)
  }
}
