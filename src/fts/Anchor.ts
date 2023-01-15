import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { ArxAnchorData, AnchorData } from '@fts/AnchorData'

export type ArxAnchor = {
  data: Omit<ArxAnchorData, 'numberOfLinkedAnchors'>
  linkedAnchors: number[]
}

export class Anchor {
  static readFrom(binary: BinaryIO): ArxAnchor {
    const { numberOfLinkedAnchors, ...anchorData } = AnchorData.readFrom(binary)

    return {
      data: anchorData,
      linkedAnchors: binary.readInt32Array(numberOfLinkedAnchors),
    }
  }

  static accumulateFrom(anchor: ArxAnchor) {
    const buffer = Buffer.alloc(AnchorData.sizeOf() + anchor.linkedAnchors.length * 4)
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(AnchorData.accumulateFrom(anchor))
    binary.writeInt32Array(anchor.linkedAnchors)

    return buffer
  }
}
