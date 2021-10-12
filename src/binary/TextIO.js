const { map, join, propOr, split, nth, defaultTo } = require("ramda");
const { CHARS, CODES } = require("./latin1CharsetLookup.js");

const BYTE_OF_AN_UNKNOWN_CHAR = CODES[" "];
const CHAR_OF_AN_UNKNOWN_BYTE = " ";

class TextIO {
  constructor(charset) {
    this.charset = charset;
  }

  decode(bytes) {
    return join(
      "",
      map((byte) => defaultTo(CHAR_OF_AN_UNKNOWN_BYTE, nth(byte, CHARS)), bytes)
    );
  }

  encode(str) {
    return map(
      (char) => propOr(BYTE_OF_AN_UNKNOWN_CHAR, char, CODES),
      split("", str)
    );
  }
}

module.exports = TextIO;
