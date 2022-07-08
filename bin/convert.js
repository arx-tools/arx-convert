#!/usr/bin/env node

const fs = require("fs");
const minimist = require("minimist-lite");
const BSON = require("bson");
const YAML = require("yaml");
const {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyYAML,
  stringifyJSON,
  stringifyBSON,
  outputInChunks,
  validateFromToPair,
} = require("./helpers.js");
const { DLF, FTS, LLF, FTL } = require("../src/index.js");

// ---------------------------

const args = minimist(process.argv.slice(2), {
  string: ["output", "from", "to"],
  boolean: ["version", "pretty"],
  alias: {
    v: "version",
    p: "pretty",
  },
});

if (args.version) {
  console.log(getPackageVersion());
  process.exit(0);
}

let filename = args._[0];
let output = args.output;
let hasErrors = false;

(async () => {
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

  try {
    validateFromToPair(args.from, args.to);
  } catch (e) {
    console.error(`error: ${e.message}`);
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

  const rawIn = await streamToBuffer(input);
  let parsedIn;
  switch (args.from) {
    case "json":
      parsedIn = JSON.parse(rawIn);
      break;
    case "yml":
    case "yaml":
      parsedIn = YAML.parse(rawIn.toString());
      break;
    case "bson":
      parsedIn = BSON.deserialize(rawIn);
      break;
    case "dlf":
      parsedIn = DLF.load(rawIn);
      break;
    case "fts":
      parsedIn = FTS.load(rawIn);
      break;
    case "llf":
      parsedIn = LLF.load(rawIn);
      break;
    case "ftl":
      parsedIn = FTL.load(rawIn);
      break;
  }

  let rawOut;
  switch (args.to) {
    case "json":
      rawOut = stringifyJSON(parsedIn, args.pretty);
      break;
    case "yml":
    case "yaml":
      rawOut = stringifyYAML(parsedIn);
      break;
    case "bson":
      rawOut = stringifyBSON(parsedIn);
      break;
    case "dlf":
      rawOut = DLF.save(parsedIn);
      break;
    case "fts":
      rawOut = FTS.save(parsedIn);
      break;
    case "llf":
      rawOut = LLF.save(parsedIn);
      break;
    case "ftl":
      rawOut = FTL.save(parsedIn);
      break;
  }

  outputInChunks(rawOut, output);
})();
