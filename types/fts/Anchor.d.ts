import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxAnchorData } from './AnchorData'

export type ArxAnchor = {
  data: ArxAnchorData
  linkedAnchors: number[]
}

export declare class Anchor {
  public static readFrom(binary: BinaryIO): ArxAncho
  public static accumulateFrom(anchor: ArxAnchor): Buffer
  public static sizeOf(): int
}
