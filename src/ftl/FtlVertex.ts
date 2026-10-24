import { BinaryIO } from '../common/BinaryIO.ts'
import { repeat } from '../common/helpers.ts'
import type { ArxVector3 } from '../common/types.ts'

export type ArxFtlVertex = {
  vector: ArxVector3
  norm: ArxVector3
}

export class FtlVertex {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxFtlVertex {
    binary.readUint8Array(32) // unused

    return {
      vector: binary.readVector3(),
      norm: binary.readVector3(),
    }
  }

  static accumulateFrom({ vector, norm }: ArxFtlVertex): ArrayBuffer {
    const buffer = new ArrayBuffer(FtlVertex.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeUint8Array(repeat(0, 32))
    binary.writeVector3(vector)
    binary.writeVector3(norm)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfUint8Array(32) + 2 * BinaryIO.sizeOfVector3()
  }
}
