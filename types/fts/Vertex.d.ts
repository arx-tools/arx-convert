import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'

export type ArxVertex = {
  x: number
  y: number
  z: number
  u: number
  v: number
}

export declare class Vertex {
  public static readFrom(binary: BinaryIO): ArxVertex
  public static accumulateFrom(vertex: ArxVertex): Buffer
  public static sizeOf(): int
}
