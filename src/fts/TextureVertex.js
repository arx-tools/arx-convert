const BinaryIO = require("../binary/BinaryIO.js");
const { Buffer } = require("buffer");

class TextureVertex {
  static readFrom(binary) {
    return {
      pos: binary.readVector3(),
      rhw: binary.readFloat32(),
      color: binary.readUint32(),
      specular: binary.readUint32(),
      tu: binary.readFloat32(),
      tv: binary.readFloat32(),
    };
  }

  static accumulateFrom(vertex) {
    const buffer = Buffer.alloc(TextureVertex.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeVector3(vertex.pos);
    binary.writeFloat32(vertex.thw);
    binary.writeUint32(vertex.color);
    binary.writeUint32(vertex.specular);
    binary.writeFloat32(vertex.tu);
    binary.writeFloat32(vertex.tv);

    return buffer;
  }

  static sizeOf() {
    return 3 * 4 + 4 + 4 + 4 + 4 + 4;
  }
}

module.exports = TextureVertex;
