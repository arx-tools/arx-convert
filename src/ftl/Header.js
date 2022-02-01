const BinaryIO = require("../binary/BinaryIO.js");

class Header {
  static readFrom(binary) {
    const data = {
      ident: binary.readString(4),
      version: binary.readFloat32(),
    };

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
