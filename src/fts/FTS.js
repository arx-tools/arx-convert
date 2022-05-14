const { has, evolve } = require("ramda");
const BinaryIO = require("../binary/BinaryIO.js");
const Header = require("./Header.js");
const SceneHeader = require("./SceneHeader.js");
const UniqueHeader = require("./UniqueHeader.js");
const TextureContainer = require("./TextureContainer.js");
const Cell = require("./Cell.js");
const Anchor = require("./Anchor.js");
const Portal = require("./Portal.js");
const Room = require("./Room.js");
const RoomDistance = require("./RoomDistance.js");
const {
  roundTo3Decimals,
  minAll,
  isZeroVertex,
} = require("../common/helpers.js");
const { Buffer } = require("buffer");

const addIndexToVertices = (polygons) => {
  let idx = 0;

  return polygons.map(
    evolve({
      vertices: (vertices) => {
        vertices.map((vertex) => {
          if (isZeroVertex(vertex)) {
            vertex.llfColorIdx = null;
          } else {
            vertex.llfColorIdx = idx;
            idx++;
          }
          return vertex;
        });
      },
    })
  );
};

const coordToCell = (coord) => {
  return Math.floor(roundTo3Decimals(coord) / 100);
};

class FTS {
  static getPolygons(cells) {
    return addIndexToVertices(cells.flatMap(({ polygons }) => polygons));
  }

  static getCellCoordinateFromPolygon(axis, polygon) {
    const vertices = polygon.map(({ vertices }) => vertices);
    const nonZeroVertices = vertices.filter((vertex) => !isZeroVertex(vertex));
    const coords = nonZeroVertices.map(({ posX, posZ }) => {
      return axis === "x" ? posX : posZ;
    });
    const cells = coords.map(coordToCell);
    return minAll(cells);
  }

  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer);

    const { numberOfUniqueHeaders, ...header } = Header.readFrom(file);

    const data = {
      meta: {
        type: "fts",
        numberOfLeftoverBytes: 0,
      },
      header: header,
      uniqueHeaders: [...Array(numberOfUniqueHeaders)].map(() => {
        return UniqueHeader.readFrom(file);
      }),
    };

    const {
      numberOfTextures,
      numberOfAnchors,
      numberOfPortals,
      numberOfRooms,
      ...sceneHeader
    } = SceneHeader.readFrom(file);

    data.sceneHeader = sceneHeader;
    data.textureContainers = [...Array(numberOfTextures)].map(() => {
      return TextureContainer.readFrom(file);
    });

    const cells = [];
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        cells.push(Cell.readFrom(file));
      }
    }
    data.cells = cells.map((cell) => {
      delete cell.polygons;
      return cell;
    });
    data.polygons = FTS.getPolygons(cells);

    data.anchors = [...Array(numberOfAnchors)].map(() => Anchor.readFrom(file));
    data.portals = [...Array(numberOfPortals)].map(() => Portal.readFrom(file));
    data.rooms = [...Array(numberOfRooms)].map(() => Room.readFrom(file));
    data.roomDistances = [...Array(numberOfRooms ** 2)].map(() => {
      return RoomDistance.readFrom(file);
    });

    const remainedBytes = decompressedFile.length - file.position;
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes;
    }

    // rooms are lookup tables for vertices, so we don't really need it,
    // we can just generate it from the cells > polygons > vertices
    delete data.rooms;

    return data;
  }

  static save(json) {
    const sizeX = json.sceneHeader.sizeX;

    const _cells = json.polygons.reduce(
      (cells, polygon) => {
        const cellX = FTS.getCellCoordinateFromPolygon("x", polygon);
        const cellY = FTS.getCellCoordinateFromPolygon("z", polygon);

        const polygons = cells[cellY * sizeX + cellX].polygons;
        const idx = polygons.length;
        cells[cellY * sizeX + cellX].polygons.push({ ...polygon });
        polygon.idx = idx; // TODO: this is a rather ugly hack for getting the indexes into polygons

        return cells;
      },
      json.cells.map((cell) => {
        cell.polygons = [];
        return cell;
      })
    );

    const _rooms = json.polygons.reduce(
      (rooms, polygon) => {
        const roomIdx = parseInt(polygon.room);
        const roomData = {
          px: FTS.getCellCoordinateFromPolygon("x", polygon),
          py: FTS.getCellCoordinateFromPolygon("z", polygon),
          idx: polygon.idx,
        };

        if (typeof rooms[roomIdx] !== "undefined") {
          rooms[roomIdx] = {
            portals: [],
            polygons: [],
          };
        }

        rooms[roomIdx].polygons.push(roomData);

        return rooms;
      },
      [
        {
          portals: [],
          polygons: [],
        },
      ]
    );

    const sceneHeader = SceneHeader.accumulateFrom(json);

    const textureContainers = Buffer.concat(
      json.textureContainers.map(
        TextureContainer.accumulateFrom.bind(TextureContainer)
      )
    );

    // TODO: generate cells based on polygons
    const cells = Buffer.concat(_cells.map(Cell.accumulateFrom.bind(Cell)));

    const anchors = Buffer.concat(
      json.anchors.map(Anchor.accumulateFrom.bind(Anchor))
    );
    const portals = Buffer.concat(
      json.portals.map(Portal.accumulateFrom.bind(Portal))
    );

    const rooms = Buffer.concat(_rooms.map(Room.accumulateFrom.bind(Room)));

    const roomDistances = Buffer.concat(
      json.roomDistances.map(RoomDistance.accumulateFrom.bind(RoomDistance))
    );

    const dataWithoutHeader = Buffer.concat([
      sceneHeader,
      textureContainers,
      cells,
      anchors,
      portals,
      rooms,
      roomDistances,
    ]);
    const uncompressedSize = dataWithoutHeader.length;

    const header = Header.accumulateFrom(json, uncompressedSize);
    const uniqueHeaders = Buffer.concat(
      json.uniqueHeaders.map(UniqueHeader.accumulateFrom.bind(UniqueHeader))
    );

    return Buffer.concat([header, uniqueHeaders, dataWithoutHeader]);
  }
}

module.exports = FTS;
