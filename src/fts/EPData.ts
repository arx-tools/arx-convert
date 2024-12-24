import { BinaryIO } from '@common/BinaryIO.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L161
 */
export type ArxEPData = {
  cellX: number
  cellY: number
  /**
   * this number is a counter for polygons in the cell, it has no relation to the order of polygons globally
   */
  polygonIdx: number
}

export class EPData {
  static readFrom(binary: BinaryIO): ArxEPData {
    const [px, py, idx] = binary.readInt16Array(4)
    return { cellX: px, cellY: py, polygonIdx: idx }
  }

  static accumulateFrom({ cellX: px, cellY: py, polygonIdx: idx }: ArxEPData): ArrayBuffer {
    const buffer = new ArrayBuffer(EPData.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt16Array([px, py, idx, 0])

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt16Array(4)
  }
}
