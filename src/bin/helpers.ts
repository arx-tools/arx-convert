import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { SUPPORTED_ARX_FORMATS, SUPPORTED_DATA_FORMATS } from '../common/constants'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile('../../package.json', 'utf-8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch (error) {
    return 'unknown'
  }
}

export const fileExists = async (filename: string) => {
  try {
    await fs.promises.access(filename, fs.constants.R_OK)
    return true
  } catch (error) {
    return false
  }
}

export const streamToBuffer = (input: fs.ReadStream | NodeJS.Socket): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    input.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    input.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    input.on('error', (e: unknown) => {
      reject(e)
    })
  })
}

export const stringifyJSON = (json: any, prettify = false) => {
  if (prettify) {
    return JSON.stringify(json, null, '\t')
  } else {
    return JSON.stringify(json)
  }
}

export const stringifyYAML = async (json: any) => {
  const YAML = await import('yaml')
  return YAML.stringify(json)
}

export const outputInChunks = (buffer: Buffer, stream: NodeJS.WritableStream) => {
  const chunks = Math.ceil(buffer.length / 1000)
  for (let i = 0; i < chunks - 1; i++) {
    stream.write(buffer.slice(i * 1000, (i + 1) * 1000))
  }
  stream.write(buffer.slice((chunks - 1) * 1000))
  stream.end()
}

const validTypes = [...SUPPORTED_ARX_FORMATS, ...SUPPORTED_DATA_FORMATS]

export const validateFromToPair = (from: string, to: string) => {
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

  // if "from" is sourcetype then "to" is targettype and vice-versa? (sourcetype=fts,dlf,...; targettype=json,...)
  if (SUPPORTED_ARX_FORMATS.includes(from) && SUPPORTED_ARX_FORMATS.includes(to)) {
    throw new Error('"from" and "to" are both referencing arx formats, expected one of them to be a data type')
  }

  if (SUPPORTED_DATA_FORMATS.includes(from) && SUPPORTED_DATA_FORMATS.includes(to)) {
    throw new Error('"from" and "to" are both referencing data types, expected one of them to be an arx format')
  }
}

export const getInputStream = async (filename?: string) => {
  if (typeof filename === 'undefined') {
    return process.openStdin()
  }

  if (await fileExists(filename)) {
    return fs.createReadStream(filename)
  }

  throw new Error('input file does not exist')
}

export const getOutputStream = async (filename?: string): Promise<any> => {
  if (typeof filename === 'undefined') {
    return process.stdout
  }

  return fs.createWriteStream(filename)
}
