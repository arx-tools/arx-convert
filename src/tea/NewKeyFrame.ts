import { BinaryIO } from '@common/BinaryIO.js'
import { OldKeyFrame } from '@tea/OldKeyFrame.js'
import type { ArxTEA } from '@tea/TEA.js'
import type { ArxKeyFrame } from '@tea/types.js'

export class NewKeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxKeyFrame {
    const dataBlock = {
      num_frame: binary.readInt32(),
      flag_frame: binary.readInt32(),
    }

    binary.readString(256) // info_frame - contains empty string or garbage data, like "ÿÿÿÿÿÿÿÿx10" or "¸}?kÞÖ½"

    return {
      ...dataBlock,
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

    // TODO: write info_frame as an empty string

    // TODO

    return buffer
  }

  static sizeOf(): number {
    return OldKeyFrame.sizeOf() + BinaryIO.sizeOfString(256)
  }
}
