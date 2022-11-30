import { BinaryIO } from '../common/BinaryIO'
import { ArxFTL } from './FTL'

export type ArxFtlHeader = {
  ident: string
  version: number
}

export class FtlHeader {
  static readFrom(binary: BinaryIO): ArxFtlHeader {
    return {
      ident: binary.readString(4),
      version: binary.readFloat32(),
      // TODO: more things to read
    }
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
