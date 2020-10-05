import { times } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import AnchorData from './AnchorData.mjs'

export default class Anchor {
  static readFrom(binary) {
    const { numberOfLinkedAnchors, ...anchorData } = AnchorData.readFrom(binary)

    return {
      data: anchorData,
      linkedAnchors: times(() => binary.readInt32(), numberOfLinkedAnchors)
    }
  }

  static accumulateFrom(anchor) {
    const anchorData = AnchorData.accumulateFrom(anchor)

    const linkedAnchors = Buffer.alloc(anchor.linkedAnchors.length * 4, 0)
    const binary = new BinaryIO(linkedAnchors.buffer)
    binary.writeInt32Array(anchor.linkedAnchors)

    return Buffer.concat([anchorData, linkedAnchors])
  }
}
