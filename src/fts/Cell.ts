import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxPolygon, type PolygonReadOptions, Polygon } from './Polygon.ts'
import { SceneInfo } from './SceneInfo.ts'

export type ArxCell = {
  polygons: ArxPolygon[]
  anchors?: number[]
}

/**
 * How the polygons of a cell are read.
 */
export type CellReadOptions = PolygonReadOptions

export class Cell {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, options?: CellReadOptions): ArxCell {
    const { numberOfPolygons, numberOfAnchors } = SceneInfo.readFrom(binary)

    const polygons = times(() => {
      return Polygon.readFrom(binary, options)
    }, numberOfPolygons)

    let anchors: number[] | undefined
    if (numberOfAnchors > 0) {
      anchors = binary.readInt32Array(numberOfAnchors)
    }

    return {
      polygons,
      anchors,
    } satisfies ArxCell
  }

  static accumulateFrom(cell: ArxCell): ArrayBuffer {
    const anchors = cell.anchors ?? []
    const buffer = new ArrayBuffer(
      SceneInfo.sizeOf() + Polygon.sizeOf() * cell.polygons.length + BinaryIO.sizeOfInt32Array(anchors.length),
    )
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(SceneInfo.accumulateFrom(cell))
    binary.writeBuffer(concatArrayBuffers(cell.polygons.map(Polygon.accumulateFrom)))
    binary.writeInt32Array(anchors)

    return buffer
  }
}
