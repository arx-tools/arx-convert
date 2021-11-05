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
    const { version } = require("../package.json");
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

const outputInChunks = (buffer, stream) => {
  const chunks = Math.ceil(buffer.length / 1000);
  for (let i = 0; i < chunks - 1; i++) {
    stream.write(buffer.slice(i * 1000, (i + 1) * 1000));
  }
  stream.write(buffer.slice((chunks - 1) * 1000));
  stream.end();
};

module.exports = {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyJSON,
  outputInChunks,
};
