const { times } = require("ramda");
const BinaryIO = require("../binary/BinaryIO.js");
const RoomData = require("./RoomData.js");
const EPData = require("./EPData.js");
const { Buffer } = require("buffer");

class Room {
  static readFrom(binary) {
    const { numberOfPortals, numberOfPolygons } = RoomData.readFrom(binary);

    return {
      portals: times(() => binary.readInt32(), numberOfPortals),
      polygons: times(() => EPData.readFrom(binary), numberOfPolygons),
    };
  }

  static accumulateFrom(room) {
    const roomData = RoomData.accumulateFrom(room);

    const portals = Buffer.alloc(room.portals.length * 4);
    const binary = new BinaryIO(portals.buffer);
    binary.writeInt32Array(room.portals);

    const polygons = Buffer.concat(
      room.polygons.map(EPData.accumulateFrom.bind(EPData))
    );

    return Buffer.concat([roomData, portals, polygons]);
  }
}

module.exports = Room;
