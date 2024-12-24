import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { type ArxVector3 } from '@common/types.js'

type HardcodedDataType = {
  color: ArxColor
  specular: ArxColor
  tu: number
  tv: number
}

const HARDCODED_DATA_TYPE1: HardcodedDataType = {
  color: Color.transparent,
  specular: Color.transparent,
  tu: 0,
  tv: 0,
}

const HARDCODED_DATA_TYPE2: HardcodedDataType = {
  color: {
    r: 1,
    g: 22,
    b: 242,
    a: 0.298_039_215_686_274_5,
  },
  specular: {
    r: 0,
    g: 92,
    b: 200,
    a: 0.494_117_647_058_823_55,
  },
  tu: 1.569_454_280_043_795_1e-43,
  tv: 2.772_455_559_201_393e-38,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L82
 * @see https://learn.microsoft.com/en-us/previous-versions/ms896915(v=msdn.10)
 */
export type ArxTextureVertex = {
  /**
   * sx, sy and sz of D3DTLVERTEX (screen coordinates)
   */
  pos: ArxVector3
  /**
   * portal bounds radius - used by ARX_PORTALS_Frustrum_ComputeRoom
   *
   * [r]eciprocal of [h]omogeneous [w] from homogeneous coordinates (x, y, z, w)
   * @see https://learn.microsoft.com/en-us/previous-versions/ms896915(v=msdn.10)#members
   */
  rhw: number
}

export class TextureVertex {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxTextureVertex {
    const data = {
      pos: binary.readVector3(),
      rhw: binary.readFloat32(),
    }

    Color.readFrom(binary, 'abgr') // color
    Color.readFrom(binary, 'abgr') // specular
    binary.readFloat32() // tu
    binary.readFloat32() // tv

    return data
  }

  static accumulateFrom(vertex: ArxTextureVertex, idx: number): ArrayBuffer {
    const buffer = new ArrayBuffer(TextureVertex.sizeOf())
    const binary = new BinaryIO(buffer)

    const isFirstVertexOfPolygon = idx === 0
    const isLastVertexOfPolygon = idx === 3

    let data: HardcodedDataType
    if (isLastVertexOfPolygon) {
      data = HARDCODED_DATA_TYPE2
    } else {
      data = HARDCODED_DATA_TYPE1
    }

    const { color, specular, tu, tv } = data

    binary.writeVector3(vertex.pos)

    if (isFirstVertexOfPolygon) {
      binary.writeFloat32(vertex.rhw)
    } else {
      binary.writeFloat32(0)
    }

    binary.writeBuffer(Color.accumulateFrom(color, 'abgr'))
    binary.writeBuffer(Color.accumulateFrom(specular, 'abgr'))
    binary.writeFloat32(tu)
    binary.writeFloat32(tv)

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32() + Color.sizeOf('abgr') * 2 + BinaryIO.sizeOfFloat32Array(2)
    )
  }
}
