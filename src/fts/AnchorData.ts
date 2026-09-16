import { BinaryIO } from '@common/BinaryIO.js'
import type { ArxVector3 } from '@common/types.js'
import type { ArxAnchor } from '@fts/Anchor.js'

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
  position: ArxVector3
  numberOfLinkedAnchors: number
}

export class AnchorData {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxAnchorData {
    const position = binary.readVector3()

    /**
     * radius and height are used by the game (NPC.cpp > AnchorData_GetNearest(), PathFinder.cpp) as a filter:
     * an anchor can only be used by an npc whose physics cylinder is at least as high as `height` and at most
     * as wide as `radius`. All anchors of the 23 levels of the original game use the same "no restriction"
     * values, so they are not part of the JSON and are always written back as these.
     */
    binary.readFloat32() // radius - always 50
    binary.readFloat32() // height - always -165

    const numberOfLinkedAnchors = binary.readInt16()

    binary.readInt16() // flags - always 0

    return { position, numberOfLinkedAnchors }
  }

  static accumulateFrom(anchor: ArxAnchor): ArrayBuffer {
    const buffer = new ArrayBuffer(AnchorData.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeVector3(anchor.data.position)
    binary.writeFloat32(50) // radius
    binary.writeFloat32(-165) // height

    binary.writeInt16(anchor.linkedAnchors.length)

    binary.writeInt16(ArxAnchorFlags.None) // flags - always 0

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
