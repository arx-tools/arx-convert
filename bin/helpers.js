const fs = require('node:fs')
const { SUPPORTED_ARX_FORMATS, SUPPORTED_DATA_FORMATS } = require('./constants')

const getPackageVersion = async () => {
  try {
    const { version } = require('../package.json')
    return version
  } catch (error) {
    return 'unknown'
  }
}

const fileExists = async (filename) => {
  try {
    await fs.promises.access(filename, fs.constants.R_OK)
    return true
  } catch (error) {
    return false
  }
}

const streamToBuffer = (input) =>
  new Promise((resolve, reject) => {
    const chunks = []
    input.on('data', (chunk) => {
      chunks.push(chunk)
    })
    input.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    input.on('error', (e) => {
      reject(e)
    })
  })

const stringifyJSON = (json, prettify = false) => {
  if (prettify) {
    return JSON.stringify(json, null, '\t')
  } else {
    return JSON.stringify(json)
  }
}

const stringifyYAML = (json) => {
  const YAML = require('yaml')
  return YAML.stringify(json)
}

const stringifyBSON = (json) => {
  const BSON = require('bson')
  return BSON.serialize(json)
}

const outputInChunks = (buffer, stream) => {
  const chunks = Math.ceil(buffer.length / 1000)
  for (let i = 0; i < chunks - 1; i++) {
    stream.write(buffer.slice(i * 1000, (i + 1) * 1000))
  }
  stream.write(buffer.slice((chunks - 1) * 1000))
  stream.end()
}

const validTypes = [...SUPPORTED_ARX_FORMATS, ...SUPPORTED_DATA_FORMATS]

const validateFromToPair = (from, to) => {
  if (typeof from === 'undefined' || from === '') {
    throw new Error('"from" argument is missing or empty')
  }
  if (typeof to === 'undefined' || to === '') {
    throw new Error('"to" argument is missing or empty')
  }

  if (!validTypes.includes(from)) {
    throw new Error(`unknown format '${from}' in "from"`)
  }

  if (!validTypes.includes(to)) {
    throw new Error(`unknown format '${to}' in "to"`)
  }

  if (from === to) {
    throw new Error('"from" and "to" have the same format')
  }

  // if "from" is sourcetype then "to" is targettype and vice-versa? (sourcetype=fts,dlf,...; targettype=json,bson,...)
  if (SUPPORTED_ARX_FORMATS.includes(from) && SUPPORTED_ARX_FORMATS.includes(to)) {
    throw new Error('"from" and "to" are both referencing arx formats, expected one of them to be a data type')
  }

  if (SUPPORTED_DATA_FORMATS.includes(from) && SUPPORTED_DATA_FORMATS.includes(to)) {
    throw new Error('"from" and "to" are both referencing data types, expected one of them to be an arx format')
  }
}

module.exports = {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyJSON,
  stringifyYAML,
  stringifyBSON,
  outputInChunks,
  validateFromToPair,
}
