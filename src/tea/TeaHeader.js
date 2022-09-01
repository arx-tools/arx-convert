const BinaryIO = require("../binary/BinaryIO.js");
const { Buffer } = require("buffer");

class TeaHeader {
  static readFrom(binary) {
    const data = {
      ident: binary.readString(20),
      version: binary.readFloat32(),
      name: binary.readString(256),
      numberOfFrames: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfKeyFrames: binary.readInt32(),
    };

    return data;
  }

  static accumulateFrom(json, uncompressedSize) {
    const buffer = Buffer.alloc(TeaHeader.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    // TODO

    return buffer;
  }

  static sizeOf() {
    return 20 + 4 + 256 + 4 + 4 + 4;
  }
}

module.exports = TeaHeader;
