import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxEPData } from './EPData'

export type ArxRoom = {
  portals: number[]
  polygons: ArxEPData[]
}

export declare class Room {
  public static readFrom(binary: BinaryIO): ArxRoom
  public static accumulateFrom(room: ArxRoom): Buffer
  public static sizeOf(): int
}
