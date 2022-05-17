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
const { SUPPORTED_EXTENSIONS } = require("./constants.js");

const args = minimist(process.argv.slice(2), {
  string: ["output"],
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

  let filename1 = args._[0];
  let filename2 = args._[1];
  let filename3 = args._[2];
  let output = args.output;

  let hasErrors = false;

  let input1;
  if (await fileExists(filename1)) {
    input1 = fs.createReadStream(filename1);
  } else {
    console.error("error: 1st input file does not exist");
    hasErrors = true;
  }

  let input2;
  if (await fileExists(filename2)) {
    input2 = fs.createReadStream(filename2);
  } else {
    console.error("error: 2nd input file does not exist");
    hasErrors = true;
  }

  let input3;
  if (await fileExists(filename3)) {
    input3 = fs.createReadStream(filename3);
  } else {
    console.error("error: 2nd input file does not exist");
    hasErrors = true;
  }

  const source = {
    dlf: null,
    llf: null,
    fts: null,
  };

  let json = JSON.parse(await streamToBuffer(input1));
  let extension = json.meta.type;

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error(
      'error: unsupported meta type for input file #1, expected "dlf", "fts" or "llf" '
    );
    hasErrors = true;
  } else {
    source[extension] = json;
  }

  json = JSON.parse(await streamToBuffer(input2));
  extension = json.meta.type;

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error(
      'error: unsupported meta type for input file #2, expected "dlf", "fts" or "llf" '
    );
    hasErrors = true;
  } else {
    source[extension] = json;
  }

  json = JSON.parse(await streamToBuffer(input3));
  extension = json.meta.type;

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error(
      'error: unsupported meta type for input file #3, expected "dlf", "fts" or "llf" '
    );
    hasErrors = true;
  } else {
    source[extension] = json;
  }

  if (source.dlf === null) {
    console.error("error: missing dlf data");
    hasErrors = true;
  }
  if (source.fts === null) {
    console.error("error: missing fts data");
    hasErrors = true;
  }
  if (source.llf === null) {
    console.error("error: missing llf data");
    hasErrors = true;
  }

  if (hasErrors) {
    process.exit(1);
  }

  if (output) {
    output = fs.createWriteStream(output);
  } else {
    output = process.stdout;
  }

  const name = source.dlf.scene.name;

  const { dlf, fts, llf } = source;

  delete dlf.meta;
  delete dlf.scene;
  delete dlf.header.numberOfBackgroundPolygons;

  delete fts.meta;
  delete fts.header.path;

  delete llf.meta;
  delete llf.header.numberOfBackgroundPolygons;

  const data = {
    meta: {
      type: "combined",
    },
    header: {
      name,
    },
    dlf,
    fts,
    llf,
  };

  // TODO: when lighting generation is implemented, then we don't need to deal with colors at all
  data.fts.polygons = data.fts.polygons.map((polygon) => {
    polygon.vertices = polygon.vertices.map((vertex) => {
      const color =
        isZeroVertex(vertex) || typeof vertex.llfColorIdx === "undefined"
          ? null
          : data.llf.colors[vertex.llfColorIdx];
      vertex.color = color;
      delete vertex.llfColorIdx;
      return vertex;
    });
    return polygon;
  });

  delete data.llf.colors;

  outputInChunks(stringifyJSON(data, args.pretty), output);
})();
