const { Buffer } = require('node:buffer')
const { times } = require('../common/helpers.js')
const { BinaryIO } = require('../binary/BinaryIO.js')
const { AnchorData } = require('./AnchorData.js')

class Anchor {
  static readFrom(binary) {
    const { numberOfLinkedAnchors, ...anchorData } = AnchorData.readFrom(binary)

    return {
      data: anchorData,
      linkedAnchors: times(() => binary.readInt32(), numberOfLinkedAnchors),
    }
  }

  static accumulateFrom(anchor) {
    const anchorData = AnchorData.accumulateFrom(anchor)

    const linkedAnchors = Buffer.alloc(anchor.linkedAnchors.length * 4)
    const binary = new BinaryIO(linkedAnchors.buffer)

    binary.writeInt32Array(anchor.linkedAnchors)

    return Buffer.concat([anchorData, linkedAnchors])
  }
}

module.exports = { Anchor }
