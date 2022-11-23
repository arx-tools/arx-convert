import { BinaryIO } from '../binary/BinaryIO'
import { ArxFTL } from './FTL'

export type ArxFtlHeader = {
  ident: string
  version: number
}

export class FtlHeader {
  static readFrom(binary: BinaryIO) {
    const data = {
      ident: binary.readString(4),
      version: binary.readFloat32(),
    }

    return data
  }

  static accumulateFrom(json: ArxFTL, uncompressedSize: number) {
    const buffer = Buffer.alloc(FtlHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return 0
  }
}
