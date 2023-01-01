import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxVector3 } from '../common/types'
import { ArxAnchor } from './Anchor'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L113
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/Include/EERIEPoly.h#L149
 */
export enum ArxAnchorFlags {
  None = 0,
  // GreenDraw = 1 << 0, // removed in Arx Libertatis, never used in files
  // ? = 1 << 1, // no info on this flag, was probably removed earlier by Arkane
  // ? = 1 << 2, // no info on this flag, was probably removed earlier by Arkane
  Blocked = 1 << 3,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L117
 */
export type ArxAnchorData = {
  pos: ArxVector3
  radius: number
  height: number
  numberOfLinkedAnchors: number
  flags: ArxAnchorFlags
}

export class AnchorData {
  static readFrom(binary: BinaryIO): ArxAnchorData {
    return {
      pos: binary.readVector3(),
      radius: binary.readFloat32(),
      height: binary.readFloat32(),
      numberOfLinkedAnchors: binary.readInt16(),
      flags: binary.readInt16(),
    }
  }

  static accumulateFrom(anchor: ArxAnchor) {
    const buffer = Buffer.alloc(AnchorData.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(anchor.data.pos)
    binary.writeFloat32(anchor.data.radius)
    binary.writeFloat32(anchor.data.height)
    binary.writeInt16(anchor.linkedAnchors.length)
    binary.writeInt16(anchor.data.flags)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
