import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxVertex, Vertex } from './Vertex'
import { ArxVector3 } from '../common/types'
import { times } from '../common/helpers'

export type ArxPolygon = {
  vertices: [ArxVertex, ArxVertex, ArxVertex, ArxVertex]
  tex: number
  norm: ArxVector3
  norm2: ArxVector3
  normals: [ArxVector3, ArxVector3, ArxVector3, ArxVector3]
  transval: number
  area: number
  type: number
  room: number
  paddy: number
}

export class Polygon {
  static readFrom(binary: BinaryIO): ArxPolygon {
    return {
      vertices: times(() => Vertex.readFrom(binary), 4),
      tex: binary.readInt32(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      normals: times(() => binary.readVector3(), 4),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      type: binary.readInt32(),
      room: binary.readInt16(),
      paddy: binary.readInt16(),
    }
  }

  static accumulateFrom(polygon: ArxPolygon) {
    const buffer = Buffer.alloc(Polygon.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeBuffer(Buffer.concat(polygon.vertices.map(Vertex.accumulateFrom)))
    binary.writeInt32(polygon.tex)
    binary.writeVector3(polygon.norm)
    binary.writeVector3(polygon.norm2)
    binary.writeVector3Array(polygon.normals)
    binary.writeFloat32(polygon.transval)
    binary.writeFloat32(polygon.area)
    binary.writeInt32(polygon.type)
    binary.writeInt16(polygon.room)
    binary.writeInt16(polygon.paddy)

    return buffer
  }

  static sizeOf() {
    return Vertex.sizeOf() * 4 + 4 + 3 * 4 * 2 + 4 * 3 * 4 + 4 + 4 + 4 + 2 + 2
  }
}
