const BinaryIO = require("../binary/BinaryIO.js");
const { Buffer } = require("buffer");

class Scene {
  static readFrom(binary) {
    const data = {
      name: binary.readString(512),
    };

    binary.readInt32Array(16); // pad
    binary.readFloat32Array(16); // fpad

    return data;
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeString(json.scene.name, 512);
    binary.writeInt32Array(Array(16).fill(0));
    binary.writeFloat32Array(Array(16).fill(0));

    return buffer;
  }

  static sizeOf() {
    return 512 + 4 * 16 + 4 * 16;
  }
}

module.exports = Scene;
