const BinaryIO = require("../binary/BinaryIO.js");

class Header {
  static readFrom(binary) {
    const data = {};

    return data;
  }

  static accumulateFrom(json, uncompressedSize) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    // TODO

    return buffer;
  }

  static sizeOf() {
    return 0;
  }
}

module.exports = Header;
