import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxAnchor } from './Anchor'
import { ArxPolygon } from './Polygon'

export type ArxCell = {
  polygons: ArxPolygon[]
  anchors: ArxAnchor[]
}

export declare class Cell {
  public static readFrom(binary: BinaryIO): ArxCell
  public static accumulateFrom(cell: ArxCell): Buffer
}
