import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'

export type ArxEPData = {
  px: number
  py: number
  idx: number
}

export declare class EPData {
  public static readFrom(binary: BinaryIO): ArxEPData
  public static accumulateFrom(polygon: ArxEPData): Buffer
  public static sizeOf(): int
}
