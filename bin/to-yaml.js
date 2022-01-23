#!/usr/bin/env node

const fs = require("fs");
const minimist = require("minimist-lite");
const { DLF, FTS, LLF } = require("../src/index.js");
const {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyYAML,
  outputInChunks,
} = require("./helpers.js");
const { SUPPORTED_EXTENSIONS } = require("./constants.js");

const args = minimist(process.argv.slice(2), {
  string: ["output", "ext"],
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
  let extension = args.ext ? args.ext.toLowerCase() : "";
  let output = args.output;

  let hasErrors = false;

  let input;
  if (filename) {
    if (await fileExists(filename)) {
      input = fs.createReadStream(filename);
      if (!extension) {
        extension = filename.match(/\.([a-zA-Z]+)$/)[1].toLowerCase();
      }
    } else {
      console.error("error: input file does not exist");
      hasErrors = true;
    }
  } else {
    input = process.openStdin();
  }

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error(
      'error: unsupported extension, expected "dlf", "fts" or "llf"'
    );
    hasErrors = true;
  }

  if (output) {
    output = fs.createWriteStream(output);
  } else {
    output = process.stdout;
  }

  if (hasErrors) {
    process.exit(1);
  }

  const raw = await streamToBuffer(input);

  let json;
  switch (extension) {
    case "fts":
      json = FTS.load(raw);
      break;
    case "dlf":
      json = DLF.load(raw);
      break;
    case "llf":
      json = LLF.load(raw);
      break;
  }

  outputInChunks(stringifyYAML(json), output);
})();
