import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxRoom } from './Room'

export type ArxRoomData = {
  numberOfPortals: number
  numberOfPolygons: number
}

export declare class RoomData {
  public static readFrom(binary: BinaryIO): ArxRoomData
  public static accumulateFrom(room: ArxRoom): Buffer
  public static sizeOf(): int
}
