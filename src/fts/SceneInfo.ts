import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxCell } from '@fts/Cell.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L125
 */
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

  static accumulateFrom(cell: ArxCell): Buffer {
    const buffer = Buffer.alloc(SceneInfo.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(cell.polygons.length)
    binary.writeInt32(cell.anchors?.length ?? 0)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32Array(2)
  }
}
