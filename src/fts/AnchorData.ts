import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxVector3 } from '@common/types.js'
import { type ArxAnchor } from '@fts/Anchor.js'

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
  isBlocked: boolean
}

export class AnchorData {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxAnchorData {
    const data: ArxAnchorData = {
      pos: binary.readVector3(),
      radius: binary.readFloat32(),
      height: binary.readFloat32(),
      numberOfLinkedAnchors: binary.readInt16(),
      isBlocked: false,
    }

    const flags = binary.readInt16()

    if ((flags & ArxAnchorFlags.Blocked) !== 0) {
      data.isBlocked = true
    }

    return data
  }

  static accumulateFrom(anchor: ArxAnchor): ArrayBuffer {
    const buffer = new ArrayBuffer(AnchorData.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeVector3(anchor.data.pos)
    binary.writeFloat32(anchor.data.radius)
    binary.writeFloat32(anchor.data.height)
    binary.writeInt16(anchor.linkedAnchors.length)

    let flags = 0
    if (anchor.data.isBlocked) {
      flags = flags | ArxAnchorFlags.Blocked
    }

    binary.writeInt16(flags)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
