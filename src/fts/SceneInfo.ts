import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxCell } from './Cell'

export type ArxSceneInfo = {
  numberOfPolygons: number
  numberOfAnchors: number
}

export class SceneInfo {
  static readFrom(binary: BinaryIO): ArxSceneInfo {
    return {
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32(),
    }
  }

  static accumulateFrom(cell: ArxCell) {
    const buffer = Buffer.alloc(SceneInfo.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(cell.polygons.length)
    binary.writeInt32(cell.anchors.length)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfInt32Array(2)
  }
}
