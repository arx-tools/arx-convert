import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { ArxVector3 } from '../common/types'

const HARDCODED_DATA_TYPE1 = {
  color: { r: 0, g: 0, b: 0, a: 0 } as ArxColor,
  specular: { r: 0, g: 0, b: 0, a: 0 } as ArxColor,
  tu: 0,
  tv: 0,
}

const HARDCODED_DATA_TYPE2 = {
  color: { r: 1, g: 22, b: 242, a: 0.2980392156862745 } as ArxColor,
  specular: { r: 0, g: 92, b: 200, a: 0.49411764705882355 } as ArxColor,
  tu: 1.5694542800437951e-43,
  tv: 2.772455559201393e-38,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L82
 */
export type ArxTextureVertex = {
  pos: ArxVector3
  /**
   * portal.bounds.radius - ?
   */
  rhw: number
}

export class TextureVertex {
  static readFrom(binary: BinaryIO): ArxTextureVertex {
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

  static accumulateFrom(vertex: ArxTextureVertex, idx: number) {
    const buffer = Buffer.alloc(TextureVertex.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(vertex.pos)
    binary.writeFloat32(idx === 0 ? vertex.rhw : 0)
    binary.writeBuffer(Color.accumulateFrom(idx < 3 ? HARDCODED_DATA_TYPE1.color : HARDCODED_DATA_TYPE2.color, 'abgr'))
    binary.writeBuffer(
      Color.accumulateFrom(idx < 3 ? HARDCODED_DATA_TYPE1.specular : HARDCODED_DATA_TYPE2.specular, 'abgr'),
    )
    binary.writeFloat32(idx < 3 ? HARDCODED_DATA_TYPE1.tu : HARDCODED_DATA_TYPE2.tu)
    binary.writeFloat32(idx < 3 ? HARDCODED_DATA_TYPE1.tv : HARDCODED_DATA_TYPE2.tv)

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32() + Color.sizeOf('abgr') * 2 + BinaryIO.sizeOfFloat32Array(2)
    )
  }
}
