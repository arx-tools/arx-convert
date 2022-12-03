import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'

/** @see https://github.com/arx/ArxLibertatis/blob/master/src/graphics/data/FastSceneFormat.h#L73 */
export type ArxVertex = {
  x: number
  y: number
  z: number
  u: number
  v: number
  llfColorIdx?: number
}

export class Vertex {
  static readFrom(binary: BinaryIO): ArxVertex {
    // y before x is not a typo!
    const [y, x, z, u, v] = binary.readFloat32Array(5)
    return { x, y, z, u, v }
  }

  static accumulateFrom({ x, y, z, u, v }: ArxVertex) {
    const buffer = Buffer.alloc(Vertex.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32Array([y, x, z, u, v])

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfFloat32Array(5)
  }
}
