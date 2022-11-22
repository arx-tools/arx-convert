import { CHARS, CODES } from './latin1CharsetLookup'

const BYTE_OF_AN_UNKNOWN_CHAR = CODES[' ']
const CHAR_OF_AN_UNKNOWN_BYTE = ' '

export class TextIO {
  private charset: string

  constructor(charset: string) {
    this.charset = charset
  }

  decode(bytes: number[]) {
    const chars = bytes.map((byte) => CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE)
    return chars.join('')
  }

  encode(text: string) {
    const chars = text.split('')
    return chars.map((char) => CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR)
  }
}
