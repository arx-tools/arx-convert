#!/usr/bin/env node

const fs = require("fs");
const minimist = require("minimist-lite");
const {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyJSON,
  outputInChunks,
} = require("./helpers.js");
const { isZeroVertex } = require("../src/common/helpers.js");
const FTS = require("../src/fts/FTS.js");

const args = minimist(process.argv.slice(2), {
  string: ["dlf", "llf", "fts"],
  boolean: ["version", "pretty"],
  alias: {
    v: "version",
    p: "pretty",
  },
});

(async () => {
  if (args.version) {
    console.log(getPackageVersion());
    process.exit(0);
  }

  let filename = args._[0];

  let hasErrors = false;

  let input;
  if (filename) {
    if (await fileExists(filename)) {
      input = fs.createReadStream(filename);
    } else {
      console.error("error: input file does not exist");
      hasErrors = true;
    }
  } else {
    input = process.openStdin();
  }

  const json = JSON.parse(await streamToBuffer(input));
  const extension = json.meta.type;

  if (extension !== "combined") {
    console.error('error: unsupported meta type, expected "combined"');
    hasErrors = true;
  }

  if (hasErrors) {
    process.exit(1);
  }

  const output = {
    dlf: fs.createWriteStream(args.dlf),
    llf: fs.createWriteStream(args.llf),
    fts: fs.createWriteStream(args.fts),
  };

  const numberOfPolygons = json.fts.polygons.length;

  const dlf = json.dlf;
  dlf.header.numberOfBackgroundPolygons = numberOfPolygons;
  dlf.meta = {
    type: "dlf",
  };
  dlf.scene = {
    name: json.header.name,
  };

  outputInChunks(stringifyJSON(dlf, args.pretty), output.dlf);

  const llf = json.llf;
  llf.meta = {
    type: "llf",
  };
  llf.header.numberOfBackgroundPolygons = numberOfPolygons;

  const polygons = ((json) => {
    const sizeX = json.fts.sceneHeader.sizeX;

    // predicting the final location of polygons based on how FTS.js calculates cell indices
    const _cells = json.fts.polygons.reduce(
      (cells, polygon) => {
        const cellX = FTS.getCellCoordinateFromPolygon("x", polygon);
        const cellY = FTS.getCellCoordinateFromPolygon("z", polygon);

        const polygons = cells[cellY * sizeX + cellX].polygons;
        const idx = polygons.length;
        cells[cellY * sizeX + cellX].polygons.push({ ...polygon });
        polygon.idx = idx; // TODO: this is a rather ugly hack for getting the indexes into polygons

        return cells;
      },
      json.fts.cells.map((cell) => {
        cell.polygons = [];
        return cell;
      })
    );

    return FTS.getPolygons(_cells);
  })(json);

  llf.colors = polygons
    .flatMap(({ vertices }) => vertices)
    .filter((vertex) => !isZeroVertex(vertex))
    .map(({ color }) => color);

  outputInChunks(stringifyJSON(llf, args.pretty), output.llf);

  const fts = json.fts;
  fts.meta = {
    type: "fts",
  };
  fts.header.path = `C:\\ARX\\Game\\${json.header.name}`;
  fts.polygons.forEach(({ vertices }) => {
    vertices.forEach((vertex) => {
      delete vertex.color;
    });
  });

  outputInChunks(stringifyJSON(fts, args.pretty), output.fts);
})();
