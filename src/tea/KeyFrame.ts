import { BinaryIO } from '@common/BinaryIO.js'
import type { ArxTEA } from '@tea/TEA.js'
import { ArxAnimationVersions, type ArxKeyFrame } from '@tea/types.js'

export class KeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, version: ArxAnimationVersions): ArxKeyFrame {
    const dataBlock: Pick<ArxKeyFrame, 'frame' | 'flags'> = {
      frame: binary.readInt32(),
      flags: binary.readInt32(),
    }

    if (version === ArxAnimationVersions.New) {
      binary.readString(256) // info_frame - always an empty string
    }

    return {
      ...dataBlock,
      isMasterKeyFrame: binary.readInt32() !== 0,
      isKeyFrame: binary.readInt32() !== 0,
      hasTranslateData: binary.readInt32() !== 0,
      hasQuaternionData: binary.readInt32() !== 0,
      hasMorphData: binary.readInt32() !== 0,
      time_frame: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA): ArrayBuffer {
    const buffer = new ArrayBuffer(KeyFrame.sizeOf(ArxAnimationVersions.Old))
    const binary = new BinaryIO(buffer)

    // TODO

    return buffer
  }

  static sizeOf(version: ArxAnimationVersions): number {
    let numberOfBytes = BinaryIO.sizeOfInt32() * 8

    if (version === ArxAnimationVersions.New) {
      numberOfBytes = numberOfBytes + BinaryIO.sizeOfString(256)
    }

    return numberOfBytes
  }
}
