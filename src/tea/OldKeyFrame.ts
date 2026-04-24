import { BinaryIO } from '@common/BinaryIO.js'
import type { ArxTEA } from '@tea/TEA.js'
import type { ArxKeyFrame } from '@tea/types.js'

export class OldKeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxKeyFrame {
    return {
      frame: binary.readInt32(),
      flags: binary.readInt32(),
      isMasterKeyFrame: binary.readInt32() !== 0,
      isKeyFrame: binary.readInt32() !== 0,
      hasTranslate: binary.readInt32() !== 0,
      hasQuaternion: binary.readInt32() !== 0,
      hasMorphData: binary.readInt32() !== 0,
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
