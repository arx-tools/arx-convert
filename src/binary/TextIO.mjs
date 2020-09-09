import { map, join, propOr, split, nth, defaultTo } from '../../node_modules/ramda/src/index.mjs'
import { CHARS, CODES } from './latin1CharsetLookup.mjs'

const BYTE_OF_AN_UNKNOWN_CHAR = CODES[' ']
const CHAR_OF_AN_UNKNOWN_BYTE = ' '

class TextIO {
  constructor(charset) {
    this.charset = charset
  }

  decode(bytes) {
    return join(
      '',
      map(byte => defaultTo(CHAR_OF_AN_UNKNOWN_BYTE, nth(byte, CHARS)), bytes)
    )
  }

  encode(str) {
    return map((char) => propOr(BYTE_OF_AN_UNKNOWN_CHAR, char, CODES), split('', str))
  }
}

export default TextIO
