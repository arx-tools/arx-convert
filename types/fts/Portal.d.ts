import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxPortalPolygon } from './PortalPolygon'

export type ArxPortal = {
  polygon: ArxPortalPolygon
  room1: number
  room2: number
  useportal: number
  paddy: number
}

export declare class Portal {
  public static readFrom(binary: BinaryIO): ArxPortal
  public static accumulateFrom(portal: ArxPortal): Buffer
}
