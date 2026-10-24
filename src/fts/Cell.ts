import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxPolygon, Polygon } from './Polygon.ts'
import { SceneInfo } from './SceneInfo.ts'

export type ArxCell = {
  polygons: ArxPolygon[]
  anchors?: number[]
}

export class Cell {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxCell {
    const { numberOfPolygons, numberOfAnchors } = SceneInfo.readFrom(binary)

    const polygons = times(() => {
      return Polygon.readFrom(binary)
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
