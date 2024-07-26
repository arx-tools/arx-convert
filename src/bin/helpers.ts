import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  type SupportedArxFormat,
  type SupportedDataFormat,
  type SupportedFormat,
  SUPPORTED_ARX_FORMATS,
  SUPPORTED_DATA_FORMATS,
  SUPPORTED_FORMATS,
} from '@bin/constants.js'
import { type DoubleOf } from '@common/types.js'

export async function getPackageVersion(): Promise<string> {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../../package.json'), 'utf8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch {
    return 'unknown'
  }
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    await fs.promises.access(filename, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

export function concatBuffersSafe(buffers: Buffer[]): Buffer {
  const bufferSize = buffers.reduce((a, b) => a + b.length, 0)
  const buffer = Buffer.alloc(bufferSize)

  let offset = 0
  buffers.forEach((buf) => {
    buf.copy(buffer, offset)
    offset += buf.byteLength
  })

  return buffer
}

export async function streamToBuffer(input: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    input.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    input.on('end', () => {
      resolve(concatBuffersSafe(chunks))
    })
    input.on('error', (e: unknown) => {
      reject(e)
    })
  })
}

export function stringifyJSON(json: any, prettify = false): string {
  if (prettify) {
    return JSON.stringify(json, null, '\t')
  }

  return JSON.stringify(json)
}

export async function stringifyYAML(json: any): Promise<string> {
  const YAML = await import('yaml')
  return YAML.stringify(json)
}

function sliceBuffer(buffer: string | Buffer, start?: number, end?: number): string | Buffer {
  if (buffer instanceof Buffer) {
    return buffer.subarray(start, end)
  }

  return buffer.slice(start, end)
}

export function evenAndRemainder(divisor: number, n: number): DoubleOf<number> {
  return [Math.floor(n / divisor), n % divisor]
}

export function outputInChunks(buffer: string | Buffer, stream: NodeJS.WritableStream, chunkSize = 1024): void {
  const [numberOfWholeChunks, leftoverChunkSize] = evenAndRemainder(buffer.length, chunkSize)

  for (let i = 0; i < numberOfWholeChunks; i++) {
    stream.write(sliceBuffer(buffer, i * chunkSize, (i + 1) * chunkSize))
  }

  if (leftoverChunkSize > 0) {
    stream.write(sliceBuffer(buffer, numberOfWholeChunks * chunkSize))
  }

  stream.end()
}

export function isValidFormat(arg: string): arg is SupportedFormat {
  for (const SUPPORTED_FORMAT of SUPPORTED_FORMATS) {
    if (SUPPORTED_FORMAT === arg) {
      return true
    }
  }

  return false
}

export function isArxFormat(arg: SupportedFormat): arg is SupportedArxFormat {
  for (const SUPPORTED_ARX_FORMAT of SUPPORTED_ARX_FORMATS) {
    if (SUPPORTED_ARX_FORMAT === arg) {
      return true
    }
  }

  return false
}

export function isDataFormat(arg: SupportedFormat): arg is SupportedDataFormat {
  for (const SUPPORTED_DATA_FORMAT of SUPPORTED_DATA_FORMATS) {
    if (SUPPORTED_DATA_FORMAT === arg) {
      return true
    }
  }

  return false
}

export async function getInputStream(filename?: string): Promise<NodeJS.ReadableStream> {
  if (filename === undefined) {
    return process.openStdin()
  }

  if (await fileExists(filename)) {
    return fs.createReadStream(filename)
  }

  throw new Error('input file does not exist')
}

export async function getOutputStream(filename?: string): Promise<NodeJS.WritableStream> {
  if (filename === undefined) {
    return process.stdout
  }

  return fs.createWriteStream(filename)
}
