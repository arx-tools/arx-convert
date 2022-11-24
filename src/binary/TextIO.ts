import { BYTE_OF_AN_UNKNOWN_CHAR, CHARS, CHAR_OF_AN_UNKNOWN_BYTE, CODES } from './latin1CharsetLookup'

export class TextIO {
  static decode(bytes: number[]) {
    const chars = bytes.map((byte) => CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE)
    return chars.join('')
  }

  static encode(text: string) {
    const chars = text.split('')
    return chars.map((char) => CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR)
  }
}
