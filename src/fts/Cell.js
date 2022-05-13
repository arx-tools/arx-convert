const BinaryIO = require("../binary/BinaryIO.js");
const SceneInfo = require("./SceneInfo.js");
const Polygon = require("./Polygon.js");
const { Buffer } = require("buffer");

class Cell {
  static readFrom(binary) {
    const sceneInfo = SceneInfo.readFrom(binary);

    return {
      polygons: [...Array(sceneInfo.numberOfPolygons)].map(() => {
        return Polygon.readFrom(binary);
      }),
      anchors: [...Array(sceneInfo.numberOfAnchors)].map(() => {
        return binary.readInt32();
      }),
    };
  }

  static accumulateFrom(cell) {
    const sceneInfo = SceneInfo.accumulateFrom(cell);

    const polygons = Buffer.concat(
      cell.polygons.map(Polygon.accumulateFrom.bind(Polygon))
    );

    const anchors = Buffer.alloc(cell.anchors.length * 4);
    const binary = new BinaryIO(anchors.buffer);
    binary.writeInt32Array(cell.anchors);

    return Buffer.concat([sceneInfo, polygons, anchors]);
  }
}

module.exports = Cell;
