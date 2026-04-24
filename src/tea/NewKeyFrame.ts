import { BinaryIO } from '@common/BinaryIO.js'
import { OldKeyFrame } from '@tea/OldKeyFrame.js'
import type { ArxTEA } from '@tea/TEA.js'
import type { ArxKeyFrame } from '@tea/types.js'

export class NewKeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxKeyFrame {
    const dataBlock: Pick<ArxKeyFrame, 'frame' | 'flags'> = {
      frame: binary.readInt32(),
      flags: binary.readInt32(),
    }

    binary.readString(256) // info_frame - always an empty string

    return {
      ...dataBlock,
      isMasterKeyFrame: binary.readInt32() !== 0,
      isKeyFrame: binary.readInt32() !== 0,
      hasTranslate: binary.readInt32() !== 0,
      hasQuaternion: binary.readInt32() !== 0,
      hasMorphData: binary.readInt32() !== 0,
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
