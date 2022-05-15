const BinaryIO = require("../binary/BinaryIO.js");
const { Buffer } = require("buffer");

class UniqueHeader {
  static readFrom(binary) {
    return {
      path: binary.readString(256),
      check: binary.readUint8Array(512),
    };
  }

  static accumulateFrom(uniqueHeader) {
    const buffer = Buffer.alloc(UniqueHeader.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeString(uniqueHeader.path, 256);
    binary.writeUint8Array(uniqueHeader.check);

    return buffer;
  }

  static sizeOf() {
    return 768;
  }
}

module.exports = UniqueHeader;
