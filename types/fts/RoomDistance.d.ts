import { Buffer } from 'node:buffer'
import { ArxVector3, BinaryIO } from '../binary/BinaryIO'

export type ArxRoomDistance = {
  distance: number
  startPosition: ArxVector3
  endPosition: ArxVector3
}

export declare class RoomDistance {
  public static readFrom(binary: BinaryIO): ArxRoomDistance
  public static accumulateFrom(roomDistance: ArxRoomDistance): Buffer
  public static sizeOf(): int
}
