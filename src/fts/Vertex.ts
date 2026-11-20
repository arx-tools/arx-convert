import { BinaryIO } from '../common/BinaryIO.ts'
import type { Float32 } from '../common/types.ts'

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

/**
 * The size of a cell on the floor, and the unit of the hundredths the legacy vertices store their floor position in.
 */
const CELL_SIZE = 100

/**
 * How many parts a unit of the texture coordinate of a legacy vertex is cut into.
 */
const UV_SCALE = 1024

export class Vertex {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxVertex {
    // y before x is not a typo!
    const [y, x, z, u, v] = binary.readFloat32Array(5)
    return { x, y, z, u, v }
  }

  /**
   * Reads a vertex of the format before 0.141, which is 12 bytes wide.
   *
   * @remarks
   * The old vertex is the height as a float, then four shorts: the floor position in hundredths **from the origin of
   * the cell the polygon is in**, and the texture coordinate in 1024ths. The newer format stores world coordinates as
   * floats, so the position is rebuilt here.
   *
   * @param binary The file to read.
   * @param cellX The column of the cell the polygon is in.
   * @param cellZ The row of the cell the polygon is in.
   *
   * @returns The vertex, in the shape the newer format uses.
   */
  static readFromLegacy(binary: BinaryIO<ArrayBufferLike>, cellX: number, cellZ: number): ArxVertex {
    const y = binary.readFloat32()
    const xOffset = binary.readInt16()
    const zOffset = binary.readInt16()
    const u = binary.readInt16()
    const v = binary.readInt16()

    return {
      x: cellX * CELL_SIZE + xOffset / CELL_SIZE,
      y,
      z: cellZ * CELL_SIZE + zOffset / CELL_SIZE,
      u: u / UV_SCALE,
      v: v / UV_SCALE,
    }
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
