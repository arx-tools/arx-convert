import { BYTE_OF_AN_UNKNOWN_CHAR, CHARS, CHAR_OF_AN_UNKNOWN_BYTE, CODES } from '@common/constants.js'

export const maxAll = (arr: number[]) => {
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
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
}

export const any = <T>(fn: (value: T) => boolean, values: T[]) => {
  for (let value of values) {
    if (fn(value)) {
      return true
    }
  }
  return false
}

export const last = <T>(values: T[]) => {
  return values[values.length - 1]
}

export const decodeText = (bytes: number[]) => {
  const chars = bytes.map((byte) => CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE)
  return chars.join('')
}

export const encodeText = (text: string) => {
  const chars = text.split('')
  return chars.map((char) => CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR)
}
