import { KEEP_ZERO_BYTES } from '../common/constants'
import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
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
  static readFrom(binary: BinaryIO) {
    return {
      ident: binary.readString(20),
      version: binary.readUint32(),
      name: binary.readString(256, KEEP_ZERO_BYTES),
      numberOfFrames: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfKeyFrames: binary.readInt32(),
    } as ArxTeaHeader
  }

  static accumulateFrom(json: ArxTEA, uncompressedSize: number) {
    const buffer = Buffer.alloc(TeaHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return 20 + 4 + 256 + 4 + 4 + 4
  }
}