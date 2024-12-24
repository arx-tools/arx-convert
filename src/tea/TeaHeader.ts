import { KEEP_ZERO_BYTES } from '@common/constants.js'
import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxTEA } from '@tea/TEA.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L82
 */
export type ArxTeaHeader = {
  ident: string
  version: number
  name: string
  numberOfFrames: number
  numberOfGroups: number
  numberOfKeyFrames: number
}

export class TeaHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxTeaHeader {
    return {
      ident: binary.readString(20),
      version: binary.readUint32(),
      name: binary.readString(256, KEEP_ZERO_BYTES),
      numberOfFrames: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfKeyFrames: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA, uncompressedSize: number): ArrayBuffer {
    const buffer = new ArrayBuffer(TeaHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    // TODO

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfString(20) + BinaryIO.sizeOfUint32() + BinaryIO.sizeOfString(256) + BinaryIO.sizeOfInt32Array(3)
    )
  }
}
