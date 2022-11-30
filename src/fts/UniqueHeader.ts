import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'

export type ArxUniqueHeader = {
  path: string
  check: number[] // 512 bytes
}

export class UniqueHeader {
  static readFrom(binary: BinaryIO): ArxUniqueHeader {
    return {
      path: binary.readString(256),
      check: binary.readUint8Array(512),
    }
  }

  static accumulateFrom(uniqueHeader: ArxUniqueHeader) {
    const buffer = Buffer.alloc(UniqueHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(uniqueHeader.path, 256)
    binary.writeUint8Array(uniqueHeader.check)

    return buffer
  }

  static sizeOf() {
    return 768
  }
}
