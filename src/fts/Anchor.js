const BinaryIO = require("../binary/BinaryIO.js");
const AnchorData = require("./AnchorData.js");
const { Buffer } = require("buffer");
const { times } = require("../common/helpers.js");

class Anchor {
  static readFrom(binary) {
    const { numberOfLinkedAnchors, ...anchorData } =
      AnchorData.readFrom(binary);

    return {
      data: anchorData,
      linkedAnchors: times(() => binary.readInt32(), numberOfLinkedAnchors),
    };
  }

  static accumulateFrom(anchor) {
    const anchorData = AnchorData.accumulateFrom(anchor);

    const linkedAnchors = Buffer.alloc(anchor.linkedAnchors.length * 4, 0);
    const binary = new BinaryIO(linkedAnchors.buffer);
    binary.writeInt32Array(anchor.linkedAnchors);

    return Buffer.concat([anchorData, linkedAnchors]);
  }
}

module.exports = Anchor;
