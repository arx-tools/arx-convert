import { BinaryIO } from '@common/BinaryIO.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L161
 */
export type ArxEPData = {
  cellX: number
  cellY: number
  /**
   * This number is a counter for polygons in the cell, it has no relation to the order of polygons globally
   */
  polygonIdx: number
}

export class EPData {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxEPData {
    const [cellX, cellY, polygonIdx] = binary.readInt16Array(4)
    return { cellX, cellY, polygonIdx }
  }

  static accumulateFrom({ cellX, cellY, polygonIdx }: ArxEPData): ArrayBuffer {
    const buffer = new ArrayBuffer(EPData.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt16Array([cellX, cellY, polygonIdx, 0])

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt16Array(4)
  }
}
