import { BYTE_OF_AN_UNKNOWN_CHAR, CHARS, CHAR_OF_AN_UNKNOWN_BYTE, CODES } from '@common/constants.js'

export function maxAll(arr: number[]): number {
  let i = arr.length
  let max = -Infinity

  while (i-- > 0) {
    max = arr[i] > max ? arr[i] : max
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
  return Array.from({ length: repetitions }).map((value, index) => fn(index))
}

export function repeat<T>(value: T, repetitions: number): T[] {
  const values = []
  for (let i = 0; i < repetitions; i++) {
    values.push(value)
  }

  return values
}

export function decodeText(bytes: number[]): string {
  const chars = bytes.map((byte) => CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE)
  return chars.join('')
}

export function encodeText(text: string): number[] {
  const chars = [...text]
  return chars.map((char) => CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR)
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
