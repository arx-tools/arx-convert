import { BYTE_OF_AN_UNKNOWN_CHAR, CHARS, CHAR_OF_AN_UNKNOWN_BYTE, CODES } from '@common/constants.js'

export function maxAll(arr: number[]): number {
  let i = arr.length
  let max = Number.NEGATIVE_INFINITY

  while (i > 0) {
    i = i - 1
    if (arr[i] > max) {
      max = arr[i]
    }
  }

  return max
}

/**
 * @see https://stackoverflow.com/a/14438954/1806628
 */
export function uniq<T>(values: T[]): T[] {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export function times<T>(fn: (index: number) => T, repetitions: number): T[] {
  return Array.from({ length: repetitions }).map((value, index) => {
    return fn(index)
  })
}

export function repeat<T>(value: T, repetitions: number): T[] {
  const values = []

  for (let i = 0; i < repetitions; i++) {
    values.push(value)
  }

  return values
}

export function invert(values: string[]): Record<string, number> {
  const obj: Record<string, number> = {}

  values.forEach((value, index) => {
    obj[value] = index
  })

  return obj
}

export function decodeText(bytes: number[]): string {
  const chars = bytes.map((byte) => {
    return CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE
  })
  return chars.join('')
}

export function encodeText(text: string): number[] {
  const chars = [...text]
  return chars.map((char) => {
    return CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR
  })
}

export function clamp(n: number, min: number, max: number): number {
  if (n < min) {
    return min
  }

  if (n > max) {
    return max
  }

  return n
}

/**
 * @see https://stackoverflow.com/a/49129872/1806628
 */
export function concatArrayBuffers(buffers: ArrayBufferLike[]): ArrayBuffer {
  if (buffers.length === 0) {
    return new ArrayBuffer(0)
  }

  const totalLength = buffers.reduce((sum, buffer) => {
    return sum + buffer.byteLength
  }, 0)

  const combinedBuffer = new Uint8Array(totalLength)

  let offset = 0
  buffers.forEach((buffer) => {
    combinedBuffer.set(new Uint8Array(buffer), offset)
    offset = offset + buffer.byteLength
  })

  return combinedBuffer.buffer
}

/**
 * Extracts the level number from a path stored in the header of an FTS or a DLF file.
 *
 * The early builds of the game kept the assets on a shared Windows drive, so the path in the header of those
 * files can be `\\ARKANESERVER\Public\Arx\Game\Graph\Levels\Level2\` instead of
 * `C:\ARX\Game\Graph\Levels\level2\`. The game itself never reads the path (it only uses the version, the
 * unique header count and the uncompressed size of the header), so paths without a level number fall back
 * to `0`.
 *
 * @example
 * ```js
 * levelIdxFromPath('C:\\ARX\\Game\\Graph\\Levels\\level2\\') -> 2
 * levelIdxFromPath('\\\\ARKANESERVER\\Public\\Arx\\Game\\Graph\\Levels\\Level5\\') -> 5
 * ```
 */
export function levelIdxFromPath(path: string): number {
  const levelIdx = /level(\d+)/i.exec(path)

  if (levelIdx === null) {
    return 0
  }

  return Number.parseInt(levelIdx[1], 10)
}
