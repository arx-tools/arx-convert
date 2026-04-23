import { BinaryIO } from '@common/BinaryIO.js'
import type { ArxTEA } from '@tea/TEA.js'
import type { ArxKeyFrame } from '@tea/types.js'

export class OldKeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxKeyFrame {
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

  static accumulateFrom(json: ArxTEA): ArrayBuffer {
    const buffer = new ArrayBuffer(OldKeyFrame.sizeOf())
    const binary = new BinaryIO(buffer)

    // TODO

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32Array(8)
  }
}
