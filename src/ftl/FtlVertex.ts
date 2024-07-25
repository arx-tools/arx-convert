import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxVector3 } from '@common/types.js'
import { repeat } from '@common/helpers.js'

export type ArxFtlVertex = {
  vector: ArxVector3
  norm: ArxVector3
}

export class FtlVertex {
  static readFrom(binary: BinaryIO): ArxFtlVertex {
    binary.readUint8Array(32) // unused

    return {
      vector: binary.readVector3(),
      norm: binary.readVector3(),
    }
  }

  static accumulateFrom({ vector, norm }: ArxFtlVertex) {
    const buffer = Buffer.alloc(FtlVertex.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeUint8Array(repeat(0, 32))
    binary.writeVector3(vector)
    binary.writeVector3(norm)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfUint8Array(32) + 2 * BinaryIO.sizeOfVector3()
  }
}
