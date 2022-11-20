import { Buffer } from 'node:buffer'
import { BinaryIO, ArxVector3 } from '../binary/BinaryIO'

export type ArxAnchorData = {
  pos: ArxVector3
  radius: number
  height: number
  numberOfLinkedAnchors: number
  flags: number
}

export declare class AnchorData {
  public static readFrom(binary: BinaryIO): ArxAnchorData
  public static accumulateFrom(anchorData: ArxAnchorData): Buffer
  public static sizeOf(): int
}
