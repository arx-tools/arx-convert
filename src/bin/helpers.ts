import { type Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  type SupportedArxFormat,
  type SupportedDataFormat,
  type SupportedFormat,
  SUPPORTED_ARX_FORMATS,
  SUPPORTED_DATA_FORMATS,
  SUPPORTED_FORMATS,
} from '@bin/constants.js'
import { concatArrayBuffers } from '@common/helpers.js'

function pathToPackageJson(): string {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)

  return path.resolve(dirname, '../../package.json')
}

export async function getPackageVersion(): Promise<string> {
  try {
    const rawIn = await fs.promises.readFile(pathToPackageJson(), 'utf8')
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

export async function streamToBuffer(input: NodeJS.ReadableStream): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const chunks: ArrayBuffer[] = []

    input.on('data', (chunk: Buffer) => {
      chunks.push(chunk.buffer)
    })

    input.on('end', () => {
      resolve(concatArrayBuffers(chunks))
    })

    input.on('error', (e: unknown) => {
      if (e instanceof Error) {
        reject(e)
      } else {
        reject(new Error('unknown error happened while converting stream to buffer'))
      }
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

function sliceBuffer(buffer: ArrayBuffer, start: number, end?: number): ArrayBuffer
function sliceBuffer(buffer: string, start: number, end?: number): string
function sliceBuffer(buffer: string | ArrayBuffer, start: number = 0, end?: number): string | ArrayBuffer {
  return buffer.slice(start, end)
}

/**
 * @example
 * ```js
 * quotientAndRemainder(20, 3) -> [6, 2]
 * ```
 */
export function quotientAndRemainder(dividend: number, divisor: number): [number, number] {
  return [Math.floor(dividend / divisor), dividend % divisor]
}

export function outputInChunks(buffer: string | ArrayBuffer, stream: NodeJS.WritableStream, chunkSize = 1024): void {
  let sizeOfBuffer: number
  if (typeof buffer === 'string') {
    const [numberOfWholeChunks, leftoverChunkSize] = quotientAndRemainder(chunkSize, buffer.length)

    for (let i = 0; i < numberOfWholeChunks; i++) {
      stream.write(sliceBuffer(buffer, i * chunkSize, (i + 1) * chunkSize))
    }

    if (leftoverChunkSize > 0) {
      stream.write(sliceBuffer(buffer, numberOfWholeChunks * chunkSize))
    }
  } else {
    const [numberOfWholeChunks, leftoverChunkSize] = quotientAndRemainder(chunkSize, buffer.byteLength)

    for (let i = 0; i < numberOfWholeChunks; i++) {
      stream.write(new Uint8Array(sliceBuffer(buffer, i * chunkSize, (i + 1) * chunkSize)))
    }

    if (leftoverChunkSize > 0) {
      stream.write(new Uint8Array(sliceBuffer(buffer, numberOfWholeChunks * chunkSize)))
    }
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
    process.stdin.resume()
    return process.stdin
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
