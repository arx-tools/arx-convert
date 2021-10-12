const BinaryIO = require("../binary/BinaryIO.js");
const { repeat } = require("ramda");

class RoomData {
  static readFrom(binary) {
    const data = {
      numberOfPortals: binary.readInt32(),
      numberOfPolygons: binary.readInt32(),
    };

    binary.readInt32Array(6);

    return data;
  }

  static accumulateFrom(room) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeInt32(room.portals.length);
    binary.writeInt32(room.polygons.length);
    binary.writeInt32Array(repeat(0, 6));

    return buffer;
  }

  static sizeOf() {
    return 4 + 4 + 6 * 4;
  }
}

module.exports = RoomData;
