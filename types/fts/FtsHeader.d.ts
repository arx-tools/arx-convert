import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxFTS } from './FTS'

export type ArxFtsHeader = {
  path: string
  numberOfUniqueHeaders: number
  version: number
}

export declare class FtsHeader {
  public static readFrom(binary: BinaryIO): ArxFtsHeader
  public static accumulateFrom(json: ArxFTS, uncompressedSize: number): Buffer
  public static sizeOf(): int
}
