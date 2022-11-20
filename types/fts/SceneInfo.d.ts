import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxCell } from './Cell'

export type ArxSceneInfo = {
  numberOfPolygons: number
  numberOfAnchors: number
}

export declare class SceneInfo {
  public static readFrom(binary: BinaryIO): ArxSceneInfo
  public static accumulateFrom(cell: ArxCell): Buffer
  public static sizeOf(): int
}
