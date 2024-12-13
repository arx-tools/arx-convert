import { BinaryIO } from '@common/BinaryIO.js'
import { concatUint8Arrays, times } from '@common/helpers.js'
import { type ArxPolygon, Polygon } from '@fts/Polygon.js'
import { SceneInfo } from '@fts/SceneInfo.js'

export type ArxCell = {
  polygons: ArxPolygon[]
  anchors?: number[]
}

export class Cell {
  static readFrom(binary: BinaryIO): ArxCell {
    const { numberOfPolygons, numberOfAnchors } = SceneInfo.readFrom(binary)

    const data: ArxCell = {
      polygons: times(() => {
        return Polygon.readFrom(binary)
      }, numberOfPolygons),
    }

    if (numberOfAnchors > 0) {
      data.anchors = binary.readInt32Array(numberOfAnchors)
    }

    return data
  }

  static accumulateFrom(cell: ArxCell): Uint8Array {
    const anchors = cell.anchors ?? []
    const buffer = new Uint8Array(
      SceneInfo.sizeOf() + Polygon.sizeOf() * cell.polygons.length + BinaryIO.sizeOfInt32Array(anchors.length),
    )
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(SceneInfo.accumulateFrom(cell))
    binary.writeBuffer(concatUint8Arrays(cell.polygons.map(Polygon.accumulateFrom)))
    binary.writeInt32Array(anchors)

    return buffer
  }
}
