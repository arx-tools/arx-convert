#!/usr/bin/env node

const fs = require("fs");
const minimist = require("minimist-lite");
const YAML = require("yaml");
const { DLF, FTS, LLF, FTL } = require("../src/index.js");
const {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  outputInChunks,
} = require("./helpers.js");
const { SUPPORTED_EXTENSIONS } = require("./constants.js");

const args = minimist(process.argv.slice(2), {
  string: ["output"],
  boolean: ["version"],
  alias: {
    v: "version",
  },
});

(async () => {
  if (args.version) {
    console.log(getPackageVersion());
    process.exit(0);
  }

  let filename = args._[0];
  let output = args.output;

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

  if (output) {
    output = fs.createWriteStream(output);
  } else {
    output = process.stdout;
  }

  const raw = await streamToBuffer(input);
  const json = YAML.parse(raw.toString());
  const extension = json.meta.type;

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error(
      'error: unsupported meta type, expected "dlf", "fts", "llf" or "ftl"'
    );
    hasErrors = true;
  }

  if (hasErrors) {
    process.exit(1);
  }

  let binary;
  switch (extension) {
    case "fts":
      binary = FTS.save(json);
      break;
    case "dlf":
      binary = DLF.save(json);
      break;
    case "llf":
      binary = LLF.save(json);
      break;
    case "ftl":
      binary = FTL.save(json);
      break;
  }

  outputInChunks(binary, output);
})();
