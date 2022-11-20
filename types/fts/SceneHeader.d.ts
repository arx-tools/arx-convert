import { Buffer } from 'node:buffer'
import { ArxVector3, BinaryIO } from '../binary/BinaryIO'
import { ArxFTS } from './FTS'

export type ArxSceneHeader = {
  version: number
  sizeX: number
  sizeZ: number
  numberOfTextures: number
  numberOfAnchors: number
  playerPosition: ArxVector3
  mScenePosition: ArxVector3
  numberOfPortals: number
  numberOfRooms: number
}

export declare class SceneHeader {
  public static readFrom(binary: BinaryIO): ArxSceneHeader
  public static accumulateFrom(fts: ArxFTS): Buffer
  public static sizeOf(): int
}
