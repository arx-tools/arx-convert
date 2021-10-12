const {
  times,
  pluck,
  unnest,
  compose,
  map,
  prop,
  reject,
  reduce,
  has,
  assoc,
  dissoc,
  append,
  evolve,
} = require("ramda");
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

const addIndexToVertices = (polygons) => {
  let idx = 0;

  return map(
    evolve({
      vertices: map((vertex) => {
        if (isZeroVertex(vertex)) {
          vertex.llfColorIdx = null;
        } else {
          vertex.llfColorIdx = idx;
          idx++;
        }
        return vertex;
      }),
    }),
    polygons
  );
};

const getPolygons = (cells) => {
  return compose(addIndexToVertices, unnest, pluck("polygons"))(cells);
};

const coordToCell = (coord) => {
  return Math.floor(roundTo3Decimals(coord) / 100);
};

const getCellCoordinateFromPolygon = (axis, polygon) => {
  return compose(
    minAll,
    map(coordToCell),
    pluck(axis === "x" ? "posX" : "posZ"),
    reject(isZeroVertex),
    prop("vertices")
  )(polygon);
};

class FTS {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer);

    const { numberOfUniqueHeaders, ...header } = Header.readFrom(file);

    const data = {
      meta: {
        type: "fts",
        numberOfLeftoverBytes: 0,
      },
      header: header,
      uniqueHeaders: times(
        () => UniqueHeader.readFrom(file),
        numberOfUniqueHeaders
      ),
    };

    const {
      numberOfTextures,
      numberOfAnchors,
      numberOfPortals,
      numberOfRooms,
      ...sceneHeader
    } = SceneHeader.readFrom(file);

    data.sceneHeader = sceneHeader;
    data.textureContainers = times(
      () => TextureContainer.readFrom(file),
      numberOfTextures
    );

    const cells = [];
    for (let z = 0; z < sceneHeader.sizeZ; z++) {
      for (let x = 0; x < sceneHeader.sizeX; x++) {
        cells.push(Cell.readFrom(file));
      }
    }
    data.cells = cells.map(dissoc("polygons"));
    data.polygons = getPolygons(cells);

    data.anchors = times(() => Anchor.readFrom(file), numberOfAnchors);
    data.portals = times(() => Portal.readFrom(file), numberOfPortals);
    data.rooms = times(() => Room.readFrom(file), numberOfRooms);
    data.roomDistances = times(
      () => RoomDistance.readFrom(file),
      numberOfRooms ** 2
    );

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

    const _cells = reduce(
      (cells, polygon) => {
        const cellX = getCellCoordinateFromPolygon("x", polygon);
        const cellY = getCellCoordinateFromPolygon("z", polygon);

        const polygons = cells[cellY * sizeX + cellX].polygons;
        const idx = polygons.length;
        cells[cellY * sizeX + cellX].polygons = append(
          { ...polygon },
          polygons
        );
        polygon.idx = idx; // TODO: this is a rather ugly hack for getting the indexes into polygons

        return cells;
      },
      json.cells.map(assoc("polygons", [])),
      json.polygons
    );

    const _rooms = reduce(
      (rooms, polygon) => {
        const roomIdx = parseInt(polygon.room);
        const roomData = {
          px: getCellCoordinateFromPolygon("x", polygon),
          py: getCellCoordinateFromPolygon("z", polygon),
          idx: polygon.idx,
        };

        if (!has(roomIdx, rooms)) {
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
      ],
      json.polygons
    );

    const sceneHeader = SceneHeader.accumulateFrom(json);

    const textureContainers = Buffer.concat(
      map(
        TextureContainer.accumulateFrom.bind(TextureContainer),
        json.textureContainers
      )
    );

    // TODO: generate cells based on polygons
    const cells = Buffer.concat(map(Cell.accumulateFrom.bind(Cell), _cells));

    const anchors = Buffer.concat(
      map(Anchor.accumulateFrom.bind(Anchor), json.anchors)
    );
    const portals = Buffer.concat(
      map(Portal.accumulateFrom.bind(Portal), json.portals)
    );

    const rooms = Buffer.concat(map(Room.accumulateFrom.bind(Room), _rooms));

    const roomDistances = Buffer.concat(
      map(RoomDistance.accumulateFrom.bind(RoomDistance), json.roomDistances)
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
      map(UniqueHeader.accumulateFrom.bind(UniqueHeader), json.uniqueHeaders)
    );

    return Buffer.concat([header, uniqueHeaders, dataWithoutHeader]);
  }
}

FTS.getPolygons = getPolygons;
FTS.getCellCoordinateFromPolygon = getCellCoordinateFromPolygon;
module.exports = FTS;
