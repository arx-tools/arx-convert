import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { SUPPORTED_ARX_FORMATS, SUPPORTED_DATA_FORMATS } from '../common/constants'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../../package.json'), 'utf-8')
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

export const streamToBuffer = (input: NodeJS.ReadableStream): Promise<Buffer> => {
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

const sliceBuffer = (buffer: string | Buffer, start?: number, end?: number) => {
  if (buffer instanceof Buffer) {
    return Uint8Array.prototype.slice.call(buffer, start, end)
  } else {
    return buffer.slice(start, end)
  }
}

export const evenAndRemainder = (divisor: number, n: number): [number, number] => {
  return [Math.floor(n / divisor), n % divisor]
}

export const outputInChunks = (buffer: string | Buffer, stream: NodeJS.WritableStream, chunkSize: number = 1024) => {
  const [numberOfWholeChunks, leftoverChunkSize] = evenAndRemainder(buffer.length, chunkSize)

  for (let i = 0; i < numberOfWholeChunks; i++) {
    stream.write(sliceBuffer(buffer, i * chunkSize, (i + 1) * chunkSize))
  }

  if (leftoverChunkSize > 0) {
    stream.write(sliceBuffer(buffer, numberOfWholeChunks * chunkSize))
  }

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

export const getInputStream = async (filename?: string): Promise<NodeJS.ReadableStream> => {
  if (typeof filename === 'undefined') {
    return process.openStdin()
  }

  if (await fileExists(filename)) {
    return fs.createReadStream(filename)
  }

  throw new Error('input file does not exist')
}

export const getOutputStream = async (filename?: string): Promise<NodeJS.WritableStream> => {
  if (typeof filename === 'undefined') {
    return process.stdout
  }

  return fs.createWriteStream(filename)
}
