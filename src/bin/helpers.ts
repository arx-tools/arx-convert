import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import {
  SupportedArxFormat,
  SupportedDataFormat,
  SupportedFormat,
  SUPPORTED_ARX_FORMATS,
  SUPPORTED_DATA_FORMATS,
  SUPPORTED_FORMATS,
} from '@bin/constants'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../../package.json'), 'utf-8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch (error) {
    return 'unknown'
  }
}

const fileExists = async (filename: string) => {
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
      resolve(Buffer.from(Buffer.concat(chunks), 0))
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
    return buffer.subarray(start, end)
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

export const isValidFormat = (arg: string): arg is SupportedFormat => {
  for (let i = 0; i < SUPPORTED_FORMATS.length; i++) {
    if (SUPPORTED_FORMATS[i] === arg) {
      return true
    }
  }
  return false
}

export const isArxFormat = (arg: SupportedFormat): arg is SupportedArxFormat => {
  for (let i = 0; i < SUPPORTED_ARX_FORMATS.length; i++) {
    if (SUPPORTED_ARX_FORMATS[i] === arg) {
      return true
    }
  }
  return false
}

export const isDataFormat = (arg: SupportedFormat): arg is SupportedDataFormat => {
  for (let i = 0; i < SUPPORTED_DATA_FORMATS.length; i++) {
    if (SUPPORTED_DATA_FORMATS[i] === arg) {
      return true
    }
  }
  return false
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
