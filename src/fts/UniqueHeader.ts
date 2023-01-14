import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L68
 */
export type ArxUniqueHeader = {
  path: string
  /**
   * 512 bytes
   */
  check: number[]
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
    return BinaryIO.sizeOfString(256) + BinaryIO.sizeOfUint8Array(512)
  }
}
