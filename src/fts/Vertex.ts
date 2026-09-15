import { BinaryIO } from '@common/BinaryIO.js'
import type { Float32 } from '@common/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L73
 */
export type ArxVertex = {
  x: Float32
  y: Float32
  z: Float32
  u: Float32
  v: Float32
  llfColorIdx?: number
}

export class Vertex {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxVertex {
    // y before x is not a typo!
    const [y, x, z, u, v] = binary.readFloat32Array(5)
    return { x, y, z, u, v }
  }

  static accumulateFrom({ x, y, z, u, v }: ArxVertex): ArrayBuffer {
    const buffer = new ArrayBuffer(Vertex.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32Array([y, x, z, u, v])

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfFloat32Array(5)
  }
}
