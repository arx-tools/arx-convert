import { KEEP_ZERO_BYTES } from '../common/constants'
import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxTEA } from './TEA'

export type ArxTeaHeader = {
  ident: string
  version: number
  name: string
  numberOfFrames: number
  numberOfGroups: number
  numberOfKeyFrames: number
}

export class TeaHeader {
  static readFrom(binary: BinaryIO): ArxTeaHeader {
    return {
      ident: binary.readString(20),
      version: binary.readUint32(),
      name: binary.readString(256, KEEP_ZERO_BYTES),
      numberOfFrames: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfKeyFrames: binary.readInt32(),
    }
  }

  static accumulateFrom(json: ArxTEA, uncompressedSize: number) {
    const buffer = Buffer.alloc(TeaHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(20) + BinaryIO.sizeOfUint32() + BinaryIO.sizeOfString(256) + BinaryIO.sizeOfInt32Array(3)
    )
  }
}
