const BinaryIO = require("../binary/BinaryIO.js");
const { times, map } = require("ramda");
const Vertex = require("./Vertex.js");

class Polygon {
  static readFrom(binary) {
    const data = {
      vertices: times(() => Vertex.readFrom(binary), 4),
      tex: binary.readInt32(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      normals: times(() => binary.readVector3(), 4),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      type: binary.readInt32(),
      room: binary.readInt16(),
      paddy: binary.readInt16(),
    };

    return data;
  }

  static accumulateFrom(polygon) {
    const vertices = Buffer.concat(
      map(Vertex.accumulateFrom.bind(Vertex), polygon.vertices)
    );

    const buffer = Buffer.alloc(this.sizeWithoutVertices(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeInt32(polygon.tex);
    binary.writeVector3(polygon.norm);
    binary.writeVector3(polygon.norm2);
    binary.writeVector3Array(polygon.normals);
    binary.writeFloat32(polygon.transval);
    binary.writeFloat32(polygon.area);
    binary.writeInt32(polygon.type);
    binary.writeInt16(polygon.room);
    binary.writeInt16(polygon.paddy);

    return Buffer.concat([vertices, buffer]);
  }

  static sizeWithoutVertices() {
    return 4 + 3 * 4 * 2 + 4 * 3 * 4 + 4 + 4 + 4 + 2 + 2;
  }
}

module.exports = Polygon;
