import { times } from '../../node_modules/ramda/src/index.mjs'
import AnchorData from './AnchorData.mjs'

export default class Anchor {
  static readFrom(binary) {
    const { numberOfLinkedAnchors, ...anchorData } = AnchorData.readFrom(binary)

    return {
      data: anchorData,
      linkedAnchors: times(() => binary.readInt32(), numberOfLinkedAnchors)
    }
  }
}
