import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxPolygon, Polygon } from './Polygon'
import { SceneInfo } from './SceneInfo'

export type ArxCell = {
  polygons: ArxPolygon[]
  anchors?: number[]
}

export class Cell {
  static readFrom(binary: BinaryIO) {
    const { numberOfPolygons, numberOfAnchors } = SceneInfo.readFrom(binary)

    const data: ArxCell = {
      polygons: times(() => Polygon.readFrom(binary), numberOfPolygons),
    }

    if (numberOfAnchors > 0) {
      data.anchors = binary.readInt32Array(numberOfAnchors)
    }

    return data
  }

  static accumulateFrom(cell: ArxCell) {
    const anchors = cell.anchors ?? []
    const buffer = Buffer.alloc(
      SceneInfo.sizeOf() + Polygon.sizeOf() * cell.polygons.length + BinaryIO.sizeOfInt32Array(anchors.length),
    )
    const binary = new BinaryIO(buffer.buffer)

    binary.writeBuffer(SceneInfo.accumulateFrom(cell))
    binary.writeBuffer(Buffer.concat(cell.polygons.map(Polygon.accumulateFrom)))
    binary.writeInt32Array(anchors)

    return buffer
  }
}
