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

export function clamp(min: number, max: number, n: number): number {
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
