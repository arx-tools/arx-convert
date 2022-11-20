import { Buffer } from 'node:buffer'
import { ArxVector3, BinaryIO } from '../binary/BinaryIO'
import { ArxTextureVertex } from './TextureVertex'

export type ArxPortalPolygon = {
  type: number
  min: ArxVector3
  max: ArxVector3
  norm: ArxVector3
  norm2: ArxVector3
  v: [ArxTextureVertex, ArxTextureVertex, ArxTextureVertex, ArxTextureVertex]
  unused: number[] // array size is 32 * 4 and it holds some data, but no idea what is it for
  nrml: [ArxVector3, ArxVector3, ArxVector3, ArxVector3]
  tex: number
  center: ArxVector3
  transval: number
  area: number
  room: number
  misc: number
}

export declare class PortalPolygon {
  public static readFrom(binary: BinaryIO): ArxPortalPolygon
  public static accumulateFrom(portalPolygon: ArxPortalPolygon): Buffer
}
