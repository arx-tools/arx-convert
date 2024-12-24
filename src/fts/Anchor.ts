import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxAnchorData, AnchorData } from '@fts/AnchorData.js'

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

  static accumulateFrom(anchor: ArxAnchor): ArrayBuffer {
    const buffer = new ArrayBuffer(AnchorData.sizeOf() + anchor.linkedAnchors.length * 4)
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(AnchorData.accumulateFrom(anchor))
    binary.writeInt32Array(anchor.linkedAnchors)

    return buffer
  }
}
