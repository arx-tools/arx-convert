const BinaryIO = require("../binary/BinaryIO.js");
const { Buffer } = require("buffer");

class LightingHeader {
  static readFrom(binary) {
    const data = {
      numberOfColors: binary.readInt32(),
    };

    binary.readInt32(); // viewMode (unused)
    binary.readInt32(); // modeLight (unused)
    binary.readInt32(); // lpad

    return data;
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeInt32(json.colors.length);

    binary.writeInt32(0);
    binary.writeInt32(63);
    binary.writeInt32(0);

    return buffer;
  }

  static sizeOf() {
    return 4 * 4;
  }
}

module.exports = LightingHeader;
