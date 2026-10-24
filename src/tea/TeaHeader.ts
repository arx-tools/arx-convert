import { BinaryIO } from '../common/BinaryIO.ts'
import type { ArxTEA } from './TEA.ts'
import { TEA_VERSION_OLD } from './constants.ts'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L82
 */
export type ArxTeaHeader = {
  /**
   * Either 2014 or 2015.
   */
  version: number
  name: string
  /**
   * Total number of frames that make up the whole animation.
   */
  totalNumberOfFrames: number
  numberOfGroups: number
  numberOfKeyFrames: number
}

export class TeaHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxTeaHeader {
    binary.readString(20) // identifier - always "Theo Animation File"

    return {
      version: binary.readUint32(),
      name: binary.readString(256),
      totalNumberOfFrames: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfKeyFrames: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA): ArrayBuffer {
    const buffer = new ArrayBuffer(TeaHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString('Theo Animation File', 20)
    binary.writeUint32(TEA_VERSION_OLD)
    binary.writeString(json.header.name, 256)
    binary.writeInt32(json.header.totalNumberOfFrames)

    if (json.keyframes.length === 0) {
      binary.writeInt32(0)
      binary.writeInt32(0)
    } else {
      binary.writeInt32(json.keyframes[0].groups.length)
      binary.writeInt32(json.keyframes.length)
    }

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfString(20) + BinaryIO.sizeOfUint32() + BinaryIO.sizeOfString(256) + BinaryIO.sizeOfInt32Array(3)
    )
  }
}
