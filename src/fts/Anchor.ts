import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxAnchorData, AnchorData } from './AnchorData'

export type ArxAnchor = {
  data: Omit<ArxAnchorData, 'numberOfLinkedAnchors'>
  linkedAnchors: number[]
}

export class Anchor {
  static readFrom(binary: BinaryIO) {
    const { numberOfLinkedAnchors, ...anchorData } = AnchorData.readFrom(binary)

    return {
      data: anchorData,
      linkedAnchors: binary.readInt32Array(numberOfLinkedAnchors),
    } as ArxAnchor
  }

  static accumulateFrom(anchor: ArxAnchor) {
    const buffer = Buffer.alloc(AnchorData.sizeOf() + anchor.linkedAnchors.length * 4)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeBuffer(AnchorData.accumulateFrom(anchor))
    binary.writeInt32Array(anchor.linkedAnchors)

    return buffer
  }
}
