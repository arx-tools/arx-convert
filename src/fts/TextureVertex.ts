import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { ArxVector3 } from '../types'

export type ArxTextureVertex = {
  pos: ArxVector3
  rhw: number
  color: ArxColor
  specular: ArxColor
  tu: number
  tv: number
}

export class TextureVertex {
  static readFrom(binary: BinaryIO): ArxTextureVertex {
    return {
      pos: binary.readVector3(),
      rhw: binary.readFloat32(), // portal bounds radius ?
      color: Color.readFrom(binary, 'abgr'),
      specular: Color.readFrom(binary, 'abgr'), // unused btw...
      tu: binary.readFloat32(),
      tv: binary.readFloat32(),
    }
  }

  static accumulateFrom(vertex: ArxTextureVertex) {
    const buffer = Buffer.alloc(TextureVertex.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(vertex.pos)
    binary.writeFloat32(vertex.rhw)
    binary.writeBuffer(Color.accumulateFrom(vertex.color, 'abgr'))
    binary.writeBuffer(Color.accumulateFrom(vertex.specular, 'abgr'))
    binary.writeFloat32(vertex.tu)
    binary.writeFloat32(vertex.tv)

    return buffer
  }

  static sizeOf() {
    return 3 * 4 + 4 + Color.sizeOf('abgr') * 2 + 4 + 4
  }
}
