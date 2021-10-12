const fs = require("fs");
const path = require("path");

const fileExists = async (filename) => {
  try {
    await fs.promises.access(filename, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const getPackageVersion = () => {
  try {
    const { version } = require("package.json");
    return version;
  } catch (error) {
    return "unknown";
  }
};

const streamToBuffer = (input) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    input.on("data", (chunk) => {
      chunks.push(chunk);
    });
    input.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    input.on("error", (e) => {
      reject(e);
    });
  });

const stringifyJSON = (json, prettify = false) => {
  if (prettify) {
    return JSON.stringify(json, null, "\t");
  } else {
    return JSON.stringify(json);
  }
};

module.exports = {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyJSON,
};
