const { CHARS, CODES } = require("./latin1CharsetLookup.js");

const BYTE_OF_AN_UNKNOWN_CHAR = CODES[" "];
const CHAR_OF_AN_UNKNOWN_BYTE = " ";

class TextIO {
  constructor(charset) {
    this.charset = charset;
  }

  decode(bytes) {
    const chars = bytes.map((byte) => {
      return CHARS[byte] ?? CHAR_OF_AN_UNKNOWN_BYTE;
    });
    return chars.join("");
  }

  encode(str) {
    const tokens = str.split("");
    return tokens.map((char) => {
      return CODES[char] ?? BYTE_OF_AN_UNKNOWN_CHAR;
    });
  }
}

module.exports = TextIO;
