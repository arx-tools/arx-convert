import { Buffer } from 'node:buffer'
import { ArxVector3, BinaryIO } from '../binary/BinaryIO'
import { ArxVertex } from './Vertex'

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

export declare class Polygon {
  public static readFrom(binary: BinaryIO): ArxPolygon
  public static accumulateFrom(polygon: ArxPolygon): Buffer
  public static sizeOf(): int
}
