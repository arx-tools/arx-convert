import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxCell } from './Cell'

export type ArxSceneInfo = {
  numberOfPolygons: number
  numberOfAnchors: number
}

export class SceneInfo {
  static readFrom(binary: BinaryIO) {
    return {
      numberOfPolygons: binary.readInt32(),
      numberOfAnchors: binary.readInt32(),
    } as ArxSceneInfo
  }

  static accumulateFrom(cell: ArxCell) {
    const buffer = Buffer.alloc(SceneInfo.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeInt32(cell.polygons.length)
    binary.writeInt32(cell.anchors.length)

    return buffer
  }

  static sizeOf() {
    return 2 * 4
  }
}
