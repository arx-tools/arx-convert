import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'

export type ArxUniqueHeader = {
  path: string
  check: number[] // 512 * 1 byte
}

export declare class UniqueHeader {
  public static readFrom(binary: BinaryIO): ArxUniqueHeader
  public static accumulateFrom(uniqueHeader: ArxUniqueHeader): Buffer
}
